import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordJobLogOnChain } from "@/lib/safe/job-logs";
import { ApiResponse } from "@/types/common";
import { JobLogStatus, JobStatus, Prisma } from "@prisma/client";
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

    // Allow cancellation of assigned jobs and jobs that need resubmission
    if (job.status !== "ASSIGNED" && job.status !== "RESUBMISSION_REQUIRED") {
      return NextResponse.json(
        {
          error: {
            message:
              "Only assigned jobs or jobs that need resubmission can be cancelled",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Update job and create log in a transaction
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "PENDING" as JobStatus,
        logs: {
          create: {
            status: "CANCELLED" as JobLogStatus,
            message: "Job assignment cancelled by user",
            agentId: job.assignedAgentId,
            requestPayload: Prisma.JsonNull,
            responsePayload: Prisma.JsonNull,
          },
        },
      },
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
        logs: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        _count: {
          select: {
            logs: true,
          },
        },
      },
    });

    // Record cancellation on-chain
    if (updatedJob.logs[0]) {
      await recordJobLogOnChain(
        updatedJob,
        "CANCELLED" as JobLogStatus,
        updatedJob.logs[0].id
      );
    }

    const response: ApiResponse<typeof updatedJob> = {
      data: updatedJob,
    };

    return NextResponse.json(response);
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
