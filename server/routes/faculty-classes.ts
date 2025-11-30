import { laravelApi, LaravelApiHelpers } from "@/lib/laravel-api";
import { Elysia, t } from "elysia";

export const facultyClasses = new Elysia({ prefix: "/faculty-classes" }).get(
    "/",
    async ({ query }) => {
        try {
            const { facultyId } = query;

            if (!facultyId) {
                return Response.json({ error: "Faculty ID is required" }, { status: 400 });
            }

            console.log("🚀 Fetching faculty classes for ID:", facultyId);

            // Fetch faculty data from Laravel API
            const facultyData = await laravelApi.getFaculty(facultyId);

            if (!facultyData?.data) {
                return Response.json({ error: "Faculty not found" }, { status: 404 });
            }

            const faculty = facultyData.data;
            console.log(`✅ Found faculty: ${faculty.full_name} with ${faculty.classes?.length || 0} classes`);

            if (faculty.classes && faculty.classes.length > 0) {
                console.log(
                    "🧐 Inspecting first class data from faculty endpoint:",
                    JSON.stringify(faculty.classes[0], null, 2)
                );
            }

            // Get class IDs to fetch details
            const classIds = faculty.classes?.map(c => c.id) || [];

            // Fetch detailed class info (including schedules)
            const classesDetails = await laravelApi.getBatchClassDetails(classIds);
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

            return Response.json({
                success: true,
                classes: mappedClasses,
                faculty: {
                    id: faculty.id,
                    name: faculty.full_name,
                    department: faculty.department,
                    email: faculty.email,
                },
                metadata: {
                    total: mappedClasses.length,
                    fetchedAt: new Date().toISOString(),
                },
            });
        } catch (error) {
            console.error("💥 Error fetching faculty classes:", error);
            return Response.json(
                {
                    error: "Failed to fetch faculty classes",
                    message: error instanceof Error ? error.message : String(error),
                    classes: [],
                },
                { status: 500 }
            );
        }
    },
    {
        query: t.Object({
            facultyId: t.String(),
        }),
    }
);
