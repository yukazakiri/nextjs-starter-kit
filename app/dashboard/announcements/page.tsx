import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ComingSoon } from "../_components/coming-soon";

export default async function AnnouncementsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <ComingSoon
            title="Announcements"
            description="Stay updated with the latest announcements and important notices."
        />
    );
}
