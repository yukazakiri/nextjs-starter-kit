import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json({ error: "studentId query param required" }, { status: 400 });
    }

    const studentIdNumber = parseInt(studentId, 10);

    // Try to find the student
    const result = await db
      .select()
      .from(students)
      .where(eq(students.studentId, studentIdNumber))
      .limit(1);

    return NextResponse.json({
      found: result.length > 0,
      count: result.length,
      student: result.length > 0 ? {
        id: result[0].id,
        studentId: result[0].studentId,
        firstName: result[0].firstName,
        lastName: result[0].lastName,
        email: result[0].email,
        deletedAt: result[0].deletedAt,
        status: result[0].status,
      } : null,
    });
  } catch (error) {
    console.error("Test query error:", error);
    return NextResponse.json(
      {
        error: "Database query failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
