"use client";

import { useEffect, useState } from "react";
import { ModernStudentDashboard } from "./modern-student-dashboard";
import { useSemester } from "@/contexts/semester-context";
import type { EnrollmentStatus } from "@/lib/enrollment";

interface StudentDashboardWrapperProps {
  studentId: string;
  userName: string;
}

export function StudentDashboardWrapper({
  studentId,
  userName,
}: StudentDashboardWrapperProps) {
  const { semester, schoolYear } = useSemester();
  const [enrollmentStatus, setEnrollmentStatus] = useState<EnrollmentStatus>({
    isEnrolled: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchEnrollmentStatus() {
      if (!semester || !schoolYear) {
        console.log("⏳ Waiting for semester/schoolYear...", {
          semester,
          schoolYear,
        });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      console.log("🔍 Fetching enrollment status:", {
        studentId,
        semester,
        schoolYear,
      });

      try {
        const url = `/api/enrollment-status?studentId=${studentId}&semester=${semester}&schoolYear=${encodeURIComponent(schoolYear)}`;
        console.log("📡 API URL:", url);

        const response = await fetch(url);

        console.log(
          "📡 Response status:",
          response.status,
          response.statusText,
        );

        if (!response.ok) {
          console.error("❌ HTTP error:", response.status, response.statusText);
          const errorText = await response.text();
          console.error("❌ Error response:", errorText);
          setEnrollmentStatus({ isEnrolled: false });
          return;
        }

        const data = await response.json();

        console.log("📦 API Response:", data);

        if (data.success) {
          console.log("✅ Enrollment status:", data.enrollmentStatus);
          setEnrollmentStatus(data.enrollmentStatus);
        } else {
          console.error("❌ API returned success: false", data);
          console.error("❌ Error details:", data.error, data.details);
          setEnrollmentStatus({ isEnrolled: false });
        }
      } catch (error) {
        console.error("💥 Failed to fetch enrollment status:", error);
        setEnrollmentStatus({ isEnrolled: false });
      } finally {
        setIsLoading(false);
      }
    }

    fetchEnrollmentStatus();
  }, [studentId, semester, schoolYear]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <ModernStudentDashboard
      enrollmentStatus={enrollmentStatus}
      currentSemester={semester}
      currentCurriculumYear={schoolYear}
      schoolYear={schoolYear}
      userName={userName}
    />
  );
}
