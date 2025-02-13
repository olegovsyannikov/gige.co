import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/services/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        description: true,
        keywords: true,
        inputSchema: true,
        outputSchema: true,
        isActive: true,
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof agents> = {
      data: agents,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching agents:", error);
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
