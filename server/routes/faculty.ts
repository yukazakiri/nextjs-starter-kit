import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicSettings } from "@/lib/enrollment";
import {
  requireAuth,
  getUserEmail,
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

        // Fetch enrolled students with their grades
        const enrollments = await prisma.class_enrollments.findMany({
          where: {
            class_id: classId,
            deleted_at: null,
          },
          select: {
            id: true,
            student_id: true,
            prelim_grade: true,
            midterm_grade: true,
            finals_grade: true,
            total_average: true,
            is_prelim_submitted: true,
            is_midterm_submitted: true,
            is_finals_submitted: true,
            is_grades_finalized: true,
            remarks: true,
          },
          orderBy: {
            student_id: "asc",
          },
        });

        // Fetch student details
        const studentIds = enrollments.map((e) => e.student_id.toString());
        const students = await prisma.students.findMany({
          where: {
            id: {
              in: studentIds.map((id) => BigInt(id)),
            },
          },
          select: {
            id: true,
            first_name: true,
            last_name: true,
            middle_name: true,
          },
        });

        // Combine data
        const gradesData = enrollments.map((enrollment) => {
          const student = students.find(
            (s) => s.id.toString() === enrollment.student_id.toString()
          );
          return {
            enrollmentId: enrollment.id.toString(),
            studentId: enrollment.student_id.toString(),
            studentName: student
              ? `${student.last_name}, ${student.first_name} ${student.middle_name || ""}`
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
            isPrelimSubmitted: enrollment.is_prelim_submitted,
            isMidtermSubmitted: enrollment.is_midterm_submitted,
            isFinalsSubmitted: enrollment.is_finals_submitted,
            isGradesFinalized: enrollment.is_grades_finalized,
            remarks: enrollment.remarks,
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
        const classId = parseInt(params.classId);

        if (!enrollmentId || !term || grade === undefined) {
          return badRequest("Missing required fields");
        }

        // Check if grades are finalized (admin lock)
        const enrollment = await prisma.class_enrollments.findUnique({
          where: { id: BigInt(enrollmentId) },
          select: {
            is_grades_finalized: true,
            is_prelim_submitted: true,
            is_midterm_submitted: true,
            is_finals_submitted: true,
          },
        });

        if (!enrollment) {
          return notFound("Enrollment not found");
        }

        if (enrollment.is_grades_finalized) {
          return new Response(
            JSON.stringify({ error: "Grades are finalized and cannot be edited" }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Check if specific term is submitted
        if (
          (term === "prelim" && enrollment.is_prelim_submitted) ||
          (term === "midterm" && enrollment.is_midterm_submitted) ||
          (term === "finals" && enrollment.is_finals_submitted)
        ) {
          return new Response(
            JSON.stringify({ error: `${term} grades are already submitted` }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" },
            }
          );
        }

        // Update grade
        const updateData: any = {};
        if (term === "prelim") updateData.prelim_grade = grade;
        if (term === "midterm") updateData.midterm_grade = grade;
        if (term === "finals") updateData.finals_grade = grade;

        const updated = await prisma.class_enrollments.update({
          where: { id: BigInt(enrollmentId) },
          data: updateData,
        });

        // Calculate total average if all grades are present
        const prelim = term === "prelim" ? grade : updated.prelim_grade;
        const midterm = term === "midterm" ? grade : updated.midterm_grade;
        const finals = term === "finals" ? grade : updated.finals_grade;

        if (prelim && midterm && finals) {
          const average =
            (parseFloat(prelim.toString()) +
              parseFloat(midterm.toString()) +
              parseFloat(finals.toString())) /
            3;
          await prisma.class_enrollments.update({
            where: { id: BigInt(enrollmentId) },
            data: { total_average: average },
          });
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
        term: t.String(),
        grade: t.Number(),
      }),
    }
  )
  .post(
    "/classes/:classId/grades/finalize",
    async ({ params }) => {
      // Add finalize grades logic here
      return { success: true };
    },
    {
      params: t.Object({
        classId: t.String(),
      }),
    }
  )
  .get(
    "/classes/:classId/students",
    async ({ params }) => {
      // Add get students logic here
      return { success: true, students: [] };
    },
    {
      params: t.Object({
        classId: t.String(),
      }),
    }
  )
  .get(
    "/classes/:classId/schedule",
    async ({ params }) => {
      // Add get schedule logic here
      return { success: true, schedule: [] };
    },
    {
      params: t.Object({
        classId: t.String(),
      }),
    }
  )
  .get(
    "/classes/:classId/announcements",
    async ({ params }) => {
      // Add get announcements logic here
      return { success: true, announcements: [] };
    },
    {
      params: t.Object({
        classId: t.String(),
      }),
    }
  )
  .post(
    "/classes/:classId/announcements",
    async ({ params, body }) => {
      // Add create announcement logic here
      return { success: true };
    },
    {
      params: t.Object({
        classId: t.String(),
      }),
      body: t.Any(),
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

        const { email, facultyCode } = body;

        console.log("[FACULTY VALIDATE] Input:", { email, facultyCode });

        // Validate input
        if (!email || !facultyCode) {
          return badRequest("Email and Faculty Code are required");
        }

        // Import Laravel API client
        const { laravelApi } = await import("@/lib/laravel-api");

        try {
          // Try to find faculty by faculty code in Laravel API
          // We don't have a direct "validate" endpoint, so we'll try to get faculty data
          const facultyData = await laravelApi.getFaculty(facultyCode);

          if (!facultyData || !facultyData.data) {
            return {
              valid: false,
              error: "Faculty Code not found in our system. Please verify your Faculty Code or contact the School MIS Administration.",
            };
          }

          // Check email match (case-insensitive and trimmed)
          const dbEmail = (facultyData.data.email || "").trim().toLowerCase();
          const inputEmail = (email || "").trim().toLowerCase();

          console.log("[FACULTY VALIDATE] Email comparison:", {
            dbEmail,
            inputEmail,
            match: dbEmail === inputEmail,
          });

          if (dbEmail !== inputEmail) {
            return {
              valid: false,
              error: `Email does not match our records for this Faculty Code. Expected: ${facultyData.data.email}. Please verify your email address or contact the School MIS Administration.`,
            };
          }

          console.log("[FACULTY VALIDATE] Success! Faculty found:", {
            id: facultyData.data.faculty_id_number,
            name: `${facultyData.data.first_name} ${facultyData.data.last_name}`,
          });

          return {
            valid: true,
            faculty: {
              firstName: facultyData.data.first_name,
              lastName: facultyData.data.last_name,
              middleName: facultyData.data.middle_name,
              email: facultyData.data.email,
              facultyId: facultyData.data.faculty_id_number?.toString() || facultyData.data.id.toString(),
              facultyCode: facultyData.data.faculty_code,
              department: facultyData.data.department,
              phoneNumber: facultyData.data.phone_number || "",
              status: facultyData.data.status || "Active",
            },
          };
        } catch (laravelError) {
          console.error("[FACULTY VALIDATE] Laravel API error:", laravelError);
          // If faculty not found in Laravel API
          return {
            valid: false,
            error: "Faculty Code not found in our system. Please verify your Faculty Code or contact the School MIS Administration.",
          };
        }
      } catch (error) {
        console.error("[FACULTY VALIDATE] Error validating faculty:", error);
        return serverError(
          "Internal server error. Please try again later.",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    {
      body: t.Object({
        email: t.String(),
        facultyCode: t.String(),
      }),
    }
  )
  .post(
    "/update-metadata",
    async ({ body }) => {
      try {
        // Ensure user is authenticated
        const userId = await requireAuth();

        console.log("[FACULTY UPDATE-METADATA] Starting update for user:", userId);

        const { metadata } = body;

        if (!metadata) {
          return badRequest("Metadata is required");
        }

        // Import Clerk client
        const { clerkClient } = await import("@clerk/nextjs/server");

        try {
          // Get Clerk client instance
          const client = await clerkClient();

          // Update user metadata in Clerk
          const updatedUser = await client.users.updateUserMetadata(userId, {
            publicMetadata: metadata,
          });

          console.log("[FACULTY UPDATE-METADATA] Successfully updated metadata");

          return {
            success: true,
            user: {
              id: updatedUser.id,
              email: updatedUser.emailAddresses[0]?.emailAddress,
            },
          };
        } catch (clerkError) {
          console.error("[FACULTY UPDATE-METADATA] Clerk error:", clerkError);
          const errorMessage = clerkError instanceof Error ? clerkError.message : "Unknown Clerk error";
          console.error("[FACULTY UPDATE-METADATA] Error details:", {
            message: errorMessage,
            name: (clerkError as any)?.name,
            clerkError: JSON.stringify(clerkError, null, 2)
          });
          return serverError("Failed to update user metadata in Clerk", errorMessage);
        }
      } catch (error) {
        console.error("[FACULTY UPDATE-METADATA] Error:", error);
        return serverError(
          "Failed to update profile",
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    },
    {
      body: t.Object({
        metadata: t.Record(t.String(), t.Any()),
      }),
    }
  )
  .get(
    "/:facultyId/students",
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

        console.log(`[FACULTY STUDENTS] Fetching students for faculty: ${facultyId}`);

        // Get the Laravel API URL and token from environment
        const baseURL = process.env.DCCP_API_URL || "http://localhost:8000";
        const token = process.env.DCCP_API_TOKEN;

        if (!token) {
          console.error("[FACULTY STUDENTS] DCCP_API_TOKEN not configured");
          return serverError("API configuration error");
        }

        // Fetch faculty data from Laravel API
        const facultyResponse = await fetch(`${baseURL}/api/faculties/${facultyId}`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!facultyResponse.ok) {
          console.error(
            `[FACULTY STUDENTS] Laravel API error: ${facultyResponse.status} ${facultyResponse.statusText}`
          );
          return serverError("Failed to fetch faculty details");
        }

        const facultyData = await facultyResponse.json();
        const classes = facultyData?.data?.classes || [];

        console.log(`[FACULTY STUDENTS] Found ${classes.length} classes for faculty`);

        if (classes.length === 0) {
          return {
            success: true,
            students: [],
            classes: [],
          };
        }

        // Fetch students from each class
        const studentMap = new Map<string, {
          id: string;
          student_id: string;
          first_name: string;
          last_name: string;
          middle_name: string;
          email: string;
          phone?: string;
          classes: Array<{
            id: number;
            subject_code: string;
            subject_title: string;
            section: string;
            grade_level: string;
            classification: string;
          }>;
        }>();

        // Fetch all class details in parallel
        const classDetailsPromises = classes.map(async (cls: any) => {
          try {
            const classResponse = await fetch(`${baseURL}/api/classes/${cls.id}`, {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            });

            if (!classResponse.ok) {
              console.error(`[FACULTY STUDENTS] Failed to fetch class ${cls.id}`);
              return null;
            }

            const classData = await classResponse.json();
            return classData?.data;
          } catch (error) {
            console.error(`[FACULTY STUDENTS] Error fetching class ${cls.id}:`, error);
            return null;
          }
        });

        const classDetails = (await Promise.all(classDetailsPromises)).filter(Boolean);

        console.log(`[FACULTY STUDENTS] Fetched ${classDetails.length} class details`);

        // Process each class and its enrolled students
        for (const classDetail of classDetails) {
          if (!classDetail) continue;

          const enrolledStudents = classDetail.enrolled_students || [];

          for (const enrollment of enrolledStudents) {
            const student = enrollment.student;
            if (!student) continue;

            const studentId = student.id || student.student_id;

            // Class info to add to student
            const classInfo = {
              id: classDetail.id,
              subject_code: classDetail.class_information?.subject_code || "",
              subject_title: classDetail.subject_information?.[0]?.subject_title ||
                classDetail.course_information?.formatted_course_codes || "",
              section: classDetail.class_information?.section || "",
              grade_level: classDetail.shs_information?.grade_level ||
                classDetail.classification || "",
              classification: classDetail.classification || "",
            };

            if (studentMap.has(studentId)) {
              // Student already exists, add this class to their list
              const existingStudent = studentMap.get(studentId)!;
              existingStudent.classes.push(classInfo);
            } else {
              // New student, add to map
              studentMap.set(studentId, {
                id: studentId,
                student_id: student.student_id || studentId,
                first_name: student.first_name || "",
                last_name: student.last_name || "",
                middle_name: student.middle_name || "",
                email: student.email || "",
                phone: student.phone || "",
                classes: [classInfo],
              });
            }
          }
        }

        // Convert map to array
        const students = Array.from(studentMap.values());

        console.log(`[FACULTY STUDENTS] Returning ${students.length} unique students`);

        // Prepare class list for filtering
        const classList = classes.map((cls: any) => ({
          id: cls.id,
          subject_code: cls.subject_code,
          subject_title: cls.subject_title,
          section: cls.section,
          display_info: cls.display_info,
          grade_level: cls.grade_level,
        }));

        return {
          success: true,
          students,
          classes: classList,
        };
      } catch (error) {
        console.error("[FACULTY STUDENTS] Error fetching students:", error);
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
  );

