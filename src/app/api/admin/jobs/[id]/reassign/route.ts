import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
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

    // TODO: Add admin role check

    const { id } = params;
    const { agentId } = await req.json();

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

    // Verify agent exists
    const agent = await prisma.agent.findUnique({
      where: {
        id: agentId,
        isActive: true,
      },
    });

    if (!agent) {
      return NextResponse.json(
        {
          error: {
            message: "Agent not found or inactive",
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
        assignedAgentId: agentId,
        status: "ASSIGNED",
        logs: {
          create: {
            status: "REASSIGNED",
            message: `Job reassigned to agent ${agent.name} by admin`,
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

    const response: ApiResponse<typeof updatedJob> = {
      data: updatedJob,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error reassigning job:", error);
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
