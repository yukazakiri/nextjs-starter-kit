import { Elysia, t } from "elysia";
import { requireAuth, unauthorized, badRequest, serverError, notFound } from "../lib/auth";
import { laravelApi } from "@/lib/laravel-api";

export const students = new Elysia({ prefix: "/students" })
  .get(
    "/:id",
    async ({ params: { id } }) => {
      try {
        console.log(`[STUDENTS] Fetching details for student ID: ${id}`);
        await requireAuth();
        
        // Try to fetch student details using the student ID directly
        try {
          const response = await laravelApi.getStudentDetails(id);
          console.log(`[STUDENTS] Fetched details successfully using ID: ${id}`);
          return { success: true, data: response.data || response };
        } catch (apiError: any) {
          console.error(`[STUDENTS] API Error for ID ${id}:`, apiError.message);
          
          // Check if it's a 404 error
          if (apiError.response?.status === 404 || apiError.message?.includes('404')) {
             return notFound(`Student with ID ${id} not found`);
          }
          
          throw apiError;
        }
      } catch (error) {
        console.error("[STUDENTS] Error fetching details:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        return serverError("Failed to fetch student details", errorMessage);
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .post(
    "/validate",
    async ({ body }) => {
      try {
        // Ensure user is authenticated
        try {
          await requireAuth();
        } catch {
          return unauthorized();
        }

        const { email, studentId } = body;

        console.log("[VALIDATE] Input:", { email, studentId });

        // Validate input
        if (!email || !studentId) {
          return badRequest("Email and Student ID are required");
        }

        // Mock implementation
        console.log("[VALIDATE] Mocking validation success (Prisma removed)");
        
        return {
            valid: true,
            student: {
                studentId: studentId,
                firstName: "Mock",
                lastName: "Student",
                middleName: "",
                email: email,
                phone: "000-000-0000",
                yearLevel: "1",
                course: "BSCS",
                courseCode: "BSCS",
            }
        };

      } catch (error) {
        console.error("[VALIDATE] Error:", error);
        return serverError("An error occurred while validating student");
      }
    },
    {
      body: t.Object({
        email: t.String(),
        studentId: t.String(),
      }),
    }
  );
