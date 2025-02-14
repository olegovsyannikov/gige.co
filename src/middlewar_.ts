import {
  clerkClient,
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const isApiRoute = createRouteMatcher(["/api/(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return redirectToSignIn();
  }

  // For API routes, ensure user is synced first
  if (
    userId &&
    isApiRoute(req) &&
    !req.nextUrl.pathname.includes("/api/auth")
  ) {
    try {
      // Call sync endpoint directly without redirect
      const syncResponse = await fetch(
        new URL("/api/auth/sync", req.nextUrl.origin).toString(),
        {
          headers: {
            cookie: req.headers.get("cookie") || "", // Forward auth cookies
          },
        }
      );

      if (!syncResponse.ok) {
        return new Response("Failed to sync user", { status: 500 });
      }
    } catch (error) {
      console.error("Error syncing user:", error);
      return new Response("Failed to sync user", { status: 500 });
    }
  }

  // Check for admin role if accessing admin routes
  if (userId && isProtectedRoute(req)) {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user.privateMetadata.isAdmin) {
      return new Response("Unauthorized - Admin access required", {
        status: 401,
      });
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
