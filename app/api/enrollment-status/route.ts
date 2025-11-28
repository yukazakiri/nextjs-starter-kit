import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");
    const semester = searchParams.get("semester");
    const schoolYear = searchParams.get("schoolYear");

    console.log("🔍 Enrollment API called with:", {
      studentId,
      semester,
      schoolYear,
    });

    if (!studentId || !semester || !schoolYear) {
      console.error("❌ Missing parameters:", {
        studentId,
        semester,
        schoolYear,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 },
      );
    }

    // Valid enrollment statuses
    const validStatuses = ["Verified By Cashier", "Verified By Head Dept"];

    // Check both student_enrollment and subject_enrollments tables
    // First, try student_enrollment
    console.log("🔍 Checking student_enrollment table...");

    let enrollment;
    try {
      enrollment = await prisma.student_enrollment.findFirst({
        where: {
          student_id: studentId,
          semester: BigInt(semester),
          school_year: schoolYear,
          status: {
            in: validStatuses,
          },
          deleted_at: null,
        },
        orderBy: {
          created_at: "desc",
        },
      });
    } catch (dbError) {
      console.error("💥 Database error in student_enrollment:", dbError);
      enrollment = null;
    }

    console.log(
      "�� student_enrollment result:",
      enrollment ? "Found" : "Not found",
    );

    // If not found in student_enrollment, check subject_enrollments
    if (!enrollment) {
      // Parse studentId to integer for subject_enrollments table
      const studentIdInt = parseInt(studentId);
      const semesterInt = parseInt(semester);

      console.log("🔍 Checking subject_enrollments table with:", {
        studentIdInt,
        semesterInt,
        schoolYear,
      });

      let subjectEnrollment;
      try {
        subjectEnrollment = await prisma.subject_enrollments.findFirst({
          where: {
            student_id: studentIdInt,
            semester: semesterInt,
            school_year: schoolYear,
          },
          orderBy: {
            created_at: "desc",
          },
        });
      } catch (dbError) {
        console.error("💥 Database error in subject_enrollments:", dbError);
        subjectEnrollment = null;
      }

      console.log(
        "📊 subject_enrollments result:",
        subjectEnrollment ? "Found" : "Not found",
      );

      if (subjectEnrollment) {
        const enrollmentData = {
          isEnrolled: true,
          status: "enrolled",
          semester: subjectEnrollment.semester || parseInt(semester),
          academicYear: parseInt(subjectEnrollment.academic_year || "0"),
          schoolYear: subjectEnrollment.school_year,
          courseId: "",
        };
        console.log(
          "✅ Returning enrollment from subject_enrollments:",
          enrollmentData,
        );
        return NextResponse.json({
          success: true,
          enrollmentStatus: enrollmentData,
        });
      }

      console.log("❌ No enrollment found in either table");
      return NextResponse.json({
        success: true,
        enrollmentStatus: {
          isEnrolled: false,
        },
      });
    }

    console.log("✅ Returning enrollment from student_enrollment");
    return NextResponse.json({
      success: true,
      enrollmentStatus: {
        isEnrolled: true,
        status: enrollment.status,
        semester: Number(enrollment.semester),
        academicYear: Number(enrollment.academic_year),
        schoolYear: enrollment.school_year,
        courseId: enrollment.course_id,
      },
    });
  } catch (error) {
    console.error("💥 Error fetching enrollment status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch enrollment status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
