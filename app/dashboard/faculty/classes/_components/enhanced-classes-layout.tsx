"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Users,
  Calendar,
  FolderOpen,
  MoreVertical,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  ClipboardCheck,
  UserCheck,
  Award,
  Bell,
} from "lucide-react";
import { FacultyClass } from "./class-card";
import { useSemester } from "@/contexts/semester-context";
import Link from "next/link";
import React, { Suspense } from "react";
import { ClassCardSkeleton } from "./skeletons/class-card-skeleton";

interface EnhancedClassesLayoutProps {
  initialClasses: FacultyClass[];
}

// Generate color index from subject code (0-9)
function getColorIndex(subjectCode: string): number {
  return subjectCode
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 10;
}

export function EnhancedClassesLayout({ initialClasses }: EnhancedClassesLayoutProps) {
  const { semester, schoolYear } = useSemester();

  // Filter classes based on global academic period
  const filteredClasses = initialClasses.filter((cls) => {
    const matchesSemester = cls.semester === semester;
    const matchesYear = cls.schoolYear.includes(schoolYear);
    return matchesSemester && matchesYear;
  });

  // Calculate dashboard stats
  const totalClasses = filteredClasses.length;
  const totalStudents = filteredClasses.reduce((sum, cls) => sum + cls.enrolledStudents, 0);
  const fullClasses = filteredClasses.filter((cls) => cls.enrolledStudents >= cls.maximumSlots).length;
  const lowEnrollmentClasses = filteredClasses.filter(
    (cls) => cls.enrolledStudents < cls.maximumSlots * 0.5 && cls.enrolledStudents > 0
  ).length;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* HEADER SECTION - Mobile First */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">My Classes</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            {semester === "1" ? "1st Semester" : semester === "2" ? "2nd Semester" : semester} {schoolYear} • {totalClasses} {totalClasses === 1 ? "class" : "classes"}
          </p>
        </div>

        {/* Action Buttons - Mobile stacked, Desktop inline */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" className="w-full sm:w-auto">
            <FolderOpen className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="w-full sm:w-auto">
            <BookOpen className="h-4 w-4 mr-2" />
            Create Class
          </Button>
        </div>
      </div>

      {/* DASHBOARD OVERVIEW CARDS - Mobile First Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Classes</CardTitle>
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">{totalClasses}</div>
            <p className="text-xs text-muted-foreground">
              {semester === "1" ? "1st" : semester === "2" ? "2nd" : semester} sem
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Students</CardTitle>
            <Users className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled</p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Full</CardTitle>
            <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-green-600">{fullClasses}</div>
            <p className="text-xs text-muted-foreground">
              {totalClasses > 0 ? Math.round((fullClasses / totalClasses) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Low Enroll</CardTitle>
            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xl sm:text-2xl font-bold text-amber-600">{lowEnrollmentClasses}</div>
            <p className="text-xs text-muted-foreground">Attention</p>
          </CardContent>
        </Card>
      </div>

      {/* CLASSES GRID - Mobile First */}
      {filteredClasses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No classes found</h3>
          <p className="text-sm text-muted-foreground">
            No classes for {semester === "1" ? "1st" : semester === "2" ? "2nd" : semester} semester {schoolYear}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Use the academic period selector in the sidebar
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClasses.map((cls) => (
            <Suspense key={cls.id} fallback={<ClassCardSkeleton />}>
              <GradientClassCard classItem={cls} />
            </Suspense>
          ))}
        </div>
      )}
    </div>
  );
}

