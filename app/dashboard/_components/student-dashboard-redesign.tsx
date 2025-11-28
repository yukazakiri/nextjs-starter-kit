"use client";

import { DashboardStats } from "./dashboard-stats";
import { CourseList } from "./course-list";
import { AssignmentList } from "./assignment-list";
import { ScheduleWidget } from "./schedule-widget";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Calendar as CalendarIcon,
  AlertCircle,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  BookOpen,
  Clock,
  Bell,
  Flame,
  Zap,
  Star,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GraduationCap,
  BarChart3,
  Trophy,
  Users,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { EnrollmentStatus } from "@/lib/enrollment";
import { cn } from "@/lib/utils";

interface StudentDashboardProps {
  enrollmentStatus: EnrollmentStatus;
  currentSemester: string;
  currentCurriculumYear: string;
  schoolYear: string;
}

// Mock data - replace with real data from your API
const mockAcademicData = {
  gpa: {
    current: 3.67,
    previous: 3.52,
    trend: "up" as const,
    target: 3.75,
  },
  credits: {
    earned: 87,
    total: 120,
    thisSession: 18,
  },
  attendance: {
    rate: 94,
    trend: "stable" as const,
  },
  courses: [
    {
      id: 1,
      name: "Advanced Web Development",
      code: "CS401",
      grade: 92,
      progress: 75,
      color: "violet",
      nextClass: "Today, 2:00 PM",
    },
    {
      id: 2,
      name: "Database Systems",
      code: "CS302",
      grade: 88,
      progress: 68,
      color: "blue",
      nextClass: "Tomorrow, 10:00 AM",
    },
    {
      id: 3,
      name: "Human-Computer Interaction",
      code: "CS350",
      grade: 95,
      progress: 82,
      color: "emerald",
      nextClass: "Today, 4:30 PM",
    },
    {
      id: 4,
      name: "Software Engineering",
      code: "CS410",
      grade: 85,
      progress: 71,
      color: "amber",
      nextClass: "Wed, 1:00 PM",
    },
  ],
  todaysPriorities: [
    {
      id: 1,
      title: "CS401 Lab Assignment",
      course: "Advanced Web Dev",
      dueIn: "3 hours",
      priority: "high" as const,
      type: "assignment" as const,
    },
    {
      id: 2,
      title: "Lecture: Database Optimization",
      course: "Database Systems",
      dueIn: "5 hours",
      priority: "medium" as const,
      type: "class" as const,
    },
    {
      id: 3,
      title: "Group Meeting - UX Project",
      course: "HCI",
      dueIn: "6 hours",
      priority: "medium" as const,
      type: "event" as const,
    },
  ],
  upcomingDeadlines: [
    { id: 1, title: "Midterm Exam - CS302", date: "Mar 15", days: 3, priority: "high" },
    { id: 2, title: "Project Proposal - CS410", date: "Mar 18", days: 6, priority: "high" },
    { id: 3, title: "Quiz 3 - CS350", date: "Mar 20", days: 8, priority: "medium" },
    { id: 4, title: "Essay Submission", date: "Mar 25", days: 13, priority: "low" },
  ],
  achievements: [
    { id: 1, title: "Dean's List", icon: Trophy, color: "amber" },
    { id: 2, title: "Perfect Attendance", icon: Award, color: "emerald" },
    { id: 3, title: "Top 10%", icon: Star, color: "violet" },
  ],
};

