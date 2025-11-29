import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get studentId from query params for testing
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || "205495";

    // Update user metadata
    const client = await clerkClient();
    await client.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "student",
        studentId: studentId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student metadata updated successfully",
      data: {
        userId,
        studentId,
        role: "student",
      },
    });
  } catch (error) {
    console.error("Error updating metadata:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update metadata",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
