"use client";

import * as React from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { type FacultyClass } from "./class-card";

interface EditClassModalProps {
  classItem: FacultyClass | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditClassModal({
  classItem,
  open,
  onOpenChange,
  onSuccess,
}: EditClassModalProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    section: "",
    maximumSlots: 0,
    credits: 0,
    lecture: 0,
    laboratory: 0,
  });

  React.useEffect(() => {
    if (classItem) {
      setFormData({
        section: classItem.section,
        maximumSlots: classItem.maximumSlots,
        credits: classItem.credits,
        lecture: classItem.lecture,
        laboratory: classItem.laboratory,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Class Details</DialogTitle>
          <DialogDescription>
            Make changes to class details for {classItem.subjectCode} -{" "}
            {classItem.subjectName}
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
                onChange={(e) =>
                  setFormData({ ...formData, section: e.target.value })
                }
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
                onChange={(e) =>
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="credits" className="text-right">
                Credits
              </Label>
              <Input
                id="credits"
                type="number"
                value={formData.credits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    credits: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
                min="0"
                max="10"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lecture" className="text-right">
                Lecture (hrs)
              </Label>
              <Input
                id="lecture"
                type="number"
                value={formData.lecture}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lecture: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
                min="0"
                max="24"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="laboratory" className="text-right">
                Lab (hrs)
              </Label>
              <Input
                id="laboratory"
                type="number"
                value={formData.laboratory}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    laboratory: parseInt(e.target.value) || 0,
                  })
                }
                className="col-span-3"
                min="0"
                max="24"
              />
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Current Class Info</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>
                  <strong>Semester:</strong> {classItem.semester}
                </p>
                <p>
                  <strong>School Year:</strong> {classItem.schoolYear}
                </p>
                <p>
                  <strong>Enrolled:</strong> {classItem.enrolledStudents} /{" "}
                  {formData.maximumSlots}
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
