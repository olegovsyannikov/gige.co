import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jobId = (await params).id;

    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { agent: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Only allow cancellation of assigned jobs
    if (job.status !== "ASSIGNED") {
      return NextResponse.json(
        { error: "Only assigned jobs can be cancelled" },
        { status: 400 }
      );
    }

    // Update job and create log in a transaction
    await prisma.$transaction([
      prisma.job.update({
        where: { id: jobId },
        data: {
          status: "PENDING",
          assignedAgentId: null,
        },
      }),
      prisma.jobLog.create({
        data: {
          jobId,
          agentId: job.assignedAgentId,
          status: "CANCELLED",
          message: "Assignment cancelled by user",
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error cancelling job assignment:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
