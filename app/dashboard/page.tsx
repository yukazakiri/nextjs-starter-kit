import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { StudentDashboard } from "./_components/student-dashboard";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return <StudentDashboard />;
}
