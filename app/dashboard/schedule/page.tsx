import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ComingSoon } from "../_components/coming-soon";

export default async function SchedulePage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <ComingSoon
            title="Schedule"
            description="View your daily and weekly class schedule."
        />
    );
}
