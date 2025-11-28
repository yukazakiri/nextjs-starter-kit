"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SemesterContextType {
  semester: string;
  schoolYear: string;
  setSemester: (semester: string) => void;
  setSchoolYear: (schoolYear: string) => void;
  setAcademicPeriod: (semester: string, schoolYear: string) => void;
}

const SemesterContext = createContext<SemesterContextType | undefined>(undefined);

export function SemesterProvider({ children }: { children: React.ReactNode }) {
  const [semester, setSemesterState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedSemester") || "1";
    }
    return "1";
  });

  const [schoolYear, setSchoolYearState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("selectedSchoolYear") || "";
    }
    return "";
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSemester", semester);
    }
  }, [semester]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedSchoolYear", schoolYear);
    }
  }, [schoolYear]);

  const setSemester = (newSemester: string) => {
    setSemesterState(newSemester);
  };

  const setSchoolYear = (newSchoolYear: string) => {
    setSchoolYearState(newSchoolYear);
  };

  const setAcademicPeriod = (newSemester: string, newSchoolYear: string) => {
    setSemesterState(newSemester);
    setSchoolYearState(newSchoolYear);
  };

  return (
    <SemesterContext.Provider
      value={{
        semester,
        schoolYear,
        setSemester,
        setSchoolYear,
        setAcademicPeriod,
      }}
    >
      {children}
    </SemesterContext.Provider>
  );
}

export function useSemester() {
  const context = useContext(SemesterContext);
  if (context === undefined) {
    throw new Error("useSemester must be used within a SemesterProvider");
  }
  return context;
}
