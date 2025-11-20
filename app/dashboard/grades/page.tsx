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
    AlertCircle,
    CheckCircle2,
    Clock,
    TrendingDown,
    TrendingUp,
    XCircle,
} from "lucide-react";
import { useState } from "react";

interface GradeData {
    id: number;
    subjectCode: string;
    subjectName: string;
    instructor: string;
    credits: number;
    semester: string;
    year: string;
    prelim?: number;
    midterm?: number;
    finals?: number;
    finalGrade?: number;
    letterGrade?: string;
    status: "complete" | "in-progress" | "no-grades" | "failed" | "passed";
    remarks?: string;
}

const gradesData: GradeData[] = [
    {
        id: 1,
        subjectCode: "CS 401",
        subjectName: "Advanced Web Development",
        instructor: "Dr. Sarah Smith",
        credits: 3,
        semester: "1st Semester",
        year: "2024-2025",
        prelim: 92,
        midterm: 88,
        finals: 90,
        finalGrade: 90,
        letterGrade: "A",
        status: "complete",
        remarks: "Excellent performance throughout the semester",
    },
    {
        id: 2,
        subjectCode: "CS 305",
        subjectName: "Database Systems",
        instructor: "Prof. Michael Johnson",
        credits: 4,
        semester: "1st Semester",
        year: "2024-2025",
        prelim: 85,
        midterm: 87,
        finals: 89,
        finalGrade: 87,
        letterGrade: "A-",
        status: "complete",
        remarks: "Strong understanding of database concepts",
    },
    {
        id: 3,
        subjectCode: "CS 450",
        subjectName: "Machine Learning",
        instructor: "Dr. Emily Williams",
        credits: 3,
        semester: "1st Semester",
        year: "2024-2025",
        prelim: 78,
        midterm: 82,
        finals: 85,
        finalGrade: 82,
        letterGrade: "B+",
        status: "complete",
        remarks: "Good progress in understanding ML algorithms",
    },
    {
        id: 4,
        subjectCode: "CS 320",
        subjectName: "Software Engineering",
        instructor: "Prof. David Brown",
        credits: 3,
        semester: "1st Semester",
        year: "2024-2025",
        prelim: 95,
        midterm: 93,
        finals: undefined,
        finalGrade: undefined,
        letterGrade: undefined,
        status: "in-progress",
        remarks: "Finals examination pending",
    },
    {
        id: 5,
        subjectCode: "MATH 301",
        subjectName: "Linear Algebra",
        instructor: "Dr. Jennifer Lee",
        credits: 3,
        semester: "1st Semester",
        year: "2024-2025",
        prelim: undefined,
        midterm: undefined,
        finals: undefined,
        finalGrade: undefined,
        letterGrade: undefined,
        status: "no-grades",
        remarks: "Grades not yet uploaded by instructor",
    },
    {
        id: 6,
        subjectCode: "CS 250",
        subjectName: "Algorithms",
        instructor: "Prof. James Wilson",
        credits: 3,
        semester: "1st Semester",
        year: "2024-2025",
        prelim: 65,
        midterm: 68,
        finals: 70,
        finalGrade: 68,
        letterGrade: "D",
        status: "failed",
        remarks: "Below passing grade - Needs improvement",
    },
    {
        id: 7,
        subjectCode: "CS 201",
        subjectName: "Data Structures",
        instructor: "Prof. Robert Chen",
        credits: 4,
        semester: "2nd Semester",
        year: "2023-2024",
        prelim: 88,
        midterm: 90,
        finals: 92,
        finalGrade: 90,
        letterGrade: "A",
        status: "complete",
        remarks: "Excellent grasp of data structures",
    },
];

