import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Fetch distinct school years and semesters from student_enrollment table
    const enrollments = await prisma.student_enrollment.findMany({
      where: {
        deleted_at: null,
        school_year: {
          not: null,
        },
      },
      select: {
        school_year: true,
        semester: true,
      },
      distinct: ["school_year", "semester"],
      orderBy: {
        school_year: "desc",
      },
    });

    // Group by school year and collect semesters
    const academicPeriods = enrollments.reduce(
      (acc, enrollment) => {
        const schoolYear = enrollment.school_year || "";
        const semester = enrollment.semester?.toString() || "";

        if (!acc[schoolYear]) {
          acc[schoolYear] = new Set<string>();
        }
        if (semester) {
          acc[schoolYear].add(semester);
        }
        return acc;
      },
      {} as Record<string, Set<string>>,
    );

    // Convert to array format
    const formattedPeriods = Object.entries(academicPeriods).map(
      ([schoolYear, semesters]) => ({
        schoolYear,
        semesters: Array.from(semesters).sort(),
      }),
    );

    return NextResponse.json({
      success: true,
      data: formattedPeriods,
    });
  } catch (error) {
    console.error("Error fetching academic periods:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch academic periods",
      },
      { status: 500 },
    );
  }
}
