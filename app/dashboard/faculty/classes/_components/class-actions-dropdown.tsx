"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2,
  Settings,
  Users,
  FileDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useState } from "react";
import { type FacultyClass } from "./class-card";
import { EditClassModal } from "./edit-class-modal";
import { DuplicateClassModal } from "./duplicate-class-modal";

interface ClassActionsDropdownProps {
  classItem: FacultyClass;
  onActionComplete?: () => void;
}

export function ClassActionsDropdown({
  classItem,
  onActionComplete,
}: ClassActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleArchive = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/faculty-classes/${classItem.id}/archive`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("Failed to archive class");

      toast.success(`Class ${classItem.subjectCode} archived successfully`);
      setShowArchiveDialog(false);
      onActionComplete?.();
    } catch (error) {
      toast.error("Failed to archive class");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(
        `/api/faculty-classes/${classItem.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) throw new Error("Failed to delete class");

      toast.success(`Class ${classItem.subjectCode} deleted successfully`);
      setShowDeleteDialog(false);
      onActionComplete?.();
    } catch (error) {
      toast.error("Failed to delete class");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExport = async (type: "roster" | "grades" | "attendance") => {
    try {
      const response = await fetch(
        `/api/faculty-classes/${classItem.id}/export?type=${type}`,
        {
          method: "GET",
        }
      );

      if (!response.ok) throw new Error("Failed to export data");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${classItem.subjectCode}_${classItem.section}_${type}_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success(`${type} exported successfully`);
    } catch (error) {
      toast.error("Failed to export data");
      console.error(error);
    }
  };

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Class Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link
              href={`/dashboard/faculty/classes/${classItem.id}?tab=people`}
              className="cursor-pointer flex items-center"
            >
              <Users className="mr-2 h-4 w-4" />
              View Students
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setShowEditModal(true);
              setIsOpen(false);
            }}
            className="cursor-pointer flex items-center"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Details
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setShowDuplicateModal(true);
              setIsOpen(false);
            }}
            className="cursor-pointer flex items-center"
          >
            <Copy className="mr-2 h-4 w-4" />
            Duplicate Class
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel>Export Data</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleExport("roster");
            }}
            className="cursor-pointer flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Roster
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleExport("grades");
            }}
            className="cursor-pointer flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Grades
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              handleExport("attendance");
            }}
            className="cursor-pointer flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Export Attendance
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              toast.info("Class settings feature coming soon");
              setIsOpen(false);
            }}
            className="cursor-pointer flex items-center"
          >
            <Settings className="mr-2 h-4 w-4" />
            Class Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setShowArchiveDialog(true);
            }}
            className="cursor-pointer flex items-center text-amber-600 dark:text-amber-500"
          >
            <Archive className="mr-2 h-4 w-4" />
            Archive Class
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              setShowDeleteDialog(true);
            }}
            className="cursor-pointer flex items-center text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Class
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Archive Confirmation Dialog */}
      <AlertDialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to archive{" "}
              <strong>
                {classItem.subjectCode} - {classItem.subjectName}
              </strong>
              ? The class will be hidden from your active classes but can be
              restored later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleArchive}
              disabled={isProcessing}
              className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Archive Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you absolutely sure? This action cannot be undone. This will
              permanently delete the class{" "}
              <strong>
                {classItem.subjectCode} - {classItem.subjectName}
              </strong>{" "}
              and all associated data (enrollments, grades, attendance records).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Class
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Class Modal */}
      <EditClassModal
        classItem={classItem}
        open={showEditModal}
        onOpenChange={setShowEditModal}
        onSuccess={onActionComplete}
      />

      {/* Duplicate Class Modal */}
      <DuplicateClassModal
        classItem={classItem}
        open={showDuplicateModal}
        onOpenChange={setShowDuplicateModal}
        onSuccess={onActionComplete}
      />
    </>
  );
}
