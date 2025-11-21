import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

interface SessionMetadata {
  studentId?: string;
  dateOfBirth?: string;
  phone?: string;
  [key: string]: unknown;
}

export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    const user = await currentUser();

    const metadata = sessionClaims as SessionMetadata;

    return NextResponse.json({
      userId,
      sessionClaims: {
        studentId: metadata?.studentId,
        dateOfBirth: metadata?.dateOfBirth,
        phone: metadata?.phone,
        allClaims: sessionClaims,
      },
      userPublicMetadata: user?.publicMetadata,
      hasRequiredInSession: !!(
        metadata?.studentId &&
        metadata?.dateOfBirth &&
        metadata?.phone
      ),
      hasRequiredInUser: !!(
        user?.publicMetadata?.studentId &&
        user?.publicMetadata?.dateOfBirth &&
        user?.publicMetadata?.phone
      ),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
