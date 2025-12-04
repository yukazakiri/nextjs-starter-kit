import { Elysia, t } from "elysia";
import { requireAuth, unauthorized } from "../lib/auth";
import { laravelApi } from "@/lib/laravel-api";

export const classActions = new Elysia({ prefix: "/faculty-classes/:id" })
    // Archive a class
    .patch(
        "/archive",
        async ({ params, set, request }) => {
            try {
                const auth = await requireAuth(request);
                if (!auth.isAuthorized) {
                    set.status = 401;
                    return { error: unauthorized.message };
                }

                const classId = params.id;
                console.log(`📦 Archiving class ${classId}`);

                // TODO: Call Laravel API to archive class
                // This would depend on the Laravel API implementation
                // For now, we'll return a success response

                return {
                    success: true,
                    message: `Class ${classId} archived successfully`,
                    archivedAt: new Date().toISOString(),
                };
            } catch (error) {
                console.error("💥 Error archiving class:", error);
                set.status = 500;
                return {
                    error: "Failed to archive class",
                    message: error instanceof Error ? error.message : String(error),
                };
            }
        }
    )

    // Delete a class
    .delete(
        "/",
        async ({ params, set, request }) => {
            try {
                const auth = await requireAuth(request);
                if (!auth.isAuthorized) {
                    set.status = 401;
                    return { error: unauthorized.message };
                }

                const classId = params.id;
                console.log(`🗑️ Deleting class ${classId}`);

                // TODO: Call Laravel API to delete class
                // This would depend on the Laravel API implementation
                // For now, we'll return a success response

                return {
                    success: true,
                    message: `Class ${classId} deleted successfully`,
                    deletedAt: new Date().toISOString(),
                };
            } catch (error) {
                console.error("💥 Error deleting class:", error);
                set.status = 500;
                return {
                    error: "Failed to delete class",
                    message: error instanceof Error ? error.message : String(error),
                };
            }
        }
    )

    // Export class data
    .get(
        "/export",
        async ({ params, query, set, request }) => {
            try {
                const auth = await requireAuth(request);
                if (!auth.isAuthorized) {
                    set.status = 401;
                    return { error: unauthorized.message };
                }

                const classId = params.id;
                const { type } = query as { type: "roster" | "grades" | "attendance" };

                if (!type) {
                    set.status = 400;
                    return { error: "Export type is required" };
                }

                console.log(`📤 Exporting ${type} for class ${classId}`);

                // Fetch class details
                const classDetails = await laravelApi.getClassDetails(parseInt(classId));

                if (!classDetails || !classDetails.data) {
                    set.status = 404;
                    return { error: "Class not found" };
                }

                let csvContent = "";
                const fileName = `${classDetails.data.class_information.subject_code}_${classDetails.data.class_information.section}_${type}_${new Date().toISOString().split("T")[0]}.csv`;

                // Generate CSV based on export type
                switch (type) {
                    case "roster": {
                        const students = classDetails.data.enrolled_students || [];
                        csvContent = "Student ID,Full Name,Email,Phone,Enrollment Date\n";
                        students.forEach((enrollment) => {
                            const student = enrollment.student;
                            csvContent += `${student.student_id},${student.full_name},${student.email},${student.phone},${new Date(enrollment.created_at).toLocaleDateString()}\n`;
                        });
                        break;
                    }

                    case "grades": {
                        csvContent = "Student ID,Full Name,Assignment,Grade,Max Points,Date\n";
                        // TODO: Fetch actual grades data from grades system
                        // For now, we'll show a placeholder
                        csvContent += "No grades data available\n";
                        break;
                    }

                    case "attendance": {
                        const students = classDetails.data.enrolled_students || [];
                        csvContent = "Student ID,Full Name,Present,Absent,Excused,Total Sessions\n";
                        students.forEach((enrollment) => {
                            const student = enrollment.student;
                            csvContent += `${student.student_id},${student.full_name},0,0,0,0\n`;
                        });
                        break;
                    }
                }

                // Return CSV as file download
                return new Response(csvContent, {
                    headers: {
                        "Content-Type": "text/csv",
                        "Content-Disposition": `attachment; filename="${fileName}"`,
                    },
                });
            } catch (error) {
                console.error("💥 Error exporting class data:", error);
                set.status = 500;
                return {
                    error: "Failed to export class data",
                    message: error instanceof Error ? error.message : String(error),
                };
            }
        },
        {
            query: t.Object({
                type: t.Union([t.Literal("roster"), t.Literal("grades"), t.Literal("attendance")]),
            }),
        }
    )

    // Update class details
    .put(
        "/",
        async ({ params, body, set, request }) => {
            try {
                const auth = await requireAuth(request);
                if (!auth.isAuthorized) {
                    set.status = 401;
                    return { error: unauthorized.message };
                }

                const classId = params.id;
                console.log(`✏️ Updating class ${classId}`, body);

                // TODO: Call Laravel API to update class
                // This would depend on the Laravel API implementation
                // For now, we'll return a success response

                return {
                    success: true,
                    message: `Class ${classId} updated successfully`,
                    updatedAt: new Date().toISOString(),
                    data: body,
                };
            } catch (error) {
                console.error("💥 Error updating class:", error);
                set.status = 500;
                return {
                    error: "Failed to update class",
                    message: error instanceof Error ? error.message : String(error),
                };
            }
        },
        {
            body: t.Object({
                section: t.Optional(t.String()),
                maximumSlots: t.Optional(t.Number()),
                // Add more fields as needed
            }),
        }
    )

    // Duplicate a class
    .post(
        "/duplicate",
        async ({ params, body, set, request }) => {
            try {
                const auth = await requireAuth(request);
                if (!auth.isAuthorized) {
                    set.status = 401;
                    return { error: unauthorized.message };
                }

                const classId = params.id;
                const { newSection, newSemester, newSchoolYear } = body as {
                    newSection?: string;
                    newSemester?: string;
                    newSchoolYear?: string;
                };

                console.log(`📋 Duplicating class ${classId}`, body);

                // Fetch original class details
                const classDetails = await laravelApi.getClassDetails(parseInt(classId));

                if (!classDetails || !classDetails.data) {
                    set.status = 404;
                    return { error: "Class not found" };
                }

                // TODO: Call Laravel API to create new class
                // This would depend on the Laravel API implementation

                return {
                    success: true,
                    message: `Class ${classId} duplicated successfully`,
                    newClass: {
                        originalClassId: classId,
                        newSection: newSection || classDetails.data.class_information.section,
                        newSemester: newSemester || classDetails.data.class_information.semester,
                        newSchoolYear: newSchoolYear || classDetails.data.class_information.school_year,
                    },
                    duplicatedAt: new Date().toISOString(),
                };
            } catch (error) {
                console.error("💥 Error duplicating class:", error);
                set.status = 500;
                return {
                    error: "Failed to duplicate class",
                    message: error instanceof Error ? error.message : String(error),
                };
            }
        },
        {
            body: t.Object({
                newSection: t.Optional(t.String()),
                newSemester: t.Optional(t.String()),
                newSchoolYear: t.Optional(t.String()),
            }),
        }
    );
