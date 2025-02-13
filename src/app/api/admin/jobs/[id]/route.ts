import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    const job = await prisma.job.findUnique({
      where: {
        id,
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

    const response: ApiResponse<typeof job> = {
      data: job,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching job:", error);
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
    const body = await req.json();
    const { action } = body;

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

    let updatedJob;

    switch (action) {
      case "resubmit":
        updatedJob = await prisma.job.update({
          where: {
            id,
          },
          data: {
            status: "PENDING",
            logs: {
              create: {
                status: "RESUBMITTED",
                message: "Job resubmitted by admin",
              },
            },
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
        });
        break;

      case "complete":
        const { result } = body;
        updatedJob = await prisma.job.update({
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
        });
        break;

      case "reassign":
        const { agentId } = body;
        updatedJob = await prisma.job.update({
          where: {
            id,
          },
          data: {
            assignedAgentId: agentId,
            status: "ASSIGNED",
            logs: {
              create: {
                status: "REASSIGNED",
                message: `Job reassigned to agent ${agentId} by admin`,
                agentId,
              },
            },
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
        });
        break;

      default:
        return NextResponse.json(
          {
            error: {
              message: "Invalid action",
              status: 400,
            },
          },
          { status: 400 }
        );
    }

    const response: ApiResponse<typeof updatedJob> = {
      data: updatedJob,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error updating job:", error);
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
