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
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
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
  const [editedRemarks, setEditedRemarks] = useState<Record<string, string>>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    term: "prelim" | "midterm" | "finals" | null;
  }>({ open: false, term: null });

  const [gradeWeights, setGradeWeights] = useState<{ prelim: number; midterm: number; finals: number }>({ prelim: 30, midterm: 30, finals: 40 });
  const cellRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const classId = params?.classId as string;

  useEffect(() => {
    async function fetchGrades() {
      if (!classId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await api.faculty.classes({ classId }).grades.get();
        if (error) {
          console.error("Failed to load grades:", typeof error === "object" ? JSON.stringify(error) : error);
        } else if (data) {
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
        headers: { "Content-Type": "application/json", Accept: "application/json" },
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
        const updated = grades.find(g => g.enrollmentId === enrollmentId);
        const prelim = term === "prelim" ? newValue : updated?.prelimGrade ?? null;
        const midterm = term === "midterm" ? newValue : updated?.midtermGrade ?? null;
        const finals = term === "finals" ? newValue : updated?.finalsGrade ?? null;
        const sum = gradeWeights.prelim + gradeWeights.midterm + gradeWeights.finals;
        const wp = {
          prelim: (gradeWeights.prelim || 0) / (sum || 1),
          midterm: (gradeWeights.midterm || 0) / (sum || 1),
          finals: (gradeWeights.finals || 0) / (sum || 1),
        };
        const avg =
          (typeof prelim === "number" ? prelim * wp.prelim : 0) +
          (typeof midterm === "number" ? midterm * wp.midterm : 0) +
          (typeof finals === "number" ? finals * wp.finals : 0);
        const avgRounded = Number.isFinite(avg) ? parseFloat(avg.toFixed(2)) : null;

        setGrades(prev => prev.map(g => g.enrollmentId === enrollmentId ? { ...g, totalAverage: avgRounded } : g));

        try {
          if (avgRounded !== null) {
            await fetch(`/api/faculty/classes/${classId}/grades`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Accept: "application/json" },
              body: JSON.stringify({ enrollmentId, totalAverage: avgRounded }),
            });
          }
        } catch {}

        // Clear edited state
        setEditedGrades((prev) => {
          const newState = { ...prev };
          delete newState[key];
          return newState;
        });
        toast.success("Grade saved", { description: `${term[0].toUpperCase() + term.slice(1)}: ${newValue ?? "-"}` });
      } else {
        const errText = await response.text();
        console.error("Failed to save grade:", errText);
        toast.error("Failed to save grade", { description: errText.slice(0, 180) });
      }
    } catch (error) {
      console.error("Error saving grade:", error);
      console.error("Failed to save grade");
      toast.error("Failed to save grade", { description: String(error).slice(0, 180) });
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
    const order: Array<"prelim" | "midterm" | "finals"> = ["prelim", "midterm", "finals"];
    const idx = order.indexOf(term);
    if (e.key === "ArrowRight" && idx >= 0 && idx < order.length - 1) {
      const nextKey = `${enrollmentId}-${order[idx + 1]}`;
      const el = (cellRefs as any).current?.[nextKey] as HTMLInputElement | undefined;
      el?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      const prevKey = `${enrollmentId}-${order[idx - 1]}`;
      const el = (cellRefs as any).current?.[prevKey] as HTMLInputElement | undefined;
      el?.focus();
      e.preventDefault();
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const rowIndex = grades.findIndex(g => g.enrollmentId === enrollmentId);
      const delta = e.key === "ArrowDown" ? 1 : -1;
      const targetRow = rowIndex + delta;
      if (targetRow >= 0 && targetRow < grades.length) {
        const nextEnrollment = grades[targetRow].enrollmentId;
        const nextKey = `${nextEnrollment}-${term}`;
        const el = (cellRefs as any).current?.[nextKey] as HTMLInputElement | undefined;
        el?.focus();
        e.preventDefault();
      }
    }
  };

  const saveRemarks = async (enrollmentId: string, value: string) => {
    const key = `${enrollmentId}-remarks`;
    setSavingMap(prev => ({ ...prev, [key]: true }));
    try {
      const response = await fetch(`/api/faculty/classes/${classId}/grades`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ enrollmentId, remarks: value }),
      });
      if (response.ok) {
        setGrades(prev => prev.map(g => g.enrollmentId === enrollmentId ? { ...g, remarks: value } : g));
        toast.success("Remarks saved");
      } else {
        const txt = await response.text();
        console.error("Failed to save remarks:", txt);
        toast.error("Failed to save remarks", { description: txt.slice(0, 180) });
      }
    } catch (error) {
      console.error("Error saving remarks:", error);
      toast.error("Error saving remarks", { description: String(error).slice(0, 180) });
    } finally {
      setSavingMap(prev => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const finalizeGrades = async (term: "prelim" | "midterm" | "finals") => {
    setConfirmDialog({ open: false, term: null });
    try {
      const response = await fetch(`/api/faculty/classes/${classId}/grades/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ term }),
      });
      if (!response.ok) {
        const txt = await response.text();
        console.error("Failed to finalize grades:", txt);
        toast.error("Failed to finalize grades", { description: txt.slice(0, 180) });
      } else {
        const { data } = await api.faculty.classes({ classId }).grades.get();
        if (data) setGrades(data.grades || []);
        toast.success("Grades finalized", { description: `${term[0].toUpperCase() + term.slice(1)} submitted` });
      }
    } catch (error) {
      console.error("Error finalizing grades:", error);
      console.error("Failed to finalize grades");
      toast.error("Failed to finalize grades", { description: String(error).slice(0, 180) });
    }
  };

  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px] min-w-[200px] border-r bg-muted/30">Student</TableHead>
              <TableHead className="w-[120px] text-center border-r">Prelim</TableHead>
              <TableHead className="w-[120px] text-center border-r">Midterm</TableHead>
              <TableHead className="w-[120px] text-center border-r">Finals</TableHead>
              <TableHead className="w-[120px] text-center border-r bg-muted/30">Average</TableHead>
              <TableHead className="min-w-[200px]">Remarks</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 6 }).map((_, idx) => (
              <TableRow key={idx} className="hover:bg-muted/30">
                <TableCell className="font-medium border-r bg-background sticky left-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-accent animate-pulse" />
                    <div className="h-4 w-40 bg-accent animate-pulse rounded" />
                  </div>
                </TableCell>
                <TableCell className="text-center border-r"><div className="h-6 w-16 bg-accent animate-pulse rounded mx-auto" /></TableCell>
                <TableCell className="text-center border-r"><div className="h-6 w-16 bg-accent animate-pulse rounded mx-auto" /></TableCell>
                <TableCell className="text-center border-r"><div className="h-6 w-16 bg-accent animate-pulse rounded mx-auto" /></TableCell>
                <TableCell className="text-center border-r"><div className="h-6 w-16 bg-accent animate-pulse rounded mx-auto" /></TableCell>
                <TableCell><div className="h-6 w-32 bg-accent animate-pulse rounded" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  const isAnyFinalized = grades.some((g) => g.isGradesFinalized);
  const canSubmitPrelim = grades.every(g => g.prelimGrade === null || typeof g.prelimGrade === "number");
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
            disabled={isAnyFinalized || !canSubmitPrelim}
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
      {/* Weights Config */}
      <Card>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Prelim Weight (%)</p>
              <Input type="number" min={0} max={100} value={gradeWeights.prelim}
                onChange={(e) => setGradeWeights(w => ({ ...w, prelim: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Midterm Weight (%)</p>
              <Input type="number" min={0} max={100} value={gradeWeights.midterm}
                onChange={(e) => setGradeWeights(w => ({ ...w, midterm: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Finals Weight (%)</p>
              <Input type="number" min={0} max={100} value={gradeWeights.finals}
                onChange={(e) => setGradeWeights(w => ({ ...w, finals: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))} />
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={(gradeWeights.prelim + gradeWeights.midterm + gradeWeights.finals) === 100 ? "default" : "destructive"}>
                Sum: {gradeWeights.prelim + gradeWeights.midterm + gradeWeights.finals}%
              </Badge>
              <Button size="sm" variant="outline" onClick={() => {
                // Recompute displayed averages using current weights
                const sum = gradeWeights.prelim + gradeWeights.midterm + gradeWeights.finals;
                const wp = {
                  prelim: (gradeWeights.prelim || 0) / (sum || 1),
                  midterm: (gradeWeights.midterm || 0) / (sum || 1),
                  finals: (gradeWeights.finals || 0) / (sum || 1),
                };
                setGrades(prev => prev.map(g => {
                  const avg =
                    (typeof g.prelimGrade === "number" ? g.prelimGrade * wp.prelim : 0) +
                    (typeof g.midtermGrade === "number" ? g.midtermGrade * wp.midterm : 0) +
                    (typeof g.finalsGrade === "number" ? g.finalsGrade * wp.finals : 0);
                  return { ...g, totalAverage: Number.isFinite(avg) ? parseFloat(avg.toFixed(2)) : null };
                }));
                toast.success("Weights applied", { description: `Prelim ${gradeWeights.prelim}%, Midterm ${gradeWeights.midterm}%, Finals ${gradeWeights.finals}%` });
              }}>Apply Weights</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grades Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px] min-w-[200px] border-r bg-muted/30">
                Student
              </TableHead>
              <TableHead className="w-[180px] text-center border-r">
                <div className="flex items-center justify-center gap-2">
                  <span>Prelim</span>
                  <Input
                    className="h-7 w-16 text-center"
                    type="number"
                    min={0}
                    max={100}
                    value={gradeWeights.prelim}
                    onChange={(e) => setGradeWeights(w => ({ ...w, prelim: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}
                  />
                </div>
              </TableHead>
              <TableHead className="w-[180px] text-center border-r">
                <div className="flex items-center justify-center gap-2">
                  <span>Midterm</span>
                  <Input
                    className="h-7 w-16 text-center"
                    type="number"
                    min={0}
                    max={100}
                    value={gradeWeights.midterm}
                    onChange={(e) => setGradeWeights(w => ({ ...w, midterm: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}
                  />
                </div>
              </TableHead>
              <TableHead className="w-[180px] text-center border-r">
                <div className="flex items-center justify-center gap-2">
                  <span>Finals</span>
                  <Input
                    className="h-7 w-16 text-center"
                    type="number"
                    min={0}
                    max={100}
                    value={gradeWeights.finals}
                    onChange={(e) => setGradeWeights(w => ({ ...w, finals: Math.max(0, Math.min(100, Number(e.target.value) || 0)) }))}
                  />
                </div>
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
                            ref={(el) => { cellRefs.current[prelimKey] = el }}
                        />
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          <Button size="xs" variant="outline" onClick={() => {
                            setEditedGrades(prev => ({ ...prev, [prelimKey]: "" }));
                            saveGrade(grade.enrollmentId, "prelim", "");
                          }}>N/A</Button>
                        </div>
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
                            ref={(el) => { cellRefs.current[midtermKey] = el }}
                        />
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          <Button size="xs" variant="outline" onClick={() => {
                            setEditedGrades(prev => ({ ...prev, [midtermKey]: "" }));
                            saveGrade(grade.enrollmentId, "midterm", "");
                          }}>N/A</Button>
                        </div>
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
                            ref={(el) => { cellRefs.current[finalsKey] = el }}
                        />
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          <Button size="xs" variant="outline" onClick={() => {
                            setEditedGrades(prev => ({ ...prev, [finalsKey]: "" }));
                            saveGrade(grade.enrollmentId, "finals", "");
                          }}>N/A</Button>
                        </div>
                         {savingMap[finalsKey] && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                            </div>
                        )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center border-r font-semibold text-primary bg-muted/20">
                    {typeof grade.totalAverage === "number"
                      ? grade.totalAverage.toFixed(2)
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground p-2">
                    <Input
                      value={editedRemarks[grade.enrollmentId] ?? (grade.remarks ?? "")}
                      onChange={(e) => setEditedRemarks(prev => ({ ...prev, [grade.enrollmentId]: e.target.value }))}
                      onBlur={() => saveRemarks(grade.enrollmentId, editedRemarks[grade.enrollmentId] ?? "")}
                      placeholder="Add remarks (optional)"
                      className="h-8"
                    />
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
import { api } from "@/lib/api-client";
