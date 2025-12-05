import { Elysia, t } from "elysia";
import { badRequest, serverError } from "../lib/auth";

export const enrollment = new Elysia({ prefix: "/enrollment-status" }).get(
  "/",
  async ({ query }) => {
    try {
      const { studentId, semester, schoolYear } = query;

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
        return badRequest("Missing required parameters");
      }

      console.log("🔍 Checking enrollment (Prisma removed)...");
      
      // Mock implementation: Assume enrolled for now, or not enrolled
      // Since we are removing Prisma, we can't check the DB.
      // TODO: Replace with Laravel API check if available
      
      const isEnrolled = false; // Default to false or true depending on dev needs

      return {
        isEnrolled: isEnrolled,
        status: isEnrolled ? "enrolled" : "not-enrolled",
        semester: parseInt(semester),
        academicYear: 0,
        schoolYear: schoolYear,
        courseId: "",
      };

    } catch (error) {
      console.error("💥 Error in enrollment check:", error);
      return serverError("Internal server error");
    }
  },
  {
    query: t.Object({
      studentId: t.String(),
      semester: t.String(),
      schoolYear: t.String(),
    }),
  }
);
