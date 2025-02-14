import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateJobSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  acceptanceCriteria: z.string().min(10).max(1000),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser(req);
    const { id } = await params;

    const job = await prisma.job.findUnique({
      where: {
        id,
        createdByUserId: user.id,
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

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser(req);
    const jobId = (await params).id;
    const body = await req.json();

    try {
      const data = updateJobSchema.parse(body);

      // Get job to check ownership and status
      const job = await prisma.job.findUnique({
        where: {
          id: jobId,
          createdByUserId: user.id, // Ensure user owns the job
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

      // Only allow updates for pending jobs or jobs that need resubmission
      if (job.status !== "PENDING" && job.status !== "RESUBMISSION_REQUIRED") {
        return NextResponse.json(
          {
            error: {
              message:
                "Only pending jobs or jobs that need resubmission can be edited",
              status: 400,
            },
          },
          { status: 400 }
        );
      }

      // Update job and create log
      const [updatedJob] = await prisma.$transaction([
        prisma.job.update({
          where: { id: jobId },
          data,
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
        }),
        prisma.jobLog.create({
          data: {
            jobId,
            status: job.status,
            message: "Job details updated by user",
          },
        }),
      ]);

      const response: ApiResponse<typeof updatedJob> = {
        data: updatedJob,
      };

      return NextResponse.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: {
              message: error.errors[0].message,
              status: 422,
            },
          },
          { status: 422 }
        );
      }
      throw error;
    }
  } catch (error: unknown) {
    console.error("Error updating job:", error);
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
