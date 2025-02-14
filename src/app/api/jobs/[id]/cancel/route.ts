import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser(req);
    const jobId = (await params).id;

    // Get job details
    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
        createdByUserId: user.id, // Ensure user owns the job
      },
      include: { agent: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Allow cancellation of assigned jobs and jobs that need resubmission
    if (job.status !== "ASSIGNED" && job.status !== "RESUBMISSION_REQUIRED") {
      return NextResponse.json(
        {
          error:
            "Only assigned jobs or jobs that need resubmission can be cancelled",
        },
        { status: 400 }
      );
    }

    // Update job and create log in a transaction
    const [updatedJob] = await prisma.$transaction([
      prisma.job.update({
        where: { id: jobId },
        data: {
          status: "PENDING",
          assignedAgentId: null,
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
          agentId: job.assignedAgentId,
          status: "CANCELLED",
          message: "Assignment cancelled by user",
        },
      }),
    ]);

    return NextResponse.json({ data: updatedJob });
  } catch (error: unknown) {
    console.error("Error cancelling job assignment:", error);
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
