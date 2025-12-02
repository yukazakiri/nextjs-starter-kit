"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Mail,
  MoreVertical,
  Phone,
  Search,
  SortAsc,
  SortDesc,
  UserCheck,
  UserPlus,
  Users,
  BookOpen,
  FileDown,
  UserX,
  User,
  GraduationCap,
  MapPin,
  Calendar,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

interface Person {
  id: string | number;
  name: string;
  avatar?: string;
  role: "teacher" | "student";
  email?: string;
  student_id?: string | number;
  status?: "active" | "dropped";
  course?: {
    id: string;
    code: string;
    name: string;
  };
}

interface StudentDetails {
  id: number;
  student_id: number | null;
  lrn: string | null;
  student_type: string | null;
  basic_information: {
    full_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string | null;
    email: string;
    phone: string | null;
    birth_date: string;
    age: number;
    gender: string;
    civil_status: string | null;
    nationality: string | null;
    religion: string | null;
  };
  academic_information: {
    academic_year: number;
    formatted_academic_year: string;
    status: string;
  };
  address_information: {
    current_address: string | null;
    permanent_address: string | null;
    city_of_origin: string | null;
    province_of_origin: string | null;
    region_of_origin: string | null;
  };
  contact_information: {
    personal_contact: string | null;
    emergency_contact_name: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_address: string | null;
    facebook_contact: string | null;
  };
  parent_information: {
    fathers_name: string | null;
    fathers_occupation: string | null;
    fathers_contact: string | null;
    mothers_name: string | null;
    mothers_occupation: string | null;
    mothers_contact: string | null;
  };
  education_information: {
    elementary_school: string | null;
    elementary_graduate_year: string | null;
    elementary_school_address: string | null;
    senior_high_name: string | null;
    senior_high_graduate_year: string | null;
    senior_high_address: string | null;
  };
  tuition_information: {
    total_tuition: string | null;
    lecture_fees: string | null;
    laboratory_fees: string | null;
    miscellaneous_fees: string | null;
    overall_tuition: string | null;
    downpayment: string | null;
    balance: string | null;
    discount: string | null;
    payment_status: string | null;
    semester: string | null;
    academic_year: string | null;
  };
}

interface PeopleTabProps {
  enrolledStudents?: any[];
}

