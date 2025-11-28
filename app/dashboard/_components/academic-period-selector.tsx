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

interface AcademicPeriod {
  schoolYear: string;
  semesters: string[];
}

export default function AcademicPeriodSelector() {
  const { semester, schoolYear, setSemester, setSchoolYear } = useSemester();
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAcademicPeriods() {
      try {
        const response = await fetch("/api/academic-periods");
        const data = await response.json();

        if (data.success && data.data) {
          setAcademicPeriods(data.data);

          // Auto-select the most recent school year if none selected
          if (!schoolYear && data.data.length > 0) {
            setSchoolYear(data.data[0].schoolYear);
            // Auto-select first available semester for that school year
            if (data.data[0].semesters.length > 0) {
              setSemester(data.data[0].semesters[0]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch academic periods:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAcademicPeriods();
  }, []);

  const currentPeriod = academicPeriods.find(p => p.schoolYear === schoolYear);
  const availableSemesters = currentPeriod?.semesters || [];

  const handleSchoolYearChange = (newSchoolYear: string) => {
    setSchoolYear(newSchoolYear);
    const newPeriod = academicPeriods.find(p => p.schoolYear === newSchoolYear);
    if (newPeriod && newPeriod.semesters.length > 0) {
      setSemester(newPeriod.semesters[0]);
    }
  };

  const getSemesterLabel = (sem: string) => {
    const semesterMap: Record<string, string> = {
      "1": "1st Semester",
      "2": "2nd Semester",
      "3": "Summer",
    };
    return semesterMap[sem] || `Semester ${sem}`;
  };

  if (isLoading) {
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
        <SelectTrigger className="w-[180px] h-9">
          <SelectValue placeholder="Select School Year" />
        </SelectTrigger>
        <SelectContent>
          {academicPeriods.map((period) => (
            <SelectItem key={period.schoolYear} value={period.schoolYear}>
              S.Y. {period.schoolYear}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={semester} onValueChange={setSemester}>
        <SelectTrigger className="w-[150px] h-9">
          <SelectValue placeholder="Select Semester" />
        </SelectTrigger>
        <SelectContent>
          {availableSemesters.map((sem) => (
            <SelectItem key={sem} value={sem}>
              {getSemesterLabel(sem)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
