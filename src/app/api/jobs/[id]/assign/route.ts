import { requireAdmin, requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    if (!agentId || !userInputs) {
      return NextResponse.json(
        {
          error: {
            message: "Agent ID and user inputs are required",
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

    // Generate payload from user inputs
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

    // Update job with assigned agent and create log
    const [updatedJob] = await prisma.$transaction([
      prisma.job.update({
        where: { id: jobId },
        data: {
          assignedAgentId: agentId,
          status: "ASSIGNED",
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              logs: true,
            },
          },
        },
      }),
      prisma.jobLog.create({
        data: {
          jobId,
          agentId,
          status: "ASSIGNED",
          message: "Agent manually assigned by user",
          requestPayload: payloadResult.payload as Prisma.JsonObject,
        },
      }),
    ]);

    const response: ApiResponse<typeof updatedJob> = {
      data: updatedJob,
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
