import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing studentId parameter",
        },
        { status: 400 }
      );
    }

    // Get all student_enrollment records for this student
    const studentEnrollments = await prisma.student_enrollment.findMany({
      where: {
        student_id: studentId,
        deleted_at: null,
      },
      select: {
        id: true,
        student_id: true,
        course_id: true,
        semester: true,
        academic_year: true,
        school_year: true,
        status: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // Get all subject_enrollments records for this student
    const subjectEnrollments = await prisma.subject_enrollments.findMany({
      where: {
        student_id: parseInt(studentId),
      },
      select: {
        id: true,
        student_id: true,
        subject_id: true,
        class_id: true,
        semester: true,
        academic_year: true,
        school_year: true,
        enrollment_id: true,
        grade: true,
        created_at: true,
      },
      orderBy: {
        created_at: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      success: true,
      data: {
        studentId,
        studentEnrollments,
        subjectEnrollments,
        counts: {
          studentEnrollments: studentEnrollments.length,
          subjectEnrollments: subjectEnrollments.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching debug enrollment data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch debug data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
