"use client";

import { Button } from "@/components/ui/button";
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

interface EditClassModalProps {
    classItem: ClassData | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditClassModal({ classItem, open, onOpenChange, onSuccess }: EditClassModalProps) {
    const [isLoading, setIsLoading] = React.useState(false);
    const [formData, setFormData] = React.useState({
        section: "",
        maximumSlots: 0,
    });

    React.useEffect(() => {
        if (classItem) {
            setFormData({
                section: classItem.class_information.section,
                maximumSlots: classItem.class_information.maximum_slots,
            });
        }
    }, [classItem]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classItem) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/faculty-classes/${classItem.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("Failed to update class");

            toast.success("Class updated successfully");
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            toast.error("Failed to update class");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!classItem) return null;

    const { subjectCode, subjectName, schoolYear, semester, semesterFormatted } = LaravelApiHelpers.formatClassInfoForClassData(classItem);
    const enrollmentCount = LaravelApiHelpers.getClassEnrollmentCount({ data: classItem } as any);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                    <DialogTitle>Edit Class Details</DialogTitle>
                    <DialogDescription>
                        Make changes to class details for {subjectCode} - {subjectName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="section" className="text-right">
                                Section
                            </Label>
                            <Input
                                id="section"
                                value={formData.section}
                                onChange={e => setFormData({ ...formData, section: e.target.value })}
                                className="col-span-3"
                                placeholder="A"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="maximumSlots" className="text-right">
                                Max Students
                            </Label>
                            <Input
                                id="maximumSlots"
                                type="number"
                                value={formData.maximumSlots}
                                onChange={e =>
                                    setFormData({
                                        ...formData,
                                        maximumSlots: parseInt(e.target.value) || 0,
                                    })
                                }
                                className="col-span-3"
                                min="1"
                                max="100"
                            />
                        </div>

                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <h4 className="font-semibold mb-2">Current Class Info</h4>
                            <div className="text-sm space-y-1 text-muted-foreground">
                                <p>
                                    <strong>Semester:</strong> {semesterFormatted}
                                </p>
                                <p>
                                    <strong>School Year:</strong> {schoolYear}
                                </p>
                                <p>
                                    <strong>Enrolled:</strong> {enrollmentCount} / {formData.maximumSlots}
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
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
