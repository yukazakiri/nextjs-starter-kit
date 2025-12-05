"use client";

import { useSemester } from "@/contexts/semester-context";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { DashboardHeader } from "./dashboard-header";
import { StatsCards } from "./stats-cards";
import { ScheduleTimeline } from "./schedule-timeline";
import { QuickActions } from "./quick-actions";
import { RecentActivity } from "./recent-activity";
import { UpcomingDeadlines } from "./upcoming-deadlines";
import { FacultyDashboardSkeleton } from "./skeletons/faculty-dashboard-skeleton";

interface FacultyDashboardClientProps {
  facultyId: string;
  firstName?: string;
  lastName?: string;
  department?: string;
}

interface FacultyData {
  id: string;
  faculty_id_number: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  full_name: string;
  email: string;
  phone_number: string;
  department: string;
  office_hours: string | null;
  birth_date: string;
  address_line1: string;
  biography: string;
  education: string;
  courses_taught: string | null;
  photo_url: string | null;
  status: string;
  gender: string;
  age: number;
  created_at: string;
  updated_at: string;
  classes: Array<{
    id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    school_year: string;
    semester: string;
    classification: string;
    maximum_slots: number;
    grade_level: string;
    student_count: string;
    display_info: string;
  }>;
  account: string;
  department_relation: string;
  class_enrollments_count: number;
  classes_count: number;
}

export function FacultyDashboardClient({
  facultyId,
  firstName,
  lastName,
  department,
}: FacultyDashboardClientProps) {
  const { semester, schoolYear, isLoading: semesterLoading } = useSemester();
  const { isLoaded: userLoaded } = useUser();
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [classCount, setClassCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  // Fetch faculty data when component mounts or semester/year changes
  useEffect(() => {
    if (!facultyId || !userLoaded) return;

    async function fetchFacultyData() {
      try {
        setIsLoading(true);
        // console.log(`🔄 Fetching faculty data for ${facultyId}, semester: ${semester}, year: ${schoolYear}`);

        const response = await fetch(`/api/faculty/${facultyId}`, {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch faculty data");
        }

        const data = await response.json();
        // console.log(`✅ Fetched faculty data:`, data);

        if (data?.data) {
          setFacultyData(data.data);
        }
      } catch (error) {
        console.error("❌ Error fetching faculty data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchFacultyData();
  }, [facultyId, userLoaded]);

  // Filter and calculate stats when faculty data or semester/year changes
  useEffect(() => {
    if (!facultyData) return;

    // Filter classes by current semester
    const filteredClasses = facultyData.classes?.filter(cls => {
      const clsSemester = cls.semester?.toString() || "";
      const clsSchoolYear = cls.school_year?.toString() || "";
      const matchesSemester = clsSemester === semester;
      const matchesYear = clsSchoolYear.includes(schoolYear);
      return matchesSemester && matchesYear;
    }) || [];

    const classCount = filteredClasses.length;
    const totalStudents = filteredClasses.reduce(
      (sum, cls) => sum + (parseInt(cls.student_count) || 0),
      0
    );

    // console.log(
    //   `🔄 Dashboard Filter Changed - Semester ${semester}, Year ${schoolYear}: showing ${classCount} classes, ${totalStudents} students`
    // );

    setClassCount(classCount);
    setTotalStudents(totalStudents);
  }, [facultyData, semester, schoolYear]);

  // Show loading state
  if (semesterLoading || isLoading || !userLoaded) {
    return <FacultyDashboardSkeleton />;
  }

  return (
    <div className="p-6 space-y-8 w-full">
      <DashboardHeader
        firstName={firstName}
        lastName={lastName}
        department={department}
        semester={semester}
        schoolYear={schoolYear}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-4">
          <StatsCards
            classCount={classCount}
            totalStudents={totalStudents}
            pendingTasks={0} // Placeholder
            attendanceRate={0} // Placeholder
            semester={semester}
          />
        </div>

        {/* Bento Grid Layout */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3 grid gap-6 grid-rows-[auto_1fr]">
          {/* Quick Actions - Full Width of Left Column */}
          <div className="w-full">
            <QuickActions />
          </div>

          {/* Activity & Deadlines - Side by Side on Large */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
            <RecentActivity />
            <UpcomingDeadlines />
          </div>
        </div>

        {/* Schedule - Right Column, Full Height */}
        <div className="col-span-1 md:col-span-2 lg:col-span-1 h-full">
          <ScheduleTimeline schedule={[]} />
        </div>
      </div>
    </div>
  );
}
