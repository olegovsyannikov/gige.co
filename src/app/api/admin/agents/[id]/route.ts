import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = await requireAdmin(request);
    if (authError) return authError;

    const { id } = await params;

    await prisma.agent.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
