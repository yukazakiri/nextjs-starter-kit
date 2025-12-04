import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ClassCardSkeleton() {
    return (
        <Card className="h-full flex flex-col overflow-hidden border-0 shadow-md bg-card ring-1 ring-border/50">
            {/* Banner Skeleton */}
            <div className="relative h-36 w-full p-5 flex flex-col justify-between bg-muted/30">
                <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-16 bg-muted-foreground/10" />
                    <Skeleton className="h-8 w-8 rounded-md bg-muted-foreground/10" />
                </div>

                <div className="flex justify-between items-end">
                    <Skeleton className="h-6 w-20 bg-muted-foreground/10" />
                </div>
            </div>

            <CardContent className="p-5 flex-1 flex flex-col gap-4">
                {/* Subject Name & Semester Skeleton */}
                <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3 rounded-full" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>

                {/* Progress Bar Skeleton */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-12" />
                        <Skeleton className="h-3 w-10" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                </div>

                <div className="h-px w-full bg-border/50" />

                {/* Meta Info Grid Skeleton */}
                <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-32" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-3 w-20" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
