import { Elysia, t } from "elysia";
import { prisma } from "@/lib/prisma";
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

      // Get the student's enrolled classes
      const enrolledClasses = await prisma.subject_enrollments.findMany({
        where: {
          student_id: parseInt(studentId),
          school_year: schoolYear,
          semester: parseInt(semester),
        },
        select: {
          class_id: true,
        },
      });

      const classIds = enrolledClasses
        .map((e) => e.class_id)
        .filter((id): id is number => id !== null);

      console.log("[SCHEDULE API] Found enrolled class IDs:", classIds);

      if (classIds.length === 0) {
        return {
          success: true,
          schedule: [],
          academicSettings: {
            semester,
            schoolYear,
          },
        };
      }

      // Get classes with their subjects
      const classes = await prisma.classes.findMany({
        where: {
          id: {
            in: classIds,
          },
        },
        include: {
          subject: {
            select: {
              code: true,
              title: true,
            },
          },
        },
      });

      console.log("[SCHEDULE API] Found classes:", classes.length);

      // Get schedules for these classes
      const schedules = await prisma.schedule.findMany({
        where: {
          class_id: {
            in: classIds.map((id) => BigInt(id)),
          },
          deleted_at: null,
        },
      });

      console.log("[SCHEDULE API] Found schedules:", schedules.length);

      // Get rooms
      const roomIds = schedules
        .map((s) => s.room_id)
        .filter((id): id is bigint => id !== null);

      const rooms = await prisma.rooms.findMany({
        where: {
          id: {
            in: roomIds,
          },
        },
      });

      const roomMap = new Map(rooms.map((r) => [r.id.toString(), r]));

      // Get faculty information for each class
      const facultyIds = classes
        .map((c) => c.faculty_id)
        .filter((id): id is string => id !== null);

      const faculty = await prisma.faculty.findMany({
        where: {
          id: {
            in: facultyIds,
          },
        },
        select: {
          id: true,
          first_name: true,
          last_name: true,
          middle_name: true,
        },
      });

      const facultyMap = new Map(
        faculty.map((f) => [
          f.id,
          `${f.first_name} ${f.middle_name ? f.middle_name + " " : ""}${f.last_name}`,
        ])
      );

      // Combine the data
      const scheduleData = schedules.map((schedule) => {
        const classInfo = classes.find((c) => c.id === Number(schedule.class_id));
        const room = schedule.room_id
          ? roomMap.get(schedule.room_id.toString())
          : null;
        const instructorName = classInfo?.faculty_id
          ? facultyMap.get(classInfo.faculty_id) || "TBA"
          : "TBA";

        // Format time from DateTime to HH:MM
        const formatTime = (date: Date) => {
          const hours = date.getUTCHours().toString().padStart(2, "0");
          const minutes = date.getUTCMinutes().toString().padStart(2, "0");
          return `${hours}:${minutes}`;
        };

        return {
          id: schedule.id.toString(),
          subjectCode: classInfo?.subject?.code || classInfo?.subject_code || "N/A",
          subjectName: classInfo?.subject?.title || "N/A",
          instructor: instructorName,
          type: classInfo?.classification || "Lecture",
          room: room ? `${room.name}, ${room.class_code}` : "TBA",
          startTime: formatTime(schedule.start_time),
          endTime: formatTime(schedule.end_time),
          day: schedule.day_of_week,
          classId: classInfo?.id,
          section: classInfo?.section,
        };
      });

      console.log("[SCHEDULE API] Processed schedule data:", scheduleData.length);

      return {
        success: true,
        schedule: scheduleData,
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
