import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicSettings } from "@/lib/enrollment";

export default async function FacultyDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the faculty info from Clerk metadata
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userRole = user.publicMetadata?.role as string | undefined;
  const facultyId = user.publicMetadata?.facultyId as string | undefined;
  const firstName = user.publicMetadata?.firstName as string | undefined;
  const lastName = user.publicMetadata?.lastName as string | undefined;
  const department = user.publicMetadata?.department as string | undefined;

  // Verify user is faculty
  if (userRole !== "faculty") {
    redirect("/onboarding");
  }

  if (!facultyId) {
    redirect("/onboarding");
  }

  // Fetch faculty classes data directly from database
  let classCount = 0;
  let totalStudents = 0;
  let todaySchedule: Array<{
    subjectCode: string;
    subjectName: string;
    startTime: string;
    endTime: string;
    room: string;
    section: string;
  }> = [];

  try {
    // Get current academic settings
    const academicSettings = await getCurrentAcademicSettings();
    const { semester, schoolYear } = academicSettings;

    // Fetch classes for the faculty
    const classes = await prisma.classes.findMany({
      where: {
        faculty_id: facultyId,
        semester: semester,
        school_year: schoolYear,
      },
      select: {
        id: true,
        subject_code: true,
        section: true,
        subject: {
          select: {
            code: true,
            title: true,
          },
        },
      },
    });

    classCount = classes.length;

    // Get enrolled students count for each class
    for (const classItem of classes) {
      const count = await prisma.subject_enrollments.count({
        where: {
          class_id: classItem.id,
          school_year: schoolYear,
          semester: parseInt(semester),
        },
      });
      totalStudents += count;
    }

    // Get today's schedule
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const today = daysOfWeek[new Date().getDay()];

    const classIds = classes.map((c) => BigInt(c.id));

    if (classIds.length > 0) {
      const schedules = await prisma.schedule.findMany({
        where: {
          class_id: {
            in: classIds,
          },
          day_of_week: today,
          deleted_at: null,
        },
        orderBy: {
          start_time: "asc",
        },
      });

      // Get rooms
      const roomIds = schedules
        .map((s) => s.room_id)
        .filter((id): id is bigint => id !== null);

      const rooms = await prisma.rooms.findMany({
        where: {
          id: {
            in: roomIds,
          },
        },
      });

      const roomMap = new Map(rooms.map((r) => [r.id.toString(), r]));

      // Format schedule data
      todaySchedule = schedules.map((schedule) => {
        const classInfo = classes.find(
          (c) => c.id === Number(schedule.class_id),
        );
        const room = schedule.room_id
          ? roomMap.get(schedule.room_id.toString())
          : null;

        const formatTime = (date: Date) => {
          const hours = date.getUTCHours().toString().padStart(2, "0");
          const minutes = date.getUTCMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        };

        return {
          subjectCode:
            classInfo?.subject?.code || classInfo?.subject_code || "N/A",
          subjectName: classInfo?.subject?.title || "N/A",
          startTime: formatTime(schedule.start_time),
          endTime: formatTime(schedule.end_time),
          room: room ? `${room.name}` : "TBA",
          section: classInfo?.section || "",
        };
      });
    }
  } catch (error) {
    console.error("Error fetching faculty classes:", error);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {firstName} {lastName}
        </h1>
        <p className="text-muted-foreground">
          {department ? `Department of ${department}` : "Faculty Dashboard"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{classCount}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Students
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Assignments to grade
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Attendance Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0%</div>
            <p className="text-xs text-muted-foreground">
              Average across classes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Today's Schedule */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Today&apos;s Schedule</CardTitle>
            </div>
            <CardDescription>Your classes for today</CardDescription>
          </CardHeader>
          <CardContent>
            {todaySchedule.length > 0 ? (
              <div className="space-y-3">
                {todaySchedule.map((schedule, index) => (
                  <div
                    key={index}
                    className="p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">
                          {schedule.subjectCode}
                          {schedule.section && ` - ${schedule.section}`}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {schedule.subjectName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{schedule.room}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground text-center py-8">
                No classes scheduled for today
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Recent Activities</CardTitle>
            </div>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-8">
              No recent activities
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Upcoming Deadlines</CardTitle>
            </div>
            <CardDescription>Tasks due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground text-center py-8">
              No upcoming deadlines
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common faculty tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
              <BookOpen className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-semibold">My Classes</h3>
              <p className="text-sm text-muted-foreground">
                View and manage classes
              </p>
            </button>

            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
              <Users className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-semibold">Students</h3>
              <p className="text-sm text-muted-foreground">
                View student records
              </p>
            </button>

            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
              <FileText className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-semibold">Grades</h3>
              <p className="text-sm text-muted-foreground">
                Submit and manage grades
              </p>
            </button>

            <button className="p-4 border rounded-lg hover:bg-accent transition-colors text-left">
              <Calendar className="h-6 w-6 mb-2 text-primary" />
              <h3 className="font-semibold">Attendance</h3>
              <p className="text-sm text-muted-foreground">Mark attendance</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
