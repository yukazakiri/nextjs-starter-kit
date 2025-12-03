import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClassesPageClient } from "./_components/classes-page-client";
import { ClassCardSkeleton } from "./_components/skeletons/class-card-skeleton";
import { DashboardStatsSkeleton } from "./_components/skeletons/dashboard-stats-skeleton";

export default async function FacultyClassesPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const facultyId = user.publicMetadata?.facultyId as string;

    if (!facultyId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-muted-foreground">You do not have a faculty ID associated with your account.</p>
            </div>
        );
    }

    return (
        <Suspense fallback={<InitialPageSkeleton />}>
            <ClassesPageClient />
        </Suspense>
    );
}

// Initial skeleton shown immediately on navigation
function InitialPageSkeleton() {
    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Header skeleton */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-96 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="h-10 w-full sm:w-40 bg-muted rounded animate-pulse" />
                    <div className="h-10 w-full sm:w-32 bg-muted rounded animate-pulse" />
                </div>
            </div>

            {/* Dashboard stats skeleton */}
            <DashboardStatsSkeleton />

            {/* Class cards skeleton - Show more cards to fill the screen */}
            <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                    <ClassCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}
