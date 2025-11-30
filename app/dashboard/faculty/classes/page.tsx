import { laravelApi, LaravelApiHelpers } from "@/lib/laravel-api";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClassCardSkeleton } from "./_components/class-card-skeleton";
import { ClassesList } from "./_components/classes-list";

async function getClasses(facultyId: string) {
    try {
        console.log("🚀 Fetching faculty classes for ID:", facultyId);

        // Fetch faculty data from Laravel API
        // Use Next.js caching: cache for 1 minute (60 seconds)
        const facultyData = await laravelApi.getFaculty(facultyId, { next: { revalidate: 60 } });

        if (!facultyData?.data) {
            return [];
        }

        const faculty = facultyData.data;
        console.log(`✅ Found faculty: ${faculty.full_name} with ${faculty.classes?.length || 0} classes`);

        // Get class IDs to fetch details
        const classIds = faculty.classes?.map(c => c.id) || [];

        // Fetch detailed class info (including schedules)
        // We can cache this aggressively if class details don't change often
        const classesDetails = await laravelApi.getBatchClassDetails(classIds, { next: { revalidate: 300 } });
        console.log(`📚 Fetched details for ${classesDetails.length} classes`);

        // Map to frontend format
        const mappedClasses = classesDetails.map((classDetail, index) => {
            const classInfo = LaravelApiHelpers.formatClassInfo(classDetail);
            const scheduleInfo = LaravelApiHelpers.getClassScheduleDisplay(classDetail);
            const statusInfo = LaravelApiHelpers.getClassStatus(classDetail);
            const enrollmentCount = LaravelApiHelpers.getClassEnrollmentCount(classDetail);

            // Generate a consistent color based on subject code
            const colors = ["blue", "green", "purple", "orange", "pink", "teal", "indigo"];
            const colorIndex =
                classInfo.subjectCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;

            return {
                id: classDetail.data.id,
                subjectCode: classInfo.subjectCode,
                subjectName: classInfo.subjectName,
                section: classInfo.section,
                semester: classInfo.semester,
                schoolYear: classInfo.schoolYear,
                enrolledStudents: enrollmentCount,
                maximumSlots: classDetail.data.class_information.maximum_slots || 30,
                credits: 3, // Default as not in API yet
                lecture: 3, // Default
                laboratory: 0, // Default
                classification: classDetail.data.classification || "College",
                gradeLevel: classInfo.gradeLevel,
                faculty: faculty.full_name,
                department: faculty.department,
                color: colors[colorIndex],
                status: "Active",
                progress: 0, // Default
                completionRate: 0, // Default
                gradeDistribution: [
                    { grade: "A", count: 0 },
                    { grade: "B", count: 0 },
                    { grade: "C", count: 0 },
                    { grade: "D", count: 0 },
                    { grade: "F", count: 0 },
                ],
                schedules: scheduleInfo.schedules,
                formattedSchedule: scheduleInfo.formatted,
                isFull: statusInfo.isFull,
                availableSlots: statusInfo.availableSlots,
            };
        });

        return mappedClasses;
    } catch (error) {
        console.error("💥 Error fetching faculty classes:", error);
        return [];
    }
}

export default async function FacultyClassesPage() {
    const user = await currentUser();

    if (!user) {
        redirect("/sign-in");
    }

    const facultyId = user.publicMetadata?.facultyId as string;

    if (!facultyId) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                <p className="text-muted-foreground">You do not have a faculty ID associated with your account.</p>
            </div>
        );
    }

    const classes = await getClasses(facultyId);

    return (
        <Suspense
            fallback={
                <div className="p-6 max-w-7xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-24">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <ClassCardSkeleton key={i} />
                    ))}
                </div>
            }
        >
            <ClassesList initialClasses={classes} />
        </Suspense>
    );
}
