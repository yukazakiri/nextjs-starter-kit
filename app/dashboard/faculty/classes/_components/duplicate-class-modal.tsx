"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClassData, LaravelApiHelpers } from "@/lib/laravel-api";
import { Loader2 } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

interface DuplicateClassModalProps {
    classItem: ClassData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function DuplicateClassModal({ classItem, open, onOpenChange, onSuccess }: DuplicateClassModalProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        newSection: "",
        newSemester: "",
        newSchoolYear: "",
        includeEnrollments: false,
        includeGrades: false,
    });

    React.useEffect(() => {
        if (classItem) {
            const { section, semester, schoolYear } = LaravelApiHelpers.formatClassInfoForClassData(classItem);
            // Auto-increment section (A -> B, B -> C, etc.)
            const nextSection = String.fromCharCode(section.charCodeAt(0) + 1);

            setFormData({
                newSection: nextSection,
                newSemester: semester,
                newSchoolYear: schoolYear,
                includeEnrollments: false,
                includeGrades: false,
            });
        }
    }, [classItem]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classItem) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/faculty-classes/${classItem.id}/duplicate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to duplicate class");

            const result = await response.json();

            toast.success(`Class duplicated successfully as Section ${result.newClass?.newSection}`);
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error("Failed to duplicate class");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!classItem) return null;

    const { subjectCode, subjectName, section, semester, semesterFormatted, schoolYear } = LaravelApiHelpers.formatClassInfoForClassData(classItem);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Duplicate Class</DialogTitle>
                    <DialogDescription>
                        Create a copy of {subjectCode} - {subjectName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="originalSection" className="text-right">
                                Original
                            </Label>
                            <div className="col-span-3 text-sm">
                                <p className="font-medium">
                                    {section} • {semesterFormatted} • {schoolYear}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newSection" className="text-right">
                                New Section
                            </Label>
                            <Input
                                id="newSection"
                                value={formData.newSection}
                                onChange={e => setFormData({ ...formData, newSection: e.target.value })}
                                className="col-span-3"
                                placeholder="B"
                                maxLength={5}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newSemester" className="text-right">
                                Semester
                            </Label>
                            <Input
                                id="newSemester"
                                value={formData.newSemester}
                                onChange={e => setFormData({ ...formData, newSemester: e.target.value })}
                                className="col-span-3"
                                placeholder="1st"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="newSchoolYear" className="text-right">
                                School Year
                            </Label>
                            <Input
                                id="newSchoolYear"
                                value={formData.newSchoolYear}
                                onChange={e => setFormData({ ...formData, newSchoolYear: e.target.value })}
                                className="col-span-3"
                                placeholder="2024-2025"
                            />
                        </div>

                        <div className="col-span-4 space-y-3 mt-4">
                            <Label>Options</Label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="includeEnrollments"
                                        checked={formData.includeEnrollments}
                                        onCheckedChange={checked =>
                                            setFormData({
                                                ...formData,
                                                includeEnrollments: checked as boolean,
                                            })
                                        }
                                    />
                                    <Label htmlFor="includeEnrollments" className="text-sm font-normal cursor-pointer">
                                        Include current enrollments
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="includeGrades"
                                        checked={formData.includeGrades}
                                        onCheckedChange={checked =>
                                            setFormData({
                                                ...formData,
                                                includeGrades: checked as boolean,
                                            })
                                        }
                                    />
                                    <Label htmlFor="includeGrades" className="text-sm font-normal cursor-pointer">
                                        Include grade history
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">Preview</h4>
                            <div className="text-sm space-y-1 text-muted-foreground">
                                <p>
                                    <strong>New Class:</strong> {subjectCode} - Section {formData.newSection || "?"}
                                </p>
                                <p>
                                    <strong>Period:</strong> {formData.newSemester || "?"} •{" "}
                                    {formData.newSchoolYear || "?"}
                                </p>
                                <p>
                                    <strong>Enrollments:</strong>{" "}
                                    {formData.includeEnrollments ? "Included" : "Not included"}
                                </p>
                                <p>
                                    <strong>Grades:</strong> {formData.includeGrades ? "Included" : "Not included"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
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
                            Duplicate Class
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
