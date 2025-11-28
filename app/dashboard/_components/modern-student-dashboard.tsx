"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  CheckCircle2,
  Users,
  FileText,
  BarChart3,
  Target,
  ArrowRight,
  Download,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { EnrollmentStatus } from "@/lib/enrollment";
import { cn } from "@/lib/utils";

interface ModernStudentDashboardProps {
  enrollmentStatus: EnrollmentStatus;
  currentSemester: string;
  currentCurriculumYear: string;
  schoolYear: string;
  userName: string;
}

// Mock data - will be replaced with real API data
const studentData = {
  profile: {
    name: "Student",
    studentId: "2024-00001",
    program: "BS Computer Science",
    yearLevel: "3rd Year",
  },
  academics: {
    currentGWA: 1.75,
    previousGWA: 1.89,
    creditsEarned: 87,
    creditsTotal: 120,
    currentLoad: 18,
    standing: "Dean's List",
  },
  attendance: {
    overall: 94,
    status: "Good Standing",
  },
  currentCourses: [
    {
      id: 1,
      code: "CS401",
      name: "Advanced Web Development",
      instructor: "Prof. Smith",
      schedule: "MWF 2:00-3:30 PM",
      room: "CS Lab 301",
      currentGrade: 1.5,
      gradeStatus: "Excellent",
      attendance: 96,
      nextClass: "Today at 2:00 PM",
      units: 3,
      color: "blue",
    },
    {
      id: 2,
      code: "CS302",
      name: "Database Systems",
      instructor: "Prof. Johnson",
      schedule: "TTH 10:00-11:30 AM",
      room: "CS Lab 302",
      currentGrade: 1.75,
      gradeStatus: "Very Good",
      attendance: 92,
      nextClass: "Tomorrow at 10:00 AM",
      units: 3,
      color: "violet",
    },
    {
      id: 3,
      code: "CS350",
      name: "Human-Computer Interaction",
      instructor: "Prof. Williams",
      schedule: "MWF 4:30-6:00 PM",
      room: "Room 205",
      currentGrade: 1.25,
      gradeStatus: "Excellent",
      attendance: 98,
      nextClass: "Today at 4:30 PM",
      units: 3,
      color: "emerald",
    },
  ],
  upcomingTasks: [
    {
      id: 1,
      title: "CS401 Lab Assignment Submission",
      course: "Advanced Web Dev",
      dueDate: "Today, 11:59 PM",
      priority: "high",
      type: "assignment",
    },
    {
      id: 2,
      title: "CS302 Midterm Examination",
      course: "Database Systems",
      dueDate: "March 15, 2025",
      priority: "high",
      type: "exam",
    },
    {
      id: 3,
      title: "CS350 Group Project Presentation",
      course: "HCI",
      dueDate: "March 20, 2025",
      priority: "medium",
      type: "project",
    },
  ],
  semesterHistory: [
    { semester: "1st Sem", year: "2023-2024", gwa: 2.15, credits: 18 },
    { semester: "2nd Sem", year: "2023-2024", gwa: 1.98, credits: 21 },
    { semester: "1st Sem", year: "2024-2025", gwa: 1.89, credits: 21 },
    {
      semester: "2nd Sem",
      year: "2024-2025",
      gwa: 1.75,
      credits: 27,
      current: true,
    },
  ],
};

