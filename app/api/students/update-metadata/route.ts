import { NextRequest, NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

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
    const { metadata } = body;

    if (!metadata) {
      return NextResponse.json(
        { error: "Metadata is required" },
        { status: 400 }
      );
    }

    console.log("[UPDATE METADATA] Updating user:", userId);
    console.log("[UPDATE METADATA] New metadata:", metadata);

    // Update user's public metadata from server-side
    const client = await clerkClient();
    const updatedUser = await client.users.updateUser(userId, {
      publicMetadata: metadata,
    });

    console.log("[UPDATE METADATA] Success! Updated user:", {
      id: updatedUser.id,
      publicMetadata: updatedUser.publicMetadata,
    });

    // Longer delay to ensure Clerk propagates the metadata to sessions and JWT
    // This is crucial to prevent redirect loops
    console.log("[UPDATE METADATA] Waiting for metadata propagation...");
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      message: "Metadata updated successfully",
      metadata: updatedUser.publicMetadata,
    });
  } catch (error) {
    console.error("[UPDATE METADATA] Error updating metadata:", error);
    return NextResponse.json(
      {
        error: "Failed to update metadata",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
