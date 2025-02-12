import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
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
    const { userId, sessionClaims } = getAuth(req);

    if (
      !userId ||
      !sessionClaims?.metadata ||
      typeof sessionClaims.metadata !== "object"
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const metadata = sessionClaims.metadata as { role?: string };
    const isAdmin = metadata.role === "admin";

    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const agents = await prisma.agent.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(agents);
  } catch (error: unknown) {
    console.error("Error fetching agents:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
}

// POST /api/admin/agents
export async function POST(req: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(req);

    if (
      !userId ||
      !sessionClaims?.metadata ||
      typeof sessionClaims.metadata !== "object"
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const metadata = sessionClaims.metadata as { role?: string };
    const isAdmin = metadata.role === "admin";

    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = agentSchema.parse(json);

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

    return NextResponse.json(agent);
  } catch (error: unknown) {
    console.error("Error creating agent:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
}

// PUT /api/admin/agents
export async function PUT(req: NextRequest) {
  try {
    const { userId, sessionClaims } = getAuth(req);

    if (
      !userId ||
      !sessionClaims?.metadata ||
      typeof sessionClaims.metadata !== "object"
    ) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const metadata = sessionClaims.metadata as { role?: string };
    const isAdmin = metadata.role === "admin";

    if (!isAdmin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = agentSchema.parse(json);

    if (!body.id) {
      return new NextResponse("Agent ID is required", { status: 400 });
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

    return NextResponse.json(agent);
  } catch (error: unknown) {
    console.error("Error updating agent:", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
}
