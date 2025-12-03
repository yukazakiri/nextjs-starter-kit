"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, useRouter, useParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { PeopleTab } from "./people-tab";
import { GradesTab } from "./grades-tab";
import { ClassTabsSkeleton } from "../../_components/skeletons/class-tabs-skeleton";
import { AttendanceTabSkeleton } from "./skeletons/attendance-tab-skeleton";
import { AnnouncementsTabSkeleton } from "./skeletons/announcements-tab-skeleton";
import React from "react";

// Lazy load tab components for better performance
const StreamTab = React.lazy(() => import("./stream-tab").then(m => ({ default: m.StreamTab })));
const ClassworkTab = React.lazy(() => import("./classwork-tab").then(m => ({ default: m.ClassworkTab })));
const AttendanceTab = React.lazy(() => import("./attendance-tab").then(m => ({ default: m.AttendanceTab })));
const AnnouncementsTab = React.lazy(() => import("./announcements-tab").then(m => ({ default: m.AnnouncementsTab })));

interface ClassTabsProps {
  classId: string;
  averageGrade?: string;
  latestResource?: any;
  recentResources?: any[];
  enrolledStudents?: any[];
}

export function ClassTabs({ classId, averageGrade, latestResource, recentResources, enrolledStudents = [] }: ClassTabsProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const params = useParams();

  // Get the active tab from URL query parameter - default to "stream"
  const getInitialTab = () => {
    if (typeof window !== 'undefined') {
      // Client-side: read from URL
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get("tab") || "stream";
    }
    // Server-side: default to "stream"
    return "stream";
  };

  // Set initial tab - always default to "stream" for consistency
  const [activeTab, setActiveTab] = useState("stream");
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate after mount to avoid SSR mismatch
  useEffect(() => {
    const initialTab = searchParams.get("tab") || "stream";
    setActiveTab(initialTab);
    setIsHydrated(true);
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // Create new URL with updated tab parameter
    const url = new URL(window.location.href);
    url.searchParams.set("tab", value);

    // Update URL without page reload
    router.push(url.pathname + url.search, { scroll: false });
  };

  // Don't render tabs until hydrated to avoid SSR mismatch
  if (!isHydrated) {
    return (
      <div className="w-full">
        <div className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3">
            <div className="h-10 bg-muted/50 rounded-full w-full animate-pulse" />
          </div>
        </div>
        <div className="py-6">
          <ClassTabsSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full" suppressHydrationWarning>
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full" suppressHydrationWarning>
        <div className="border-b sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-3">
            <TabsList className="h-auto bg-transparent p-0 gap-2 justify-start overflow-x-auto no-scrollbar w-full">
              <TabsTrigger
                value="stream"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Stream
              </TabsTrigger>
              <TabsTrigger
                value="classwork"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Classwork
              </TabsTrigger>
              <TabsTrigger
                value="people"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="attendance"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Attendance
              </TabsTrigger>
              <TabsTrigger
                value="announcements"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Announcements
              </TabsTrigger>
              <TabsTrigger
                value="grades"
                className="rounded-full border px-4 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary hover:bg-muted transition-colors"
              >
                Grades
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="py-6">
          <TabsContent value="stream" className="mt-0">
            <Suspense fallback={<ClassTabsSkeleton />}>
              <StreamTab
                classId={classId}
                averageGrade={averageGrade}
                latestResource={latestResource}
                recentResources={recentResources}
              />
            </Suspense>
          </TabsContent>

          <TabsContent value="classwork" className="mt-0">
            <Suspense fallback={<ClassTabsSkeleton />}>
              <ClassworkTab />
            </Suspense>
          </TabsContent>

          <TabsContent value="people" className="mt-0 animate-in fade-in-50 duration-300">
            <PeopleTab enrolledStudents={enrolledStudents} />
          </TabsContent>

          <TabsContent value="attendance" className="mt-0">
            <Suspense fallback={<AttendanceTabSkeleton />}>
              <AttendanceTab classId={classId} enrolledStudents={enrolledStudents} />
            </Suspense>
          </TabsContent>

          <TabsContent value="announcements" className="mt-0">
            <Suspense fallback={<AnnouncementsTabSkeleton />}>
              <AnnouncementsTab classId={classId} />
            </Suspense>
          </TabsContent>

          <TabsContent value="grades" className="mt-0 animate-in fade-in-50 duration-300">
            <GradesTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

