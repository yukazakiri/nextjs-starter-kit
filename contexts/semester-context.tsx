"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface SemesterContextType {
  semester: string;
  schoolYear: string;
  setSemester: (semester: string) => void;
  setSchoolYear: (schoolYear: string) => void;
  setAcademicPeriod: (semester: string, schoolYear: string) => void;
  isLoading: boolean;
}

const SemesterContext = createContext<SemesterContextType | undefined>(undefined);

export function SemesterProvider({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [semester, setSemesterState] = useState<string>("1");
  const [schoolYear, setSchoolYearState] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from Clerk metadata, then Laravel API, then localStorage
  useEffect(() => {
    async function initializeAcademicPeriod() {
      if (!isLoaded) return;

      try {
        console.log("[SEMESTER CONTEXT] Initializing academic period...");

        // Step 1: Try to load from Clerk metadata
        if (user?.publicMetadata?.semester && user?.publicMetadata?.schoolYear) {
          const savedSemester = String(user.publicMetadata.semester);
          const savedSchoolYear = String(user.publicMetadata.schoolYear);

          console.log("[SEMESTER CONTEXT] Found saved preference in Clerk metadata:", {
            semester: savedSemester,
            schoolYear: savedSchoolYear,
          });

          setSemesterState(savedSemester);
          setSchoolYearState(savedSchoolYear);
          setIsLoading(false);
          return;
        }

        // Step 2: Fetch from Laravel API
        console.log("[SEMESTER CONTEXT] No saved preference, fetching from Laravel API...");
        const response = await fetch("/api/academic-periods");

        if (response.ok) {
          const data = await response.json();

          if (data.success && data.current) {
            console.log("[SEMESTER CONTEXT] Loaded current academic period from Laravel API:", data.current);
            setSemesterState(data.current.semester);
            setSchoolYearState(data.current.schoolYear);
            setIsLoading(false);
            return;
          }
        }

        // Step 3: Fallback to localStorage
        console.log("[SEMESTER CONTEXT] Falling back to localStorage...");
        const localSemester = localStorage.getItem("selectedSemester") || "1";
        const localSchoolYear = localStorage.getItem("selectedSchoolYear") || "2025";

        setSemesterState(localSemester);
        setSchoolYearState(localSchoolYear);
      } catch (error) {
        console.error("[SEMESTER CONTEXT] Error initializing academic period:", error);

        // Step 4: Final fallback
        setSemesterState("1");
        setSchoolYearState("2025");
      } finally {
        setIsLoading(false);
      }
    }

    initializeAcademicPeriod();
  }, [user, isLoaded]);

  // Save to localStorage and Clerk metadata whenever values change
  useEffect(() => {
    if (!isLoading && (semester || schoolYear)) {
      localStorage.setItem("selectedSemester", semester);
      localStorage.setItem("selectedSchoolYear", schoolYear);

      // Save to Clerk metadata
      if (user?.id) {
        saveToClerkMetadata(semester, schoolYear);
      }
    }
  }, [semester, schoolYear, user, isLoading]);

  const saveToClerkMetadata = async (semesterValue: string, schoolYearValue: string) => {
    try {
      const response = await fetch("/api/user/academic-period", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          semester: semesterValue,
          schoolYear: schoolYearValue,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      console.log("[SEMESTER CONTEXT] Saved academic period to Clerk metadata");
    } catch (error) {
      console.error("[SEMESTER CONTEXT] Error saving to Clerk metadata:", error);
      // Don't show toast here as it's called on every change
    }
  };

  const setSemester = (newSemester: string) => {
    console.log("[SEMESTER CONTEXT] Setting semester:", newSemester);
    setSemesterState(newSemester);
  };

  const setSchoolYear = (newSchoolYear: string) => {
    console.log("[SEMESTER CONTEXT] Setting school year:", newSchoolYear);
    setSchoolYearState(newSchoolYear);
  };

  const setAcademicPeriod = (newSemester: string, newSchoolYear: string) => {
    console.log("[SEMESTER CONTEXT] Setting academic period:", {
      semester: newSemester,
      schoolYear: newSchoolYear,
    });
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
        isLoading,
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