export function ModernStudentDashboard({
  enrollmentStatus,
  currentSemester,
  currentCurriculumYear,
  schoolYear,
  userName,
}: ModernStudentDashboardProps) {
  const getGradeColor = (gwa: number) => {
    if (gwa <= 1.5) return "text-emerald-600";
    if (gwa <= 2.0) return "text-blue-600";
    if (gwa <= 2.5) return "text-amber-600";
    return "text-orange-600";
  };

  const getGradeBadgeColor = (gwa: number) => {
    if (gwa <= 1.5) return "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (gwa <= 2.0) return "bg-blue-100 text-blue-800 border-blue-300";
    if (gwa <= 2.5) return "bg-amber-100 text-amber-800 border-amber-300";
    return "bg-orange-100 text-orange-800 border-orange-300";
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="destructive" className="text-xs">
            Urgent
          </Badge>
        );
      case "medium":
        return (
          <Badge
            variant="outline"
            className="text-xs border-amber-300 text-amber-700"
          >
            Soon
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-xs">
            Later
          </Badge>
        );
    }
  };

  if (!enrollmentStatus.isEnrolled) {
    return (
      <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white min-h-screen">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Enrolled</AlertTitle>
          <AlertDescription>
            You are not currently enrolled for School Year {schoolYear} -
            Semester {currentSemester}. Please complete your enrollment to
            access your dashboard.
          </AlertDescription>
        </Alert>
        <div className="max-w-2xl mx-auto text-center">
          <Button size="lg" className="mr-3">
            Complete Enrollment
          </Button>
          <Button size="lg" variant="outline">
            Contact Registrar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Simple Header */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                Welcome back, {userName}! 👋
              </h1>
              <p className="text-slate-600 mt-1">
                {studentData.profile.program} • {studentData.profile.yearLevel}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="text-right">
                <p className="text-sm text-slate-500">School Year</p>
                <p className="font-semibold text-slate-900">{schoolYear}</p>
                <Badge variant="outline" className="mt-1">
                  Semester {currentSemester}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Key Stats - Simple Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* GWA Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Current GWA</p>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <p
                className={cn(
                  "text-3xl font-bold",
                  getGradeColor(studentData.academics.currentGWA),
                )}
              >
                {studentData.academics.currentGWA.toFixed(2)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Previous: {studentData.academics.previousGWA.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          {/* Credits Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Credits</p>
                <Target className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-slate-900">
                {studentData.academics.creditsEarned}
                <span className="text-lg text-slate-400">
                  /{studentData.academics.creditsTotal}
                </span>
              </p>
              <Progress
                value={
                  (studentData.academics.creditsEarned /
                    studentData.academics.creditsTotal) *
                  100
                }
                className="h-1.5 mt-2"
              />
            </CardContent>
          </Card>

          {/* Attendance Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-slate-600">Attendance</p>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-bold text-emerald-600">
                {studentData.attendance.overall}%
              </p>
              <p className="text-xs text-emerald-600 mt-1">Good Standing</p>
            </CardContent>
          </Card>

          {/* Standing Card */}
          <Card className="border-2 hover:shadow-lg transition-shadow bg-gradient-to-br from-amber-50 to-yellow-50">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-amber-800">Standing</p>
                <Award className="h-4 w-4 text-amber-600" />
              </div>
              <p className="text-lg font-bold text-amber-900">
                {studentData.academics.standing}
              </p>
              <p className="text-xs text-amber-700 mt-1">Keep it up!</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="courses">My Courses</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Tasks & Schedule */}
              <div className="lg:col-span-2 space-y-6">
                {/* Upcoming Tasks */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Clock className="h-5 w-5 text-blue-600" />
                        What's Due Soon
                      </CardTitle>
                      <Button variant="ghost" size="sm">
                        View All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {studentData.upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start justify-between p-4 rounded-lg border-2 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getPriorityBadge(task.priority)}
                            <h4 className="font-semibold text-slate-900">
                              {task.title}
                            </h4>
                          </div>
                          <p className="text-sm text-slate-600">
                            {task.course}
                          </p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {task.dueDate}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Today's Schedule */}
                <Card className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Calendar className="h-5 w-5 text-violet-600" />
                      Today's Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {studentData.currentCourses
                      .filter((c) => c.nextClass.includes("Today"))
                      .map((course) => (
                        <div
                          key={course.id}
                          className="flex items-center gap-4 p-4 rounded-lg border-2 bg-gradient-to-r from-white to-slate-50"
                        >
                          <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold">
                            {course.code.substring(0, 2)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">
                              {course.code}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {course.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {course.schedule} • {course.room}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-blue-600">
                              {course.nextClass}
                            </p>
                          </div>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Quick Actions */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      size="lg"
                    >
                      <FileText className="mr-3 h-5 w-5" />
                      View Grades
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      size="lg"
                    >
                      <Download className="mr-3 h-5 w-5" />
                      Request Transcript
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      size="lg"
                    >
                      <Calendar className="mr-3 h-5 w-5" />
                      Class Schedule
                    </Button>
                    <Button
                      className="w-full justify-start"
                      variant="outline"
                      size="lg"
                    >
                      <Users className="mr-3 h-5 w-5" />
                      Classmates
                    </Button>
                  </CardContent>
                </Card>

                {/* GWA Progress */}
                <Card className="border-2 bg-gradient-to-br from-blue-50 to-violet-50">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      GWA Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <p className="text-4xl font-bold text-blue-600">
                        {studentData.academics.currentGWA.toFixed(2)}
                      </p>
                      <p className="text-sm text-slate-600">Current Semester</p>
                    </div>
                    <div className="h-32 flex items-end justify-between gap-2">
                      {studentData.semesterHistory.map((sem, idx) => (
                        <div
                          key={idx}
                          className="flex-1 flex flex-col items-center"
                        >
                          <div
                            className={cn(
                              "w-full rounded-t-lg transition-all",
                              sem.current
                                ? "bg-gradient-to-t from-blue-500 to-violet-600"
                                : "bg-gradient-to-t from-slate-300 to-slate-400",
                            )}
                            style={{
                              height: `${Math.min(((3.0 - sem.gwa) / 1.5) * 100, 100)}%`,
                            }}
                          />
                          <p className="text-xs text-slate-600 mt-2 font-semibold">
                            {sem.gwa.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-400">S{idx + 1}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <p className="text-xs text-center text-slate-600">
                        Improving steadily! Keep up the good work.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* COURSES TAB */}
          <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {studentData.currentCourses.map((course) => (
                <Card
                  key={course.id}
                  className="border-2 hover:shadow-lg transition-all group"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge variant="outline" className="mb-2">
                          {course.code}
                        </Badge>
                        <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                          {course.name}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {course.instructor}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          className={getGradeBadgeColor(course.currentGrade)}
                        >
                          {course.currentGrade.toFixed(2)}
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1">
                          {course.gradeStatus}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Schedule */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      <span>{course.schedule}</span>
                    </div>

                    {/* Attendance */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                        <span>Attendance</span>
                        <span className="font-semibold">
                          {course.attendance}%
                        </span>
                      </div>
                      <Progress value={course.attendance} className="h-2" />
                    </div>

                    {/* Next Class */}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <p className="text-sm text-slate-600">
                        Next class:{" "}
                        <span className="font-semibold text-blue-600">
                          {course.nextClass}
                        </span>
                      </p>
                      <Button size="sm" variant="ghost">
                        View Details <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* GRADES TAB */}
          <TabsContent value="grades" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-amber-600" />
                    Current Semester Grades
                  </span>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">
                          Course
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                          Units
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                          Prelim
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                          Midterm
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                          Finals
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                          Grade
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-slate-700">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.currentCourses.map((course) => (
                        <tr
                          key={course.id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900">
                              {course.code}
                            </p>
                            <p className="text-sm text-slate-600">
                              {course.name}
                            </p>
                          </td>
                          <td className="text-center py-3 px-4 text-slate-700">
                            {course.units}
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="font-semibold">1.50</span>
                          </td>
                          <td className="text-center py-3 px-4">
                            <span className="font-semibold">
                              {course.currentGrade.toFixed(2)}
                            </span>
                          </td>
                          <td className="text-center py-3 px-4 text-slate-400">
                            -
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge
                              className={getGradeBadgeColor(
                                course.currentGrade,
                              )}
                            >
                              {course.currentGrade.toFixed(2)}
                            </Badge>
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge variant="outline" className="text-xs">
                              In Progress
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-semibold">
                        <td className="py-3 px-4">Semester GWA</td>
                        <td className="text-center py-3 px-4">
                          {studentData.academics.currentLoad}
                        </td>
                        <td colSpan={4}></td>
                        <td className="text-center py-3 px-4">
                          <Badge className="bg-blue-600 text-white text-base px-3 py-1">
                            {studentData.academics.currentGWA.toFixed(2)}
                          </Badge>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HISTORY TAB */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Academic History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Timeline */}
                <div className="space-y-6">
                  {studentData.semesterHistory
                    .slice()
                    .reverse()
                    .map((sem, idx) => (
                      <div key={idx} className="flex gap-4">
                        {/* Timeline Indicator */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm",
                              sem.current
                                ? "bg-blue-600 text-white ring-4 ring-blue-200"
                                : "bg-slate-200 text-slate-600",
                            )}
                          >
                            {sem.gwa.toFixed(1)}
                          </div>
                          {idx < studentData.semesterHistory.length - 1 && (
                            <div className="w-0.5 h-16 bg-slate-200 mt-2" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-6">
                          <div
                            className={cn(
                              "p-4 rounded-lg border-2",
                              sem.current
                                ? "bg-blue-50 border-blue-200"
                                : "bg-white",
                            )}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-slate-900">
                                  {sem.semester} - SY {sem.year}
                                </h4>
                                {sem.current && (
                                  <Badge
                                    variant="outline"
                                    className="mt-1 text-xs"
                                  >
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge className={getGradeBadgeColor(sem.gwa)}>
                                  GWA: {sem.gwa.toFixed(2)}
                                </Badge>
                                <p className="text-xs text-slate-500 mt-1">
                                  {sem.credits} credits
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-slate-600">
                              {sem.gwa <= 1.75
                                ? "Dean's List"
                                : "Good Standing"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Summary Stats */}
                <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t-2">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      {(
                        studentData.semesterHistory.reduce(
                          (sum, s) => sum + s.gwa,
                          0,
                        ) / studentData.semesterHistory.length
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-slate-600">Cumulative GWA</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-emerald-600">
                      {studentData.semesterHistory.reduce(
                        (sum, s) => sum + s.credits,
                        0,
                      )}
                    </p>
                    <p className="text-sm text-slate-600">Total Credits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-amber-600">
                      {
                        studentData.semesterHistory.filter((s) => s.gwa <= 1.75)
                          .length
                      }
                    </p>
                    <p className="text-sm text-slate-600">Dean's List</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
