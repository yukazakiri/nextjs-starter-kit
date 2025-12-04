import { laravelApi } from "@/lib/laravel-api";
import { Elysia, t } from "elysia";

export const classSettings = new Elysia({ prefix: "/classes" }).patch(
    "/:id",
    async ({ params, request }) => {
        try {
            const { id } = params;

            if (!id) {
                return Response.json({ error: "Class ID is required" }, { status: 400 });
            }

            console.log(`[CLASS SETTINGS] Updating settings for class ${id}`);

            const body = await request.json();
            const { settings } = body;

            if (!settings) {
                return Response.json({ error: "Settings are required" }, { status: 400 });
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
        } catch (error) {
            console.error("[CLASS SETTINGS] Error updating class settings:", error);

            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            const status = errorMessage.includes("not found") ? 404 : 500;

            return Response.json(
                {
                    success: false,
                    error: "Failed to update class settings",
                    message: errorMessage,
                },
                { status }
            );
        }
    },
    {
        params: t.Object({
            id: t.String(),
        }),
    }
);
