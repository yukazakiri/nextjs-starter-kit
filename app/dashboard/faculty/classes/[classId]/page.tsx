import { ClassHeader } from "../_components/class-header";
import { ClassTabs } from "../_components/class-tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

async function getClassDetails(classId: string, facultyId: string) {
  try {
    const classInfo = await prisma.classes.findFirst({
      where: {
        id: parseInt(classId),
        faculty_id: facultyId,
      },
      select: {
        id: true,
        subject_code: true,
        section: true,
        semester: true,
        school_year: true,
        academic_year: true,
        maximum_slots: true,
        course_codes: true,
        classification: true,
        grade_level: true,
        subject: {
          select: {
            code: true,
            title: true,
            units: true,
            lecture: true,
            laboratory: true,
          },
        },
      },
    });

    if (!classInfo) {
      return null;
    }

    // Get enrolled students count
    const enrolledCount = await prisma.subject_enrollments.count({
      where: {
        class_id: classInfo.id,
        school_year: classInfo.school_year || undefined,
        semester: classInfo.semester ? parseInt(classInfo.semester) : undefined,
      },
    });

    // Get enrolled students with grades
    const enrolledStudents = await prisma.subject_enrollments.findMany({
      where: {
        class_id: classInfo.id,
        school_year: classInfo.school_year || undefined,
        semester: classInfo.semester ? parseInt(classInfo.semester) : undefined,
      },
      select: {
        student_id: true,
        grade: true,
      },
    });

    // Calculate average grade
    const gradesWithValues = enrolledStudents
      .map((s) => s.grade)
      .filter((grade): grade is number => grade !== null && grade > 0);

    const averageGrade =
      gradesWithValues.length > 0
        ? (
            gradesWithValues.reduce((sum, grade) => sum + grade, 0) /
            gradesWithValues.length
          ).toFixed(2)
        : "N/A";

    // Get attendance rate
    const totalAttendance = await prisma.attendances.count({
      where: {
        class_id: classInfo.id,
      },
    });

    const presentAttendance = await prisma.attendances.count({
      where: {
        class_id: classInfo.id,
        status: "present",
      },
    });

    const attendanceRate =
      totalAttendance > 0
        ? `${Math.round((presentAttendance / totalAttendance) * 100)}%`
        : "N/A";

    return {
      id: classInfo.id,
      code: classInfo.subject?.code || classInfo.subject_code || "N/A",
      name: classInfo.subject?.title || "N/A",
      section: classInfo.section || "N/A",
      credits: Number(classInfo.subject?.units) || 0,
      semester: classInfo.semester === "1" ? "1st Semester" : "2nd Semester",
      year: classInfo.school_year || "N/A",
      enrolledStudents: enrolledCount,
      capacity: classInfo.maximum_slots || 0,
      averageGrade,
      attendanceRate,
      courseCodes: classInfo.course_codes,
      classification: classInfo.classification,
      gradeLevel: classInfo.grade_level,
      lecture: Number(classInfo.subject?.lecture) || 0,
      laboratory: Number(classInfo.subject?.laboratory) || 0,
    };
  } catch (error) {
    console.error("Error fetching class details:", error);
    return null;
  }
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const facultyId = user.publicMetadata?.facultyId as string | undefined;

  if (!facultyId) {
    redirect("/onboarding");
  }

  const { classId } = await params;
  const classDetails = await getClassDetails(classId, facultyId);

  if (!classDetails) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Class Not Found</h1>
        <p className="text-muted-foreground">
          The class you are looking for does not exist or you do not have
          permission to view it.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/faculty/classes">Back to Classes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ClassHeader classDetails={classDetails} />
      <div className="flex-grow">
        <ClassTabs />
      </div>
    </div>
  );
}
