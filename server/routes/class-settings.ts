import { laravelApi } from "@/lib/laravel-api";
import { Elysia, t } from "elysia";

// Type for Laravel validation errors
interface LaravelValidationError {
    message: string;
    errors?: Record<string, string[]>;
}

export const classSettings = new Elysia({ prefix: "/classes" }).patch(
    "/:id",
    async ({ params, request }) => {
        try {
            const { id } = params;

            if (!id) {
                return Response.json(
                    {
                        success: false,
                        error: "Class ID is required",
                        message: "Please provide a valid class ID"
                    },
                    { status: 400 }
                );
            }

            console.log(`[CLASS SETTINGS] Updating settings for class ${id}`);

            const body = await request.json();
            const { settings } = body;

            if (!settings) {
                return Response.json(
                    {
                        success: false,
                        error: "Settings are required",
                        message: "Please provide settings to update"
                    },
                    { status: 400 }
                );
            }

            console.log("[CLASS SETTINGS] Settings received:", settings);

            // Update class settings via Laravel API
            const response = await laravelApi.updateClassSettings(parseInt(id), settings);

            console.log("[CLASS SETTINGS] Settings updated successfully:", response);

            return Response.json({
                success: true,
                message: "Class settings updated successfully",
                data: response,
            });
        } catch (error: any) {
            console.error("[CLASS SETTINGS] Error updating class settings:", error);

            // Handle validation errors (422)
            if (error.status === 422 || error.validationErrors) {
                const validationErrors = error.validationErrors || {};
                const errorDetails = error.details || "";

                return Response.json(
                    {
                        success: false,
                        error: "Validation Error",
                        message: error.message || "The given data was invalid.",
                        validationErrors,
                        details: errorDetails,
                    },
                    { status: 422 }
                );
            }

            // Handle not found errors
            if (error.status === 404 || (error.message && error.message.includes("not found"))) {
                return Response.json(
                    {
                        success: false,
                        error: "Not Found",
                        message: error.message || "Class not found",
                    },
                    { status: 404 }
                );
            }

            // Handle authentication errors
            if (error.status === 401) {
                return Response.json(
                    {
                        success: false,
                        error: "Authentication Error",
                        message: "Unable to authenticate with the server. Please try again.",
                    },
                    { status: 401 }
                );
            }

            // General server error
            return Response.json(
                {
                    success: false,
                    error: "Server Error",
                    message: error.message || "Failed to update class settings. Please try again.",
                },
                { status: 500 }
            );
        }
    },
    {
        params: t.Object({
            id: t.String(),
        }),
    }
);
