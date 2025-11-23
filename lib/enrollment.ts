import { prisma } from "./prisma";

export interface EnrollmentStatus {
  isEnrolled: boolean;
  status?: string;
  semester?: bigint | null;
  academicYear?: bigint | null;
  schoolYear?: string | null;
  courseId?: string;
}

/**
 * Helper function to extract year from date string in format "2026-12-31 00:00:00"
 * @param dateString - Date string in format "YYYY-MM-DD HH:MM:SS"
 * @returns Year as string or empty string if invalid
 */
export function extractYear(dateString: string | null | undefined): string {
  if (!dateString) return "";

  try {
    // Extract the year part from "2026-12-31 00:00:00" format
    const year = dateString.split("-")[0];
    return year || "";
  } catch (error) {
    console.error("Error extracting year from date:", error);
    return "";
  }
}

/**
 * Helper function to format school year from starting and ending dates
 * Example: "2024-2025" from start date "2024-08-01" and end date "2025-05-31"
 * @param startDate - School starting date in format "YYYY-MM-DD HH:MM:SS"
 * @param endDate - School ending date in format "YYYY-MM-DD HH:MM:SS"
 * @returns Formatted school year like "2024-2025" or empty string if invalid
 */
export function formatSchoolYear(
  startDate: string | null | undefined,
  endDate: string | null | undefined,
): string {
  const startYear = extractYear(startDate);
  const endYear = extractYear(endDate);

  if (!startYear || !endYear) return "";

  return `${startYear} - ${endYear}`;
}

export async function getStudentEnrollmentStatus(
  studentId: string,
  currentSemester: string,
  currentCurriculumYear: string,
): Promise<EnrollmentStatus> {
  try {
    // Query the student_enrollment table for the current semester and curriculum year
    const enrollment = await prisma.student_enrollment.findFirst({
      where: {
        student_id: studentId,
        semester: BigInt(currentSemester),
        school_year: currentCurriculumYear,
        deleted_at: null, // Only get non-deleted enrollments
      },
      orderBy: {
        created_at: "desc", // Get the most recent enrollment
      },
    });

    if (!enrollment) {
      return {
        isEnrolled: false,
      };
    }

    return {
      isEnrolled: true,
      status: enrollment.status,
      semester: enrollment.semester,
      academicYear: enrollment.academic_year,
      schoolYear: enrollment.school_year,
      courseId: enrollment.course_id,
    };
  } catch (error) {
    console.error("Error fetching enrollment status:", error);
    return {
      isEnrolled: false,
    };
  }
}

export async function getCurrentAcademicSettings() {
  try {
    const settings = await prisma.general_settings.findFirst({
      select: {
        semester: true,
        curriculum_year: true,
        school_starting_date: true,
        school_ending_date: true,
      },
    });

    const schoolYear = formatSchoolYear(
      settings?.school_starting_date,
      settings?.school_ending_date,
    );

    return {
      semester: settings?.semester || "1",
      curriculumYear: settings?.curriculum_year || "",
      schoolYear,
      schoolStartingDate: settings?.school_starting_date || "",
      schoolEndingDate: settings?.school_ending_date || "",
    };
  } catch (error) {
    console.error("Error fetching academic settings:", error);
    return {
      semester: "1",
      curriculumYear: "",
      schoolYear: "",
      schoolStartingDate: "",
      schoolEndingDate: "",
    };
  }
}
