import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { term } = body;

    if (!term || !["prelim", "midterm", "finals"].includes(term)) {
      return NextResponse.json({ error: "Invalid term" }, { status: 400 });
    }

    const { classId: classIdParam } = await params;
    const classId = parseInt(classIdParam);

    // Get all enrollments for this class
    const enrollments = await prisma.class_enrollments.findMany({
      where: {
        class_id: classId,
        deleted_at: null,
      },
      select: {
        id: true,
        is_grades_finalized: true,
        is_prelim_submitted: true,
        is_midterm_submitted: true,
        is_finals_submitted: true,
      },
    });

    if (enrollments.length === 0) {
      return NextResponse.json(
        { error: "No enrollments found" },
        { status: 404 }
      );
    }

    // Check if any enrollment is finalized (admin lock)
    const isFinalized = enrollments.some((e) => e.is_grades_finalized);
    if (isFinalized) {
      return NextResponse.json(
        { error: "Grades are finalized and cannot be modified" },
        { status: 403 }
      );
    }

    // Toggle submission status for all enrollments
    const currentStatus =
      term === "prelim"
        ? enrollments[0].is_prelim_submitted
        : term === "midterm"
          ? enrollments[0].is_midterm_submitted
          : enrollments[0].is_finals_submitted;

    const updateData: any = {};
    if (term === "prelim") updateData.is_prelim_submitted = !currentStatus;
    if (term === "midterm") updateData.is_midterm_submitted = !currentStatus;
    if (term === "finals") updateData.is_finals_submitted = !currentStatus;

    await prisma.class_enrollments.updateMany({
      where: {
        class_id: classId,
        deleted_at: null,
      },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      submitted: !currentStatus,
      term,
    });
  } catch (error) {
    console.error("Error finalizing grades:", error);
    return NextResponse.json(
      { error: "Failed to finalize grades" },
      { status: 500 }
    );
  }
}
