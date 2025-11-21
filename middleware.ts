import { clerkMiddleware, createRouteMatcher, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)", "/privacy-policy", "/terms-of-service", "/success"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Allow public routes without authentication
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Allow onboarding route for authenticated users without redirect loop check
  if (isOnboardingRoute(req)) {
    if (!userId) {
      await auth.protect();
    }
    console.log("[MIDDLEWARE] Allowing access to onboarding");
    return NextResponse.next();
  }

  // Protect dashboard routes - require authentication
  if (isProtectedRoute(req)) {
    await auth.protect();

    // Get the current user to check publicMetadata directly using clerkClient
    // This is more reliable than sessionClaims which may not be updated yet
    const client = await clerkClient();
    const user = await client.users.getUser(userId!);

    const hasRequiredInfo =
      user?.publicMetadata?.studentId &&
      user?.publicMetadata?.dateOfBirth &&
      user?.publicMetadata?.phone;

    console.log("[MIDDLEWARE] Dashboard access attempt");
    console.log("[MIDDLEWARE] User ID:", userId);
    console.log("[MIDDLEWARE] Has required info:", hasRequiredInfo);
    console.log("[MIDDLEWARE] Metadata from user:", {
      studentId: user?.publicMetadata?.studentId,
      dateOfBirth: user?.publicMetadata?.dateOfBirth,
      phone: user?.publicMetadata?.phone,
    });

    // If user is authenticated but missing required info, redirect to onboarding
    if (userId && !hasRequiredInfo) {
      console.log("[MIDDLEWARE] Redirecting to onboarding - missing required info");
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    console.log("[MIDDLEWARE] Allowing access to dashboard");
    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
