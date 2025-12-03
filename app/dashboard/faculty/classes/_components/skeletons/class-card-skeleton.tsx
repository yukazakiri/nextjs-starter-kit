import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export function ClassCardSkeleton() {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm animate-pulse">
      {/* Colored accent bar - simulate gradient colors */}
      <div className="h-1 w-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />

      <div className="p-4 sm:p-5 space-y-4">
        {/* HEADER */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {/* Subject code badge */}
                <div className="h-6 w-16 bg-muted rounded" />
                {/* Status icons */}
                <div className="h-4 w-4 bg-muted rounded-full" />
                <div className="h-4 w-4 bg-muted rounded-full" />
                <div className="h-4 w-4 bg-muted rounded-full" />
                <div className="h-4 w-4 bg-muted rounded-full" />
              </div>

              {/* Subject name - 2 lines */}
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4" />
            </div>

            {/* Menu button */}
            <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
          </div>

          {/* Section and status badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="h-5 w-20 bg-muted rounded" />
            <div className="h-5 w-16 bg-muted rounded" />
            <div className="h-5 w-24 bg-muted rounded" />
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-border/50" />

        {/* ENROLLMENT SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded" />
              <div className="h-4 w-8 bg-muted rounded" />
              <div className="h-4 w-12 bg-muted rounded" />
            </div>
            <div className="h-4 w-12 bg-muted rounded" />
          </div>

          <Progress value={0} className="h-2" />

          <div className="flex justify-between">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="h-3 w-32 bg-muted rounded" />
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-border/50" />

        {/* SEMESTER */}
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 bg-muted rounded" />
          <div className="h-3 w-40 bg-muted rounded" />
        </div>

        {/* QUICK ACTIONS - 2x2 grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="h-9 bg-muted rounded-md" />
          <div className="h-9 bg-muted rounded-md" />
          <div className="h-9 bg-muted rounded-md" />
          <div className="h-9 bg-muted rounded-md" />
        </div>
      </div>
    </div>
  );
}
