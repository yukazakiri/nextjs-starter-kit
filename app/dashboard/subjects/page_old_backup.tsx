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
import { BookOpen, Calendar, Clock, MapPin, Search, User } from "lucide-react";
import { useState, useEffect } from "react";
import { SubjectDetailModal } from "./_components/subject-detail-modal";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const subjects = [
  {
    id: 1,
    code: "CS 401",
    name: "Advanced Web Development",
    instructor: "Dr. Sarah Smith",
    instructorEmail: "sarah.smith@university.edu",
    instructorPhone: "+1 (555) 123-4567",
    credits: 3,
    semester: "1st Semester",
    year: "2024-2025",
    schedule: [
      {
        day: "Monday",
        time: "9:00 AM - 10:30 AM",
        room: "Room 301, Building A",
        type: "Lecture",
      },
      {
        day: "Wednesday",
        time: "9:00 AM - 10:30 AM",
        room: "Room 301, Building A",
        type: "Lecture",
      },
      {
        day: "Friday",
        time: "2:00 PM - 4:00 PM",
        room: "Lab 205, Building B",
        type: "Lab",
      },
    ],
    grade: "A",
    color: "bg-blue-500",
    units: 3,
    courseType: "Lecture & Lab",
    enrollmentDate: "August 15, 2024",
    totalStudents: 45,
    resources: [
      {
        type: "syllabus",
        name: "Course Syllabus",
        url: "#",
      },
      {
        type: "video",
        name: "Lecture Recordings",
        url: "#",
      },
      {
        type: "link",
        name: "Course Materials",
        url: "#",
      },
    ],
  },
  {
    id: 2,
    code: "CS 305",
    name: "Database Systems",
    instructor: "Prof. Michael Johnson",
    instructorEmail: "michael.johnson@university.edu",
    instructorPhone: "+1 (555) 234-5678",
    credits: 4,
    semester: "1st Semester",
    year: "2024-2025",
    schedule: [
      {
        day: "Tuesday",
        time: "11:00 AM - 12:30 PM",
        room: "Room 402, Building A",
        type: "Lecture",
      },
      {
        day: "Thursday",
        time: "11:00 AM - 12:30 PM",
        room: "Room 402, Building A",
        type: "Lecture",
      },
      {
        day: "Thursday",
        time: "2:00 PM - 4:00 PM",
        room: "Lab 301, Building B",
        type: "Lab",
      },
    ],
    grade: "A-",
    color: "bg-green-500",
    units: 4,
    courseType: "Lecture & Lab",
    enrollmentDate: "August 15, 2024",
    totalStudents: 38,
    resources: [
      {
        type: "syllabus",
        name: "Course Syllabus",
        url: "#",
      },
      {
        type: "video",
        name: "Tutorial Videos",
        url: "#",
      },
      {
        type: "link",
        name: "Practice Exercises",
        url: "#",
      },
    ],
  },
  {
    id: 3,
    code: "CS 450",
    name: "Machine Learning",
    instructor: "Dr. Emily Williams",
    instructorEmail: "emily.williams@university.edu",
    instructorPhone: "+1 (555) 345-6789",
    credits: 3,
    semester: "1st Semester",
    year: "2024-2025",
    schedule: [
      {
        day: "Monday",
        time: "2:00 PM - 3:30 PM",
        room: "Room 501, Building C",
        type: "Lecture",
      },
      {
        day: "Wednesday",
        time: "2:00 PM - 3:30 PM",
        room: "Room 501, Building C",
        type: "Lecture",
      },
    ],
    grade: "B+",
    color: "bg-purple-500",
    units: 3,
    courseType: "Lecture",
    enrollmentDate: "August 15, 2024",
    totalStudents: 52,
    resources: [
      {
        type: "syllabus",
        name: "Course Syllabus",
        url: "#",
      },
      {
        type: "video",
        name: "Lecture Series",
        url: "#",
      },
      {
        type: "link",
        name: "Jupyter Notebooks",
        url: "#",
      },
    ],
  },
  {
    id: 4,
    code: "CS 320",
    name: "Software Engineering",
    instructor: "Prof. David Brown",
    instructorEmail: "david.brown@university.edu",
    instructorPhone: "+1 (555) 456-7890",
    credits: 3,
    semester: "1st Semester",
    year: "2024-2025",
    schedule: [
      {
        day: "Tuesday",
        time: "4:00 PM - 5:30 PM",
        room: "Room 302, Building A",
        type: "Lecture",
      },
      {
        day: "Friday",
        time: "10:00 AM - 12:00 PM",
        room: "Room 302, Building A",
        type: "Tutorial",
      },
    ],
    grade: "A",
    color: "bg-orange-500",
    units: 3,
    courseType: "Lecture & Tutorial",
    enrollmentDate: "August 15, 2024",
    totalStudents: 42,
    resources: [
      {
        type: "syllabus",
        name: "Course Syllabus",
        url: "#",
      },
      {
        type: "video",
        name: "Workshop Recordings",
        url: "#",
      },
      {
        type: "link",
        name: "Project Guidelines",
        url: "#",
      },
    ],
  },
  {
    id: 5,
    code: "MATH 301",
    name: "Linear Algebra",
    instructor: "Dr. Jennifer Lee",
    instructorEmail: "jennifer.lee@university.edu",
    instructorPhone: "+1 (555) 567-8901",
    credits: 3,
    semester: "1st Semester",
    year: "2024-2025",
    schedule: [
      {
        day: "Monday",
        time: "11:00 AM - 12:30 PM",
        room: "Room 201, Building D",
        type: "Lecture",
      },
      {
        day: "Wednesday",
        time: "11:00 AM - 12:30 PM",
        room: "Room 201, Building D",
        type: "Lecture",
      },
    ],
    grade: "A-",
    color: "bg-pink-500",
    units: 3,
    courseType: "Lecture",
    enrollmentDate: "August 15, 2024",
    totalStudents: 35,
    resources: [
      {
        type: "syllabus",
        name: "Course Syllabus",
        url: "#",
      },
      {
        type: "link",
        name: "Problem Sets",
        url: "#",
      },
      {
        type: "link",
        name: "Solution Manual",
        url: "#",
      },
    ],
  },
  // Previous year subjects
  {
    id: 6,
    code: "CS 201",
    name: "Data Structures",
    instructor: "Prof. Robert Chen",
    instructorEmail: "robert.chen@university.edu",
    instructorPhone: "+1 (555) 678-9012",
    credits: 4,
    semester: "2nd Semester",
    year: "2023-2024",
    schedule: [
      {
        day: "Monday",
        time: "10:00 AM - 11:30 AM",
        room: "Room 105, Building A",
        type: "Lecture",
      },
      {
        day: "Wednesday",
        time: "10:00 AM - 11:30 AM",
        room: "Room 105, Building A",
        type: "Lecture",
      },
    ],
    grade: "A",
    color: "bg-cyan-500",
    units: 4,
    courseType: "Lecture",
    enrollmentDate: "January 10, 2024",
    totalStudents: 48,
    resources: [
      {
        type: "syllabus",
        name: "Course Syllabus",
        url: "#",
      },
    ],
  },
];

