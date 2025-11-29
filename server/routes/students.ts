import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { requireAuth, unauthorized, badRequest, serverError } from "../lib/auth";

export const students = new Elysia({ prefix: "/students" })
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

        // Convert studentId to number
        const studentIdNumber = parseInt(studentId, 10);
        if (isNaN(studentIdNumber)) {
          return {
            valid: false,
            error:
              "Invalid Student ID format. Please enter a valid numeric Student ID.",
          };
        }

        console.log("[VALIDATE] Searching for student_id:", studentIdNumber);

        // First, check if student exists by ID only (for debugging)
        const allStudentsById = await prisma.students.findMany({
          where: {
            student_id: studentIdNumber,
          },
          take: 5,
        });

        console.log(
          "[VALIDATE] Found students with this ID:",
          allStudentsById.length
        );
        if (allStudentsById.length > 0) {
          console.log("[VALIDATE] First match email:", allStudentsById[0].email);
          console.log(
            "[VALIDATE] First match deleted_at:",
            allStudentsById[0].deleted_at
          );
        }

        // Query database for student with matching email and studentId
        // Check that student is not deleted (deletedAt is null)
        const student = await prisma.students.findFirst({
          where: {
            student_id: studentIdNumber,
            deleted_at: null,
          },
        });

        console.log("[VALIDATE] Query result:", student ? "found" : "not found");

        if (!student) {
          // Student ID doesn't exist at all
          return {
            valid: false,
            error:
              "Student ID not found in our system. Please verify your Student ID or contact the School MIS Administration for assistance.",
          };
        }

        // Check email match (case-insensitive and trimmed)
        const dbEmail = (student.email || "").trim().toLowerCase();
        const inputEmail = (email || "").trim().toLowerCase();

        console.log("[VALIDATE] Email comparison:", {
          dbEmail,
          inputEmail,
          match: dbEmail === inputEmail,
        });

        if (dbEmail !== inputEmail) {
          return {
            valid: false,
            error: `Email does not match our records for this Student ID. Expected: ${student.email}. Please verify your email address or contact the School MIS Administration.`,
          };
        }

        // Parse contacts if it's JSON, otherwise use as-is
        let phone = "";
        if (student.contacts) {
          try {
            const contactsData = JSON.parse(student.contacts);
            phone =
              contactsData.phone ||
              contactsData.mobile ||
              contactsData.contact ||
              "";
          } catch {
            // If not JSON, assume it's a plain phone number
            phone = student.contacts;
          }
        }

        console.log("[VALIDATE] Success! Student found:", {
          id: Number(student.student_id),
          name: `${student.first_name} ${student.last_name}`,
        });

        return {
          valid: true,
          student: {
            firstName: student.first_name,
            lastName: student.last_name,
            middleName: student.middle_name,
            email: student.email,
            studentId: Number(student.student_id),
            birthDate: student.birth_date?.toISOString(),
            address: student.address,
            courseId: Number(student.course_id),
            gender: student.gender,
            age: Number(student.age),
            academicYear: student.academic_year
              ? Number(student.academic_year)
              : null,
            status: student.status,
            contacts: phone,
          },
        };
      } catch (error) {
        console.error("[VALIDATE] Error validating student:", error);
        return serverError(
          "Internal server error. Please try again later.",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    {
      body: t.Object({
        email: t.String(),
        studentId: t.String(),
      }),
    }
  )
  .post(
    "/update-metadata",
    async ({ body }) => {
      // Add student metadata update logic here
      return { success: true };
    },
    {
      body: t.Any(),
    }
  )
  .get("/test", async () => {
    return { success: true, message: "Test endpoint" };
  });
