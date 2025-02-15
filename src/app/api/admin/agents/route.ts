import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { safeService } from "@/lib/safe/service";
import { ApiResponse } from "@/services/api";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const agentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  description: z.string().min(10),
  endpointURL: z.string().url(),
  inputSchema: z.any(),
  outputSchema: z.any(),
  keywords: z.string().min(2),
  isActive: z.boolean(),
});

// GET /api/admin/agents
export async function GET(req: NextRequest) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const agents = await prisma.agent.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
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

// POST /api/admin/agents
export async function POST(req: NextRequest) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const json = await req.json();

    try {
      const body = agentSchema.parse(json);

      // Validate JSON schemas
      try {
        if (typeof body.inputSchema !== "object") {
          throw new Error("Input schema must be a valid JSON object");
        }
        if (typeof body.outputSchema !== "object") {
          throw new Error("Output schema must be a valid JSON object");
        }
      } catch (error) {
        return NextResponse.json(
          {
            error: {
              message:
                error instanceof Error ? error.message : "Invalid JSON schema",
              status: 400,
            },
          },
          { status: 400 }
        );
      }

      // Create agent in database first
      const agent = await prisma.agent.create({
        data: {
          name: body.name,
          description: body.description,
          endpointURL: body.endpointURL,
          inputSchema: body.inputSchema,
          outputSchema: body.outputSchema,
          keywords: body.keywords,
          isActive: body.isActive,
        },
      });

      // Deploy Safe wallet for the agent
      try {
        const { safeAddress, txHash } = await safeService.deployAgentSafe(
          agent.id
        );

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
      } catch (error) {
        console.error("Failed to deploy Safe wallet:", error);
        // Return the agent even if Safe deployment fails
        // The Safe can be deployed later through a separate endpoint
        const response: ApiResponse<typeof agent & { safeError: string }> = {
          data: {
            ...agent,
            safeError:
              error instanceof Error
                ? error.message
                : "Failed to deploy Safe wallet",
          },
        };
        return NextResponse.json(response);
      }
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
    console.error("Error creating agent:", error);
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

// PUT /api/admin/agents
export async function PUT(req: NextRequest) {
  try {
    const authError = await requireAdmin(req);
    if (authError) return authError;

    const json = await req.json();
    const body = agentSchema.parse(json);

    if (!body.id) {
      return NextResponse.json(
        {
          error: {
            message: "Agent ID is required",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const agent = await prisma.agent.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        endpointURL: body.endpointURL,
        inputSchema: body.inputSchema,
        outputSchema: body.outputSchema,
        keywords: body.keywords,
        isActive: body.isActive,
      },
    });

    const response: ApiResponse<typeof agent> = {
      data: agent,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error updating agent:", error);
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
