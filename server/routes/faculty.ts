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

        const classId = params.classId;

        const { laravelApi } = await import("@/lib/laravel-api");

        let enrollments: any;
        try {
          enrollments = await laravelApi.getClassEnrollmentsByClassId(classId);
        } catch (e) {
          const base = (process.env.DCCP_API_URL || "https://admin.dccp.edu.ph").replace(/\/$/, "");
          const url = `${base}/api/class-enrollments/class/${classId}`;
          const token = (process.env.DCCP_API_TOKEN || "").replace(/^\s*["']|["']\s*$/g, "");
          const res = await fetch(url, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            const txt = await res.text();
            return serverError("Failed to fetch grades", `Laravel ${res.status}: ${res.statusText} ${txt}`);
          }
          enrollments = await res.json();
        }

        const gradesData = (enrollments?.data || []).map((item: any) => ({
          enrollmentId: String(item.id),
          studentId: item.student?.student_id || String(item.student_id),
          studentName: item.student?.full_name || "",
          prelimGrade: item.prelim_grade ?? null,
          midtermGrade: item.midterm_grade ?? null,
          finalsGrade: item.finals_grade ?? null,
          totalAverage: item.total_average ?? null,
          isPrelimSubmitted: !!item.prelim_grade,
          isMidtermSubmitted: !!item.midterm_grade,
          isFinalsSubmitted: !!item.finals_grade,
          isGradesFinalized: !!item.is_grades_finalized,
          remarks: item.remarks ?? "",
        }));

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

        const { enrollmentId, term, grade, totalAverage, remarks } = body as { enrollmentId: string; term?: string; grade?: number | null; totalAverage?: number; remarks?: string };
        
        if (!enrollmentId) return badRequest("Missing enrollmentId");
        if (term && grade === undefined) return badRequest("Missing grade for term");
        if (!term && totalAverage === undefined && remarks === undefined) return badRequest("No fields to update");

        const { laravelApi } = await import("@/lib/laravel-api");
        const payload: Record<string, any> = {};
        if (term) {
          const field = term === 'prelim' ? 'prelim_grade' : term === 'midterm' ? 'midterm_grade' : term === 'finals' ? 'finals_grade' : undefined;
          if (!field) return badRequest("Invalid term");
          payload[field] = grade ?? null;
        }
        if (typeof totalAverage === 'number') payload.total_average = totalAverage;
        if (typeof remarks === 'string') payload.remarks = remarks;

        try {
          await laravelApi.updateClassEnrollment(enrollmentId, payload);
        } catch (e) {
          const base = (process.env.DCCP_API_URL || "https://admin.dccp.edu.ph").replace(/\/$/, "");
          const url = `${base}/api/class-enrollments/${enrollmentId}`;
          const token = (process.env.DCCP_API_TOKEN || "").replace(/^\s*["']|["']\s*$/g, "");
          const res = await fetch(url, {
            method: "PUT",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const txt = await res.text();
            return serverError("Failed to update grade", `Laravel ${res.status}: ${res.statusText} ${txt}`);
          }
        }

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
        term: t.Optional(t.String()),
        grade: t.Nullable(t.Number()),
        totalAverage: t.Optional(t.Number()),
        remarks: t.Optional(t.String()),
      }),
    }
  );
