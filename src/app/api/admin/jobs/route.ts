import { requireAdmin, requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // First ensure user is authenticated
    await requireDbUser(req);

    // Then check admin access
    const adminCheck = await requireAdmin(req);
    if (adminCheck) {
      return adminCheck;
    }

    const jobs = await prisma.job.findMany({
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
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            logs: true,
          },
        },
      },
    });

    const response: ApiResponse<typeof jobs> = {
      data: jobs,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching jobs:", error);
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
