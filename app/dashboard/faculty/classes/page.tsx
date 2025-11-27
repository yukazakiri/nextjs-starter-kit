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

  useEffect(() => {
    async function fetchClasses() {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/faculty/classes");
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
  }, [user]);

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
                <Card className="h-full flex flex-col overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card group-hover:-translate-y-1">
                  {/* Gradient Cover Header */}
                  <div 
                    className="relative h-32 w-full p-6 flex flex-col justify-between"
                    style={{ background: theme.gradient }}
                  >
                    <div className="flex justify-between items-start">
                      <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                        {classItem.subjectCode}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/20">
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

                    <div className="flex justify-between items-end">
                      <Badge variant="secondary" className="bg-white/90 text-black hover:bg-white font-semibold shadow-sm">
                        Section {classItem.section}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex-1 flex flex-col gap-4">
                    {/* Subject Name */}
                    <div>
                      <h3 className="font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                        {classItem.subjectName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{classItem.schoolYear} • {classItem.semester}</span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-border/50">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Students</span>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">
                            {classItem.enrolledStudents}
                            <span className="text-muted-foreground font-normal text-xs ml-1">/ {classItem.maximumSlots}</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Credits</span>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <span className="font-semibold text-foreground">{classItem.credits} Units</span>
                        </div>
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

