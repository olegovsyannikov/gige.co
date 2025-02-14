import { requireDbUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await requireDbUser(req);

    // Get user's jobs
    const userJobs = await prisma.job.groupBy({
      by: ["status"],
      where: {
        createdByUserId: user.id,
      },
      _count: true,
    });

    // Get global jobs
    const globalJobs = await prisma.job.groupBy({
      by: ["status"],
      _count: true,
    });

    // Get top 2 agents by completed jobs
    const agents = await prisma.agent.findMany({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        keywords: true,
        _count: {
          select: {
            jobs: true,
          },
        },
      },
      orderBy: {
        jobs: {
          _count: "desc",
        },
      },
      take: 2,
    });

    // Calculate stats
    const userStats = {
      total: userJobs.reduce((acc, curr) => acc + curr._count, 0),
      completed: userJobs.find((j) => j.status === "COMPLETED")?._count || 0,
      pending: userJobs.find((j) => j.status === "PENDING")?._count || 0,
    };

    const globalStats = {
      total: globalJobs.reduce((acc, curr) => acc + curr._count, 0),
      completed: globalJobs.find((j) => j.status === "COMPLETED")?._count || 0,
      pending: globalJobs.find((j) => j.status === "PENDING")?._count || 0,
    };

    const agentStats = {
      total: await prisma.agent.count(),
      active: await prisma.agent.count({
        where: { isActive: true },
      }),
    };

    const response: ApiResponse<{
      userStats: typeof userStats;
      globalStats: typeof globalStats;
      agentStats: typeof agentStats;
      agents: typeof agents;
    }> = {
      data: {
        userStats,
        globalStats,
        agentStats,
        agents: agents.map((agent) => ({
          ...agent,
          tags: agent.keywords.split(",").map((k) => k.trim()),
          jobsCompleted: agent._count.jobs,
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error fetching dashboard data:", error);
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
