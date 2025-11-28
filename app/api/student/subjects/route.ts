import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");
    const semester = searchParams.get("semester");
    const schoolYear = searchParams.get("schoolYear");

    console.log("🔍 Subjects API called with:", {
      studentId,
      semester,
      schoolYear,
    });

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: "Student ID is required" },
        { status: 400 },
      );
    }

    // Convert studentId to Decimal for class_enrollments query
    // class_enrollments.student_id is Decimal type
    const studentIdDecimal = new Prisma.Decimal(studentId);

    console.log("📝 Using student ID as Decimal:", studentIdDecimal.toString());

    // Build the where clause for class_enrollments
    const whereClause: any = {
      student_id: studentIdDecimal,
      deleted_at: null,
      status: true, // Only active enrollments
    };

    // Fetch all class enrollments for the student
    const enrollments = await prisma.class_enrollments.findMany({
      where: whereClause,
      include: {
        classes: {
          where:
            semester || schoolYear
              ? {
                  ...(semester ? { semester: semester } : {}),
                  ...(schoolYear ? { school_year: schoolYear } : {}),
                }
              : undefined,
          include: {
            subject: true, // Include subject details
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    console.log("📊 Found enrollments:", enrollments.length);

    console.log(
      "🔍 Sample enrollment:",
      enrollments[0]
        ? {
            id: enrollments[0].id.toString(),
            class_id: enrollments[0].class_id,
            has_classes: !!enrollments[0].classes,
            classes_data: enrollments[0].classes
              ? {
                  id: enrollments[0].classes.id,
                  subject_code: enrollments[0].classes.subject_code,
                  has_subject: !!enrollments[0].classes.subject,
                }
              : null,
          }
        : "No enrollments found",
    );

    // Transform the data for frontend consumption
    const subjects = enrollments
      .filter((enrollment) => enrollment.classes) // Only include enrollments with class data
      .map((enrollment) => {
        const classData = enrollment.classes;
        const subjectData = classData?.subject;

        return {
          enrollmentId: enrollment.id.toString(),
          classId: enrollment.class_id,

          // Subject info
          subjectCode: classData?.subject_code || "N/A",
          subjectName:
            subjectData?.title || subjectData?.name || "Unknown Subject",
          subjectDescription: subjectData?.description || null,

          // Class info
          section: classData?.section || null,
          room: classData?.room || null,
          schedule: classData?.schedule_id || null,
          maxStudents: classData?.maximum_slots || null,
          classification: classData?.classification || null,

          // Academic period
          semester: classData?.semester || null,
          schoolYear: classData?.school_year || null,
          academicYear: classData?.academic_year || null,

          // Units
          units: subjectData?.units ? Number(subjectData.units) : null,
          lecture: subjectData?.lecture ? Number(subjectData.lecture) : null,
          laboratory: subjectData?.laboratory
            ? Number(subjectData.laboratory)
            : null,

          // Grades
          prelimGrade: enrollment.prelim_grade
            ? Number(enrollment.prelim_grade)
            : null,
          midtermGrade: enrollment.midterm_grade
            ? Number(enrollment.midterm_grade)
            : null,
          finalsGrade: enrollment.finals_grade
            ? Number(enrollment.finals_grade)
            : null,
          totalAverage: enrollment.total_average
            ? Number(enrollment.total_average)
            : null,

          // Status
          isGradesFinalized: enrollment.is_grades_finalized,
          isPrelimSubmitted: enrollment.is_prelim_submitted,
          isMidtermSubmitted: enrollment.is_midterm_submitted,
          isFinalsSubmitted: enrollment.is_finals_submitted,

          // Faculty info (if needed later)
          facultyId: classData?.faculty_id || null,

          // Enrollment dates
          enrolledAt: enrollment.created_at,
          completionDate: enrollment.completion_date,
        };
      });

    console.log("✅ Returning subjects:", {
      total: subjects.length,
      sample: subjects[0]
        ? {
            code: subjects[0].subjectCode,
            name: subjects[0].subjectName,
          }
        : null,
    });

    return NextResponse.json({
      success: true,
      subjects,
      total: subjects.length,
    });
  } catch (error) {
    console.error("💥 Error fetching student subjects:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subjects",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
