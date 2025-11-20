import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ComingSoon } from "../_components/coming-soon";

export default async function TimetablePage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <ComingSoon
            title="Timetable"
            description="View your complete semester timetable and exam schedule."
        />
    );
}
