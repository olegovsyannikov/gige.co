import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/services/api";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Fetching agents from database...");
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
        safeAddress: true,
        _count: {
          select: {
            jobs: true,
          },
        },
      },
    });

    console.log("Agents fetched:", JSON.stringify(agents, null, 2));

    const response: ApiResponse<typeof agents> = {
      data: agents,
    };

    console.log("Sending response:", JSON.stringify(response, null, 2));

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
