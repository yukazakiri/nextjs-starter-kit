import { Elysia, t } from "elysia";
import { getCurrentAcademicSettings } from "@/lib/enrollment";
import { badRequest, serverError } from "../lib/auth";

export const schedule = new Elysia({ prefix: "/schedule" }).get(
  "/",
  async ({ query }) => {
    try {
      const { studentId } = query;

      if (!studentId) {
        return badRequest("Student ID is required");
      }

      console.log("[SCHEDULE API] Fetching schedule for student:", studentId);

      // Get current academic settings
      const academicSettings = await getCurrentAcademicSettings();
      const { semester, schoolYear } = academicSettings;

      // TODO: Replace with Laravel API call
      // const scheduleData = await laravelApi.getStudentSchedule(studentId, semester, schoolYear);

      console.log("[SCHEDULE API] Returning empty schedule (Prisma removed)");

      return {
        success: true,
        schedule: [],
        academicSettings: {
          semester,
          schoolYear,
        },
      };
    } catch (error) {
      console.error("[SCHEDULE API] Error:", error);
      return serverError("An error occurred while fetching schedule");
    }
  },
  {
    query: t.Object({
      studentId: t.String(),
    }),
  }
);
