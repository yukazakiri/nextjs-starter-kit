"use client";

import { useState } from "react";
import { ClassData } from "@/lib/laravel-api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Palette, Settings as SettingsIcon, Loader2 } from "lucide-react";

interface ClassSettingsModalProps {
    classItem: ClassData;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSettingsUpdated?: () => void;
}

const THEMES = [
    { value: "default", label: "Default" },
];

const BACKGROUND_COLORS = [
    "#ffffff", "#f0f0f0", "#e3f2fd", "#e8f5e9", "#fce4ec",
    "#fff3e0", "#e1f5fe", "#f3e5f5", "#e0f2f1", "#fff9c4"
];

const ACCENT_COLORS = [
    "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899",
    "#6366f1", "#14b8a6", "#f97316", "#06b6d4", "#84cc16"
];

export function ClassSettingsModal({ classItem, open, onOpenChange, onSettingsUpdated }: ClassSettingsModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        visual: {
            background_color: classItem.settings?.visual?.background_color || "#ffffff",
            accent_color: classItem.settings?.visual?.accent_color || "#3b82f6",
            banner_image: classItem.settings?.visual?.banner_image || "",
        },
        features: {
            enable_announcements: classItem.settings?.features?.enable_announcements === true || classItem.settings?.features?.enable_announcements === "true",
            enable_grade_visibility: classItem.settings?.features?.enable_grade_visibility === true || classItem.settings?.features?.enable_grade_visibility === "true",
            enable_attendance_tracking: classItem.settings?.features?.enable_attendance_tracking === true || classItem.settings?.features?.enable_attendance_tracking === "true",
            allow_late_submissions: classItem.settings?.features?.allow_late_submissions === true || classItem.settings?.features?.allow_late_submissions === "true",
            enable_discussion_board: classItem.settings?.features?.enable_discussion_board === true || classItem.settings?.features?.enable_discussion_board === "true",
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`/api/classes/${classItem.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    settings: {
                        ...formData.visual,
                        ...formData.features,
                    },
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || result.error || "Failed to update class settings");
            }

            if (result.success) {
                toast.success(result.message || "Class settings updated successfully");
                onOpenChange(false);
                onSettingsUpdated?.();
            } else {
                throw new Error(result.message || result.error || "Failed to update class settings");
            }
        } catch (error) {
            console.error("[CLASS SETTINGS MODAL] Error updating settings:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to update class settings";
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            visual: {
                ...prev.visual,
                [field]: value,
            },
        }));
    };

    const handleFeatureToggle = (field: string, value: boolean) => {
        setFormData(prev => ({
            ...prev,
            features: {
                ...prev.features,
                [field]: value,
            },
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Class Settings</DialogTitle>
                    <DialogDescription>
                        Customize the appearance and features for this class
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <Tabs defaultValue="visual" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="visual" className="flex items-center gap-2">
                                <Palette className="h-4 w-4" />
                                Visual
                            </TabsTrigger>
                            <TabsTrigger value="features" className="flex items-center gap-2">
                                <SettingsIcon className="h-4 w-4" />
                                Features
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="visual" className="space-y-6 pt-4">

                            {/* Background Color */}
                            <div className="space-y-2">
                                <Label>Background Color</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {BACKGROUND_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="h-10 w-full rounded-md border-2 transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: color,
                                                borderColor: formData.visual.background_color === color ? "#3b82f6" : "#e5e7eb",
                                            }}
                                            onClick={() => handleInputChange("background_color", color)}
                                        />
                                    ))}
                                </div>
                                <Input
                                    type="color"
                                    value={formData.visual.background_color}
                                    onChange={(e) => handleInputChange("background_color", e.target.value)}
                                    className="h-10"
                                />
                            </div>

                            {/* Accent Color */}
                            <div className="space-y-2">
                                <Label>Accent Color</Label>
                                <div className="grid grid-cols-5 gap-2">
                                    {ACCENT_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="h-10 w-full rounded-md border-2 transition-all hover:scale-105"
                                            style={{
                                                backgroundColor: color,
                                                borderColor: formData.visual.accent_color === color ? "#3b82f6" : "#e5e7eb",
                                            }}
                                            onClick={() => handleInputChange("accent_color", color)}
                                        />
                                    ))}
                                </div>
                                <Input
                                    type="color"
                                    value={formData.visual.accent_color}
                                    onChange={(e) => handleInputChange("accent_color", e.target.value)}
                                    className="h-10"
                                />
                            </div>

                            {/* Banner Image URL */}
                            <div className="space-y-2">
                                <Label htmlFor="banner_image">Banner Image URL</Label>
                                <Input
                                    id="banner_image"
                                    type="url"
                                    placeholder="https://example.com/image.jpg"
                                    value={formData.visual.banner_image}
                                    onChange={(e) => handleInputChange("banner_image", e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Optional: Add a banner image URL to customize the class header
                                </p>
                            </div>

                            {/* Preview */}
                            <div className="space-y-2">
                                <Label>Preview</Label>
                                <div
                                    className="p-4 rounded-lg border"
                                    style={{
                                        backgroundColor: formData.visual.background_color,
                                    }}
                                >
                                    <div
                                        className="p-3 rounded text-white font-semibold"
                                        style={{
                                            backgroundColor: formData.visual.accent_color,
                                        }}
                                    >
                                        Sample Class Header
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="space-y-6 pt-4">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enable_announcements">Enable Announcements</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Allow posting announcements for this class
                                        </p>
                                    </div>
                                    <Switch
                                        id="enable_announcements"
                                        checked={formData.features.enable_announcements}
                                        onCheckedChange={(checked) => handleFeatureToggle("enable_announcements", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enable_grade_visibility">Enable Grade Visibility</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Allow students to view their grades
                                        </p>
                                    </div>
                                    <Switch
                                        id="enable_grade_visibility"
                                        checked={formData.features.enable_grade_visibility}
                                        onCheckedChange={(checked) => handleFeatureToggle("enable_grade_visibility", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enable_attendance_tracking">Enable Attendance Tracking</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Track student attendance for this class
                                        </p>
                                    </div>
                                    <Switch
                                        id="enable_attendance_tracking"
                                        checked={formData.features.enable_attendance_tracking}
                                        onCheckedChange={(checked) => handleFeatureToggle("enable_attendance_tracking", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="allow_late_submissions">Allow Late Submissions</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Allow students to submit assignments late
                                        </p>
                                    </div>
                                    <Switch
                                        id="allow_late_submissions"
                                        checked={formData.features.allow_late_submissions}
                                        onCheckedChange={(checked) => handleFeatureToggle("allow_late_submissions", checked)}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="enable_discussion_board">Enable Discussion Board</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Allow class discussions
                                        </p>
                                    </div>
                                    <Switch
                                        id="enable_discussion_board"
                                        checked={formData.features.enable_discussion_board}
                                        onCheckedChange={(checked) => handleFeatureToggle("enable_discussion_board", checked)}
                                    />
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>

                    <DialogFooter className="mt-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Settings
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
