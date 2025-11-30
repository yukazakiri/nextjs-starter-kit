import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClassCardSkeleton() {
    return (
        <Card className="h-full flex flex-col overflow-hidden border-0 shadow-md bg-card">
            {/* Gradient Cover Header Skeleton */}
            <div className="relative h-32 w-full p-6 flex flex-col justify-between bg-muted/30">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-20 bg-muted-foreground/20" />
                    <Skeleton className="h-8 w-8 rounded-md bg-muted-foreground/20" />
                </div>

                <div className="flex justify-between items-end">
                    <Skeleton className="h-6 w-24 bg-muted-foreground/20" />
                </div>
            </div>

            <CardContent className="p-6 flex-1 flex flex-col gap-4">
                {/* Subject Name Skeleton */}
                <div>
                    <Skeleton className="h-7 w-3/4 mb-2" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                {/* Progress Information Skeleton */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-16" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-32 h-2 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-8" />
                    </div>
                </div>

                {/* Class Information Skeleton */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-16" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </div>

                    {/* Schedule Information Skeleton */}
                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-16" />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-12" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-5 w-12" />
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Skeleton className="h-3 w-16" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4 rounded-full" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
