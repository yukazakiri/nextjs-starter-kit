"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSemester } from "@/contexts/semester-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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

export default function MyClassesPage() {
  const { sessionClaims } = useAuth();
  const { semester, schoolYear } = useSemester();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null);
  const [filter, setFilter] = useState<"current" | "all">("current");

  const studentId = (sessionClaims?.metadata as { studentId?: string })
    ?.studentId;

  useEffect(() => {
    async function fetchClasses() {
      console.log("🔍 My Classes Page - Starting fetch with:", {
        studentId,
        semester,
        schoolYear,
        filter,
      });

      if (!studentId) {
        console.warn("⚠️ No student ID available");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({ studentId });

        // Apply filter
        if (filter === "current" && semester && schoolYear) {
          params.append("semester", semester);
          params.append("schoolYear", schoolYear);
          console.log("🔍 Filtering by current semester:", { semester, schoolYear });
        }

        const url = `/api/student/subjects?${params.toString()}`;
        console.log("📡 Fetching from:", url);

        const response = await fetch(url);
        console.log("📡 Response status:", response.status);

        const data = await response.json();
        console.log("📦 Response data:", data);

        if (data.success) {
          console.log("✅ Successfully fetched classes:", data.subjects.length);
          setClasses(data.subjects);
        } else {
          console.error("❌ Failed to fetch classes:", data.error, data.details);
        }
      } catch (error) {
        console.error("💥 Error fetching classes:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchClasses();
  }, [studentId, semester, schoolYear, filter]);

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
    if (grade <= 1.5) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (grade <= 2.0) return "bg-blue-100 text-blue-800 border-blue-300";
    if (grade <= 2.5) return "bg-amber-100 text-amber-800 border-amber-300";
    if (grade <= 3.0) return "bg-orange-100 text-orange-800 border-orange-300";
    return "bg-red-100 text-red-800 border-red-300";
  };

  const getGradeLabel = (grade: number | null) => {
    if (!grade) return "No Grade";
    if (grade <= 1.5) return "Excellent";
    if (grade <= 2.0) return "Very Good";
    if (grade <= 2.5) return "Good";
    if (grade <= 3.0) return "Passing";
    return "Failed";
  };

  const calculateCurrentGrade = (classData: ClassData) => {
    if (classData.totalAverage) return classData.totalAverage;
    if (classData.finalsGrade) return classData.finalsGrade;
    if (classData.midtermGrade) return classData.midtermGrade;
    if (classData.prelimGrade) return classData.prelimGrade;
    return null;
  };

  const totalUnits = classes.reduce((sum, c) => sum + (c.units || 0), 0);
  const completedClasses = classes.filter((c) => c.isGradesFinalized).length;
  const averageGrade =
    classes.filter((c) => c.totalAverage).length > 0
      ? classes.reduce((sum, c) => sum + (c.totalAverage || 0), 0) /
        classes.filter((c) => c.totalAverage).length
      : null;

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
            View your enrolled classes and track your academic progress
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
              <p className="text-3xl font-bold text-slate-900">{classes.length}</p>
              <p className="text-xs text-slate-500 mt-1">Enrolled</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Total Units</p>
                <GraduationCap className="h-4 w-4 text-violet-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{totalUnits}</p>
              <p className="text-xs text-slate-500 mt-1">This semester</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Completed</p>
                <Award className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">{completedClasses}</p>
              <p className="text-xs text-slate-500 mt-1">Finalized</p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Average</p>
                <TrendingUp className="h-4 w-4 text-amber-600" />
              </div>
              <p className={`text-3xl font-bold ${getGradeColor(averageGrade)}`}>
                {averageGrade ? averageGrade.toFixed(2) : "-"}
              </p>
              <p className="text-xs text-slate-500 mt-1">Current GWA</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <Tabs defaultValue="current" onValueChange={(v) => setFilter(v as "current" | "all")}>
          <TabsList>
            <TabsTrigger value="current">Current Semester</TabsTrigger>
            <TabsTrigger value="all">All Classes</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4 mt-6">
            {classes.length === 0 ? (
              <Alert className="border-2">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg">No Classes Found</AlertTitle>
                <AlertDescription className="text-base mt-2">
                  {semester && schoolYear ? (
                    <>
                      You don't have any classes for <strong>School Year {schoolYear}, Semester {semester}</strong>.
                      <br />
                      <span className="text-sm text-slate-600 mt-2 block">
                        If you are enrolled but don't see your classes, please contact the registrar's office.
                      </span>
                    </>
                  ) : (
                    "Academic period information is not available. Please try again later."
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((classData) => (
                  <Card
                    key={classData.enrollmentId}
                    className="border-2 hover:shadow-lg transition-all group cursor-pointer"
                    onClick={() => setSelectedClass(classData)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Badge variant="outline" className="mb-2">
                            {classData.subjectCode}
                          </Badge>
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                            {classData.subjectName}
                          </h3>
                          {classData.section && (
                            <p className="text-sm text-slate-600 mt-1">
                              Section: {classData.section}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {calculateCurrentGrade(classData) ? (
                            <>
                              <Badge className={getGradeBadgeColor(calculateCurrentGrade(classData))}>
                                {calculateCurrentGrade(classData)?.toFixed(2)}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">
                                {getGradeLabel(calculateCurrentGrade(classData))}
                              </p>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Units */}
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-700">
                          {classData.units} {classData.units === 1 ? "Unit" : "Units"}
                          {classData.lecture && classData.laboratory && (
                            <span className="text-slate-500 ml-1">
                              ({classData.lecture}L + {classData.laboratory}Lab)
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Room */}
                      {classData.room && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <MapPin className="h-4 w-4" />
                          <span>{classData.room}</span>
                        </div>
                      )}

                      {/* Grades Progress */}
                      <div className="pt-2 border-t">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Prelim</p>
                            <p className={`font-semibold ${getGradeColor(classData.prelimGrade)}`}>
                              {classData.prelimGrade ? classData.prelimGrade.toFixed(2) : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Midterm</p>
                            <p className={`font-semibold ${getGradeColor(classData.midtermGrade)}`}>
                              {classData.midtermGrade ? classData.midtermGrade.toFixed(2) : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Finals</p>
                            <p className={`font-semibold ${getGradeColor(classData.finalsGrade)}`}>
                              {classData.finalsGrade ? classData.finalsGrade.toFixed(2) : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Indicator */}
                      {classData.isGradesFinalized && (
                        <div className="pt-2 flex items-center gap-2 text-sm text-emerald-600">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">Grades Finalized</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4 mt-6">
            {classes.length === 0 ? (
              <Alert className="border-2">
                <AlertCircle className="h-5 w-5" />
                <AlertTitle className="text-lg">No Classes Found</AlertTitle>
                <AlertDescription className="text-base mt-2">
                  You don't have any enrolled classes in your academic history.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((classData) => (
                  <Card
                    key={classData.enrollmentId}
                    className="border-2 hover:shadow-lg transition-all group cursor-pointer"
                    onClick={() => setSelectedClass(classData)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">{classData.subjectCode}</Badge>
                            <Badge variant="secondary" className="text-xs">
                              SY {classData.schoolYear} - S{classData.semester}
                            </Badge>
                          </div>
                          <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                            {classData.subjectName}
                          </h3>
                          {classData.section && (
                            <p className="text-sm text-slate-600 mt-1">
                              Section: {classData.section}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {calculateCurrentGrade(classData) ? (
                            <>
                              <Badge className={getGradeBadgeColor(calculateCurrentGrade(classData))}>
                                {calculateCurrentGrade(classData)?.toFixed(2)}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">
                                {getGradeLabel(calculateCurrentGrade(classData))}
                              </p>
                            </>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-700">
                          {classData.units} {classData.units === 1 ? "Unit" : "Units"}
                        </span>
                      </div>

                      <div className="pt-2 border-t">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Prelim</p>
                            <p className={`font-semibold ${getGradeColor(classData.prelimGrade)}`}>
                              {classData.prelimGrade ? classData.prelimGrade.toFixed(2) : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Midterm</p>
                            <p className={`font-semibold ${getGradeColor(classData.midtermGrade)}`}>
                              {classData.midtermGrade ? classData.midtermGrade.toFixed(2) : "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Finals</p>
                            <p className={`font-semibold ${getGradeColor(classData.finalsGrade)}`}>
                              {classData.finalsGrade ? classData.finalsGrade.toFixed(2) : "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {classData.isGradesFinalized && (
                        <div className="pt-2 flex items-center gap-2 text-sm text-emerald-600">
                          <Award className="h-4 w-4" />
                          <span className="font-medium">Grades Finalized</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
