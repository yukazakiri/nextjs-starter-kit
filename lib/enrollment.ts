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
  // Mock implementation or replace with Laravel API call
  console.log("getStudentEnrollmentStatus called with", { studentId, currentSemester, currentCurriculumYear });
  return {
    isEnrolled: false,
  };
}

export async function getCurrentAcademicSettings() {
   // Mock implementation or replace with Laravel API call
   return {
      semester: "1", 
      curriculum_year: "2024-2025",
      schoolYear: "2024-2025",
      school_starting_date: "2024-08-01",
      school_ending_date: "2025-05-31"
    };
}