export function StudentDashboard({
  enrollmentStatus,
  currentSemester,
  currentCurriculumYear,
  schoolYear,
}: StudentDashboardProps) {
  const currentDate = new Date();
  const timeOfDay = currentDate.getHours() < 12 ? "Morning" : currentDate.getHours() < 18 ? "Afternoon" : "Evening";

  const getStatusVariant = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "enrolled":
      case "active":
        return "default";
      case "pending":
        return "secondary";
      case "dropped":
      case "inactive":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-900";
      case "medium":
        return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900";
      case "low":
        return "text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900";
      default:
        return "";
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return "text-emerald-600";
    if (grade >= 80) return "text-blue-600";
    if (grade >= 70) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="flex-1 p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/50 min-h-screen">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Geist:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');

        .dashboard-header {
          font-family: 'Outfit', sans-serif;
        }

        .dashboard-body {
          font-family: 'Geist', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .dashboard-mono {
          font-family: 'JetBrains Mono', monospace;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.6s ease-out forwards;
        }

        .animate-delay-100 {
          animation-delay: 100ms;
        }

        .animate-delay-200 {
          animation-delay: 200ms;
        }

        .animate-delay-300 {
          animation-delay: 300ms;
        }

        .animate-delay-400 {
          animation-delay: 400ms;
        }

        .priority-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Header Section */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          {/* Left: Greeting & Profile */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold dashboard-header shadow-lg">
                S
              </div>
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight dashboard-header bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Good {timeOfDay}, Student
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-2 dashboard-body text-sm">
                  <CalendarIcon className="h-4 w-4" />
                  {currentDate.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                {enrollmentStatus.isEnrolled && (
                  <div className="flex items-center gap-2 mt-3">
                    <Badge variant="outline" className="dashboard-mono text-xs">
                      SY {schoolYear}
                    </Badge>
                    <Badge variant="outline" className="dashboard-mono text-xs">
                      Semester {currentSemester}
                    </Badge>
                    <Badge variant={getStatusVariant(enrollmentStatus.status)} className="text-xs">
                      {enrollmentStatus.status}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Stats */}
          {enrollmentStatus.isEnrolled && (
            <div className="grid grid-cols-3 gap-3 lg:gap-4">
              <Card className="relative overflow-hidden border-2">
                <CardContent className="p-4">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-muted-foreground dashboard-body mb-1">Current GPA</p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-2xl font-bold dashboard-mono">{mockAcademicData.gpa.current}</p>
                      {mockAcademicData.gpa.trend === "up" ? (
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {mockAcademicData.gpa.target}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2">
                <CardContent className="p-4">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-green-500/5 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-muted-foreground dashboard-body mb-1">Credits</p>
                    <p className="text-2xl font-bold dashboard-mono">
                      {mockAcademicData.credits.earned}
                      <span className="text-sm text-muted-foreground">/{mockAcademicData.credits.total}</span>
                    </p>
                    <Progress value={(mockAcademicData.credits.earned / mockAcademicData.credits.total) * 100} className="mt-2 h-1" />
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-2">
                <CardContent className="p-4">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-muted-foreground dashboard-body mb-1">Attendance</p>
                    <p className="text-2xl font-bold dashboard-mono">{mockAcademicData.attendance.rate}%</p>
                    <p className="text-xs text-emerald-600 mt-1">Excellent</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Status */}
      {enrollmentStatus.isEnrolled ? (
        <Alert className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50/50 dark:from-emerald-950/20 dark:to-green-950/10 animate-fade-in-up animate-delay-100">
          <UserCheck className="h-5 w-5 text-emerald-600" />
          <AlertTitle className="text-emerald-900 dark:text-emerald-100 font-semibold dashboard-header">
            Actively Enrolled
          </AlertTitle>
          <AlertDescription className="text-emerald-800 dark:text-emerald-200 dashboard-body">
            You're all set for School Year {schoolYear}, Semester {currentSemester}
            {currentCurriculumYear && ` • Curriculum Year: ${currentCurriculumYear}`}
          </AlertDescription>
        </Alert>
      ) : (
        <Alert variant="destructive" className="animate-fade-in-up animate-delay-100">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="dashboard-header">Not Enrolled</AlertTitle>
          <AlertDescription className="dashboard-body">
            You are not currently enrolled for School Year {schoolYear} - Semester {currentSemester}. Please contact
            the registrar's office or complete your enrollment to access full dashboard features.
          </AlertDescription>
        </Alert>
      )}

      {enrollmentStatus.isEnrolled ? (
        <>
          {/* Today's Priority Section */}
          <div className="animate-fade-in-up animate-delay-200">
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-orange-50/30 to-amber-50/50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-amber-950/20 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white priority-pulse">
                      <Flame className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="dashboard-header text-2xl">Today's Priority</CardTitle>
                      <p className="text-xs text-muted-foreground dashboard-body">Focus on what matters now</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="dashboard-mono">
                    {mockAcademicData.todaysPriorities.length} items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAcademicData.todaysPriorities.map((item, index) => (
                  <div
                    key={item.id}
                    className={cn(
                      "p-4 rounded-xl border-2 bg-white dark:bg-slate-950 transition-all hover:shadow-md hover:scale-[1.02]",
                      getPriorityColor(item.priority)
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {item.priority === "high" && <Zap className="h-4 w-4" />}
                          <h4 className="font-semibold dashboard-body">{item.title}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground dashboard-body">{item.course}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="dashboard-mono text-xs whitespace-nowrap">
                          {item.dueIn}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1 capitalize">{item.type}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column: Courses & Performance */}
            <div className="xl:col-span-2 space-y-6">
              {/* Courses Overview */}
              <div className="animate-fade-in-up animate-delay-300">
                <Card className="border-2">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="dashboard-header text-xl flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        My Courses
                      </CardTitle>
                      <Button variant="ghost" size="sm" className="dashboard-body">
                        View All <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockAcademicData.courses.map((course, index) => (
                      <div
                        key={course.id}
                        className="group relative p-5 rounded-xl border-2 hover:shadow-lg transition-all hover:scale-[1.02] bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-950/50"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        {/* Color accent bar */}
                        <div className={`absolute top-0 left-0 w-full h-1 rounded-t-xl bg-${course.color}-500`} />

                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <Badge variant="outline" className="dashboard-mono text-xs mb-2">
                              {course.code}
                            </Badge>
                            <h4 className="font-semibold dashboard-body leading-tight">{course.name}</h4>
                          </div>
                          <div className="text-right">
                            <div className={cn("text-3xl font-bold dashboard-mono", getGradeColor(course.grade))}>
                              {course.grade}
                            </div>
                            <p className="text-xs text-muted-foreground">Grade</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-muted-foreground dashboard-body">
                            <span>Progress</span>
                            <span className="dashboard-mono">{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>

                        <div className="mt-3 pt-3 border-t flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className="dashboard-body">{course.nextClass}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-7 text-xs">
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Academic Performance Chart */}
              <div className="animate-fade-in-up animate-delay-400">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="dashboard-header text-xl flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Academic Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="gpa" className="w-full">
                      <TabsList className="grid w-full grid-cols-3 dashboard-body">
                        <TabsTrigger value="gpa">GPA Trend</TabsTrigger>
                        <TabsTrigger value="grades">Grades</TabsTrigger>
                        <TabsTrigger value="attendance">Attendance</TabsTrigger>
                      </TabsList>
                      <TabsContent value="gpa" className="space-y-4 pt-4">
                        <div className="grid grid-cols-4 gap-4">
                          {[
                            { semester: "Fall '24", gpa: 3.52 },
                            { semester: "Spring '25", gpa: 3.67 },
                            { semester: "Target", gpa: 3.75 },
                            { semester: "Max", gpa: 4.0 },
                          ].map((item, i) => (
                            <div key={i} className="text-center">
                              <div className="h-32 flex items-end justify-center mb-2">
                                <div
                                  className={cn(
                                    "w-full rounded-t-lg transition-all",
                                    i === 1
                                      ? "bg-gradient-to-t from-violet-500 to-purple-600"
                                      : i === 2
                                      ? "bg-gradient-to-t from-amber-400 to-orange-500 opacity-40"
                                      : "bg-gradient-to-t from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700"
                                  )}
                                  style={{ height: `${(item.gpa / 4) * 100}%` }}
                                />
                              </div>
                              <p className="font-bold dashboard-mono text-sm">{item.gpa}</p>
                              <p className="text-xs text-muted-foreground dashboard-body">{item.semester}</p>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/10 border-2 border-violet-200 dark:border-violet-900">
                          <div className="flex items-center gap-3">
                            <Target className="h-5 w-5 text-violet-600" />
                            <div className="flex-1">
                              <p className="font-semibold dashboard-body text-sm">Keep it up!</p>
                              <p className="text-xs text-muted-foreground">
                                You're {((mockAcademicData.gpa.target - mockAcademicData.gpa.current) * 100).toFixed(0)} points away from your target GPA
                              </p>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="grades" className="pt-4">
                        <div className="space-y-3">
                          {mockAcademicData.courses.map((course) => (
                            <div key={course.id} className="flex items-center gap-4">
                              <div className="flex-1">
                                <p className="font-medium dashboard-body text-sm">{course.code}</p>
                                <p className="text-xs text-muted-foreground">{course.name}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Progress value={course.grade} className="w-24 h-2" />
                                <span className={cn("font-bold dashboard-mono text-lg w-12 text-right", getGradeColor(course.grade))}>
                                  {course.grade}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="attendance" className="pt-4">
                        <div className="space-y-4">
                          <div className="text-center p-6">
                            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white mb-4">
                              <span className="text-4xl font-bold dashboard-mono">{mockAcademicData.attendance.rate}%</span>
                            </div>
                            <p className="font-semibold dashboard-body">Excellent Attendance</p>
                            <p className="text-sm text-muted-foreground">Keep up the great work!</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Right Column: Deadlines & Quick Actions */}
            <div className="space-y-6">
              {/* Upcoming Deadlines */}
              <div className="animate-slide-in-right">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="dashboard-header text-xl flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockAcademicData.upcomingDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className={cn(
                          "p-3 rounded-lg border-l-4 bg-gradient-to-r transition-all hover:shadow-md",
                          deadline.priority === "high"
                            ? "border-l-red-500 from-red-50 to-white dark:from-red-950/20 dark:to-slate-900"
                            : deadline.priority === "medium"
                            ? "border-l-amber-500 from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900"
                            : "border-l-blue-500 from-blue-50 to-white dark:from-blue-950/20 dark:to-slate-900"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm dashboard-body leading-tight">{deadline.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{deadline.date}</p>
                          </div>
                          <Badge
                            variant={deadline.days <= 3 ? "destructive" : "outline"}
                            className="dashboard-mono text-xs shrink-0"
                          >
                            {deadline.days}d
                          </Badge>
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" className="w-full dashboard-body" size="sm">
                      View All Deadlines
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Achievements */}
              <div className="animate-slide-in-right animate-delay-100">
                <Card className="border-2 bg-gradient-to-br from-amber-50 via-yellow-50/30 to-amber-50/50 dark:from-amber-950/20 dark:via-yellow-950/10 dark:to-amber-950/20">
                  <CardHeader>
                    <CardTitle className="dashboard-header text-xl flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-600" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockAcademicData.achievements.map((achievement) => {
                      const Icon = achievement.icon;
                      return (
                        <div
                          key={achievement.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-slate-950 border-2 hover:shadow-md transition-all"
                        >
                          <div className={`h-10 w-10 rounded-full bg-gradient-to-br from-${achievement.color}-400 to-${achievement.color}-600 flex items-center justify-center text-white`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold dashboard-body text-sm">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground">This Semester</p>
                          </div>
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="animate-slide-in-right animate-delay-200">
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="dashboard-header text-xl flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full justify-start dashboard-body" size="lg">
                      <GraduationCap className="mr-3 h-5 w-5" />
                      Request Transcript
                    </Button>
                    <Button variant="outline" className="w-full justify-start dashboard-body" size="lg">
                      <CalendarIcon className="mr-3 h-5 w-5" />
                      View Full Schedule
                    </Button>
                    <Button variant="outline" className="w-full justify-start dashboard-body" size="lg">
                      <Users className="mr-3 h-5 w-5" />
                      Study Groups
                    </Button>
                    <Button variant="outline" className="w-full justify-start dashboard-body" size="lg">
                      <Download className="mr-3 h-5 w-5" />
                      Download Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Not enrolled view
        <div className="grid grid-cols-1 gap-6 animate-fade-in-up animate-delay-200">
          <div className="p-8 rounded-xl border-2 bg-card text-card-foreground shadow-sm text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/20 mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold mb-4 dashboard-header">Limited Access - Not Enrolled</h3>
            <p className="text-muted-foreground mb-6 dashboard-body max-w-2xl mx-auto">
              You currently do not have access to the full dashboard because you are not enrolled for School Year{" "}
              {schoolYear} - Semester {currentSemester}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="dashboard-body">
                Complete Enrollment
              </Button>
              <Button variant="outline" size="lg" className="dashboard-body">
                Contact Registrar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="dashboard-header">Available Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" className="w-full justify-start dashboard-body">
                  View Profile
                </Button>
                <Button variant="secondary" className="w-full justify-start dashboard-body">
                  Browse Courses
                </Button>
                <Button variant="secondary" className="w-full justify-start dashboard-body">
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2">
              <CardHeader>
                <CardTitle className="dashboard-header">Enrollment Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 dashboard-body text-sm">
                <div>
                  <p className="text-muted-foreground">School Year</p>
                  <p className="font-medium dashboard-mono">{schoolYear || "Not Set"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Semester</p>
                  <p className="font-medium dashboard-mono">Semester {currentSemester}</p>
                </div>
                {currentCurriculumYear && (
                  <div>
                    <p className="text-muted-foreground">Curriculum Year</p>
                    <p className="font-medium dashboard-mono">{currentCurriculumYear}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Enrollment Status</p>
                  <Badge variant="destructive">Not Enrolled</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
