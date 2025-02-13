import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generatePayload } from "@/services/payload";
import { JsonSchema } from "@/types/common";
import { getAuth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = params.id;
    const body = await req.json();
    const { agentId, userInputs } = body;

    if (!agentId || !userInputs) {
      return NextResponse.json(
        { error: "Agent ID and user inputs are required" },
        { status: 400 }
      );
    }

    // Get job and agent details
    const [job, agent] = await Promise.all([
      prisma.job.findUnique({
        where: { id: jobId },
        include: { agent: true },
      }),
      prisma.agent.findUnique({
        where: { id: agentId },
      }),
    ]);

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
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
          error: "Invalid inputs",
          validationErrors: payloadResult.validationErrors,
        },
        { status: 400 }
      );
    }

    // Update job with assigned agent and create log
    await prisma.$transaction([
      prisma.job.update({
        where: { id: jobId },
        data: {
          assignedAgentId: agentId,
          status: "ASSIGNED",
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

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error in manual job assignment:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
