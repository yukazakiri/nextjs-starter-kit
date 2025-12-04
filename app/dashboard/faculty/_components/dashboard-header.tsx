"use client";

import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";

interface DashboardHeaderProps {
  firstName?: string;
  lastName?: string;
  department?: string;
  semester: string;
  schoolYear: string;
}

export function DashboardHeader({
  firstName,
  lastName,
  department,
  semester,
  schoolYear,
}: DashboardHeaderProps) {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          {department ? `Department of ${department}` : "Faculty Dashboard"}
        </p>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{currentDate}</span>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {semester === "1"
            ? "1st Semester"
            : semester === "2"
            ? "2nd Semester"
            : semester}{" "}
          {schoolYear}
        </Badge>
      </div>
    </div>
  );
}
