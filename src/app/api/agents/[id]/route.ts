import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/services/api";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const agent = await prisma.agent.findUnique({
      where: {
        id: params.id,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            jobs: true,
            jobLogs: true,
          },
        },
      },
    });

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

    const response: ApiResponse<typeof agent> = {
      data: agent,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching agent:", error);
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
