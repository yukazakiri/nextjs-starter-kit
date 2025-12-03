"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { EnhancedClassesLayout } from "./enhanced-classes-layout";
import { FacultyClass } from "./class-card";
import { DashboardStatsSkeleton } from "./skeletons/dashboard-stats-skeleton";

export function ClassesPageClient() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [classes, setClasses] = useState<FacultyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClasses() {
      if (!isUserLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const facultyId = user.publicMetadata?.facultyId as string;

        if (!facultyId) {
          setError("No faculty ID found");
          setLoading(false);
          return;
        }

        // Fetch data from API route - endpoint gets authenticated user automatically
        const response = await fetch("/api/faculty/classes", {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch classes");
        }

        const data = await response.json();
        // Transform the data to match FacultyClass interface
        const transformedClasses = (data.classes || []).map((cls: any) => ({
          id: cls.id,
          subjectCode: cls.subjectCode,
          subjectName: cls.subjectName,
          section: cls.section,
          semester: cls.semester,
          originalSemester: cls.semester === "1" ? "1st Semester" : cls.semester === "2" ? "2nd Semester" : cls.semester,
          schoolYear: cls.schoolYear,
          enrolledStudents: cls.enrolledStudents,
          maximumSlots: cls.maximumSlots,
          credits: cls.credits,
          lecture: cls.lecture,
          laboratory: cls.laboratory,
          classification: cls.classification,
          gradeLevel: cls.gradeLevel,
          faculty: data.faculty?.name || "Faculty",
          department: data.faculty?.department || "",
          color: cls.color,
          status: cls.status,
          progress: cls.progress,
          completionRate: cls.completionRate,
          gradeDistribution: cls.gradeDistribution,
          schedules: cls.schedules,
          formattedSchedule: cls.formattedSchedule,
          isFull: cls.isFull,
          availableSlots: cls.availableSlots,
        }));

        setClasses(transformedClasses);
      } catch (err) {
        console.error("Error fetching classes:", err);
        setError(err instanceof Error ? err.message : "Failed to load classes");
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, [user, isUserLoaded]);

  if (!isUserLoaded || loading) {
    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header skeleton */}
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-40 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>
        </div>

        {/* Dashboard stats skeleton */}
        <DashboardStatsSkeleton />

        {/* Class cards skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-red-500 mb-2">Error Loading Classes</h1>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return <EnhancedClassesLayout initialClasses={classes} />;
}
