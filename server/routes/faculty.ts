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
  .get("/classes", async () => {
    try {
      // Get authenticated user
      const userId = await requireAuth();

      // Get user email from Clerk
      const userEmail = await getUserEmail(userId);

      if (!userEmail) {
        return badRequest("Email not found");
      }

      // Find faculty by email
      const facultyRecord = await prisma.faculty.findUnique({
        where: {
          email: userEmail,
        },
        select: {
          id: true,
        },
      });

      if (!facultyRecord) {
        return notFound("Faculty not found");
      }

      const facultyId = facultyRecord.id;

      // Get current academic settings
      const academicSettings = await getCurrentAcademicSettings();
      const { semester, schoolYear } = academicSettings;

      console.log("[FACULTY CLASSES] Fetching classes for:", {
        facultyId,
        semester,
        schoolYear,
      });

      // Fetch classes for the faculty based on current semester and school year
      const classes = await prisma.classes.findMany({
        where: {
          faculty_id: facultyId,
          semester: semester,
          school_year: schoolYear,
        },
        include: {
          subject: {
            select: {
              code: true,
              title: true,
              units: true,
              lecture: true,
              laboratory: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
      });

      console.log(`[FACULTY CLASSES] Found ${classes.length} classes`);

      // For each class, get the enrolled students count from subject_enrollments
      const classesWithEnrollment = await Promise.all(
        classes.map(async (classItem) => {
          // Get enrolled students for this class
          const enrolledStudentsCount = await prisma.subject_enrollments.count({
            where: {
              class_id: classItem.id,
              school_year: schoolYear,
              semester: parseInt(semester),
            },
          });

          // Get all enrolled students with their details
          const enrolledStudents = await prisma.subject_enrollments.findMany({
            where: {
              class_id: classItem.id,
              school_year: schoolYear,
              semester: parseInt(semester),
            },
            select: {
              student_id: true,
              grade: true,
              remarks: true,
              created_at: true,
            },
          });

          // Get student details
          const studentIds = enrolledStudents
            .map((e) => e.student_id)
            .filter((id): id is number => id !== null);

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
              email: true,
              student_id: true,
            },
          });

          // Map student details with enrollment info
          const studentsWithEnrollment = enrolledStudents.map((enrollment) => {
            const student = students.find(
              (s) => s.id === BigInt(enrollment.student_id || 0)
            );
            return {
              studentId: student?.id.toString() || "",
              studentNumber: student?.student_id?.toString() || "",
              firstName: student?.first_name || "",
              lastName: student?.last_name || "",
              middleName: student?.middle_name || "",
              email: student?.email || "",
              grade: enrollment.grade,
              remarks: enrollment.remarks,
              enrolledAt: enrollment.created_at,
            };
          });

          return {
            id: classItem.id,
            subjectCode: classItem.subject_code || classItem.subject?.code || "",
            subjectName: classItem.subject?.title || "",
            section: classItem.section || "",
            semester: classItem.semester || "",
            schoolYear: classItem.school_year || "",
            academicYear: classItem.academic_year || "",
            courseCodes: classItem.course_codes || "",
            classification: classItem.classification || "",
            gradeLevel: classItem.grade_level || "",
            maximumSlots: classItem.maximum_slots || 0,
            enrolledStudents: enrolledStudentsCount,
            students: studentsWithEnrollment,
            credits: Number(classItem.subject?.units || 0),
            lecture: Number(classItem.subject?.lecture || 0),
            laboratory: Number(classItem.subject?.laboratory || 0),
          };
        })
      );

      return {
        success: true,
        classes: classesWithEnrollment,
        academicSettings: {
          semester,
          schoolYear,
        },
      };
    } catch (error) {
      console.error("[FACULTY CLASSES] Error:", error);
      return serverError("An error occurred while fetching classes");
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
      // Add faculty validation logic here
      return { success: true };
    },
    {
      body: t.Any(),
    }
  )
  .post(
    "/update-metadata",
    async ({ body }) => {
      // Add faculty metadata update logic here
      return { success: true };
    },
    {
      body: t.Any(),
    }
  );