export default function SubjectsPage() {
  const router = useRouter();
  const { sessionClaims, isLoaded } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("2024-2025");
  const [selectedSubject, setSelectedSubject] = useState<
    (typeof subjects)[0] | null
  >(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Redirect faculty users to their classes page
  useEffect(() => {
    if (isLoaded) {
      const userRole = (sessionClaims?.metadata as { role?: string })?.role;
      if (userRole === "faculty") {
        router.push("/dashboard/faculty/classes");
      }
    }
  }, [isLoaded, sessionClaims, router]);

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subject.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSemester =
      semesterFilter === "all" || subject.semester === semesterFilter;

    const matchesYear = yearFilter === "all" || subject.year === yearFilter;

    return matchesSearch && matchesSemester && matchesYear;
  });

  const handleSubjectClick = (subject: (typeof subjects)[0]) => {
    setSelectedSubject(subject);
    setModalOpen(true);
  };

  const currentYearSubjects = filteredSubjects.filter(
    (s) => s.year === yearFilter,
  );
  const totalCredits = currentYearSubjects.reduce(
    (sum, s) => sum + s.credits,
    0,
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Subjects</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view your enrolled subjects
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
                  placeholder="Search subjects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="School Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2022-2023">2022-2023</SelectItem>
                </SelectContent>
              </Select>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  <SelectItem value="1st Semester">1st Semester</SelectItem>
                  <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Summary Stats */}
            <div className="flex items-center gap-6 pt-2 border-t">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <span className="font-semibold">
                    {filteredSubjects.length}
                  </span>{" "}
                  Subject{filteredSubjects.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  <span className="font-semibold">{totalCredits}</span> Total
                  Credits
                </span>
              </div>
              {yearFilter !== "all" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    School Year:{" "}
                    <span className="font-medium text-foreground">
                      {yearFilter}
                    </span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subject List */}
      <div className="space-y-3">
        {filteredSubjects.map((subject) => (
          <Card
            key={subject.id}
            className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
            onClick={() => handleSubjectClick(subject)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Color Indicator */}
                <div
                  className={`w-1.5 h-full rounded-full ${subject.color} min-h-[80px]`}
                />

                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">
                          {subject.code}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {subject.credits} Credits
                        </Badge>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">
                          {subject.grade}
                        </Badge>
                      </div>
                      <p className="text-base font-medium text-foreground mb-1">
                        {subject.name}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{subject.instructor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{subject.schedule[0].day}</span>
                      <Clock className="h-3.5 w-3.5 ml-2" />
                      <span className="truncate">
                        {subject.schedule[0].time}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span className="truncate">
                        {subject.schedule[0].room}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No subjects found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your filters or search query
            </p>
          </CardContent>
        </Card>
      )}

      {/* Subject Detail Modal */}
      <SubjectDetailModal
        subject={selectedSubject}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
