import { prisma } from "@/lib/prisma";
import { validateAgentResponse } from "@/services/validation";
import { ApiResponse } from "@/types/common";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

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

    const { id: jobId } = await params;

    // Get job with agent details and latest assigned log
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        agent: true,
        logs: {
          where: {
            status: "ASSIGNED",
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
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

    if (!job.agent || !job.assignedAgentId) {
      return NextResponse.json(
        {
          error: {
            message: "No agent assigned to this job",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    if (job.status !== "ASSIGNED" && job.status !== "RESUBMISSION_REQUIRED") {
      return NextResponse.json(
        {
          error: {
            message: "Job is not in a valid state for execution",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Get the latest assigned log payload
    const latestAssignedLog = job.logs[0];
    if (!latestAssignedLog?.requestPayload) {
      return NextResponse.json(
        {
          error: {
            message: "No valid assignment payload found",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Update job status to IN_PROGRESS
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "IN_PROGRESS",
        logs: {
          create: {
            status: "IN_PROGRESS",
            message: "Job execution started",
            agentId: job.assignedAgentId,
          },
        },
      },
    });

    // Call agent endpoint with the payload from the assignment
    try {
      const agentResponse = await fetch(job.agent.endpointURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(latestAssignedLog.requestPayload),
      });

      if (!agentResponse.ok) {
        throw new Error(`Agent returned status ${agentResponse.status}`);
      }

      const result = await agentResponse.json();

      // Validate agent response against acceptance criteria
      const validationResult = await validateAgentResponse(
        result,
        job.acceptanceCriteria,
        {
          model: "gpt-4-turbo-preview",
          temperature: 0.2,
          maxTokens: 1000,
        }
      );

      if (validationResult.isValid) {
        // Update job as completed
        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data: {
            status: "COMPLETED",
            result,
            logs: {
              create: {
                status: "COMPLETED",
                message: "Job completed successfully",
                agentId: job.assignedAgentId,
                requestPayload: latestAssignedLog.requestPayload,
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

        const response: ApiResponse<typeof updatedJob> = {
          data: updatedJob,
        };

        return NextResponse.json(response);
      } else {
        // Update job as requiring resubmission
        const updatedJob = await prisma.job.update({
          where: { id: jobId },
          data: {
            status: "RESUBMISSION_REQUIRED",
            logs: {
              create: {
                status: "RESUBMISSION_REQUIRED",
                message: `Validation failed: ${validationResult.reason}`,
                agentId: job.assignedAgentId,
                requestPayload: latestAssignedLog.requestPayload,
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

        const response: ApiResponse<typeof updatedJob> = {
          data: updatedJob,
        };

        return NextResponse.json(response);
      }
    } catch (error) {
      // Update job as failed
      const updatedJob = await prisma.job.update({
        where: { id: jobId },
        data: {
          status: "FAILED",
          logs: {
            create: {
              status: "FAILED",
              message: `Execution failed: ${
                error instanceof Error ? error.message : "Unknown error"
              }`,
              agentId: job.assignedAgentId,
              requestPayload: latestAssignedLog.requestPayload,
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
    }
  } catch (error: unknown) {
    console.error("Error executing job:", error);
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
