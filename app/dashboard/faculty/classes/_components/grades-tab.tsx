"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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

interface GradeData {
  enrollmentId: string;
  studentId: string;
  studentName: string;
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalsGrade: number | null;
  totalAverage: number | null;
  isPrelimSubmitted: boolean;
  isMidtermSubmitted: boolean;
  isFinalsSubmitted: boolean;
  isGradesFinalized: boolean;
  remarks: string | null;
}

export function GradesTab() {
  const params = useParams();
  const { user } = useUser();
  const [grades, setGrades] = useState<GradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});
  const [editedGrades, setEditedGrades] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    term: "prelim" | "midterm" | "finals" | null;
  }>({ open: false, term: null });

  const classId = params?.classId as string;

  useEffect(() => {
    async function fetchGrades() {
      if (!classId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/faculty/classes/${classId}/grades`,
        );
        if (response.ok) {
          const data = await response.json();
          setGrades(data.grades || []);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
        console.error("Failed to load grades");
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [classId]);

  const handleGradeChange = (
    enrollmentId: string,
    term: "prelim" | "midterm" | "finals",
    value: string
  ) => {
    setEditedGrades((prev) => ({
      ...prev,
      [`${enrollmentId}-${term}`]: value,
    }));
  };

  const saveGrade = async (
    enrollmentId: string,
    term: "prelim" | "midterm" | "finals",
    value: string
  ) => {
    const key = `${enrollmentId}-${term}`;
    
    // Don't save if value hasn't changed from original (unless it's currently in edited state)
    // Actually, we should check if it's different from what's in `grades`
    const currentGrade = grades.find(g => g.enrollmentId === enrollmentId);
    if (!currentGrade) return;

    const originalValue = currentGrade[`${term}Grade`];
    const newValue = value === "" ? null : parseFloat(value);

    if (originalValue === newValue) {
       // Just clear the edited state if it matches original
       setEditedGrades((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
      return;
    }

    setSavingMap((prev) => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`/api/faculty/classes/${classId}/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentId, term, grade: newValue }),
      });

      if (response.ok) {
        // Update local state
        setGrades((prev) =>
          prev.map((g) => {
            if (g.enrollmentId === enrollmentId) {
              return {
                ...g,
                [`${term}Grade`]: newValue,
              };
            }
            return g;
          })
        );
        // Clear edited state
        setEditedGrades((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
        console.log(`${term} grade saved`);
      } else {
        const error = await response.json();
        console.error(error.error || "Failed to save grade");
      }
    } catch (error) {
      console.error("Error saving grade:", error);
      console.error("Failed to save grade");
    } finally {
      setSavingMap((prev) => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });
    }
  };

  const handleBlur = (
    enrollmentId: string,
    term: "prelim" | "midterm" | "finals"
  ) => {
    const key = `${enrollmentId}-${term}`;
    const value = editedGrades[key];
    if (value !== undefined) {
      saveGrade(enrollmentId, term, value);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    enrollmentId: string,
    term: "prelim" | "midterm" | "finals"
  ) => {
    if (e.key === "Enter") {
      e.currentTarget.blur(); // Trigger blur to save
    }
  };

  const finalizeGrades = async (term: "prelim" | "midterm" | "finals") => {
    setConfirmDialog({ open: false, term: null });
    try {
      const response = await fetch(
        `/api/faculty/classes/${classId}/grades/finalize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ term }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Refresh grades
        const gradesResponse = await fetch(
          `/api/faculty/classes/${classId}/grades`
        );
        if (gradesResponse.ok) {
          const gradesData = await gradesResponse.json();
          setGrades(gradesData.grades || []);
        }
        console.log(`${term} grades ${data.submitted ? "submitted" : "reopened"}`);
      } else {
        const error = await response.json();
        console.error(error.error || "Failed to finalize grades");
      }
    } catch (error) {
      console.error("Error finalizing grades:", error);
      console.error("Failed to finalize grades");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading grades...
      </div>
    );
  }

  const isAnyFinalized = grades.some((g) => g.isGradesFinalized);
  const isPrelimSubmitted = grades[0]?.isPrelimSubmitted || false;
  const isMidtermSubmitted = grades[0]?.isMidtermSubmitted || false;
  const isFinalsSubmitted = grades[0]?.isFinalsSubmitted || false;

  return (
    <div className="max-w-full px-4 sm:px-6 space-y-4">
      {/* Status Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-muted/30 p-4 rounded-lg border">
        <div className="flex gap-3 items-center flex-wrap">
          <Badge variant={isPrelimSubmitted ? "default" : "outline"}>
            {isPrelimSubmitted ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            Prelim {isPrelimSubmitted ? "Submitted" : "Open"}
          </Badge>
          <Badge variant={isMidtermSubmitted ? "default" : "outline"}>
            {isMidtermSubmitted ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            Midterm {isMidtermSubmitted ? "Submitted" : "Open"}
          </Badge>
          <Badge variant={isFinalsSubmitted ? "default" : "outline"}>
            {isFinalsSubmitted ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            Finals {isFinalsSubmitted ? "Submitted" : "Open"}
          </Badge>
          {isAnyFinalized && (
            <Badge variant="destructive">
              <Lock className="h-3 w-3 mr-1" />
              Admin Locked
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={isPrelimSubmitted ? "outline" : "default"}
            onClick={() => setConfirmDialog({ open: true, term: "prelim" })}
            disabled={isAnyFinalized}
          >
            {isPrelimSubmitted ? "Reopen Prelim" : "Submit Prelim"}
          </Button>
          <Button
            size="sm"
            variant={isMidtermSubmitted ? "outline" : "default"}
            onClick={() => setConfirmDialog({ open: true, term: "midterm" })}
            disabled={isAnyFinalized}
          >
            {isMidtermSubmitted ? "Reopen Midterm" : "Submit Midterm"}
          </Button>
          <Button
            size="sm"
            variant={isFinalsSubmitted ? "outline" : "default"}
            onClick={() => setConfirmDialog({ open: true, term: "finals" })}
            disabled={isAnyFinalized}
          >
            {isFinalsSubmitted ? "Reopen Finals" : "Submit Finals"}
          </Button>
        </div>
      </div>

      {/* Grades Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px] min-w-[200px] border-r bg-muted/30">
                Student
              </TableHead>
              <TableHead className="w-[120px] text-center border-r">
                Prelim
              </TableHead>
              <TableHead className="w-[120px] text-center border-r">
                Midterm
              </TableHead>
              <TableHead className="w-[120px] text-center border-r">
                Finals
              </TableHead>
              <TableHead className="w-[120px] text-center border-r bg-muted/30">
                Average
              </TableHead>
              <TableHead className="min-w-[200px]">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((grade) => {
              const prelimKey = `${grade.enrollmentId}-prelim`;
              const midtermKey = `${grade.enrollmentId}-midterm`;
              const finalsKey = `${grade.enrollmentId}-finals`;

              return (
                <TableRow key={grade.enrollmentId} className="hover:bg-muted/30">
                  <TableCell className="font-medium border-r bg-background sticky left-0 z-10">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {grade.studentName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{grade.studentName}</span>
                    </div>
                  </TableCell>
                  
                  {/* Prelim Grade Cell */}
                  <TableCell className="text-center border-r p-0 relative group">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                            editedGrades[prelimKey] !== undefined
                                ? editedGrades[prelimKey]
                                : grade.prelimGrade ?? ""
                            }
                            onChange={(e) =>
                            handleGradeChange(
                                grade.enrollmentId,
                                "prelim",
                                e.target.value
                            )
                            }
                            onBlur={() => handleBlur(grade.enrollmentId, "prelim")}
                            onKeyDown={(e) => handleKeyDown(e, grade.enrollmentId, "prelim")}
                            disabled={
                            grade.isPrelimSubmitted || grade.isGradesFinalized
                            }
                            className="h-full w-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset text-center bg-transparent hover:bg-muted/50 transition-colors"
                            placeholder="-"
                        />
                        {savingMap[prelimKey] && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                  </TableCell>

                  {/* Midterm Grade Cell */}
                  <TableCell className="text-center border-r p-0 relative group">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                            editedGrades[midtermKey] !== undefined
                                ? editedGrades[midtermKey]
                                : grade.midtermGrade ?? ""
                            }
                            onChange={(e) =>
                            handleGradeChange(
                                grade.enrollmentId,
                                "midterm",
                                e.target.value
                            )
                            }
                            onBlur={() => handleBlur(grade.enrollmentId, "midterm")}
                            onKeyDown={(e) => handleKeyDown(e, grade.enrollmentId, "midterm")}
                            disabled={
                            grade.isMidtermSubmitted || grade.isGradesFinalized
                            }
                            className="h-full w-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset text-center bg-transparent hover:bg-muted/50 transition-colors"
                            placeholder="-"
                        />
                         {savingMap[midtermKey] && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                  </TableCell>

                  {/* Finals Grade Cell */}
                  <TableCell className="text-center border-r p-0 relative group">
                    <div className="relative w-full h-full flex items-center justify-center">
                        <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={
                            editedGrades[finalsKey] !== undefined
                                ? editedGrades[finalsKey]
                                : grade.finalsGrade ?? ""
                            }
                            onChange={(e) =>
                            handleGradeChange(
                                grade.enrollmentId,
                                "finals",
                                e.target.value
                            )
                            }
                            onBlur={() => handleBlur(grade.enrollmentId, "finals")}
                            onKeyDown={(e) => handleKeyDown(e, grade.enrollmentId, "finals")}
                            disabled={
                            grade.isFinalsSubmitted || grade.isGradesFinalized
                            }
                            className="h-full w-full border-0 rounded-none focus-visible:ring-1 focus-visible:ring-inset text-center bg-transparent hover:bg-muted/50 transition-colors"
                            placeholder="-"
                        />
                         {savingMap[finalsKey] && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center border-r font-semibold text-primary bg-muted/20">
                    {grade.totalAverage
                      ? grade.totalAverage.toFixed(2)
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {grade.remarks || "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          setConfirmDialog({ open, term: confirmDialog.term })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Grade Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit {confirmDialog.term} grades? You
              won't be able to edit them after submission.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDialog.term) {
                  finalizeGrades(confirmDialog.term);
                }
              }}
            >
              Submit Grades
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
