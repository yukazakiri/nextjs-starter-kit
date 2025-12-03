"use client";

import { useEffect, useState } from "react";
import { useSemester } from "@/contexts/semester-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { toast } from "sonner";

interface AcademicPeriod {
  schoolYear: string;
  label: string;
  semesters: string[];
}

interface SettingsResponse {
  success: boolean;
  data: AcademicPeriod[];
  current: {
    semester: string;
    schoolYear: string;
    schoolYearString: string;
  };
  availableSemesters: Record<string, string>;
  availableSchoolYears: Record<string, string>;
}

export default function AcademicPeriodSelector() {
  const { semester, schoolYear, setSemester, setSchoolYear, isLoading: contextLoading } = useSemester();
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [availableSemesters, setAvailableSemesters] = useState<Record<string, string>>({});
  const [currentPeriod, setCurrentPeriod] = useState<{ semester: string; schoolYear: string; schoolYearString: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAcademicPeriods() {
      try {
        console.log("[ACADEMIC SELECTOR] Fetching academic periods...");
        const response = await fetch("/api/academic-periods");
        console.log("[ACADEMIC SELECTOR] Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("[ACADEMIC SELECTOR] API Error:", errorText);
          toast.error(`Failed to fetch academic periods: ${response.statusText}`);
          setIsLoading(false);
          return;
        }

        const data: SettingsResponse = await response.json();
        console.log("[ACADEMIC SELECTOR] API Response:", data);

        if (data.success && data.data) {
          setAcademicPeriods(data.data);
          setAvailableSemesters(data.availableSemesters || {});
          setCurrentPeriod(data.current || null);
          console.log("[ACADEMIC SELECTOR] Set academic periods:", data.data.length);

          // Don't auto-select here - let the SemesterContext handle initialization
          // The context will use saved preferences or Laravel defaults

          toast.success("Academic periods loaded successfully");
        } else {
          console.error("[ACADEMIC SELECTOR] Invalid response format:", data);
          toast.error(data.error || "Invalid response format from server");
        }
      } catch (error) {
        console.error("[ACADEMIC SELECTOR] Fetch error:", error);
        toast.error(`Failed to fetch academic periods: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAcademicPeriods();
  }, []);

  const handleSchoolYearChange = (newSchoolYear: string) => {
    console.log("[ACADEMIC SELECTOR] School year changed:", newSchoolYear);
    setSchoolYear(newSchoolYear);
    toast.success(`School year changed to ${newSchoolYear}`);
    // Keep the current semester when changing school year
  };

  const handleSemesterChange = (newSemester: string) => {
    console.log("[ACADEMIC SELECTOR] Semester changed:", newSemester);
    setSemester(newSemester);
    const semesterLabel = availableSemesters[newSemester] || newSemester;
    toast.success(`Semester changed to ${semesterLabel}`);
  };

  const getSemesterLabel = (sem: string) => {
    return availableSemesters[sem] || `Semester ${sem}`;
  };

  const getSchoolYearLabel = (schoolYear: string) => {
    const period = academicPeriods.find(p => p.schoolYear === schoolYear);
    return period?.label || `S.Y. ${schoolYear}`;
  };

  if (contextLoading || isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground animate-pulse" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Calendar className="h-4 w-4 text-muted-foreground" />

      <Select value={schoolYear} onValueChange={handleSchoolYearChange}>
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Select School Year" />
        </SelectTrigger>
        <SelectContent>
          {academicPeriods.map((period) => (
            <SelectItem key={period.schoolYear} value={period.schoolYear}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={semester} onValueChange={handleSemesterChange}>
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Select Semester" />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(availableSemesters).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
