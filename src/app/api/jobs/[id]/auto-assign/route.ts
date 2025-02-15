import { requireAdmin, requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordJobOnChain } from "@/lib/safe/job-logs";
import { findBestMatch } from "@/services/matching";
import { Agent } from "@/types/agent";
import { ApiResponse, JsonSchema } from "@/types/common";
import { Job } from "@/types/job";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireDbUser(req);
    const { id: jobId } = await params;

    // Get job and available agents
    const [job, agents] = await Promise.all([
      prisma.job.findUnique({
        where: {
          id: jobId,
          createdByUserId: user.id, // Ensure user owns the job
        },
        include: { agent: true },
      }),
      prisma.agent.findMany({
        where: { isActive: true },
      }),
    ]);

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

    // If job is not pending, require admin access
    if (job.status !== "PENDING") {
      const adminCheck = await requireAdmin(req);
      if (adminCheck) {
        return adminCheck; // Return the error response if not admin
      }
    }

    // Convert Prisma types to our custom types
    const jobForMatching: Job = {
      id: job.id,
      name: job.name,
      description: job.description,
      acceptanceCriteria: job.acceptanceCriteria,
      status: job.status,
      result: job.result as JsonSchema | null,
      createdByUserId: job.createdByUserId,
      assignedAgentId: job.assignedAgentId,
      onChainAssignmentTxHash: null,
      createdAt: job.createdAt.toISOString(),
      updatedAt: job.updatedAt.toISOString(),
      agent: job.agent
        ? {
            id: job.agent.id,
            name: job.agent.name,
          }
        : undefined,
    };

    // Convert agents with type assertion for schema fields
    const agentsForMatching = agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      endpointURL: agent.endpointURL,
      inputSchema: agent.inputSchema as unknown as JsonSchema,
      outputSchema: agent.outputSchema as unknown as JsonSchema,
      keywords: agent.keywords,
      isActive: agent.isActive,
      createdAt: agent.createdAt.toISOString(),
      updatedAt: agent.updatedAt.toISOString(),
      _count: { jobs: 0, jobLogs: 0 }, // Fixed to match Agent type
    })) as Agent[];

    // Get best match using OpenAI
    const result = await findBestMatch({
      job: jobForMatching,
      availableAgents: agentsForMatching,
    });

    // If no agent was found, leave the job unassigned
    if (!result.agentId) {
      await prisma.jobLog.create({
        data: {
          jobId,
          status: "MATCHING_FAILED",
          message: result.reasoning,
        },
      });

      return NextResponse.json(
        {
          error: {
            message: "No suitable agent found",
            reasoning: result.reasoning,
            status: 404,
          },
        },
        { status: 404 }
      );
    }

    // Update job with matched agent and create log in a transaction
    const [updatedJob, newLog] = await prisma.$transaction([
      prisma.job.update({
        where: { id: jobId },
        data: {
          assignedAgentId: result.agentId,
          status: "ASSIGNED",
        },
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              safeAddress: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          logs: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1,
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
          agentId: result.agentId,
          status: "ASSIGNED",
          message: `Agent automatically matched with confidence: ${result.confidence}. Reasoning: ${result.reasoning}`,
          requestPayload: result.requestPayload
            ? (result.requestPayload as Prisma.JsonObject)
            : Prisma.JsonNull,
        },
      }),
    ]);

    // Record assignment and log on-chain
    if (newLog) {
      await recordJobOnChain(updatedJob, "ASSIGNED", newLog.id);
    }

    const response: ApiResponse<typeof updatedJob> = {
      data: updatedJob,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in auto job assignment:", error);
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