export default function GradesPage() {
    const [semesterFilter, setSemesterFilter] = useState("1st Semester");
    const [yearFilter, setYearFilter] = useState("2024-2025");

    // Filter grades based on selected semester and year
    const filteredGrades = gradesData.filter((grade) => {
        const matchesSemester = semesterFilter === "all" || grade.semester === semesterFilter;
        const matchesYear = yearFilter === "all" || grade.year === yearFilter;
        return matchesSemester && matchesYear;
    });

    const completedSubjects = filteredGrades.filter((g) => g.status === "complete");
    const totalCredits = filteredGrades.reduce((sum, g) => sum + g.credits, 0);
    const earnedCredits = completedSubjects.reduce((sum, g) => sum + g.credits, 0);

    // Calculate GPA (only for completed subjects)
    const gpaSubjects = completedSubjects.filter(g => g.finalGrade && g.finalGrade >= 75);
    const gpa = gpaSubjects.length > 0
        ? (gpaSubjects.reduce((sum, g) => {
            const grade = g.finalGrade || 0;
            if (grade >= 90) return sum + 4.0;
            if (grade >= 85) return sum + 3.5;
            if (grade >= 80) return sum + 3.0;
            if (grade >= 75) return sum + 2.5;
            return sum + 2.0;
        }, 0) / gpaSubjects.length).toFixed(2)
        : "N/A";

    const getStatusBadge = (status: GradeData["status"]) => {
        switch (status) {
            case "complete":
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                    </Badge>
                );
            case "in-progress":
                return (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <Clock className="h-3 w-3 mr-1" />
                        In Progress
                    </Badge>
                );
            case "no-grades":
                return (
                    <Badge variant="secondary">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        No Grades
                    </Badge>
                );
            case "failed":
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle className="h-3 w-3 mr-1" />
                        Failed
                    </Badge>
                );
            case "passed":
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Passed
                    </Badge>
                );
        }
    };

    const getGradeColor = (grade?: number) => {
        if (!grade) return "text-muted-foreground";
        if (grade >= 90) return "text-green-600 dark:text-green-400";
        if (grade >= 85) return "text-blue-600 dark:text-blue-400";
        if (grade >= 80) return "text-yellow-600 dark:text-yellow-400";
        if (grade >= 75) return "text-orange-600 dark:text-orange-400";
        return "text-red-600 dark:text-red-400";
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Grades</h1>
                    <p className="text-muted-foreground mt-2">
                        View your academic performance
                    </p>
                </div>
                <div className="flex gap-3">
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="School Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            <SelectItem value="2024-2025">2024-2025</SelectItem>
                            <SelectItem value="2023-2024">2023-2024</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                        <SelectTrigger className="w-[160px]">
                            <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            <SelectItem value="1st Semester">1st Semester</SelectItem>
                            <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Current GPA
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{gpa}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Out of 4.0
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Credits Earned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{earnedCredits}/{totalCredits}</div>
                        <Progress value={(earnedCredits / totalCredits) * 100} className="h-2 mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{completedSubjects.length}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Out of {filteredGrades.length} subjects
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-600" />
                            <span className="text-lg font-semibold">On Track</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Good academic standing
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Grades Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Subject Grades</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Code</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="text-center">Prelim</TableHead>
                                    <TableHead className="text-center">Midterm</TableHead>
                                    <TableHead className="text-center">Finals</TableHead>
                                    <TableHead className="text-center">Final Grade</TableHead>
                                    <TableHead className="text-center">Letter</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredGrades.map((grade) => (
                                    <TableRow key={grade.id}>
                                        <TableCell className="font-medium">{grade.subjectCode}</TableCell>
                                        <TableCell>
                                            <div>
                                                <div className="font-medium">{grade.subjectName}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {grade.instructor} • {grade.credits} Credits
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {grade.prelim ? (
                                                <span className={`font-semibold ${getGradeColor(grade.prelim)}`}>
                                                    {grade.prelim}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {grade.midterm ? (
                                                <span className={`font-semibold ${getGradeColor(grade.midterm)}`}>
                                                    {grade.midterm}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {grade.finals ? (
                                                <span className={`font-semibold ${getGradeColor(grade.finals)}`}>
                                                    {grade.finals}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {grade.finalGrade ? (
                                                <span className={`font-bold text-lg ${getGradeColor(grade.finalGrade)}`}>
                                                    {grade.finalGrade}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {grade.letterGrade ? (
                                                <Badge variant="outline" className="font-semibold">
                                                    {grade.letterGrade}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(grade.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Remarks Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Instructor Remarks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {filteredGrades
                            .filter((g) => g.remarks)
                            .map((grade) => (
                                <div
                                    key={grade.id}
                                    className="flex items-start gap-3 p-3 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold">{grade.subjectCode}</span>
                                            <span className="text-sm text-muted-foreground">
                                                {grade.subjectName}
                                            </span>
                                        </div>
                                        <p className="text-sm">{grade.remarks}</p>
                                    </div>
                                    {grade.status === "failed" && (
                                        <TrendingDown className="h-5 w-5 text-red-500" />
                                    )}
                                    {grade.status === "complete" && grade.finalGrade && grade.finalGrade >= 85 && (
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                    )}
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>

            {/* Legend */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm">Grading Scale</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                            <div className="font-semibold text-green-600">90-100</div>
                            <div className="text-muted-foreground">A (Excellent)</div>
                        </div>
                        <div>
                            <div className="font-semibold text-blue-600">85-89</div>
                            <div className="text-muted-foreground">A- (Very Good)</div>
                        </div>
                        <div>
                            <div className="font-semibold text-yellow-600">80-84</div>
                            <div className="text-muted-foreground">B+ (Good)</div>
                        </div>
                        <div>
                            <div className="font-semibold text-orange-600">75-79</div>
                            <div className="text-muted-foreground">B (Satisfactory)</div>
                        </div>
                        <div>
                            <div className="font-semibold text-red-600">Below 75</div>
                            <div className="text-muted-foreground">Failed</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
