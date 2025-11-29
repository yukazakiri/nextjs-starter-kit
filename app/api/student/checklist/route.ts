import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    console.log("🔍 Checklist API called with:", { studentId });

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 },
      );
    }

    // Step 1: Get student's course_id
    const student = await prisma.students.findFirst({
      where: {
        student_id: BigInt(studentId),
        deleted_at: null,
      },
      select: {
        id: true,
        student_id: true,
        course_id: true,
      },
    });

    console.log(
      "📚 Student found:",
      student
        ? {
            id: student.id.toString(),
            student_id: student.student_id?.toString(),
            course_id: student.course_id.toString(),
          }
        : "Not found",
    );

    if (!student || !student.course_id) {
      console.error("❌ Student or course not found for studentId:", studentId);
      return NextResponse.json(
        {
          success: false,
          error: "Student or course not found",
          details: `No student found with student_id: ${studentId}`,
        },
        { status: 404 },
      );
    }

    // Step 2: Get all subjects from the subject table for this course
    const courseSubjects = await prisma.subject.findMany({
      where: {
        course_id: student.course_id,
      },
      orderBy: [{ academic_year: "asc" }, { semester: "asc" }],
    });

    console.log("📖 Found course subjects:", courseSubjects.length);

    // Step 3: Get all subject enrollments for this student
    const studentEnrollments = await prisma.subject_enrollments.findMany({
      where: {
        student_id: parseInt(studentId),
      },
    });

    console.log("📝 Found student enrollments:", studentEnrollments.length);

    // Step 4: Create a map of subject_id to enrollment data
    const enrollmentMap = new Map();
    studentEnrollments.forEach((enrollment) => {
      if (enrollment.subject_id) {
        enrollmentMap.set(enrollment.subject_id.toString(), enrollment);
      }
    });

    // Step 5: Combine subjects with enrollment data
    const checklist = courseSubjects.map((subject) => {
      const enrollment = enrollmentMap.get(subject.id.toString());

      let status: "not-started" | "ongoing" | "finished";
      let grade: number | null = null;

      if (!enrollment) {
        // Not found in subject_enrollments = not started
        status = "not-started";
      } else if (enrollment.grade && enrollment.grade > 0) {
        // Has a grade = finished
        status = "finished";
        grade = enrollment.grade;
      } else {
        // Found but no grade = ongoing
        status = "ongoing";
      }

      return {
        subjectId: subject.id.toString(),
        code: subject.code,
        title: subject.title || subject.name || "Untitled Subject",
        description: subject.description,
        units: subject.units ? Number(subject.units) : null,
        lecture: subject.lecture ? Number(subject.lecture) : null,
        laboratory: subject.laboratory ? Number(subject.laboratory) : null,
        prerequisite: subject.pre_riquisite,
        academicYear: subject.academic_year
          ? Number(subject.academic_year)
          : null,
        semester: subject.semester ? Number(subject.semester) : null,
        group: subject.group,
        classification: subject.classification,

        // Enrollment data
        status,
        grade,
        enrollmentId: enrollment?.id.toString() || null,
        instructor: enrollment?.instructor || null,
        section: enrollment?.section || null,
        remarks: enrollment?.remarks || null,
        schoolYear: enrollment?.school_year || null,
        enrolledSemester: enrollment?.semester || null,
        isCredited: enrollment?.is_credited || false,
      };
    });

    // Calculate progress statistics
    const totalSubjects = checklist.length;
    const finishedSubjects = checklist.filter(
      (s) => s.status === "finished",
    ).length;
    const ongoingSubjects = checklist.filter(
      (s) => s.status === "ongoing",
    ).length;
    const notStartedSubjects = checklist.filter(
      (s) => s.status === "not-started",
    ).length;

    // Calculate GWA from finished subjects
    const finishedWithGrades = checklist.filter(
      (s) => s.status === "finished" && s.grade !== null,
    );
    const gwa =
      finishedWithGrades.length > 0
        ? finishedWithGrades.reduce((sum, s) => sum + (s.grade || 0), 0) /
          finishedWithGrades.length
        : null;

    // Calculate earned units
    const earnedUnits = checklist
      .filter((s) => s.status === "finished")
      .reduce((sum, s) => sum + (s.units || 0), 0);

    const totalUnits = checklist.reduce((sum, s) => sum + (s.units || 0), 0);

    console.log("✅ Checklist prepared:", {
      totalSubjects,
      finished: finishedSubjects,
      ongoing: ongoingSubjects,
      notStarted: notStartedSubjects,
      gwa,
    });

    return NextResponse.json({
      success: true,
      checklist,
      statistics: {
        totalSubjects,
        finishedSubjects,
        ongoingSubjects,
        notStartedSubjects,
        gwa,
        earnedUnits,
        totalUnits,
        completionPercentage:
          totalSubjects > 0
            ? Math.round((finishedSubjects / totalSubjects) * 100)
            : 0,
      },
    });
  } catch (error) {
    console.error("💥 Error fetching checklist:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch checklist",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
