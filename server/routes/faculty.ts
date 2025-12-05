import { Elysia, t } from "elysia";
import {
  requireAuth,
  unauthorized,
  badRequest,
  notFound,
  serverError,
} from "../lib/auth";

export const faculty = new Elysia({ prefix: "/faculty" })
  .get(
    "/:facultyId",
    async ({ params }) => {
      try {
        // Ensure user is authenticated
        try {
          await requireAuth();
        } catch {
          return unauthorized();
        }

        const facultyId = params.facultyId;

        if (!facultyId) {
          return badRequest("Faculty ID is required");
        }

        console.log(`[FACULTY DETAILS] Fetching faculty: ${facultyId}`);

        // Get the Laravel API URL and token from environment
        const baseURL = process.env.DCCP_API_URL || "http://localhost:8000";
        const token = process.env.DCCP_API_TOKEN;

        if (!token) {
          console.error("[FACULTY DETAILS] DCCP_API_TOKEN not configured");
          return serverError("API configuration error");
        }

        // Forward request to Laravel API
        const response = await fetch(`${baseURL}/api/faculties/${facultyId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error(
            `[FACULTY DETAILS] Laravel API error: ${response.status} ${response.statusText}`
          );
          const errorText = await response.text();
          console.error("[FACULTY DETAILS] Error response:", errorText);

          if (response.status === 404) {
            return serverError("Faculty not found");
          }

          return serverError(
            `Failed to fetch faculty details: ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("[FACULTY DETAILS] Faculty found:", data?.data?.full_name);

        return data;
      } catch (error) {
        console.error("[FACULTY DETAILS] Error fetching faculty details:", error);
        return serverError(
          "Internal server error. Please try again later.",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    {
      params: t.Object({
        facultyId: t.String(),
      }),
    }
  )
  .get("/classes", async () => {
    try {
      // Get authenticated user
      const userId = await requireAuth();

      // Import Clerk client to get user metadata
      const { clerkClient } = await import("@clerk/nextjs/server");
      const client = await clerkClient();
      const user = await client.users.getUser(userId);

      // Get facultyId from user metadata (set during onboarding)
      const facultyId = user.publicMetadata?.facultyId as string;

      if (!facultyId) {
        return badRequest("Faculty ID not found in user metadata");
      }

      console.log("[FACULTY CLASSES] Fetching faculty:", facultyId);

      // Import Laravel API
      const { laravelApi } = await import("@/lib/laravel-api");

      // Fetch faculty data from Laravel API
      const facultyData = await laravelApi.getFaculty(facultyId);

      if (!facultyData?.data) {
        return notFound("Faculty not found");
      }

      const faculty = facultyData.data;
      const facultyClasses = faculty.classes || [];

      console.log(`[FACULTY CLASSES] Found ${facultyClasses.length} classes`);

      // Map classes to frontend format
      const mappedClasses = facultyClasses.map((cls: any) => {
        // Generate a consistent color based on subject code
        const colors = ["blue", "green", "purple", "orange", "pink", "teal", "indigo"];
        const colorIndex = cls.subject_code
          ? cls.subject_code.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % colors.length
          : 0;

        return {
          id: cls.id,
          subjectCode: cls.subject_code || "",
          subjectName: cls.subject_title || "",
          section: cls.section || "",
          semester: cls.semester || "",
          schoolYear: cls.school_year || "",
          enrolledStudents: parseInt(cls.student_count || "0"),
          maximumSlots: cls.maximum_slots || 30,
          credits: 3, // Default
          lecture: 3, // Default
          laboratory: 0, // Default
          classification: cls.classification || "College",
          gradeLevel: cls.grade_level || "N/A",
          faculty: faculty.full_name || "",
          department: faculty.department || "",
          color: colors[colorIndex],
          status: "Active",
          progress: 0,
          completionRate: 0,
          gradeDistribution: [
            { grade: "A", count: 0 },
            { grade: "B", count: 0 },
            { grade: "C", count: 0 },
            { grade: "D", count: 0 },
            { grade: "F", count: 0 },
          ],
          schedules: [],
          formattedSchedule: "Schedule not available",
          isFull: parseInt(cls.student_count || "0") >= (cls.maximum_slots || 30),
          availableSlots: Math.max(0, (cls.maximum_slots || 30) - parseInt(cls.student_count || "0")),
        };
      });

      return {
        success: true,
        classes: mappedClasses,
        faculty: {
          id: faculty.id,
          name: faculty.full_name,
          department: faculty.department,
          email: faculty.email,
        },
      };
    } catch (error) {
      console.error("[FACULTY CLASSES] Error:", error);
      return serverError("An error occurred while fetching classes", error instanceof Error ? error.message : String(error));
    }
  })
  .get(
    "/classes/:classId/grades",
    async ({ params }) => {
      try {
        await requireAuth();

        const classId = parseInt(params.classId);

        // Import Laravel API
        const { laravelApi } = await import("@/lib/laravel-api");

        // Fetch grades from Laravel API
        const grades = await laravelApi.getClassGrades(classId);

        // Combine data
        const gradesData = grades.map((enrollment: any) => {
          return {
            enrollmentId: enrollment.id?.toString() || "",
            studentId: enrollment.student_id?.toString() || "",
            studentName: enrollment.first_name && enrollment.last_name
              ? `${enrollment.last_name}, ${enrollment.first_name}`
              : "Unknown",
            prelimGrade: enrollment.prelim_grade
              ? parseFloat(enrollment.prelim_grade.toString())
              : null,
            midtermGrade: enrollment.midterm_grade
              ? parseFloat(enrollment.midterm_grade.toString())
              : null,
            finalsGrade: enrollment.finals_grade
              ? parseFloat(enrollment.finals_grade.toString())
              : null,
            totalAverage: enrollment.total_average
              ? parseFloat(enrollment.total_average.toString())
              : null,
            isPrelimSubmitted: false, // TODO: Add to Laravel API
            isMidtermSubmitted: false, // TODO: Add to Laravel API
            isFinalsSubmitted: false, // TODO: Add to Laravel API
            isGradesFinalized: false, // TODO: Add to Laravel API
            remarks: enrollment.remarks || "",
          };
        });

        return { grades: gradesData };
      } catch (error) {
        console.error("Error fetching grades:", error);
        return serverError("Failed to fetch grades");
      }
    },
    {
      params: t.Object({
        classId: t.String(),
      }),
    }
  )
  .post(
    "/classes/:classId/grades",
    async ({ params, body }) => {
      try {
        await requireAuth();

        const { enrollmentId, term, grade } = body;
        
        if (!enrollmentId || !term || grade === undefined) {
          return badRequest("Missing required fields");
        }

        // Import Laravel API
        const { laravelApi } = await import("@/lib/laravel-api");
        
        // Prepare update data
        const updateData: any = {};
        if (term === 'prelim') updateData.prelim_grade = grade;
        else if (term === 'midterm') updateData.midterm_grade = grade;
        else if (term === 'finals') updateData.finals_grade = grade;

        // Update grade via Laravel API
        await laravelApi.updateGrade(enrollmentId, updateData);

        return { success: true };

      } catch (error) {
        console.error("Error updating grade:", error);
        return serverError("Failed to update grade");
      }
    },
    {
      params: t.Object({
        classId: t.String(),
      }),
      body: t.Object({
        enrollmentId: t.String(),
        term: t.String(),
        grade: t.Number(),
      }),
    }
  );