export function PeopleTab({ enrolledStudents = [] }: PeopleTabProps) {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "id">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [droppedStudents, setDroppedStudents] = useState<Set<string | number>>(new Set());
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);

  // Transform enrolled students to match Person interface
  const students: Person[] = enrolledStudents.map((s: any) => ({
    id: s.id || Math.random().toString(36).substr(2, 9),
    name: `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.student_id || "Unknown Student",
    email: s.email,
    student_id: s.student_id,
    avatar: s.avatar_url,
    role: "student" as const,
    status: droppedStudents.has(s.id) ? "dropped" : "active",
    course: s.academic_information?.course ? {
      id: s.academic_information.course.id,
      code: s.academic_information.course.code,
      name: s.academic_information.course.name,
    } : undefined,
  }));

  // Fetch student details
  const fetchStudentDetails = async (studentId: string | number) => {
    setIsLoadingStudent(true);
    try {
      // Call our Elysia backend route which proxies to Laravel API
      const response = await fetch(`/api/students/${studentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();
      setSelectedStudent(data.data);
      setIsSheetOpen(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setIsLoadingStudent(false);
    }
  };

  // Export to Excel
  const exportToExcel = () => {
    const data = students.map((student, index) => ({
      "#": index + 1,
      "Student Name": student.name,
      "Student ID": student.student_id || "N/A",
      "Course": student.course?.code || "N/A",
      "Email": student.email || "No email",
      "Status": student.status === "dropped" ? "Dropped" : "Active",
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "class-students.xlsx");
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text("Class Students List", 14, 20);

    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Add table headers
    doc.setFontSize(12);
    let y = 45;

    // Table headers
    doc.text("#", 14, y);
    doc.text("Student Name", 25, y);
    doc.text("Student ID", 70, y);
    doc.text("Course", 110, y);
    doc.text("Email", 140, y);
    doc.text("Status", 180, y);

    // Draw line under headers
    y += 5;
    doc.line(14, y, 196, y);
    y += 10;

    // Table rows
    doc.setFontSize(10);
    students.forEach((student, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }

      doc.text((index + 1).toString(), 14, y);
      doc.text(student.name.substring(0, 20), 25, y);
      doc.text((student.student_id || "N/A").toString(), 70, y);
      doc.text((student.course?.code || "N/A").toString(), 110, y);
      doc.text((student.email || "No email").substring(0, 20), 140, y);
      doc.text(student.status === "dropped" ? "Dropped" : "Active", 180, y);
      y += 10;
    });

    doc.save("class-students.pdf");
  };

  // Mark student as dropped
  const toggleDropStatus = (studentId: string | number) => {
    setDroppedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };

  const teacher: Person = {
    id: "teacher-1",
    name: user?.fullName || "Faculty",
    email: user?.primaryEmailAddress?.emailAddress,
    avatar: user?.imageUrl,
    role: "teacher",
  };

  // Filter and sort students
  const filteredStudents = students
    .filter((student) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        student.name.toLowerCase().includes(query) ||
        student.student_id?.toString().toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      const multiplier = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "name") {
        return a.name.localeCompare(b.name) * multiplier;
      } else {
        return (
          String(a.student_id || "").localeCompare(String(b.student_id || "")) *
          multiplier
        );
      }
    });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Header Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">People</h2>
            <p className="text-muted-foreground">
              Manage class participants and view enrollment details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportToExcel}>
              <FileDown className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={exportToPDF}>
              <FileDown className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Students
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-bold">{students.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Students</p>
                  <p className="text-2xl font-bold">{students.filter(s => s.status === "active").length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Dropped Students</p>
                  <p className="text-2xl font-bold">{students.filter(s => s.status === "dropped").length}</p>
                </div>
                <UserX className="h-8 w-8 text-red-500 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Capacity</p>
                  <p className="text-2xl font-bold">
                    {students.length} / {enrolledStudents.length + 10 || 40}
                  </p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Teachers Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Teachers
        </h3>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={teacher.avatar} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(teacher.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{teacher.name}</p>
                <p className="text-sm text-muted-foreground">Instructor</p>
                {teacher.email && (
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {teacher.email}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3">
                  <Button variant="outline" size="sm" className="h-8">
                    <Mail className="h-3 w-3 mr-1" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Students
            </h3>
            <p className="text-sm text-muted-foreground">
              {filteredStudents.length} of {students.length} students
            </p>
          </div>
          <Button variant="outline">
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll Student
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, student ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Select value={sortBy} onValueChange={(v: "name" | "id") => setSortBy(v)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="id">Student ID</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setSortOrder(sortOrder === "asc" ? "desc" : "asc")
              }
            >
              {sortOrder === "asc" ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No students found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? `No students match your search "${searchQuery}"`
                  : "No students are enrolled in this class yet"}
              </p>
              {!searchQuery && (
                <Button className="mt-4">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Enroll First Student
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">#</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className="hover:bg-muted/50 transition-all duration-300 ease-in-out animate-in fade-in-50"
                    >
                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.student_id || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.course ? (
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-primary" />
                            <span>{student.course.code}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[250px] truncate">
                        {student.email || "No email"}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={student.status === "dropped"
                            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          }
                        >
                          {student.status === "dropped" ? "Dropped" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => fetchStudentDetails(student.id)}>
                                <Phone className="h-4 w-4 mr-2" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => toggleDropStatus(student.id)}
                                className={student.status === "dropped" ? "text-green-600" : "text-red-600"}
                              >
                                {student.status === "dropped" ? (
                                  <>
                                    <UserCheck className="h-4 w-4 mr-2" />
                                    Mark as Active
                                  </>
                                ) : (
                                  <>
                                    <UserX className="h-4 w-4 mr-2" />
                                    Mark as Dropped
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full md:max-w-3xl overflow-y-auto">
          <SheetHeader className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {selectedStudent ? getInitials(selectedStudent.basic_information.full_name) : "S"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="flex-1">
                <SheetTitle className="text-2xl leading-tight">
                  {selectedStudent?.basic_information.full_name || "Student Name"}
                </SheetTitle>
                <div className="flex items-center gap-3 text-sm mt-1">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {selectedStudent?.student_id || "N/A"}
                  </span>
                  <span className="text-muted-foreground">•</span>
                  <span className="capitalize">{selectedStudent?.academic_information.status || "N/A"}</span>
                  <span className="text-muted-foreground">•</span>
                  <span>{selectedStudent?.academic_information.formatted_academic_year || "N/A"}</span>
                </div>
              </div>
            </div>
          </SheetHeader>

          {isLoadingStudent ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : selectedStudent ? (
            <div className="mt-6 space-y-8">
              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <p className="text-xs text-muted-foreground mb-1">Age</p>
                  <p className="text-lg font-semibold">{selectedStudent.basic_information.age}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Gender</p>
                  <p className="text-lg font-semibold">{selectedStudent.basic_information.gender}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-lg font-semibold capitalize">{selectedStudent.academic_information.status}</p>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Academic Year</p>
                  <p className="text-sm font-semibold">{selectedStudent.academic_information.formatted_academic_year}</p>
                </div>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">Personal Details</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium text-sm">{selectedStudent.basic_information.email || "N/A"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium text-sm">{selectedStudent.basic_information.phone || "N/A"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Birth Date</p>
                      <p className="font-medium text-sm">{selectedStudent.basic_information.birth_date}</p>
                    </div>
                  </div>
                  <div className="space-y-3 p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Civil Status</p>
                      <p className="font-medium text-sm">{selectedStudent.basic_information.civil_status || "N/A"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Nationality</p>
                      <p className="font-medium text-sm">{selectedStudent.basic_information.nationality || "N/A"}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Religion</p>
                      <p className="font-medium text-sm">{selectedStudent.basic_information.religion || "N/A"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground mb-3">Personal Contacts</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Personal Contact</p>
                        <p className="font-medium">{selectedStudent.contact_information.personal_contact || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Facebook</p>
                        <p className="font-medium text-sm">{selectedStudent.contact_information.facebook_contact || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border bg-card">
                    <p className="text-xs text-muted-foreground mb-3">Emergency Contact</p>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="font-medium">{selectedStudent.contact_information.emergency_contact_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-medium text-sm">{selectedStudent.contact_information.emergency_contact_phone || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold">Address Information</h3>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-4 rounded-lg border bg-card">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Current Address</p>
                        <p className="font-medium leading-relaxed">
                          {selectedStudent.address_information.current_address || "N/A"}
                        </p>
                      </div>
                      {selectedStudent.address_information.permanent_address !== selectedStudent.address_information.current_address && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Permanent Address</p>
                          <p className="font-medium leading-relaxed">
                            {selectedStudent.address_information.permanent_address || "N/A"}
                          </p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">City</p>
                          <p className="font-medium">{selectedStudent.address_information.city_of_origin || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Province</p>
                          <p className="font-medium">{selectedStudent.address_information.province_of_origin || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No student details available
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
