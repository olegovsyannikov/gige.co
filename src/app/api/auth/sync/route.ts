import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/clerk-sdk-node";
import type { EmailAddress } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user exists in our database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!dbUser) {
      // Get user details from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);

      // Get the primary email address
      const primaryEmail = clerkUser.emailAddresses.find(
        (email: EmailAddress) => email.id === clerkUser.primaryEmailAddressId
      );

      if (!primaryEmail) {
        return NextResponse.json(
          { error: "User email not found" },
          { status: 400 }
        );
      }

      // Create user in our database
      const newUser = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail.emailAddress,
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : null,
        },
      });
      return NextResponse.json({ success: true, user: newUser });
    }

    return NextResponse.json({ success: true, user: dbUser });
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
