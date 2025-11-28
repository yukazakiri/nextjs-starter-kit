import { StudentDashboardWrapper } from "../_components/student-dashboard-wrapper";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function StudentDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the student ID from Clerk metadata
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const userRole = user.publicMetadata?.role as string | undefined;
  const studentId = user.publicMetadata?.studentId as string | undefined;

  // Verify user is a student
  if (userRole !== "student") {
    redirect("/onboarding");
  }

  if (!studentId) {
    // If no student ID, redirect to onboarding
    redirect("/onboarding");
  }

  // Get user's full name or first name
  const userName = user.firstName || user.fullName || "Student";

  return <StudentDashboardWrapper studentId={studentId} userName={userName} />;
}
