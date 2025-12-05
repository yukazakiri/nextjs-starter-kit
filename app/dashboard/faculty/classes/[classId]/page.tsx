import { ClassHeader } from "../_components/class-header";
import { ClassTabs } from "../_components/class-tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ClassDetailHeaderSkeleton } from "../../_components/skeletons/class-detail-header-skeleton";
import { ClassTabsSkeleton } from "../../_components/skeletons/class-tabs-skeleton";
import { laravelApi } from "@/lib/laravel-api";

async function getClassDetails(classId: string) {
  try {
    // Use Laravel API to get class details
    const classDetails = await laravelApi.getClassDetails(parseInt(classId));

    if (!classDetails || !classDetails.data) {
      return null;
    }

    const data = classDetails.data;

    // Handle subject_information - filter out null values
    const subjectInfo = data.subject_information && Array.isArray(data.subject_information)
      ? data.subject_information.filter(s => s !== null)
      : [];

    // Handle enrolled students - pass the full enrollment object to preserve structure and IDs
    // The PeopleTab component handles the extraction of student data
    const enrolledStudentsList = data.enrolled_students || [];

    // Handle schedule
    const schedule = data.schedule_information?.schedules || [];

    return {
      id: data.id,
      code: data.class_information?.subject_code || "N/A",
      name: subjectInfo[0]?.subject_title || subjectInfo[0]?.title || data.class_information?.subject_code || "N/A",
      section: data.class_information?.section || "N/A",
      credits: subjectInfo[0]?.units || 0,
      semester: data.class_information?.formatted_semester || "N/A",
      year: data.class_information?.formatted_academic_year || "N/A",
      enrolledStudents: parseInt(data.class_information?.enrolled_students || "0"),
      capacity: data.class_information?.maximum_slots || 0,
      averageGrade: "N/A",
      attendanceRate: "N/A",
      courseCodes: data.course_information?.formatted_course_codes || "",
      classification: data.classification || "",
      gradeLevel: data.shs_information?.grade_level || "",
      lecture: subjectInfo[0]?.lecture || 0,
      laboratory: subjectInfo[0]?.laboratory || 0,
      latestResource: null,
      recentResources: [],
      enrolledStudentsList,
      schedule,
    };
  } catch (error) {
    console.error("Error fetching class details:", error);
    return null;
  }
}

export default async function ClassDetailPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { userId } = await auth();

  // Early redirect if not authenticated
  if (!userId) {
    redirect("/sign-in");
  }

  // Don't wait for user verification, do it in parallel
  const clientPromise = clerkClient();

  const { classId } = await params;

  // Start fetching data immediately without blocking
  const classDetailsPromise = getClassDetails(classId);

  // Verify user in parallel
  const client = await clientPromise;
  const user = await client.users.getUser(userId);
  const userRole = user.publicMetadata?.role as string | undefined;
  const facultyId = user.publicMetadata?.facultyId as string | undefined;

  // Verify user is faculty
  if (userRole !== "faculty") {
    redirect("/onboarding");
  }

  if (!facultyId) {
    redirect("/onboarding");
  }

  // Wait for class details
  const classDetails = await classDetailsPromise;

  if (!classDetails) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Class Not Found</h1>
        <p className="text-muted-foreground">
          The class you are looking for does not exist or you do not have
          permission to view it.
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/faculty/classes">Back to Classes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Suspense fallback={<ClassDetailHeaderSkeleton />}>
        <ClassHeader classDetails={classDetails} schedule={classDetails.schedule} />
      </Suspense>
      <div className="flex-grow">
        <Suspense fallback={<ClassTabsSkeleton />}>
          <ClassTabs
            classId={classId}
            averageGrade={classDetails.averageGrade}
            latestResource={classDetails.latestResource}
            recentResources={classDetails.recentResources}
            enrolledStudents={classDetails.enrolledStudentsList}
          />
        </Suspense>
      </div>
    </div>
  );
}
