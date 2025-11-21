import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { students } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  try {
    // Ensure user is authenticated
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, studentId } = body;

    console.log("[VALIDATE] Input:", { email, studentId });

    // Validate input
    if (!email || !studentId) {
      return NextResponse.json(
        { error: "Email and Student ID are required" },
        { status: 400 }
      );
    }

    // Convert studentId to number
    const studentIdNumber = parseInt(studentId, 10);
    if (isNaN(studentIdNumber)) {
      return NextResponse.json(
        {
          valid: false,
          error: "Invalid Student ID format. Please enter a valid numeric Student ID.",
        },
        { status: 200 }
      );
    }

    console.log("[VALIDATE] Searching for student_id:", studentIdNumber);

    // First, check if student exists by ID only (for debugging)
    const allStudentsById = await db
      .select()
      .from(students)
      .where(eq(students.studentId, studentIdNumber))
      .limit(5);

    console.log("[VALIDATE] Found students with this ID:", allStudentsById.length);
    if (allStudentsById.length > 0) {
      console.log("[VALIDATE] First match email:", allStudentsById[0].email);
      console.log("[VALIDATE] First match deleted_at:", allStudentsById[0].deletedAt);
    }

    // Query database for student with matching email and studentId
    // Check that student is not deleted (deletedAt is null)
    const student = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.studentId, studentIdNumber),
          isNull(students.deletedAt)
        )
      )
      .limit(1);

    console.log("[VALIDATE] Query result count:", student.length);

    if (student.length === 0) {
      // Student ID doesn't exist at all
      return NextResponse.json({
        valid: false,
        error: "Student ID not found in our system. Please verify your Student ID or contact the School MIS Administration for assistance.",
      });
    }

    // Check email match (case-insensitive and trimmed)
    const validatedStudent = student[0];
    const dbEmail = (validatedStudent.email || "").trim().toLowerCase();
    const inputEmail = (email || "").trim().toLowerCase();

    console.log("[VALIDATE] Email comparison:", {
      dbEmail,
      inputEmail,
      match: dbEmail === inputEmail,
    });

    if (dbEmail !== inputEmail) {
      return NextResponse.json({
        valid: false,
        error: `Email does not match our records for this Student ID. Expected: ${validatedStudent.email}. Please verify your email address or contact the School MIS Administration.`,
      });
    }

    // Parse contacts if it's JSON, otherwise use as-is
    let phone = "";
    if (validatedStudent.contacts) {
      try {
        const contactsData = JSON.parse(validatedStudent.contacts);
        phone = contactsData.phone || contactsData.mobile || contactsData.contact || "";
      } catch {
        // If not JSON, assume it's a plain phone number
        phone = validatedStudent.contacts;
      }
    }

    console.log("[VALIDATE] Success! Student found:", {
      id: validatedStudent.studentId,
      name: `${validatedStudent.firstName} ${validatedStudent.lastName}`,
    });

    return NextResponse.json({
      valid: true,
      student: {
        firstName: validatedStudent.firstName,
        lastName: validatedStudent.lastName,
        middleName: validatedStudent.middleName,
        email: validatedStudent.email,
        studentId: validatedStudent.studentId,
        birthDate: validatedStudent.birthDate,
        address: validatedStudent.address,
        courseId: validatedStudent.courseId,
        gender: validatedStudent.gender,
        age: validatedStudent.age,
        academicYear: validatedStudent.academicYear,
        status: validatedStudent.status,
        contacts: phone,
      },
    });
  } catch (error) {
    console.error("[VALIDATE] Error validating student:", error);
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
