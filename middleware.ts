import {
  clerkMiddleware,
  createRouteMatcher,
  clerkClient,
} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isStudentDashboard = createRouteMatcher(["/dashboard/student(.*)"]);
const isFacultyDashboard = createRouteMatcher(["/dashboard/faculty(.*)"]);
const isStudentOnlyRoute = createRouteMatcher([
  "/dashboard/subjects",
  "/dashboard/grades",
  "/dashboard/attendance",
  "/dashboard/teachers",
  "/dashboard/schedule",
  "/dashboard/assignments",
  "/dashboard/payments",
  "/dashboard/library",
  "/dashboard/announcements",
  "/dashboard/education-history",
]);
const isFacultyOnlyRoute = createRouteMatcher([
  "/dashboard/faculty/classes",
  "/dashboard/faculty/students",
  "/dashboard/faculty/grades",
  "/dashboard/faculty/attendance",
  "/dashboard/faculty/schedule",
  "/dashboard/faculty/assignments",
  "/dashboard/faculty/announcements",
]);
const isOnboardingRoute = createRouteMatcher(["/onboarding"]);
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/privacy-policy",
  "/terms-of-service",
  "/success",
]);

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

  // Protect dashboard routes - require authentication and role-based access
  if (
    isStudentDashboard(req) ||
    isFacultyDashboard(req) ||
    isStudentOnlyRoute(req) ||
    isFacultyOnlyRoute(req)
  ) {
    await auth.protect();

    console.log("[MIDDLEWARE] Dashboard access attempt");
    console.log("[MIDDLEWARE] User ID:", userId);
    console.log("[MIDDLEWARE] Requested path:", req.nextUrl.pathname);

    // Get the current user to check publicMetadata
    let user;
    try {
      const client = await clerkClient();
      user = await client.users.getUser(userId!);
    } catch (error) {
      console.error("[MIDDLEWARE] Error fetching user from Clerk:", error);
      // If user not found, allow the request to continue
      // Clerk will handle the authentication redirect
      return NextResponse.next();
    }

    const userRole = user?.publicMetadata?.role as string | undefined;
    console.log("[MIDDLEWARE] User role:", userRole);

    // If no role assigned, redirect to onboarding
    if (!userRole) {
      console.log("[MIDDLEWARE] No role found, redirecting to onboarding");
      const onboardingUrl = new URL("/onboarding", req.url);
      return NextResponse.redirect(onboardingUrl);
    }

    // Check role-specific required info
    if (userRole === "student") {
      const hasRequiredInfo =
        user?.publicMetadata?.studentId &&
        user?.publicMetadata?.dateOfBirth &&
        user?.publicMetadata?.phone;

      // If missing required info, redirect to onboarding
      if (!hasRequiredInfo) {
        console.log(
          "[MIDDLEWARE] Student missing required info, redirecting to onboarding",
        );
        const onboardingUrl = new URL("/onboarding", req.url);
        return NextResponse.redirect(onboardingUrl);
      }

      // If student trying to access faculty dashboard or faculty-only routes, redirect to student dashboard
      if (isFacultyDashboard(req) || isFacultyOnlyRoute(req)) {
        console.log(
          "[MIDDLEWARE] Student trying to access faculty route, redirecting",
        );
        const studentDashboardUrl = new URL("/dashboard/student", req.url);
        return NextResponse.redirect(studentDashboardUrl);
      }
    } else if (userRole === "faculty") {
      const hasRequiredInfo =
        user?.publicMetadata?.facultyId && user?.publicMetadata?.phone;

      // If missing required info, redirect to onboarding
      if (!hasRequiredInfo) {
        console.log(
          "[MIDDLEWARE] Faculty missing required info, redirecting to onboarding",
        );
        const onboardingUrl = new URL("/onboarding", req.url);
        return NextResponse.redirect(onboardingUrl);
      }

      // If faculty trying to access student dashboard or student-only routes, redirect to faculty dashboard
      if (isStudentDashboard(req) || isStudentOnlyRoute(req)) {
        console.log(
          "[MIDDLEWARE] Faculty trying to access student route, redirecting",
        );
        const facultyDashboardUrl = new URL("/dashboard/faculty", req.url);
        return NextResponse.redirect(facultyDashboardUrl);
      }
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
