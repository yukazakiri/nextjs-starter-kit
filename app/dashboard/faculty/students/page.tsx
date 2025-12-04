"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Search,
  User,
  Mail,
  Phone,
  BookOpen,
  AlertCircle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { StudentCardSkeleton } from "../_components/skeletons/student-card-skeleton";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StudentData {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  phone?: string;
  classes: Array<{
    id: number;
    subject_code: string;
    subject_title: string;
    section: string;
    grade_level: string;
    classification: string;
  }>;
}

interface ClassData {
  id: number;
  subject_code: string;
  subject_title: string;
  section: string;
  display_info: string;
  grade_level: string;
}

export default function FacultyStudentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [gradeLevelFilter, setGradeLevelFilter] = useState("all");

  const facultyId = user?.publicMetadata?.facultyId as string;
  const userRole = user?.publicMetadata?.role as string;

  // Redirect non-faculty users
  if (user && userRole !== "faculty") {
    router.push("/dashboard/student");
    return null;
  }

  // Fetch students using Elysia API
  const { data, isLoading, error } = useQuery({
    queryKey: ["faculty-students", facultyId],
    queryFn: async () => {
      if (!facultyId) throw new Error("Faculty ID not found");

      const response = await api.faculty[facultyId].students.get();

      if (response.error) {
        throw new Error("Failed to fetch students");
      }

      return response.data as {
        success: boolean;
        students: StudentData[];
        classes: ClassData[];
      };
    },
    enabled: !!facultyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const students = data?.students || [];
  const classes = data?.classes || [];

  // Extract unique grade levels from students' classes
  const gradeLevels = useMemo(() => {
    const levels = new Set<string>();
    students.forEach(student => {
      student.classes.forEach(cls => {
        if (cls.grade_level) {
          levels.add(cls.grade_level);
        }
      });
    });
    return Array.from(levels).sort();
  }, [students]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search filter
      const matchesSearch =
        student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase());

      // Class filter
      const matchesClass = classFilter === "all" ||
        student.classes.some(cls => cls.id.toString() === classFilter);

      // Grade level filter
      const matchesGradeLevel = gradeLevelFilter === "all" ||
        student.classes.some(cls => cls.grade_level === gradeLevelFilter);

      return matchesSearch && matchesClass && matchesGradeLevel;
    });
  }, [students, searchQuery, classFilter, gradeLevelFilter]);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`.toUpperCase();
  };

  if (error) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
          <p className="text-muted-foreground mt-2">
            View and manage students enrolled in your classes
          </p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load students. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
        <p className="text-muted-foreground mt-2">
          View and manage students enrolled in your classes
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id.toString()}>
                      {cls.display_info || `${cls.subject_code} - ${cls.section}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={gradeLevelFilter} onValueChange={setGradeLevelFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Grade Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grade Levels</SelectItem>
                  {gradeLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Summary Stats */}
            <div className="flex items-center gap-6 pt-2 border-t">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">
                    {filteredStudents.length}
                  </span>{" "}
                  Student{filteredStudents.length !== 1 ? "s" : ""}
                </span>
              </div>
              {classFilter !== "all" && (
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Filtered by class
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StudentCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground text-center">
              {students.length === 0
                ? "You don't have any students enrolled in your classes yet."
                : "Try adjusting your filters or search query"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card
              key={student.id}
              className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4">
                  {/* Student Header */}
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(student.first_name, student.last_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">
                        {student.first_name} {student.last_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {student.student_id}
                      </p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        Active
                      </Badge>
                    </div>
                  </div>

                  {/* Student Details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    {student.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span>{student.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Enrolled Classes */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Enrolled Classes ({student.classes.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {student.classes.slice(0, 3).map((cls) => (
                        <Badge
                          key={cls.id}
                          variant="outline"
                          className="text-xs"
                          title={`${cls.subject_code} - ${cls.section}`}
                        >
                          {cls.subject_code}
                        </Badge>
                      ))}
                      {student.classes.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{student.classes.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
