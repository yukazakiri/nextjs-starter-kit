import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ComingSoon } from "../_components/coming-soon";

export default async function SubjectsPage() {
    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    return (
        <ComingSoon
            title="My Subjects"
            description="View and manage all your enrolled subjects, course materials, and resources."
        />
    );
}
