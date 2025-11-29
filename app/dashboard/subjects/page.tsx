"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Users,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useSemester } from "@/contexts/semester-context";

interface ClassData {
  enrollmentId: string;
  classId: number;
  subjectCode: string;
  subjectName: string;
  subjectDescription: string | null;
  section: string | null;
  room: string | null;
  semester: string | null;
  schoolYear: string | null;
  academicYear: string | null;
  units: number | null;
  lecture: number | null;
  laboratory: number | null;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalsGrade: number | null;
  totalAverage: number | null;
  isGradesFinalized: boolean;
  isPrelimSubmitted: boolean;
  isMidtermSubmitted: boolean;
  isFinalsSubmitted: boolean;
  facultyId: string | null;
  enrolledAt: string;
  completionDate: string | null;
}

interface GroupedClasses {
  [key: string]: ClassData[];
}

export default function MyClassesPage() {
  const { user, isLoaded } = useUser();
  const { semester, schoolYear } = useSemester();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const studentId = user?.publicMetadata?.studentId as string | undefined;

  useEffect(() => {
    async function fetchClasses() {
      console.log(
        "🔍 My Classes Page - Starting fetch with studentId:",
        studentId,
        "semester:",
        semester,
        "schoolYear:",
        schoolYear,
      );

      if (!studentId) {
        console.warn("⚠️ No student ID available");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch classes for current semester and school year
        const url = `/api/student/subjects?studentId=${studentId}&semester=${semester}&schoolYear=${schoolYear}`;
        console.log("📡 Fetching from:", url);

        const response = await fetch(url);
        console.log("📡 Response status:", response.status);

        const data = await response.json();
        console.log("📦 Response data:", data);

        if (data.success) {
          console.log("✅ Successfully fetched classes:", data.subjects.length);
          setClasses(data.subjects);

          // Auto-expand the first section
          if (data.subjects.length > 0) {
            const firstKey = `${data.subjects[0].schoolYear}-${data.subjects[0].semester}`;
            setOpenSections({ [firstKey]: true });
          }
        } else {
          console.error(
            "❌ Failed to fetch classes:",
            data.error,
            data.details,
          );
        }
      } catch (error) {
        console.error("💥 Error fetching classes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, [studentId, semester, schoolYear]);

  const getGradeColor = (grade: number | null) => {
    if (!grade) return "text-slate-400";
    if (grade <= 1.5) return "text-emerald-600";
    if (grade <= 2.0) return "text-blue-600";
    if (grade <= 2.5) return "text-amber-600";
    if (grade <= 3.0) return "text-orange-600";
    return "text-red-600";
  };

  const getGradeBadgeColor = (grade: number | null) => {
    if (!grade) return "bg-slate-100 text-slate-600 border-slate-300";
    if (grade <= 1.5)
      return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (grade <= 2.0) return "bg-blue-100 text-blue-800 border-blue-300";
    if (grade <= 2.5) return "bg-amber-100 text-amber-800 border-amber-300";
    if (grade <= 3.0) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const calculateCurrentGrade = (classData: ClassData) => {
    if (classData.totalAverage) return classData.totalAverage;
    if (classData.finalsGrade) return classData.finalsGrade;
    if (classData.midtermGrade) return classData.midtermGrade;
    if (classData.prelimGrade) return classData.prelimGrade;
    return null;
  };

  // Group classes by school year and semester
  const groupedClasses: GroupedClasses = classes.reduce((acc, classData) => {
    const key = `${classData.schoolYear || "Unknown"} - Semester ${classData.semester || "?"}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(classData);
    return acc;
  }, {} as GroupedClasses);

  // Sort groups by year and semester (most recent first)
  const sortedGroups = Object.entries(groupedClasses).sort((a, b) => {
    const [yearA, semA] = [a[1][0]?.schoolYear || "", a[1][0]?.semester || "0"];
    const [yearB, semB] = [b[1][0]?.schoolYear || "", b[1][0]?.semester || "0"];

    // Compare years first
    if (yearA !== yearB) {
      return yearB.localeCompare(yearA); // Descending order
    }
    // Then compare semesters
    return parseInt(semB) - parseInt(semA); // Descending order
  });

  const totalUnits = classes.reduce((sum, c) => sum + (c.units || 0), 0);
  const completedClasses = classes.filter((c) => c.isGradesFinalized).length;
  const averageGrade =
    classes.filter((c) => c.totalAverage).length > 0
      ? classes.reduce((sum, c) => sum + (c.totalAverage || 0), 0) /
        classes.filter((c) => c.totalAverage).length
      : null;

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            My Classes
          </h1>
          <p className="text-slate-600">
            View all your enrolled classes across all semesters
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Classes</p>
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {classes.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Units</p>
                <GraduationCap className="h-4 w-4 text-violet-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalUnits}</p>
              <p className="text-xs text-slate-500 mt-1">Enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Completed</p>
                <Award className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {completedClasses}
              </p>
              <p className="text-xs text-slate-500 mt-1">Finalized</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Average</p>
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <p
                className={`text-3xl font-bold ${getGradeColor(averageGrade)}`}
              >
                {averageGrade ? averageGrade.toFixed(2) : "-"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Overall GWA</p>
            </CardContent>
          </Card>
        </div>

        {/* Classes List - Collapsible by Semester */}
        {classes.length === 0 ? (
          <Alert className="border-2">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-lg">No Classes Found</AlertTitle>
            <AlertDescription className="text-base mt-2">
              You don't have any enrolled classes in your academic history.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {sortedGroups.map(([groupKey, groupClasses]) => {
              const isOpen =
                openSections[
                  `${groupClasses[0]?.schoolYear}-${groupClasses[0]?.semester}`
                ];
              const groupUnits = groupClasses.reduce(
                (sum, c) => sum + (c.units || 0),
                0,
              );
              const groupAverage =
                groupClasses.filter((c) => c.totalAverage).length > 0
                  ? groupClasses.reduce(
                      (sum, c) => sum + (c.totalAverage || 0),
                      0,
                    ) / groupClasses.filter((c) => c.totalAverage).length
                  : null;

              return (
                <Card key={groupKey} className="border-2">
                  <Collapsible
                    open={isOpen}
                    onOpenChange={() =>
                      toggleSection(
                        `${groupClasses[0]?.schoolYear}-${groupClasses[0]?.semester}`,
                      )
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isOpen ? (
                              <ChevronDown className="h-5 w-5 text-slate-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-slate-600" />
                            )}
                            <div>
                              <CardTitle className="flex items-center gap-2 text-xl">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                                {groupKey}
                              </CardTitle>
                              <p className="text-sm text-slate-600 mt-1">
                                {groupClasses.length} classes • {groupUnits}{" "}
                                units
                                {groupAverage && (
                                  <span
                                    className={`ml-2 font-semibold ${getGradeColor(groupAverage)}`}
                                  >
                                    • GWA: {groupAverage.toFixed(2)}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {
                              groupClasses.filter((c) => c.isGradesFinalized)
                                .length
                            }{" "}
                            Finalized
                          </Badge>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[100px]">
                                  Code
                                </TableHead>
                                <TableHead>Class Name</TableHead>
                                <TableHead className="text-center">
                                  Section
                                </TableHead>
                                <TableHead className="text-center">
                                  Room
                                </TableHead>
                                <TableHead className="text-center">
                                  Units
                                </TableHead>
                                <TableHead className="text-center">
                                  Prelim
                                </TableHead>
                                <TableHead className="text-center">
                                  Midterm
                                </TableHead>
                                <TableHead className="text-center">
                                  Finals
                                </TableHead>
                                <TableHead className="text-center">
                                  Grade
                                </TableHead>
                                <TableHead className="text-center">
                                  Status
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {groupClasses.map((classData) => (
                                <TableRow key={classData.enrollmentId}>
                                  <TableCell className="font-mono font-semibold">
                                    {classData.subjectCode}
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">
                                      {classData.subjectName}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {classData.section || "-"}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm">
                                      {classData.room ? (
                                        <>
                                          <MapPin className="h-3 w-3 text-slate-400" />
                                          {classData.room}
                                        </>
                                      ) : (
                                        "-"
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <span className="font-semibold">
                                      {classData.units || "-"}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {classData.prelimGrade ? (
                                      <span
                                        className={`font-semibold ${getGradeColor(classData.prelimGrade)}`}
                                      >
                                        {classData.prelimGrade.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {classData.midtermGrade ? (
                                      <span
                                        className={`font-semibold ${getGradeColor(classData.midtermGrade)}`}
                                      >
                                        {classData.midtermGrade.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {classData.finalsGrade ? (
                                      <span
                                        className={`font-semibold ${getGradeColor(classData.finalsGrade)}`}
                                      >
                                        {classData.finalsGrade.toFixed(2)}
                                      </span>
                                    ) : (
                                      <span className="text-slate-400">-</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {calculateCurrentGrade(classData) ? (
                                      <Badge
                                        className={getGradeBadgeColor(
                                          calculateCurrentGrade(classData),
                                        )}
                                      >
                                        {calculateCurrentGrade(
                                          classData,
                                        )?.toFixed(2)}
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        In Progress
                                      </Badge>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {classData.isGradesFinalized ? (
                                      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-xs">
                                        Finalized
                                      </Badge>
                                    ) : (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Ongoing
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
