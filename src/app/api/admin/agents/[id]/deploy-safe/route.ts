import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SAFE_CONFIG } from "@/lib/safe/config";
import { safeService } from "@/lib/safe/service";
import { ApiResponse } from "@/services/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    // Validate RPC URL
    if (!SAFE_CONFIG.rpcUrl) {
      return NextResponse.json(
        {
          error: {
            message: "RPC URL not configured",
            status: 500,
          },
        },
        { status: 500 }
      );
    }

    const { id } = await params;

    // Check if agent exists and doesn't have a Safe wallet
    const agent = await prisma.agent.findUnique({
      where: { id },
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

    if (agent.safeAddress) {
      return NextResponse.json(
        {
          error: {
            message: "Agent already has a Safe wallet",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Deploy Safe wallet
    const { safeAddress, txHash } = await safeService.deployAgentSafe(agent.id);

    // Update agent with Safe details
    const updatedAgent = await prisma.agent.update({
      where: { id: agent.id },
      data: {
        safeAddress,
        safeTxHash: txHash,
      },
    });

    const response: ApiResponse<typeof updatedAgent> = {
      data: updatedAgent,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error deploying Safe wallet:", error);
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error
              ? error.message
              : "Failed to deploy Safe wallet",
          status: 500,
        },
      },
      { status: 500 }
    );
  }
}
