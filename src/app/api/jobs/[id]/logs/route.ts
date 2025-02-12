import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

    // First check if the user has access to this job
    const job = await prisma.job.findUnique({
      where: {
        id,
        createdByUserId: userId,
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

    const logs = await prisma.jobLog.findMany({
      where: {
        jobId: id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof logs> = {
      data: logs,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching job logs:", error);
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
