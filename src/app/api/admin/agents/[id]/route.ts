import { prisma } from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await prisma.agent.delete({
      where: { id: params.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("Error deleting agent:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
  }
}
