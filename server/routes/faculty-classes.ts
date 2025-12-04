import { laravelApi } from "@/lib/laravel-api";
import { Elysia, t } from "elysia";

export const facultyClasses = new Elysia({ prefix: "/faculty-classes" }).get(
    "/",
    async ({ query }) => {
        try {
            const { facultyId } = query;

            if (!facultyId) {
                return Response.json({ error: "Faculty ID is required" }, { status: 400 });
            }

            // Fetch faculty data from Laravel API
            const facultyData = await laravelApi.getFaculty(facultyId);

            if (!facultyData?.data) {
                return Response.json({ error: "Faculty not found" }, { status: 404 });
            }

            const faculty = facultyData.data;

            // Get class IDs to fetch details
            const classIds = faculty.classes?.map(c => c.id) || [];

            // Fetch detailed class info (including schedules)
            const classesDetails = await laravelApi.getBatchClassDetails(classIds);

            // Return the raw ClassData objects
            const classes = classesDetails.map(detail => detail.data);

            return Response.json({
                success: true,
                classes: classes,
                faculty: {
                    id: faculty.id,
                    name: faculty.full_name,
                    department: faculty.department,
                    email: faculty.email,
                },
                metadata: {
                    total: classes.length,
                    fetchedAt: new Date().toISOString(),
                },
            });
        } catch (error) {
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
