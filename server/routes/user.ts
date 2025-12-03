import { Elysia, t } from "elysia";
import { requireAuth, unauthorized, badRequest } from "../lib/auth";
import { setUserAcademicPeriod } from "../lib/auth";

export const user = new Elysia({ prefix: "/user" })
  .post(
    "/academic-period",
    async ({ body }) => {
      try {
        // Ensure user is authenticated
        let userId: string;
        try {
          userId = await requireAuth();
        } catch {
          return unauthorized();
        }

        const { semester, schoolYear } = body;

        if (!semester || !schoolYear) {
          return badRequest("Semester and School Year are required");
        }

        console.log("[USER] Saving academic period for user:", userId, {
          semester,
          schoolYear,
        });

        await setUserAcademicPeriod(userId, {
          semester,
          schoolYear,
        });

        return {
          success: true,
          message: "Academic period saved successfully",
        };
      } catch (error) {
        console.error("[USER] Error saving academic period:", error);
        return {
          success: false,
          error:
            error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
    {
      body: t.Object({
        semester: t.String(),
        schoolYear: t.String(),
      }),
    }
  );
