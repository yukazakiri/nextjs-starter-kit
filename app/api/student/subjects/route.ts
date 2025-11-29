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

    // Use raw SQL since Prisma has issues with class_enrollments table
    const enrollments: any[] = await prisma.$queryRaw`
      SELECT * FROM class_enrollments
      WHERE student_id = ${studentIdDecimal}::numeric
    `;

    console.log("📊 Found enrollments:", enrollments.length);

    // Now fetch the related classes and subjects separately
    const classIds = enrollments.map((e) => Number(e.class_id));

    const classesWithSubjects = await prisma.classes.findMany({
      where: {
        id: {
          in: classIds,
        },
      },
      include: {
        subject: true,
      },
    });

    // Map classes by ID for easy lookup
    const classesMap = new Map(classesWithSubjects.map((c) => [c.id, c]));

    // Combine the data - convert BigInt to number for proper mapping
    const enrollmentsWithClasses = enrollments.map((enrollment) => ({
      ...enrollment,
      id: enrollment.id,
      class_id: Number(enrollment.class_id),
      classes: classesMap.get(Number(enrollment.class_id)) || null,
    }));

    console.log(
      "🔍 Sample enrollment:",
      enrollmentsWithClasses[0]
        ? {
            id: enrollmentsWithClasses[0].id.toString(),
            class_id: enrollmentsWithClasses[0].class_id,
            has_classes: !!enrollmentsWithClasses[0].classes,
            classes_data: enrollmentsWithClasses[0].classes
              ? {
                  id: enrollmentsWithClasses[0].classes.id,
                  subject_code: enrollmentsWithClasses[0].classes.subject_code,
                  has_subject: !!enrollmentsWithClasses[0].classes.subject,
                }
              : null,
          }
        : "No enrollments found",
    );

    // Normalize school year format (remove spaces)
    const normalizeSchoolYear = (sy: string | null | undefined) => {
      if (!sy) return "";
      return sy.replace(/\s+/g, ""); // Remove all spaces
    };

    // Transform the data for frontend consumption
    const subjects = enrollmentsWithClasses
      .filter((enrollment) => enrollment.deleted_at === null) // Only non-deleted enrollments
      .filter((enrollment) => enrollment.status === true) // Only active enrollments
      .filter((enrollment) => enrollment.classes) // Only include enrollments with class data
      .filter((enrollment) => {
        // Filter by semester and schoolYear if provided
        const classData = enrollment.classes;

        // Normalize school years for comparison (remove spaces)
        const normalizedClassSchoolYear = normalizeSchoolYear(
          classData?.school_year,
        );
        const normalizedFilterSchoolYear = normalizeSchoolYear(schoolYear);

        console.log("🔍 Filtering enrollment:", {
          enrollment_id: enrollment.id,
          class_semester: classData?.semester,
          class_schoolYear: classData?.school_year,
          normalized_class_schoolYear: normalizedClassSchoolYear,
          filter_semester: semester,
          filter_schoolYear: schoolYear,
          normalized_filter_schoolYear: normalizedFilterSchoolYear,
          semester_match: !semester || classData?.semester === semester,
          schoolYear_match:
            !schoolYear ||
            normalizedClassSchoolYear === normalizedFilterSchoolYear,
        });

        if (semester && classData?.semester !== semester) return false;
        if (
          schoolYear &&
          normalizedClassSchoolYear !== normalizedFilterSchoolYear
        )
          return false;
        return true;
      })
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
          room: classData?.room_id ? String(classData.room_id) : null,
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
