"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
  LayoutGrid,
  List,
} from "lucide-react";
import { FacultyClass } from "./class-card";
import { useSemester } from "@/contexts/semester-context";
import Link from "next/link";
import React, { Suspense, useState } from "react";
import { ClassCardSkeleton } from "./skeletons/class-card-skeleton";
import { ModernClassCard } from "./modern-class-card";

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
        <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg self-start sm:self-auto">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
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
        <div className={cn(
          "grid gap-4 sm:gap-6",
          viewMode === "grid"
            ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            : "grid-cols-1"
        )}>
          {filteredClasses.map((cls) => (
            <Suspense key={cls.id} fallback={<ClassCardSkeleton />}>
              <ModernClassCard classItem={cls} viewMode={viewMode} />
            </Suspense>
          ))}
        </div>
      )}
    </div>
  );
}


