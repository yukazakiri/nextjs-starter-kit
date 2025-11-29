"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle2,
  Clock,
  Circle,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ChecklistItem {
  subjectId: string;
  code: string;
  title: string;
  description: string | null;
  units: number | null;
  lecture: number | null;
  laboratory: number | null;
  prerequisite: string | null;
  academicYear: number | null;
  semester: number | null;
  group: string | null;
  classification: string;
  status: "not-started" | "ongoing" | "finished";
  grade: number | null;
  enrollmentId: string | null;
  instructor: string | null;
  section: string | null;
  remarks: string | null;
  schoolYear: string | null;
  enrolledSemester: number | null;
  isCredited: boolean;
}

interface Statistics {
  totalSubjects: number;
  finishedSubjects: number;
  ongoingSubjects: number;
  notStartedSubjects: number;
  gwa: number | null;
  earnedUnits: number;
  totalUnits: number;
  completionPercentage: number;
}

export default function MyChecklistPage() {
  const { user, isLoaded } = useUser();
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "not-started" | "ongoing" | "finished"
  >("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");

  const studentId = user?.publicMetadata?.studentId as string | undefined;

  useEffect(() => {
    async function fetchChecklist() {
      console.log("🔍 Checklist Page - Fetching for student:", studentId);

      if (!studentId) {
        console.warn("⚠️ No student ID available");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const url = `/api/student/checklist?studentId=${studentId}`;
        console.log("📡 Fetching from:", url);

        const response = await fetch(url);
        const data = await response.json();

        console.log("📦 Response data:", data);

        if (data.success) {
          console.log(
            "✅ Successfully fetched checklist:",
            data.checklist.length,
          );
          setChecklist(data.checklist);
          setStatistics(data.statistics);
        } else {
          console.error("❌ Failed to fetch checklist:", data.error);
        }
      } catch (error) {
        console.error("💥 Error fetching checklist:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchChecklist();
  }, [studentId]);

  const getStatusBadge = (status: ChecklistItem["status"]) => {
    switch (status) {
      case "finished":
        return (
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Finished
          </Badge>
        );
      case "ongoing":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            <Clock className="h-3 w-3 mr-1" />
            Ongoing
          </Badge>
        );
      case "not-started":
        return (
          <Badge variant="outline" className="text-slate-600">
            <Circle className="h-3 w-3 mr-1" />
            Not Started
          </Badge>
        );
    }
  };

  const getGradeColor = (grade: number | null) => {
    if (!grade) return "text-slate-400";
    if (grade <= 1.5) return "text-emerald-600";
    if (grade <= 2.0) return "text-blue-600";
    if (grade <= 2.5) return "text-amber-600";
    if (grade <= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  // Get unique years for filtering
  const uniqueYears = Array.from(
    new Set(
      checklist
        .map((item) => item.academicYear)
        .filter((year) => year !== null),
    ),
  ).sort() as number[];

  // Filter checklist
  const filteredChecklist = checklist.filter((item) => {
    const matchesStatus =
      filterStatus === "all" || item.status === filterStatus;
    const matchesYear =
      filterYear === "all" || item.academicYear === filterYear;
    return matchesStatus && matchesYear;
  });

  // Group by year and semester
  const groupedChecklist = filteredChecklist.reduce(
    (acc, item) => {
      const year = item.academicYear || 0;
      const semester = item.semester || 0;
      const key = `Year ${year} - Semester ${semester}`;

      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    },
    {} as Record<string, ChecklistItem[]>,
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your checklist...</p>
        </div>
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load checklist data. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            My Checklist
          </h1>
          <p className="text-slate-600">
            Track your progress through all subjects in your course curriculum
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Completion</p>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {statistics.completionPercentage}%
              </p>
              <Progress
                value={statistics.completionPercentage}
                className="h-2 mt-2"
              />
              <p className="text-xs text-slate-500 mt-1">
                {statistics.finishedSubjects} of {statistics.totalSubjects}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Current GWA</p>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {statistics.gwa ? statistics.gwa.toFixed(2) : "-"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {statistics.finishedSubjects} subjects
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Units Earned</p>
                <GraduationCap className="h-4 w-4 text-violet-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {statistics.earnedUnits}
                <span className="text-lg text-slate-400">
                  /{statistics.totalUnits}
                </span>
              </p>
              <Progress
                value={(statistics.earnedUnits / statistics.totalUnits) * 100}
                className="h-2 mt-2"
              />
            </CardContent>
          </Card>

          <Card className="border-2 bg-gradient-to-br from-emerald-50 to-green-50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-emerald-800">Status</p>
                <Award className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-emerald-800">
                    {statistics.finishedSubjects} Finished
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    {statistics.ongoingSubjects} Ongoing
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Circle className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">
                    {statistics.notStartedSubjects} Not Started
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-2">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All Subjects
              </Button>
              <Button
                variant={filterStatus === "finished" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("finished")}
                className={
                  filterStatus === "finished"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : ""
                }
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Finished
              </Button>
              <Button
                variant={filterStatus === "ongoing" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("ongoing")}
                className={
                  filterStatus === "ongoing"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }
              >
                <Clock className="h-4 w-4 mr-1" />
                Ongoing
              </Button>
              <Button
                variant={filterStatus === "not-started" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("not-started")}
              >
                <Circle className="h-4 w-4 mr-1" />
                Not Started
              </Button>

              <div className="ml-auto flex gap-2">
                <Button
                  variant={filterYear === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterYear("all")}
                >
                  All Years
                </Button>
                {uniqueYears.map((year) => (
                  <Button
                    key={year}
                    variant={filterYear === year ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterYear(year)}
                  >
                    Year {year}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Checklist Table - Grouped by Year/Semester */}
        {Object.entries(groupedChecklist).map(([groupKey, items]) => (
          <Card key={groupKey} className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                {groupKey}
                <Badge variant="outline" className="ml-auto">
                  {items.length} subjects
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Code</TableHead>
                      <TableHead>Subject Title</TableHead>
                      <TableHead className="text-center">Units</TableHead>
                      <TableHead className="text-center">Grade</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.subjectId}>
                        <TableCell className="font-mono font-semibold">
                          {item.code}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.title}</div>
                            {item.prerequisite && (
                              <div className="text-xs text-slate-500">
                                Prerequisite: {item.prerequisite}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-semibold">
                            {item.units || "-"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {item.grade ? (
                            <span
                              className={`font-bold text-lg ${getGradeColor(item.grade)}`}
                            >
                              {item.grade.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {getStatusBadge(item.status)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredChecklist.length === 0 && (
          <Alert>
            <AlertTitle>No subjects found</AlertTitle>
            <AlertDescription>
              Try adjusting your filters to see more subjects.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
