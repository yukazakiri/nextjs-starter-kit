import { Context } from "elysia";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireAuth() {
  const userId = await getAuthUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  return userId;
}

export async function getUserEmail(userId: string): Promise<string | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  return user.emailAddresses[0]?.emailAddress || null;
}

export interface UserAcademicPeriod {
  semester: string;
  schoolYear: string;
}

export async function getUserAcademicPeriod(userId: string): Promise<UserAcademicPeriod | null> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const metadata = user.publicMetadata || {};

    if (metadata.semester && metadata.schoolYear) {
      return {
        semester: String(metadata.semester),
        schoolYear: String(metadata.schoolYear),
      };
    }

    return null;
  } catch (error) {
    console.error("[AUTH] Error getting user academic period:", error);
    return null;
  }
}

export async function setUserAcademicPeriod(
  userId: string,
  period: UserAcademicPeriod
): Promise<void> {
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: {
        ...await getUserAcademicPeriod(userId),
        semester: period.semester,
        schoolYear: period.schoolYear,
      },
    });
    console.log("[AUTH] Saved academic period for user:", userId, period);
  } catch (error) {
    console.error("[AUTH] Error setting user academic period:", error);
    throw error;
  }
}

export function unauthorized(message = "Unauthorized") {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}

export function badRequest(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export function notFound(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
  });
}

export function serverError(message: string, details?: string) {
  return new Response(
    JSON.stringify({ error: message, details }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    }
  );
}
