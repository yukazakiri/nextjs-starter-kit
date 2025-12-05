"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Calendar,
  FileDown,
  GraduationCap,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Search,
  SortAsc,
  SortDesc,
  User,
  UserCheck,
  UserPlus,
  Users,
  UserX,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import { api } from "@/lib/api-client";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

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
  databaseId?: number | string;
  apiStudentId?: string | number;
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
    course: {
      id: string;
      code: string;
      name: string;
      description: string;
    };
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
  clearance_information: {
    current_clearance: {
      status: string;
      is_cleared: boolean;
      cleared_by: string | null;
      cleared_at: string | null;
      remarks: string | null;
      academic_year: string;
      semester: string;
      formatted_semester: string;
    };
    previous_clearance: {
      status: string;
      allowed: string;
      message: string;
      academic_period: string;
      academic_year: string;
      semester: string;
    };
    clearance_history: Array<{
      academic_year: string;
      semester: number;
      formatted_semester: string;
      is_cleared: boolean;
      status: string;
      cleared_by: string | null;
      cleared_at: string | null;
      remarks: string | null;
    }>;
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
  current_enrolled_subjects: Array<{
    subject_code: string;
    subject_title: string;
    units: string;
    section: string;
    grade: number;
    academic_year: string;
    semester: number;
  }>;
  documents: {
    picture_1x1: string | null;
    transcript_records: string | null;
    transfer_credentials: string | null;
    good_moral_cert: string | null;
    form_137: string | null;
    form_138: string | null;
    birth_certificate: string | null;
  };
  demographic_information: {
    ethnicity: string | null;
    is_indigenous_person: boolean;
    indigenous_group: string | null;
  };
  scholarship_information: {
    scholarship_type: string | null;
    scholarship_details: string | null;
  };
  employment_information: {
    employment_status: string | null;
    employer_name: string | null;
    job_position: string | null;
    employment_date: string | null;
    employed_by_institution: boolean;
  };
  attrition_information: {
    withdrawal_date: string | null;
    withdrawal_reason: string | null;
    attrition_category: string | null;
    dropout_date: string | null;
  };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
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
  const students: Person[] = enrolledStudents.map((s: any) => {
    // Check if s is an EnrolledStudent (has nested student property) or a direct Student object
    const isEnrolledStudent = s.student && typeof s.student === 'object';
    const studentData = isEnrolledStudent ? s.student : s;
    const apiStudentId = studentData.student_id;
    const databaseId = studentData.id || (isEnrolledStudent ? s.student_id : s.id);
    const schoolId = studentData.student_id;

    return {
      id: s.id || Math.random().toString(36).substr(2, 9),
      name: `${studentData.first_name || ""} ${studentData.last_name || ""}`.trim() || schoolId || "Unknown Student",
      email: studentData.email,
      student_id: schoolId,
      avatar: studentData.avatar_url || studentData.avatar,
      role: "student" as const,
      status: droppedStudents.has(s.id) ? "dropped" : "active",
      course: studentData.academic_information?.course ? {
        id: studentData.academic_information.course.id,
        code: studentData.academic_information.course.code,
        name: studentData.academic_information.course.name,
      } : undefined,
      databaseId: databaseId,
      apiStudentId: apiStudentId // Use this for API calls
    };
  });

  // Fetch student details
  const fetchStudentDetails = async (studentId: string | number) => {
    if (!studentId) {
      console.error("Invalid student ID:", studentId);
      return;
    }

    // Open sheet immediately to show loading state
    setIsSheetOpen(true);
    setIsLoadingStudent(true);
    
    try {
      const safeId = String(studentId).trim();
      const { data, error } = await api.students({ id: safeId }).get();
      if (error) {
        console.error("Failed to fetch student details:", typeof error === "object" ? JSON.stringify(error) : error);
        const v: any = (error as any);
        const message =
          (v?.value?.error && typeof v.value.error === "string" ? v.value.error : undefined) ??
          (v?.value?.message && typeof v.value.message === "string" ? v.value.message : undefined) ??
          (v?.message && typeof v.message === "string" ? v.message : undefined) ??
          (typeof v === "string" ? v : undefined) ??
          "Failed to fetch student details";
        throw new Error(message);
      }
      if (data) {
        // @ts-ignore
        setSelectedStudent(data.data);
      }
    } catch (error) {
      console.error("Error fetching student details:", typeof error === "object" ? JSON.stringify(error) : error);
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
                        <div 
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => fetchStudentDetails(student.apiStudentId || student.student_id || student.id)}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback>{student.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{student.name}</span>
                            <span className="text-xs text-muted-foreground">{student.email}</span>
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
                              <DropdownMenuItem onClick={() => fetchStudentDetails(student.apiStudentId || student.student_id || student.id)}>
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
      <SheetContent className="w-full md:max-w-3xl p-0 flex flex-col h-full">
          <SheetHeader className="sr-only">
            <SheetTitle>Student Details</SheetTitle>
          </SheetHeader>
          <div className="p-6 border-b bg-gradient-to-r from-primary/10 via-violet-100 to-teal-100">
            <div className="flex items-start gap-4">
              {isLoadingStudent ? (
                <>
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <div className="flex flex-wrap items-center gap-2">
                      <Skeleton className="h-6 w-28 rounded-full" />
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-6 w-32 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-24" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="relative">
                    <Avatar className="h-16 w-16 ring-2 ring-primary/30">
                      <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                        {selectedStudent ? getInitials(selectedStudent.basic_information.full_name) : "S"}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold leading-tight">
                      {selectedStudent?.basic_information.full_name || "Student Name"}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-sm mt-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <GraduationCap className="h-4 w-4" />
                        {String(selectedStudent?.student_id || "N/A")}
                      </Badge>
                      <Badge variant="default" className="capitalize">
                        {selectedStudent?.academic_information.status || "N/A"}
                      </Badge>
                      <Badge variant="outline">
                        {selectedStudent?.academic_information.formatted_academic_year || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button onClick={() => selectedStudent?.basic_information.email && window.open(`mailto:${selectedStudent.basic_information.email}`)}>
                              <Mail className="h-4 w-4 mr-2" />
                              Email
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Open email client</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" onClick={() => navigator.clipboard.writeText(String(selectedStudent?.student_id || ""))}>
                              <User className="h-4 w-4 mr-2" />
                              Copy ID
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy student ID</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {isLoadingStudent ? (
            <ScrollArea className="flex-1">
              <div className="p-6 pt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-32" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-40" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-28" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-6 w-24" />
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-32" />
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-32" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-28" />
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-y-4 gap-x-8">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                    <Skeleton className="h-5 w-64" />
                    <Skeleton className="h-5 w-40" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <Skeleton className="h-5 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-12 w-full" />
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : selectedStudent ? (
            <ScrollArea className="flex-1">
              <div className="p-6 pt-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Student ID</p>
                      <p className="text-lg font-semibold">{String(selectedStudent.student_id || "N/A")}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Year Level</p>
                      <p className="text-sm font-semibold truncate">{selectedStudent.academic_information.formatted_academic_year}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Status</p>
                      <p className="text-lg font-semibold capitalize">{selectedStudent.academic_information.status}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Gender</p>
                      <p className="text-lg font-semibold capitalize">{selectedStudent.basic_information.gender}</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Identity
                    </h3>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{selectedStudent.basic_information.full_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Student ID</p>
                      <p className="font-medium">{String(selectedStudent.student_id || "N/A")}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      Academic
                    </h3>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-3 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-sm text-muted-foreground">Course</p>
                      <p className="font-medium">{selectedStudent.academic_information.course?.code || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">{selectedStudent.academic_information.course?.name || ""}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Year Level</p>
                      <p className="font-medium">{selectedStudent.academic_information.formatted_academic_year}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge variant="outline" className="capitalize">{selectedStudent.academic_information.status}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-5 w-5 text-primary" />
                      Contact
                    </h3>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-y-4 gap-x-8">
                    <div>
                      <p className="text-sm text-muted-foreground">Email Address</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedStudent.basic_information.email}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(String(selectedStudent.basic_information.email || ""))}>Copy</Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy email</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{selectedStudent.basic_information.phone || "N/A"}</p>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(String(selectedStudent.basic_information.phone || ""))}>Copy</Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy phone</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Address
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-1">Current Address</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium bg-muted/30 p-3 rounded-md border flex-1">{selectedStudent.address_information.current_address || "N/A"}</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(String(selectedStudent.address_information.current_address || ""))}>Copy</Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy address</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
              <Users className="h-12 w-12 mb-4 opacity-20" />
              <p>No student details selected</p>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
