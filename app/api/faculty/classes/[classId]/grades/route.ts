import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId: classIdParam } = await params;
    const classId = parseInt(classIdParam);

    // Fetch enrolled students with their grades
    const enrollments = await prisma.class_enrollments.findMany({
      where: {
        class_id: classId,
        deleted_at: null,
      },
      select: {
        id: true,
        student_id: true,
        prelim_grade: true,
        midterm_grade: true,
        finals_grade: true,
        total_average: true,
        is_prelim_submitted: true,
        is_midterm_submitted: true,
        is_finals_submitted: true,
        is_grades_finalized: true,
        remarks: true,
      },
      orderBy: {
        student_id: "asc",
      },
    });

    // Fetch student details
    const studentIds = enrollments.map((e) => e.student_id.toString());
    const students = await prisma.students.findMany({
      where: {
        id: {
          in: studentIds.map((id) => BigInt(id)),
        },
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        middle_name: true,
      },
    });

    // Combine data
    const gradesData = enrollments.map((enrollment) => {
      const student = students.find(
        (s) => s.id.toString() === enrollment.student_id.toString()
      );
      return {
        enrollmentId: enrollment.id.toString(),
        studentId: enrollment.student_id.toString(),
        studentName: student
          ? `${student.last_name}, ${student.first_name} ${student.middle_name || ""}`
          : "Unknown",
        prelimGrade: enrollment.prelim_grade
          ? parseFloat(enrollment.prelim_grade.toString())
          : null,
        midtermGrade: enrollment.midterm_grade
          ? parseFloat(enrollment.midterm_grade.toString())
          : null,
        finalsGrade: enrollment.finals_grade
          ? parseFloat(enrollment.finals_grade.toString())
          : null,
        totalAverage: enrollment.total_average
          ? parseFloat(enrollment.total_average.toString())
          : null,
        isPrelimSubmitted: enrollment.is_prelim_submitted,
        isMidtermSubmitted: enrollment.is_midterm_submitted,
        isFinalsSubmitted: enrollment.is_finals_submitted,
        isGradesFinalized: enrollment.is_grades_finalized,
        remarks: enrollment.remarks,
      };
    });

    return NextResponse.json({ grades: gradesData });
  } catch (error) {
    console.error("Error fetching grades:", error);
    return NextResponse.json(
      { error: "Failed to fetch grades" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { classId: classIdParam } = await params;

    const body = await request.json();
    const { enrollmentId, term, grade } = body;
    const classId = parseInt(classIdParam);

    if (!enrollmentId || !term || grade === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if grades are finalized (admin lock)
    const enrollment = await prisma.class_enrollments.findUnique({
      where: { id: BigInt(enrollmentId) },
      select: {
        is_grades_finalized: true,
        is_prelim_submitted: true,
        is_midterm_submitted: true,
        is_finals_submitted: true,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    if (enrollment.is_grades_finalized) {
      return NextResponse.json(
        { error: "Grades are finalized and cannot be edited" },
        { status: 403 }
      );
    }

    // Check if specific term is submitted
    if (
      (term === "prelim" && enrollment.is_prelim_submitted) ||
      (term === "midterm" && enrollment.is_midterm_submitted) ||
      (term === "finals" && enrollment.is_finals_submitted)
    ) {
      return NextResponse.json(
        { error: `${term} grades are already submitted` },
        { status: 403 }
      );
    }

    // Update grade
    const updateData: any = {};
    if (term === "prelim") updateData.prelim_grade = grade;
    if (term === "midterm") updateData.midterm_grade = grade;
    if (term === "finals") updateData.finals_grade = grade;

    const updated = await prisma.class_enrollments.update({
      where: { id: BigInt(enrollmentId) },
      data: updateData,
    });

    // Calculate total average if all grades are present
    const prelim = term === "prelim" ? grade : updated.prelim_grade;
    const midterm = term === "midterm" ? grade : updated.midterm_grade;
    const finals = term === "finals" ? grade : updated.finals_grade;

    if (prelim && midterm && finals) {
      const average =
        (parseFloat(prelim.toString()) +
          parseFloat(midterm.toString()) +
          parseFloat(finals.toString())) /
        3;
      await prisma.class_enrollments.update({
        where: { id: BigInt(enrollmentId) },
        data: { total_average: average },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating grade:", error);
    return NextResponse.json(
      { error: "Failed to update grade" },
      { status: 500 }
    );
  }
}
