import { Card, CardContent, CardHeader } from "@/components/ui/card";
import * as skeleton from "@/components/ui/skeleton";
import { FacultyScheduleCardSkeleton } from "./faculty-schedule-card-skeleton";
import { FacultyStatsCardSkeleton } from "./faculty-stats-card-skeleton";

export function FacultyDashboardSkeleton() {
    return (
        <div className="p-6 space-y-8 w-full">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
                <div className="space-y-2">
                    <skeleton.Skeleton className="h-9 w-96" />
                    <skeleton.Skeleton className="h-5 w-72" />
                </div>
                <div className="flex flex-col items-end gap-2">
                    <skeleton.Skeleton className="h-4 w-48" />
                    <skeleton.Skeleton className="h-6 w-32 rounded-full" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="col-span-1 md:col-span-2 lg:col-span-4">
                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <FacultyStatsCardSkeleton />
                        <FacultyStatsCardSkeleton />
                        <FacultyStatsCardSkeleton />
                        <FacultyStatsCardSkeleton />
                    </div>
                </div>

                {/* Bento Grid Layout */}
                <div className="col-span-1 md:col-span-2 lg:col-span-3 grid gap-6 grid-rows-[auto_1fr]">
                    {/* Quick Actions */}
                    <Card className="h-full">
                        <CardHeader>
                            <skeleton.Skeleton className="h-6 w-48" />
                            <skeleton.Skeleton className="h-4 w-64" />
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className="p-6 border rounded-xl flex flex-col items-center space-y-3">
                                        <skeleton.Skeleton className="h-8 w-8 rounded-full" />
                                        <div className="space-y-1 w-full flex flex-col items-center">
                                            <skeleton.Skeleton className="h-4 w-24" />
                                            <skeleton.Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity & Deadlines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <skeleton.Skeleton className="h-5 w-5 rounded" />
                                    <skeleton.Skeleton className="h-6 w-40" />
                                </div>
                                <skeleton.Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                    <skeleton.Skeleton className="h-12 w-12 rounded-full" />
                                    <skeleton.Skeleton className="h-4 w-48" />
                                    <skeleton.Skeleton className="h-3 w-32" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="h-full">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <skeleton.Skeleton className="h-5 w-5 rounded" />
                                    <skeleton.Skeleton className="h-6 w-40" />
                                </div>
                                <skeleton.Skeleton className="h-4 w-48" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                                    <skeleton.Skeleton className="h-12 w-12 rounded-full" />
                                    <skeleton.Skeleton className="h-4 w-48" />
                                    <skeleton.Skeleton className="h-3 w-32" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Schedule */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1 h-full">
                    <FacultyScheduleCardSkeleton />
                </div>
            </div>
        </div>
    );
}
