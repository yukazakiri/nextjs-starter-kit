"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  MoreVertical,
  Search,
  Users,
  Plus,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getClassColor } from "./_utils/colors";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FacultyClass {
  id: number;
  subjectCode: string;
  subjectName: string;
  section: string;
  semester: string;
  schoolYear: string;
  enrolledStudents: number;
  maximumSlots: number;
  credits: number;
  lecture: number;
  laboratory: number;
}

export default function FacultyClassesPage() {
  const { user } = useUser();
  const [classes, setClasses] = useState<FacultyClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  const facultyId = user?.publicMetadata?.facultyId as string | undefined;

  useEffect(() => {
    async function fetchClasses() {
      if (!facultyId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/faculty/classes?facultyId=${facultyId}`,
        );
        if (response.ok) {
          const data = await response.json();
          setClasses(data.classes || []);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClasses();
  }, [facultyId]);

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      classItem.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      classItem.section.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester =
      semesterFilter === "all" || classItem.semester === semesterFilter;

    const matchesYear =
      yearFilter === "all" || classItem.schoolYear === yearFilter;

    return matchesSearch && matchesSemester && matchesYear;
  });

  const uniqueSchoolYears = Array.from(
    new Set(classes.map((c) => c.schoolYear)),
  ).filter(Boolean);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Manage your classes and view student progress
          </p>
        </div>
        <Button className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Create Class
        </Button>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by subject, code, or section..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-full bg-muted/50 border-transparent focus:bg-background transition-colors"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={semesterFilter} onValueChange={setSemesterFilter}>
            <SelectTrigger className="w-full md:w-[160px] rounded-full border-transparent bg-muted/50 hover:bg-muted">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              <SelectItem value="1st Semester">1st Semester</SelectItem>
              <SelectItem value="2nd Semester">2nd Semester</SelectItem>
            </SelectContent>
          </Select>
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-full md:w-[160px] rounded-full border-transparent bg-muted/50 hover:bg-muted">
              <SelectValue placeholder="School Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {uniqueSchoolYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Classes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <BookOpen className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No classes found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Try adjusting your search or filters, or create a new class to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => {
            const theme = getClassColor(classItem.subjectCode);
            
            return (
              <Link
                href={`/dashboard/faculty/classes/${classItem.id}`}
                key={classItem.id}
                className="block group h-full"
              >
                <Card className="h-full flex flex-col overflow-hidden border-2 border-transparent hover:border-primary/10 transition-all duration-300 hover:shadow-xl bg-card">
                  {/* Minimalist Header Strip */}
                  <div 
                    className="h-2 w-full"
                    style={{ background: theme.gradient }}
                  />
                  
                  <CardContent className="p-6 flex-1 flex flex-col gap-4">
                    {/* Header Info */}
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-medium border-primary/20 text-primary bg-primary/5">
                            {classItem.subjectCode}
                          </Badge>
                          <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-secondary">
                            Sec {classItem.section}
                          </span>
                        </div>
                        <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                          {classItem.subjectName}
                        </h3>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>View Students</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Archive Class</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <Users className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Students</span>
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {classItem.enrolledStudents}
                          <span className="text-xs text-muted-foreground font-normal ml-1">
                            / {classItem.maximumSlots}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                          <BookOpen className="h-3.5 w-3.5" />
                          <span className="text-xs font-medium">Credits</span>
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {classItem.credits}
                          <span className="text-xs text-muted-foreground font-normal ml-1">
                            Units
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-auto pt-4 flex items-center justify-between text-sm text-muted-foreground border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{classItem.schoolYear}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-emerald-600 font-medium">Active</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

