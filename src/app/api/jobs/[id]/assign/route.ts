import { requireAdmin, requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordJobOnChain } from "@/lib/safe/job-logs";
import { generatePayload } from "@/services/payload";
import { ApiResponse, JsonSchema } from "@/types/common";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser(req);
    const { id: jobId } = await params;
    const body = await req.json();
    const { agentId, userInputs } = body;
    const generateInput = body.generateInput ?? false;

    if (!agentId) {
      return NextResponse.json(
        {
          error: {
            message: "Agent ID is required",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Only require userInputs when not using auto-generation
    if (
      !generateInput &&
      (!userInputs || Object.keys(userInputs).length === 0)
    ) {
      return NextResponse.json(
        {
          error: {
            message:
              "User inputs are required when auto-generation is disabled",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Get job and agent details
    const [job, agent] = await Promise.all([
      prisma.job.findUnique({
        where: {
          id: jobId,
          createdByUserId: user.id, // Ensure user owns the job
        },
        include: { agent: true },
      }),
      prisma.agent.findUnique({
        where: { id: agentId },
      }),
    ]);

    if (!job) {
      return NextResponse.json(
        {
          error: {
            message: "Job not found",
            status: 404,
          },
        },
        { status: 404 }
      );
    }

    if (!agent) {
      return NextResponse.json(
        {
          error: {
            message: "Agent not found",
            status: 404,
          },
        },
        { status: 404 }
      );
    }

    // Only allow assignment of pending jobs or by admin
    if (job.status !== "PENDING") {
      const adminCheck = await requireAdmin(req);
      if (adminCheck) {
        return adminCheck;
      }
    }

    let requestPayload: Prisma.JsonObject;

    if (generateInput) {
      // Generate payload from user inputs using AI
      const payloadResult = await generatePayload({
        agentId: agent.id,
        agentName: agent.name,
        inputSchema: agent.inputSchema as JsonSchema,
        userInputs,
        jobDescription: job.description,
        jobRequirements: job.acceptanceCriteria,
      });

      // If there are validation errors, return them
      if (payloadResult.validationErrors?.length) {
        return NextResponse.json(
          {
            error: {
              message: "Invalid inputs",
              validationErrors: payloadResult.validationErrors,
              status: 400,
            },
          },
          { status: 400 }
        );
      }

      // Check if payload is undefined or null
      if (!payloadResult.payload) {
        return NextResponse.json(
          {
            error: {
              message: "Failed to generate input payload",
              status: 400,
            },
          },
          { status: 400 }
        );
      }

      requestPayload = payloadResult.payload as Prisma.JsonObject;
    } else {
      // Use user inputs directly as payload
      requestPayload = userInputs as Prisma.JsonObject;
    }

    // First update the job
    await prisma.job.update({
      where: { id: jobId },
      data: {
        assignedAgentId: agentId,
        status: "ASSIGNED",
      },
    });

    console.log("Creating new job log...");
    // Then create the log
    const createdLog = await prisma.jobLog.create({
      data: {
        jobId,
        agentId,
        status: "ASSIGNED",
        message: generateInput
          ? "Agent manually assigned by user with AI-generated input"
          : "Agent manually assigned by user with custom input",
        requestPayload,
      },
    });
    console.log("Created new log:", {
      logId: createdLog.id,
      createdAt: createdLog.createdAt,
    });

    // Fetch the final job state with all logs
    const finalJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
            safeAddress: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        logs: true,
      },
    });

    if (!finalJob) {
      throw new Error("Failed to fetch updated job");
    }

    // Record assignment and log on-chain using the newly created log ID
    await recordJobOnChain(finalJob, "ASSIGNED", createdLog.id);

    const response: ApiResponse<typeof finalJob> = {
      data: finalJob,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in manual job assignment:", error);
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Internal server error",
          status:
            error instanceof Error && error.message.includes("authenticated")
              ? 401
              : 500,
        },
      },
      {
        status:
          error instanceof Error && error.message.includes("authenticated")
            ? 401
            : 500,
      }
    );
  }
}