function GradientClassCard({ classItem }: { classItem: FacultyClass }) {
  const enrollmentPercentage = (classItem.enrolledStudents / classItem.maximumSlots) * 100;
  const isFull = classItem.enrolledStudents >= classItem.maximumSlots;
  const isLowEnrollment = classItem.enrolledStudents < classItem.maximumSlots * 0.5 && classItem.enrolledStudents > 0;
  const isEmpty = classItem.enrolledStudents === 0;

  // Get color index based on subject code
  const colorIndex = getColorIndex(classItem.subjectCode);

  return (
    <Link
      href={`/dashboard/faculty/classes/${classItem.id}`}
      className="group relative overflow-hidden rounded-xl border bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer block"
      style={{
        background: `linear-gradient(135deg,
          hsl(var(--primary) / 0.05) 0%,
          hsl(var(--accent) / 0.1) 100%),
          linear-gradient(to bottom right,
          hsla(${colorIndex * 36}, 70%, 60%, 0.15) 0%,
          hsla(${colorIndex * 36 + 60}, 70%, 60%, 0.05) 100%)`
      }}
    >
      {/* Colored accent bar */}
      <div
        className="h-1 w-full"
        style={{
          background: `hsl(${colorIndex * 36}, 70%, 60%)`
        }}
      />

      <div className="p-4 sm:p-5 space-y-4">
        {/* HEADER */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <Badge
                  variant="secondary"
                  className="font-mono text-xs"
                  style={{
                    backgroundColor: `hsla(${colorIndex * 36}, 70%, 60%, 0.2)`,
                    color: `hsl(${colorIndex * 36}, 70%, 40%)`,
                    borderColor: `hsla(${colorIndex * 36}, 70%, 60%, 0.3)`
                  }}
                >
                  {classItem.subjectCode}
                </Badge>
                {isFull && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                {isLowEnrollment && <TrendingUp className="h-4 w-4 text-amber-600" />}
                {isEmpty && <AlertCircle className="h-4 w-4 text-red-600" />}
              </div>

              <h3 className="font-semibold text-base sm:text-lg line-clamp-2 leading-tight text-card-foreground">
                {classItem.subjectName}
              </h3>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                // Prevent card navigation when clicking the menu button
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              Section {classItem.section}
            </Badge>
            {isFull && (
              <Badge variant="outline" className="text-xs border-green-500/30 text-green-700">
                Full
              </Badge>
            )}
            {isLowEnrollment && !isFull && (
              <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-700">
                Low Enrollment
              </Badge>
            )}
            {isEmpty && (
              <Badge variant="outline" className="text-xs border-red-500/30 text-red-700">
                No Students
              </Badge>
            )}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* ENROLLMENT SECTION */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{classItem.enrolledStudents}</span>
              <span className="text-xs text-muted-foreground">/ {classItem.maximumSlots}</span>
            </div>
            <span className="text-sm font-bold">{Math.round(enrollmentPercentage)}%</span>
          </div>

          <Progress
            value={enrollmentPercentage}
            className="h-2"
            style={{
              '--progress-background': `hsl(${colorIndex * 36}, 70%, 60%)`
            } as React.CSSProperties}
          />

          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">
              {classItem.availableSlots > 0
                ? `${classItem.availableSlots} available`
                : "Full"}
            </span>
            {isLowEnrollment && (
              <span className="text-amber-600 font-medium">Needs recruitment</span>
            )}
            {isFull && (
              <span className="text-green-600 font-medium">Capacity reached</span>
            )}
          </div>
        </div>

        <Separator className="bg-border/50" />

        {/* SEMESTER */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>
            {classItem.originalSemester || classItem.semester} • {classItem.schoolYear}
          </span>
        </div>

        {/* QUICK ACTIONS - Mobile First: Stack vertically on mobile, 2x2 grid on larger screens */}
        <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => {
          // Prevent card navigation when clicking quick actions
          e.preventDefault();
          e.stopPropagation();
        }}>
          <Button
            size="sm"
            variant="outline"
            className="justify-start h-9 text-xs"
            onClick={(e) => {
              // Prevent card navigation
              e.preventDefault();
              e.stopPropagation();
              // Navigate to Students tab
              window.location.href = `/dashboard/faculty/classes/${classItem.id}?tab=people`;
            }}
          >
            <UserCheck className="h-3 w-3 mr-2" />
            <span className="hidden xs:inline">View </span>Students
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="justify-start h-9 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Navigate to Attendance tab
              window.location.href = `/dashboard/faculty/classes/${classItem.id}?tab=attendance`;
            }}
          >
            <ClipboardCheck className="h-3 w-3 mr-2" />
            <span className="hidden xs:inline">Take </span>Attendance
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="justify-start h-9 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Navigate to Grades tab
              window.location.href = `/dashboard/faculty/classes/${classItem.id}?tab=grades`;
            }}
          >
            <Award className="h-3 w-3 mr-2" />
            <span className="hidden xs:inline">Enter </span>Grades
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="justify-start h-9 text-xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Navigate to Announcements tab
              window.location.href = `/dashboard/faculty/classes/${classItem.id}?tab=announcements`;
            }}
          >
            <Bell className="h-3 w-3 mr-2" />
            <span className="hidden xs:inline">Post </span>Announce
          </Button>
        </div>
      </div>
    </Link>
  );
}
