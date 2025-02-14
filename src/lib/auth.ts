import { prisma } from "@/lib/prisma";
import { clerkClient, EmailAddress, getAuth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function requireDbUser(req: NextRequest) {
  console.log("requireDbUser", req);
  const { userId } = getAuth(req);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  return findOrCreateUser(userId);
}

export async function isAdmin(clerkId: string) {
  const clerk = await clerkClient();
  const user = await clerk.users.getUser(clerkId);
  return !!user.privateMetadata.isAdmin;
}

export async function requireAdmin(req: NextRequest) {
  const { userId: clerkId } = getAuth(req);
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isUserAdmin = await isAdmin(clerkId);
  if (!isUserAdmin) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 }
    );
  }

  return null; // Auth check passed
}

async function findOrCreateUser(clerkId: string) {
  // First try to find the user
  const existingUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (existingUser) {
    return existingUser;
  }

  // If user doesn't exist, get details from Clerk and create them
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(clerkId);

  // Get the primary email address
  const primaryEmail = clerkUser.emailAddresses.find(
    (email: EmailAddress) => email.id === clerkUser.primaryEmailAddressId
  );

  if (!primaryEmail) {
    throw new Error("User email not found");
  }

  // Create user in our database
  const newUser = await prisma.user.create({
    data: {
      clerkId,
      email: primaryEmail.emailAddress,
      name: clerkUser.firstName
        ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
        : null,
      role: clerkUser.privateMetadata.isAdmin ? "ADMIN" : "USER",
    } as Prisma.UserCreateInput,
  });

  return newUser;
}
