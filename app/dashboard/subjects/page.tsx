"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { BookOpen, Calendar, Clock, MapPin, Search, User } from "lucide-react";
import { useState } from "react";
import { SubjectDetailModal } from "./_components/subject-detail-modal";

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
];

export default function SubjectsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [selectedSubject, setSelectedSubject] = useState<typeof subjects[0] | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const filteredSubjects = subjects.filter((subject) => {
        const matchesSearch =
            subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subject.instructor.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSemester =
            semesterFilter === "all" || subject.semester === semesterFilter;

        return matchesSearch && matchesSemester;
    });

    const handleSubjectClick = (subject: typeof subjects[0]) => {
        setSelectedSubject(subject);
        setModalOpen(true);
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold tracking-tight">My Subjects</h1>
                <p className="text-muted-foreground mt-2">
                    Academic Year 2024-2025 • 1st Semester
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search subjects, code, or instructor..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue placeholder="Filter by semester" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Semesters</SelectItem>
                        <SelectItem value="1st Semester">1st Semester</SelectItem>
                        <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Subjects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{filteredSubjects.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Credits
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {filteredSubjects.reduce((sum, s) => sum + s.credits, 0)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Grade
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">A-</div>
                    </CardContent>
                </Card>
            </div>

            {/* Subject Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredSubjects.map((subject) => (
                    <Card
                        key={subject.id}
                        className="cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => handleSubjectClick(subject)}
                    >
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className={`w-1 h-16 rounded ${subject.color}`} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-semibold">{subject.code}</h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {subject.credits} Credits
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-1">
                                                {subject.name}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    {subject.grade}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <User className="h-4 w-4" />
                                <span className="truncate">{subject.instructor}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{subject.schedule[0].day}</span>
                                <Clock className="h-4 w-4 ml-2" />
                                <span>{subject.schedule[0].time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{subject.schedule[0].room}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredSubjects.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No subjects found</h3>
                    <p className="text-muted-foreground">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
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
