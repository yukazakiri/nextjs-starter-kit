"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassData } from "@/lib/laravel-api";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Palette, Save, Settings, Sliders } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

interface ClassSettingsClientProps {
    classData: ClassData;
}

// Helper to convert string booleans ("1"/"0", "true"/"false") to native boolean
const toBoolean = (val: string | boolean | undefined): boolean => {
    if (typeof val === 'boolean') return val;
    if (val === '1' || val === 'true') return true;
    return false;
};

const settingsSchema = z.object({
    // Visuals
    theme: z.string().optional(),
    accent_color: z.string().optional(),
    background_color: z.string().optional(),
    banner_image: z.string().url("Please enter a valid URL").optional().or(z.literal("")),

    // Features
    enable_announcements: z.boolean().default(true),
    enable_grade_visibility: z.boolean().default(true),
    enable_attendance_tracking: z.boolean().default(true),
    allow_late_submissions: z.boolean().default(false),
    enable_discussion_board: z.boolean().default(false),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

export function ClassSettingsClient({ classData }: ClassSettingsClientProps) {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);

    // Initial values from classData.settings
    // We cast to SettingsFormValues because we ensure all required fields are present via toBoolean
    const defaultValues: SettingsFormValues = {
        theme: classData.settings?.visual?.theme || "blue",
        accent_color: classData.settings?.visual?.accent_color || "",
        background_color: classData.settings?.visual?.background_color || "",
        banner_image: classData.settings?.visual?.banner_image || "",

        enable_announcements: toBoolean(classData.settings?.features?.enable_announcements),
        enable_grade_visibility: toBoolean(classData.settings?.features?.enable_grade_visibility),
        enable_attendance_tracking: toBoolean(classData.settings?.features?.enable_attendance_tracking),
        allow_late_submissions: toBoolean(classData.settings?.features?.allow_late_submissions),
        enable_discussion_board: toBoolean(classData.settings?.features?.enable_discussion_board),
    };

    const form = useForm({
        resolver: zodResolver(settingsSchema),
        defaultValues,
    });

    async function onSubmit(data: SettingsFormValues) {
        setIsSaving(true);
        try {
            // Build settings payload matching expected API structure
            const settingsPayload = {
                theme: data.theme,
                accent_color: data.accent_color,
                background_color: data.background_color,
                banner_image: data.banner_image,
                enable_announcements: data.enable_announcements,
                enable_grade_visibility: data.enable_grade_visibility,
                enable_attendance_tracking: data.enable_attendance_tracking,
                allow_late_submissions: data.allow_late_submissions,
                enable_discussion_board: data.enable_discussion_board,
            };

            // Call our server API route which handles authentication
            const response = await fetch(`/api/classes/${classData.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ settings: settingsPayload }),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok) {
                // Handle different error types with specific notifications
                if (response.status === 422 && result.validationErrors) {
                    // Validation errors - show detailed feedback
                    const errorList = Object.entries(result.validationErrors as Record<string, string[]>)
                        .slice(0, 3) // Show first 3 errors
                        .map(([field, messages]) => `• ${field}: ${(messages as string[])[0]}`)
                        .join('\n');

                    toast.error("Validation Error", {
                        description: errorList || result.message || "Please check your input and try again.",
                        duration: 6000,
                    });
                } else if (response.status === 401) {
                    toast.error("Authentication Error", {
                        description: "Your session may have expired. Please refresh the page and try again.",
                        duration: 5000,
                    });
                } else if (response.status === 404) {
                    toast.error("Class Not Found", {
                        description: "The class you're trying to update could not be found.",
                        duration: 5000,
                    });
                } else {
                    toast.error(result.error || "Update Failed", {
                        description: result.message || "Failed to save settings. Please try again.",
                        duration: 5000,
                    });
                }
                return;
            }

            toast.success("Settings Updated", {
                description: "Your class settings have been saved successfully.",
                duration: 3000,
            });
            router.refresh(); // Refresh server data
        } catch (error) {
            console.error("Failed to save settings:", error);
            // Network or unexpected errors
            toast.error("Connection Error", {
                description: error instanceof Error
                    ? error.message
                    : "Unable to reach the server. Please check your connection and try again.",
                duration: 5000,
            });
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="container max-w-4xl py-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="shrink-0">
                    <Link href={`/dashboard/faculty/classes/${classData.id}`}>
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to Class</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Class Settings</h1>
                    <p className="text-muted-foreground">
                        Manage configuration for {classData.class_information.subject_code} - {classData.class_information.section}
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs defaultValue="visuals" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                            <TabsTrigger value="visuals" className="gap-2">
                                <Palette className="h-4 w-4" /> Visuals
                            </TabsTrigger>
                            <TabsTrigger value="features" className="gap-2">
                                <Sliders className="h-4 w-4" /> Features
                            </TabsTrigger>
                        </TabsList>

                        {/* VISUALS TAB */}
                        <TabsContent value="visuals" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Appearance</CardTitle>
                                    <CardDescription>
                                        Customize how this class appears in your dashboard and to students.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="banner_image"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Banner Image URL</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="https://example.com/image.jpg" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Enter a direct link to an image to use as the class banner.
                                                </FormDescription>
                                                <FormMessage />
                                                {field.value && (
                                                    <div className="mt-4 rounded-lg overflow-hidden border aspect-video w-full h-48 relative max-w-md bg-muted">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={field.value}
                                                            alt="Banner Preview"
                                                            className="object-cover w-full h-full"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="theme"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Theme Color Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. blue, green, violet" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Tailwind color name for the theme.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="accent_color"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Custom Accent Hex</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="#000000" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Specific hex code override.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* FEATURES TAB */}
                        <TabsContent value="features" className="space-y-4 mt-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Features & Permissions</CardTitle>
                                    <CardDescription>
                                        Control what students can see and do in this class.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="enable_announcements"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Announcements</FormLabel>
                                                        <FormDescription>
                                                            Show the announcements tab to students.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Separator />
                                        <FormField
                                            control={form.control}
                                            name="enable_grade_visibility"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Grade Visibility</FormLabel>
                                                        <FormDescription>
                                                            Allow students to view their own grades.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Separator />
                                        <FormField
                                            control={form.control}
                                            name="enable_attendance_tracking"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Attendance Tracking</FormLabel>
                                                        <FormDescription>
                                                            Show attendance records to students.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        <Separator />
                                        <FormField
                                            control={form.control}
                                            name="allow_late_submissions"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Late Submissions</FormLabel>
                                                        <FormDescription>
                                                            Accept assignments after the due date.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    <div className="flex items-center justify-end gap-4">
                        <Button type="button" variant="outline" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            <Save className="mr-2 h-4 w-4" />
                            To Save Changes
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
