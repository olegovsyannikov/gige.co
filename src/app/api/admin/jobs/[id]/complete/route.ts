import { prisma } from "@/lib/prisma";
import { recordJobLogOnChain } from "@/lib/safe/job-logs";
import { ApiResponse } from "@/types/common";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized",
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    // TODO: Add admin role check

    const { id } = await params;
    const { result } = await req.json();

    if (!result) {
      return NextResponse.json(
        {
          error: {
            message: "Result is required",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.findUnique({
      where: {
        id,
      },
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

    const updatedJob = await prisma.job.update({
      where: {
        id,
      },
      data: {
        status: "COMPLETED",
        result,
        logs: {
          create: {
            status: "COMPLETED",
            message: "Job marked as complete by admin",
            responsePayload: result,
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

    // Record completion on-chain
    if (updatedJob.logs[0]) {
      await recordJobLogOnChain(updatedJob, "COMPLETED", updatedJob.logs[0].id);
    }

    const response: ApiResponse<typeof updatedJob> = {
      data: updatedJob,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error completing job:", error);
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Internal server error",
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}
