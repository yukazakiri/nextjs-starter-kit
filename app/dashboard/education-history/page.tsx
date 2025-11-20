"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
    BookOpen,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    Clock,
    Minus,
} from "lucide-react";
import { useState } from "react";
import { SubjectDetailModal } from "../subjects/_components/subject-detail-modal";

type SubjectStatus = "not-started" | "in-progress" | "finished";

interface Subject {
    id: number;
    code: string;
    name: string;
    instructor: string;
    instructorEmail: string;
    instructorPhone: string;
    credits: number;
    semester: string;
    year: string;
    status: SubjectStatus;
    grade?: string;
    schedule: {
        day: string;
        time: string;
        room: string;
        type: string;
    }[];
    color: string;
    units: number;
    courseType: string;
    enrollmentDate: string;
    totalStudents: number;
    resources: {
        type: string;
        name: string;
        url: string;
    }[];
}

const educationHistoryData: Subject[] = [
    // 2024-2025 - Current Year
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
        status: "finished",
        grade: "A",
        schedule: [
            {
                day: "Monday",
                time: "9:00 AM - 10:30 AM",
                room: "Room 301, Building A",
                type: "Lecture",
            },
        ],
        color: "bg-blue-500",
        units: 3,
        courseType: "Lecture & Lab",
        enrollmentDate: "August 15, 2024",
        totalStudents: 45,
        resources: [],
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
        status: "finished",
        grade: "A-",
        schedule: [
            {
                day: "Tuesday",
                time: "11:00 AM - 12:30 PM",
                room: "Room 402, Building A",
                type: "Lecture",
            },
        ],
        color: "bg-green-500",
        units: 4,
        courseType: "Lecture & Lab",
        enrollmentDate: "August 15, 2024",
        totalStudents: 38,
        resources: [],
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
        status: "in-progress",
        grade: undefined,
        schedule: [
            {
                day: "Monday",
                time: "2:00 PM - 3:30 PM",
                room: "Room 501, Building C",
                type: "Lecture",
            },
        ],
        color: "bg-purple-500",
        units: 3,
        courseType: "Lecture",
        enrollmentDate: "August 15, 2024",
        totalStudents: 52,
        resources: [],
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
        status: "in-progress",
        grade: undefined,
        schedule: [
            {
                day: "Tuesday",
                time: "4:00 PM - 5:30 PM",
                room: "Room 302, Building A",
                type: "Lecture",
            },
        ],
        color: "bg-orange-500",
        units: 3,
        courseType: "Lecture & Tutorial",
        enrollmentDate: "August 15, 2024",
        totalStudents: 42,
        resources: [],
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
        status: "not-started",
        grade: undefined,
        schedule: [
            {
                day: "Monday",
                time: "11:00 AM - 12:30 PM",
                room: "Room 201, Building D",
                type: "Lecture",
            },
        ],
        color: "bg-pink-500",
        units: 3,
        courseType: "Lecture",
        enrollmentDate: "August 15, 2024",
        totalStudents: 35,
        resources: [],
    },
    {
        id: 6,
        code: "CS 410",
        name: "Cloud Computing",
        instructor: "Prof. Alex Martinez",
        instructorEmail: "alex.martinez@university.edu",
        instructorPhone: "+1 (555) 678-9012",
        credits: 3,
        semester: "2nd Semester",
        year: "2024-2025",
        status: "not-started",
        grade: undefined,
        schedule: [
            {
                day: "Wednesday",
                time: "1:00 PM - 2:30 PM",
                room: "Room 405, Building A",
                type: "Lecture",
            },
        ],
        color: "bg-indigo-500",
        units: 3,
        courseType: "Lecture & Lab",
        enrollmentDate: "January 10, 2025",
        totalStudents: 40,
        resources: [],
    },
    {
        id: 7,
        code: "CS 425",
        name: "Mobile App Development",
        instructor: "Dr. Rachel Green",
        instructorEmail: "rachel.green@university.edu",
        instructorPhone: "+1 (555) 789-0123",
        credits: 3,
        semester: "2nd Semester",
        year: "2024-2025",
        status: "not-started",
        grade: undefined,
        schedule: [
            {
                day: "Thursday",
                time: "3:00 PM - 4:30 PM",
                room: "Room 302, Building C",
                type: "Lecture",
            },
        ],
        color: "bg-teal-500",
        units: 3,
        courseType: "Lecture & Lab",
        enrollmentDate: "January 10, 2025",
        totalStudents: 48,
        resources: [],
    },

    // 2023-2024 - Previous Year
    {
        id: 8,
        code: "CS 201",
        name: "Data Structures",
        instructor: "Prof. Robert Chen",
        instructorEmail: "robert.chen@university.edu",
        instructorPhone: "+1 (555) 890-1234",
        credits: 4,
        semester: "1st Semester",
        year: "2023-2024",
        status: "finished",
        grade: "A",
        schedule: [
            {
                day: "Monday",
                time: "10:00 AM - 11:30 AM",
                room: "Room 105, Building A",
                type: "Lecture",
            },
        ],
        color: "bg-cyan-500",
        units: 4,
        courseType: "Lecture",
        enrollmentDate: "August 20, 2023",
        totalStudents: 48,
        resources: [],
    },
    {
        id: 9,
        code: "CS 210",
        name: "Algorithms",
        instructor: "Dr. Lisa Wang",
        instructorEmail: "lisa.wang@university.edu",
        instructorPhone: "+1 (555) 901-2345",
        credits: 3,
        semester: "1st Semester",
        year: "2023-2024",
        status: "finished",
        grade: "B+",
        schedule: [
            {
                day: "Tuesday",
                time: "2:00 PM - 3:30 PM",
                room: "Room 203, Building B",
                type: "Lecture",
            },
        ],
        color: "bg-yellow-500",
        units: 3,
        courseType: "Lecture",
        enrollmentDate: "August 20, 2023",
        totalStudents: 50,
        resources: [],
    },
    {
        id: 10,
        code: "CS 220",
        name: "Computer Networks",
        instructor: "Prof. James Wilson",
        instructorEmail: "james.wilson@university.edu",
        instructorPhone: "+1 (555) 012-3456",
        credits: 3,
        semester: "1st Semester",
        year: "2023-2024",
        status: "finished",
        grade: "A-",
        schedule: [
            {
                day: "Wednesday",
                time: "9:00 AM - 10:30 AM",
                room: "Room 304, Building A",
                type: "Lecture",
            },
        ],
        color: "bg-red-500",
        units: 3,
        courseType: "Lecture & Lab",
        enrollmentDate: "August 20, 2023",
        totalStudents: 42,
        resources: [],
    },
    {
        id: 11,
        code: "MATH 201",
        name: "Discrete Mathematics",
        instructor: "Dr. Patricia Brown",
        instructorEmail: "patricia.brown@university.edu",
        instructorPhone: "+1 (555) 123-4567",
        credits: 3,
        semester: "1st Semester",
        year: "2023-2024",
        status: "finished",
        grade: "A",
        schedule: [
            {
                day: "Friday",
                time: "10:00 AM - 11:30 AM",
                room: "Room 102, Building D",
                type: "Lecture",
            },
        ],
        color: "bg-violet-500",
        units: 3,
        courseType: "Lecture",
        enrollmentDate: "August 20, 2023",
        totalStudents: 55,
        resources: [],
    },
    {
        id: 12,
        code: "CS 230",
        name: "Operating Systems",
        instructor: "Prof. Kevin Lee",
        instructorEmail: "kevin.lee@university.edu",
        instructorPhone: "+1 (555) 234-5678",
        credits: 4,
        semester: "2nd Semester",
        year: "2023-2024",
        status: "finished",
        grade: "A",
        schedule: [
            {
                day: "Monday",
                time: "1:00 PM - 2:30 PM",
                room: "Room 401, Building A",
                type: "Lecture",
            },
        ],
        color: "bg-lime-500",
        units: 4,
        courseType: "Lecture & Lab",
        enrollmentDate: "January 15, 2024",
        totalStudents: 46,
        resources: [],
    },
    {
        id: 13,
        code: "CS 240",
        name: "Software Design Patterns",
        instructor: "Dr. Amanda Taylor",
        instructorEmail: "amanda.taylor@university.edu",
        instructorPhone: "+1 (555) 345-6789",
        credits: 3,
        semester: "2nd Semester",
        year: "2023-2024",
        status: "finished",
        grade: "A-",
        schedule: [
            {
                day: "Tuesday",
                time: "3:00 PM - 4:30 PM",
                room: "Room 205, Building C",
                type: "Lecture",
            },
        ],
        color: "bg-emerald-500",
        units: 3,
        courseType: "Lecture",
        enrollmentDate: "January 15, 2024",
        totalStudents: 38,
        resources: [],
    },

    // 2022-2023 - Earlier Year
    {
        id: 14,
        code: "CS 101",
        name: "Introduction to Programming",
        instructor: "Prof. Daniel Kim",
        instructorEmail: "daniel.kim@university.edu",
        instructorPhone: "+1 (555) 456-7890",
        credits: 3,
        semester: "1st Semester",
        year: "2022-2023",
        status: "finished",
        grade: "A",
        schedule: [
            {
                day: "Monday",
                time: "8:00 AM - 9:30 AM",
                room: "Room 101, Building A",
                type: "Lecture",
            },
        ],
        color: "bg-sky-500",
        units: 3,
        courseType: "Lecture & Lab",
        enrollmentDate: "August 22, 2022",
        totalStudents: 60,
        resources: [],
    },
    {
        id: 15,
        code: "CS 102",
        name: "Object-Oriented Programming",
        instructor: "Dr. Michelle Davis",
        instructorEmail: "michelle.davis@university.edu",
        instructorPhone: "+1 (555) 567-8901",
        credits: 4,
        semester: "1st Semester",
        year: "2022-2023",
        status: "finished",
        grade: "A",
        schedule: [
            {
                day: "Wednesday",
                time: "10:00 AM - 11:30 AM",
                room: "Room 202, Building B",
                type: "Lecture",
            },
        ],
        color: "bg-rose-500",
        units: 4,
        courseType: "Lecture & Lab",
        enrollmentDate: "August 22, 2022",
        totalStudents: 55,
        resources: [],
    },
    {
        id: 16,
        code: "MATH 101",
        name: "Calculus I",
        instructor: "Prof. Steven Anderson",
        instructorEmail: "steven.anderson@university.edu",
        instructorPhone: "+1 (555) 678-9012",
        credits: 3,
        semester: "1st Semester",
        year: "2022-2023",
        status: "finished",
        grade: "B+",
        schedule: [
            {
                day: "Tuesday",
                time: "9:00 AM - 10:30 AM",
                room: "Room 101, Building D",
                type: "Lecture",
            },
        ],
        color: "bg-amber-500",
        units: 3,
        courseType: "Lecture",
        enrollmentDate: "August 22, 2022",
        totalStudents: 65,
        resources: [],
    },
    {
        id: 17,
        code: "CS 110",
        name: "Web Development Fundamentals",
        instructor: "Dr. Brian White",
        instructorEmail: "brian.white@university.edu",
        instructorPhone: "+1 (555) 789-0123",
        credits: 3,
        semester: "2nd Semester",
        year: "2022-2023",
        status: "finished",
        grade: "A",
        schedule: [
            {
                day: "Thursday",
                time: "1:00 PM - 2:30 PM",
                room: "Room 303, Building C",
                type: "Lecture",
            },
        ],
        color: "bg-fuchsia-500",
        units: 3,
        courseType: "Lecture & Lab",
        enrollmentDate: "January 16, 2023",
        totalStudents: 50,
        resources: [],
    },
    {
        id: 18,
        code: "MATH 102",
        name: "Calculus II",
        instructor: "Prof. Nancy Garcia",
        instructorEmail: "nancy.garcia@university.edu",
        instructorPhone: "+1 (555) 890-1234",
        credits: 3,
        semester: "2nd Semester",
        year: "2022-2023",
        status: "finished",
        grade: "A-",
        schedule: [
            {
                day: "Friday",
                time: "2:00 PM - 3:30 PM",
                room: "Room 103, Building D",
                type: "Lecture",
            },
        ],
        color: "bg-slate-500",
        units: 3,
        courseType: "Lecture",
        enrollmentDate: "January 16, 2023",
        totalStudents: 58,
        resources: [],
    },
];

