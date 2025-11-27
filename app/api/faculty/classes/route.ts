import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAcademicSettings } from "@/lib/enrollment";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Get user email from Clerk
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const userEmail = user.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "Email not found" },
        { status: 400 },
      );
    }

    // Find faculty by email
    const faculty = await prisma.faculty.findUnique({
      where: {
        email: userEmail,
      },
      select: {
        id: true,
      },
    });

    if (!faculty) {
      return NextResponse.json(
        { error: "Faculty not found" },
        { status: 404 },
      );
    }

    const facultyId = faculty.id;

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
            (s) => s.id === BigInt(enrollment.student_id || 0),
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
      }),
    );

    return NextResponse.json({
      success: true,
      classes: classesWithEnrollment,
      academicSettings: {
        semester,
        schoolYear,
      },
    });
  } catch (error) {
    console.error("[FACULTY CLASSES] Error:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching classes" },
      { status: 500 },
    );
  }
}
