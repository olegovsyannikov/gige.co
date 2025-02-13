import { syncUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const user = await syncUser(req);
    return NextResponse.json({ success: true, user });
  } catch (error: unknown) {
    console.error("Error syncing user:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
