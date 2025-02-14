import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser(req);
    const { id } = await params;

    // First check if the user has access to this job
    const job = await prisma.job.findUnique({
      where: {
        id,
        createdByUserId: user.id,
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
