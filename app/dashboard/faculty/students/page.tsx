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
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { laravelApi, type LaravelStudent } from "@/lib/laravel-api";

export default function FacultyStudentsPage() {
  const router = useRouter();
  const { user } = useUser();
  const [students, setStudents] = useState<LaravelStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");

  // Redirect non-faculty users to student dashboard
  useEffect(() => {
    if (user) {
      const userRole = user.publicMetadata?.role as string;
      if (userRole !== "faculty") {
        router.push("/dashboard/student");
        return;
      }

      // Fetch students from Laravel API
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    const facultyId = user?.publicMetadata?.facultyId as string;
    if (!facultyId) {
      console.error("No faculty ID found in user metadata");
      setLoading(false);
      return;
    }

    try {
      const facultyData = await laravelApi.getFaculty(facultyId);
      
      // Check if facultyData is valid
      if (!facultyData || !facultyData.data || !Array.isArray(facultyData.data.classes)) {
        console.error("Faculty data is invalid or classes not found:", facultyData);
        setStudents([]);
        return;
      }
      
      // For now, we'll need to get students from each class
      // TODO: Update this when we have a direct students endpoint
      const allStudents: LaravelStudent[] = [];
      
      for (const classItem of facultyData.data.classes) {
        const classStudents = await laravelApi.getClassStudents(classItem.id);
        allStudents.push(...classStudents);
      }
      
      // Remove duplicates (students might be in multiple classes)
      const uniqueStudents = allStudents.filter((student, index, self) => 
        index === self.findIndex((s) => s.id === student.id)
      );
      
      setStudents(uniqueStudents);
    } catch (error) {
      console.error("Error fetching students from Laravel API:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // TODO: Implement class and year filtering when we have the data
    const matchesClass = classFilter === "all"; // Placeholder
    const matchesYear = yearFilter === "all"; // Placeholder

    return matchesSearch && matchesClass && matchesYear;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0)}${lastName?.charAt(0)}`.toUpperCase();
  };

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
                  <SelectItem value="CS 401">CS 401</SelectItem>
                  <SelectItem value="CS 305">CS 305</SelectItem>
                  <SelectItem value="CS 201">CS 201</SelectItem>
                  <SelectItem value="CS 101">CS 101</SelectItem>
                </SelectContent>
              </Select>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Year Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Year Levels</SelectItem>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="h-64 animate-pulse bg-muted/20" />
          ))}
        </div>
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
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{student.phone || "Not provided"}</span>
                    </div>
                  </div>

                  {/* Performance Stats - TODO: Get from Laravel API */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>GPA</span>
                      </div>
                      <p className="text-lg font-semibold">N/A</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Attendance</span>
                      </div>
                      <p className="text-lg font-semibold">N/A</p>
                    </div>
                  </div>

                  {/* Enrolled Classes - TODO: Get from Laravel API */}
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Enrolled Classes</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">
                        TBD
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredStudents.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No students found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
