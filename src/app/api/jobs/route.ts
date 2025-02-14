import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/jobs - Start");
    const user = await requireDbUser(req);
    console.log("Authenticated user:", user);

    console.log("Fetching jobs for internal userId:", user.id);
    const jobs = await prisma.job.findMany({
      where: {
        createdByUserId: user.id,
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
    console.log("Found jobs:", jobs);

    const response: ApiResponse<typeof jobs> = {
      data: jobs,
    };

    console.log("GET /api/jobs - Success");
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in GET /api/jobs:", error);
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

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/jobs - Start");
    const user = await requireDbUser(req);
    console.log("Authenticated user:", user);

    let body;
    try {
      body = await req.json();
      console.log("Received request body:", body);
    } catch (e) {
      console.error("Error parsing request body:", e);
      return NextResponse.json(
        {
          error: {
            message: "Invalid request body - expected JSON",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const { name, description, acceptanceCriteria } = body || {};
    console.log("Extracted job data:", {
      name,
      description,
      acceptanceCriteria,
    });

    if (!name || !description || !acceptanceCriteria) {
      console.log("Missing required fields");
      return NextResponse.json(
        {
          error: {
            message:
              "Missing required fields: name, description, and acceptanceCriteria are required",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    console.log("Creating job with userId:", user.id);
    const job = await prisma.job.create({
      data: {
        name,
        description,
        acceptanceCriteria,
        createdByUserId: user.id,
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
    console.log("Job created:", job);

    const response: ApiResponse<typeof job> = {
      data: job,
    };

    console.log("POST /api/jobs - Success");
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in POST /api/jobs:", error);
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
