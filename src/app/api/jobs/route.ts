import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
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

    const jobs = await prisma.job.findMany({
      where: {
        createdByUserId: userId,
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
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, description, acceptanceCriteria } = body;

    if (!name || !description || !acceptanceCriteria) {
      return NextResponse.json(
        {
          error: {
            message: "Missing required fields",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const job = await prisma.job.create({
      data: {
        name,
        description,
        acceptanceCriteria,
        createdByUserId: userId,
        status: "PENDING",
      },
      include: {
        agent: {
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

    const response: ApiResponse<typeof job> = {
      data: job,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error creating job:", error);
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
