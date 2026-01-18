import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require authentication
const isProtectedRoute = createRouteMatcher(["/campaigns(.*)"]);

// Home page - redirect to campaigns if logged in
const isHomePage = createRouteMatcher(["/"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Home page behavior
  if (isHomePage(req)) {
    if (userId) {
      // Logged in: redirect to campaigns
      return NextResponse.redirect(new URL("/campaigns", req.url));
    } else {
      // Logged out: redirect to sign-in
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }
  }

  // Protect campaign routes
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
