import { fetchDCCPUser, type Faculty, type Student } from "@/lib/dccp";
import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
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
    "/sign-in",
    "/sign-up",
    "/privacy-policy",
    "/terms-of-service",
    "/success",
]);

export default clerkMiddleware(async (auth, req) => {
    const { userId } = await auth();

    // Allow public routes without authentication
    if (isPublicRoute(req)) {
        console.log("[PROXY] Public route access:", req.nextUrl.pathname);
        return NextResponse.next();
    }

    // Allow onboarding route for authenticated users without redirect loop check
    if (isOnboardingRoute(req)) {
        if (!userId) {
            await auth.protect();
        }
        console.log("[PROXY] Allowing access to onboarding");
        return NextResponse.next();
    }

    // Protect dashboard routes - require authentication and role-based access
    if (isStudentDashboard(req) || isFacultyDashboard(req) || isStudentOnlyRoute(req) || isFacultyOnlyRoute(req)) {
        await auth.protect();

        console.log("[PROXY] Dashboard access attempt");
        console.log("[PROXY] User ID:", userId);
        console.log("[PROXY] Requested path:", req.nextUrl.pathname);

        // Get the current user to check publicMetadata
        let user;
        try {
            const client = await clerkClient();
            user = await client.users.getUser(userId!);
        } catch (error) {
            console.error("[PROXY] Error fetching user from Clerk:", error);
            // If user not found, allow the request to continue
            // Clerk will handle the authentication redirect
            return NextResponse.next();
        }

        const userRole = user?.publicMetadata?.role as string | undefined;
        console.log("[PROXY] User role:", userRole);

        // If no role assigned, try to fetch from DCCP API
        if (!userRole) {
            console.log("[PROXY] No role found, attempting to fetch from DCCP API");
            const email =
                user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress ||
                user.emailAddresses[0]?.emailAddress;

            if (email) {
                const dccpUser = await fetchDCCPUser(email);

                if (dccpUser.type && dccpUser.data) {
                    console.log(`[PROXY] Found user in DCCP as ${dccpUser.type}`);

                    const publicMetadata: any = {
                        role: dccpUser.type,
                    };

                    if (dccpUser.type === "student") {
                        const data = dccpUser.data as Student;
                        publicMetadata.studentId = data.student_id;
                        publicMetadata.dateOfBirth = data.basic_information.birth_date;
                        publicMetadata.phone = data.basic_information.phone;
                    } else if (dccpUser.type === "faculty") {
                        const data = dccpUser.data as Faculty;
                        publicMetadata.facultyId = data.faculty_id_number;
                        publicMetadata.phone = data.phone_number;
                    }

                    // Update Clerk Metadata
                    const client = await clerkClient();
                    await client.users.updateUserMetadata(userId!, {
                        publicMetadata,
                    });

                    // Redirect to the appropriate dashboard
                    const dashboardUrl = new URL(`/dashboard/${dccpUser.type}`, req.url);
                    return NextResponse.redirect(dashboardUrl);
                }
            }

            console.log("[PROXY] User not found in DCCP, redirecting to onboarding");
            const onboardingUrl = new URL("/onboarding", req.url);
            return NextResponse.redirect(onboardingUrl);
        }

        // Check role-specific required info
        if (userRole === "student") {
            const hasRequiredInfo =
                user?.publicMetadata?.studentId && user?.publicMetadata?.dateOfBirth && user?.publicMetadata?.phone;

            // If missing required info, redirect to onboarding
            if (!hasRequiredInfo) {
                console.log("[PROXY] Student missing required info, redirecting to onboarding");
                const onboardingUrl = new URL("/onboarding", req.url);
                return NextResponse.redirect(onboardingUrl);
            }

            // If student trying to access faculty dashboard or faculty-only routes, redirect to student dashboard
            if (isFacultyDashboard(req) || isFacultyOnlyRoute(req)) {
                console.log("[PROXY] Student trying to access faculty route, redirecting");
                const studentDashboardUrl = new URL("/dashboard/student", req.url);
                return NextResponse.redirect(studentDashboardUrl);
            }
        } else if (userRole === "faculty") {
            const hasRequiredInfo = user?.publicMetadata?.facultyId && user?.publicMetadata?.phone;

            // If missing required info, redirect to onboarding
            if (!hasRequiredInfo) {
                console.log("[PROXY] Faculty missing required info, redirecting to onboarding");
                const onboardingUrl = new URL("/onboarding", req.url);
                return NextResponse.redirect(onboardingUrl);
            }

            // If faculty trying to access student dashboard or student-only routes, redirect to faculty dashboard
            if (isStudentDashboard(req) || isStudentOnlyRoute(req)) {
                console.log("[PROXY] Faculty trying to access student route, redirecting");
                const facultyDashboardUrl = new URL("/dashboard/faculty", req.url);
                return NextResponse.redirect(facultyDashboardUrl);
            }
        }

        console.log("[PROXY] Allowing access to dashboard");
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