export default function EducationHistoryPage() {
    const [yearFilter, setYearFilter] = useState<string>("all");
    const [expandedYears, setExpandedYears] = useState<Set<string>>(
        new Set(["2024-2025"])
    );
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Get unique years sorted in descending order
    const uniqueYears = Array.from(
        new Set(educationHistoryData.map((s) => s.year))
    ).sort((a, b) => b.localeCompare(a));

    // Filter data by year
    const filteredData =
        yearFilter === "all"
            ? educationHistoryData
            : educationHistoryData.filter((s) => s.year === yearFilter);

    // Group subjects by year and semester
    const groupedByYear = filteredData.reduce((acc, subject) => {
        if (!acc[subject.year]) {
            acc[subject.year] = {};
        }
        if (!acc[subject.year][subject.semester]) {
            acc[subject.year][subject.semester] = [];
        }
        acc[subject.year][subject.semester].push(subject);
        return acc;
    }, {} as Record<string, Record<string, Subject[]>>);

    // Calculate overall statistics
    const totalSubjects = filteredData.length;
    const finishedSubjects = filteredData.filter((s) => s.status === "finished").length;
    const inProgressSubjects = filteredData.filter((s) => s.status === "in-progress").length;
    const notStartedSubjects = filteredData.filter((s) => s.status === "not-started").length;

    const toggleYear = (year: string) => {
        const newExpanded = new Set(expandedYears);
        if (newExpanded.has(year)) {
            newExpanded.delete(year);
        } else {
            newExpanded.add(year);
        }
        setExpandedYears(newExpanded);
    };

    const getStatusBadge = (status: SubjectStatus) => {
        switch (status) {
            case "finished":
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Finished
                    </Badge>
                );
            case "in-progress":
                return (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                );
            case "not-started":
                return (
                    <Badge variant="secondary">
                        <Minus className="h-3 w-3 mr-1" />
                        Not Started
                    </Badge>
                );
        }
    };

    const handleSubjectClick = (subject: Subject) => {
        setSelectedSubject(subject);
        setModalOpen(true);
    };

    const getYearProgress = (year: string) => {
        const yearSubjects = educationHistoryData.filter((s) => s.year === year);
        const finished = yearSubjects.filter((s) => s.status === "finished").length;
        return yearSubjects.length > 0 ? (finished / yearSubjects.length) * 100 : 0;
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Education History
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Track your academic journey across all school years
                    </p>
                </div>
                <Select value={yearFilter} onValueChange={setYearFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="School Year" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Years</SelectItem>
                        {uniqueYears.map((year) => (
                            <SelectItem key={year} value={year}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Summary Statistics */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Subjects
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalSubjects}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across all years
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Finished
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {finishedSubjects}
                        </div>
                        <Progress
                            value={(finishedSubjects / totalSubjects) * 100}
                            className="h-2 mt-2"
                        />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            In Progress
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                            {inProgressSubjects}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Currently enrolled
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Not Started
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-gray-600">
                            {notStartedSubjects}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Upcoming subjects
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Year Tables */}
            <div className="space-y-4">
                {Object.keys(groupedByYear)
                    .sort((a, b) => b.localeCompare(a))
                    .map((year) => {
                        const isExpanded = expandedYears.has(year);
                        const yearProgress = getYearProgress(year);
                        const yearSubjects = educationHistoryData.filter(
                            (s) => s.year === year
                        );
                        const yearFinished = yearSubjects.filter(
                            (s) => s.status === "finished"
                        ).length;

                        return (
                            <Card key={year}>
                                <CardHeader
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => toggleYear(year)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-xl">
                                                    School Year {year}
                                                </CardTitle>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                                ) : (
                                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 mt-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {yearFinished} of {yearSubjects.length} subjects
                                                    completed
                                                </p>
                                                <Progress
                                                    value={yearProgress}
                                                    className="h-2 w-48"
                                                />
                                                <span className="text-sm font-medium">
                                                    {Math.round(yearProgress)}%
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>

                                {isExpanded && (
                                    <CardContent className="pt-0">
                                        {Object.keys(groupedByYear[year])
                                            .sort()
                                            .map((semester) => (
                                                <div key={semester} className="mb-6 last:mb-0">
                                                    <h3 className="text-lg font-semibold mb-3 px-2">
                                                        {semester}
                                                    </h3>
                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead className="w-[120px]">
                                                                        Code
                                                                    </TableHead>
                                                                    <TableHead>Subject Name</TableHead>
                                                                    <TableHead className="text-center">
                                                                        Credits
                                                                    </TableHead>
                                                                    <TableHead>Instructor</TableHead>
                                                                    <TableHead className="text-center">
                                                                        Status
                                                                    </TableHead>
                                                                    <TableHead className="text-center">
                                                                        Grade
                                                                    </TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {groupedByYear[year][semester].map(
                                                                    (subject) => (
                                                                        <TableRow
                                                                            key={subject.id}
                                                                            className="cursor-pointer hover:bg-muted/50"
                                                                            onClick={() =>
                                                                                handleSubjectClick(subject)
                                                                            }
                                                                        >
                                                                            <TableCell className="font-medium">
                                                                                {subject.code}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div>
                                                                                    <div className="font-medium">
                                                                                        {subject.name}
                                                                                    </div>
                                                                                    <div className="text-xs text-muted-foreground">
                                                                                        {subject.courseType}
                                                                                    </div>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="text-center">
                                                                                {subject.credits}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <div className="text-sm">
                                                                                    {subject.instructor}
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="text-center">
                                                                                {getStatusBadge(subject.status)}
                                                                            </TableCell>
                                                                            <TableCell className="text-center">
                                                                                {subject.grade ? (
                                                                                    <Badge
                                                                                        variant="outline"
                                                                                        className="font-semibold"
                                                                                    >
                                                                                        {subject.grade}
                                                                                    </Badge>
                                                                                ) : (
                                                                                    <span className="text-muted-foreground">
                                                                                        -
                                                                                    </span>
                                                                                )}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    )
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </div>
                                            ))}
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
            </div>

            {Object.keys(groupedByYear).length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                            No education history found
                        </h3>
                        <p className="text-muted-foreground text-center">
                            Try adjusting your filters
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
