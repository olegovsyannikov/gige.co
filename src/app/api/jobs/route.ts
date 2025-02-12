import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/common";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("GET /api/jobs - Start");
    const { userId } = await auth();
    console.log("Authenticated userId:", userId);

    if (!userId) {
      console.log("No userId found in auth");
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized",
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    // Find the user in our database
    console.log("Looking up user with clerkId:", userId);
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    console.log("Found user:", user);

    if (!user) {
      console.log("No user found in database for clerkId:", userId);
      return NextResponse.json(
        {
          error: {
            message: "User not found",
            status: 404,
          },
        },
        { status: 404 }
      );
    }

    console.log("Fetching jobs for internal userId:", user.id);
    const jobs = await prisma.job.findMany({
      where: {
        createdByUserId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            logs: true,
          },
        },
      },
    });
    console.log("Found jobs:", jobs);

    const response: ApiResponse<typeof jobs> = {
      data: jobs,
    };

    console.log("GET /api/jobs - Success");
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in GET /api/jobs:", error);
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

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/jobs - Start");
    const { userId } = await auth();
    console.log("Authenticated userId:", userId);

    if (!userId) {
      console.log("No userId found in auth");
      return NextResponse.json(
        {
          error: {
            message: "Unauthorized",
            status: 401,
          },
        },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await req.json();
      console.log("Received request body:", body);
    } catch (e) {
      console.error("Error parsing request body:", e);
      return NextResponse.json(
        {
          error: {
            message: "Invalid request body - expected JSON",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    const { name, description, acceptanceCriteria } = body || {};
    console.log("Extracted job data:", {
      name,
      description,
      acceptanceCriteria,
    });

    if (!name || !description || !acceptanceCriteria) {
      console.log("Missing required fields");
      return NextResponse.json(
        {
          error: {
            message:
              "Missing required fields: name, description, and acceptanceCriteria are required",
            status: 400,
          },
        },
        { status: 400 }
      );
    }

    // Get user details from Clerk
    console.log("Fetching Clerk user details for:", userId);
    const clerkUser = await clerkClient.users.getUser(userId);
    console.log("Clerk user details:", {
      id: clerkUser.id,
      email: clerkUser.emailAddresses,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
    });

    // Find or create user in our database
    console.log("Looking up user in database with clerkId:", userId);
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    console.log("Existing user found:", user);

    if (!user) {
      console.log("User not found, creating new user");
      // Get the primary email address
      const primaryEmail = clerkUser.emailAddresses.find(
        (email) => email.id === clerkUser.primaryEmailAddressId
      );
      console.log("Primary email:", primaryEmail);

      if (!primaryEmail) {
        console.log("No primary email found for user");
        return NextResponse.json(
          {
            error: {
              message: "User email not found",
              status: 400,
            },
          },
          { status: 400 }
        );
      }

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: primaryEmail.emailAddress,
          name: clerkUser.firstName
            ? `${clerkUser.firstName} ${clerkUser.lastName || ""}`.trim()
            : null,
        },
      });
      console.log("Created new user:", user);
    }

    console.log("Creating job with userId:", user.id);
    const job = await prisma.job.create({
      data: {
        name,
        description,
        acceptanceCriteria,
        createdByUserId: user.id,
        status: "PENDING",
      },
      include: {
        agent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            logs: true,
          },
        },
      },
    });
    console.log("Job created:", job);

    const response: ApiResponse<typeof job> = {
      data: job,
    };

    console.log("POST /api/jobs - Success");
    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Error in POST /api/jobs:", error);
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
