import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ComingSoon } from "../_components/coming-soon";

export default async function AttendancePage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <ComingSoon
            title="Attendance"
            description="Track your class attendance and view attendance records."
        />
    );
}
