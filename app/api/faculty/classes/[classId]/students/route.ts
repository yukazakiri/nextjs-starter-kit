import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const { searchParams } = new URL(request.url);
    const facultyId = searchParams.get("facultyId");

    if (!facultyId) {
      return NextResponse.json(
        { error: "Faculty ID is required" },
        { status: 400 }
      );
    }

    console.log("[CLASS STUDENTS API] Fetching students for class:", classId);

    // Verify the class belongs to the faculty
    const classInfo = await prisma.classes.findFirst({
      where: {
        id: parseInt(classId),
        faculty_id: facultyId,
      },
    });

    if (!classInfo) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get enrolled students
    const enrollments = await prisma.subject_enrollments.findMany({
      where: {
        class_id: parseInt(classId),
        school_year: classInfo.school_year || undefined,
        semester: classInfo.semester ? parseInt(classInfo.semester) : undefined,
      },
      select: {
        student_id: true,
        grade: true,
        remarks: true,
      },
    });

    console.log("[CLASS STUDENTS API] Found enrollments:", enrollments.length);

    const studentIds = enrollments
      .map((e) => e.student_id)
      .filter((id): id is number => id !== null);

    if (studentIds.length === 0) {
      return NextResponse.json({
        success: true,
        students: [],
      });
    }

    // Get student details
    const students = await prisma.students.findMany({
      where: {
        id: {
          in: studentIds.map((id) => BigInt(id)),
        },
      },
      select: {
        id: true,
        student_id: true,
        first_name: true,
        last_name: true,
        middle_name: true,
        email: true,
        profile_url: true,
        status: true,
      },
    });

    // Combine enrollment data with student details
    const studentsWithGrades = students.map((student) => {
      const enrollment = enrollments.find(
        (e) => e.student_id === Number(student.id)
      );

      return {
        id: student.student_id?.toString() || student.id.toString(),
        name: `${student.first_name} ${student.middle_name ? student.middle_name + " " : ""}${student.last_name}`,
        firstName: student.first_name,
        lastName: student.last_name,
        middleName: student.middle_name,
        email: student.email || "N/A",
        status: student.status || "Enrolled",
        avatar: student.profile_url,
        grade: enrollment?.grade || null,
        remarks: enrollment?.remarks,
      };
    });

    console.log("[CLASS STUDENTS API] Processed students:", studentsWithGrades.length);

    return NextResponse.json({
      success: true,
      students: studentsWithGrades,
    });
  } catch (error) {
    console.error("[CLASS STUDENTS API] Error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching students" },
      { status: 500 }
    );
  }
}
