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
    AlertTriangle,
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
} from "lucide-react";
import { useState } from "react";

interface AttendanceRecord {
    id: number;
    subjectCode: string;
    subjectName: string;
    instructor: string;
    semester: string;
    year: string;
    totalSessions: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
    recentRecords: {
        date: string;
        status: "present" | "absent" | "late" | "excused";
    }[];
}

const attendanceData: AttendanceRecord[] = [
    {
        id: 1,
        subjectCode: "CS 401",
        subjectName: "Advanced Web Development",
        instructor: "Dr. Sarah Smith",
        semester: "1st Semester",
        year: "2024-2025",
        totalSessions: 42,
        present: 38,
        absent: 2,
        late: 2,
        excused: 0,
        attendanceRate: 90.5,
        recentRecords: [
            { date: "2024-11-18", status: "present" },
            { date: "2024-11-15", status: "present" },
            { date: "2024-11-13", status: "late" },
            { date: "2024-11-11", status: "present" },
            { date: "2024-11-08", status: "absent" },
        ],
    },
    {
        id: 2,
        subjectCode: "CS 305",
        subjectName: "Database Systems",
        instructor: "Prof. Michael Johnson",
        semester: "1st Semester",
        year: "2024-2025",
        totalSessions: 45,
        present: 43,
        absent: 1,
        late: 1,
        excused: 0,
        attendanceRate: 95.6,
        recentRecords: [
            { date: "2024-11-19", status: "present" },
            { date: "2024-11-17", status: "present" },
            { date: "2024-11-14", status: "present" },
            { date: "2024-11-12", status: "late" },
            { date: "2024-11-10", status: "present" },
        ],
    },
    {
        id: 3,
        subjectCode: "CS 450",
        subjectName: "Machine Learning",
        instructor: "Dr. Emily Williams",
        semester: "1st Semester",
        year: "2024-2025",
        totalSessions: 28,
        present: 24,
        absent: 3,
        late: 1,
        excused: 0,
        attendanceRate: 85.7,
        recentRecords: [
            { date: "2024-11-18", status: "present" },
            { date: "2024-11-16", status: "absent" },
            { date: "2024-11-13", status: "present" },
            { date: "2024-11-11", status: "present" },
            { date: "2024-11-09", status: "late" },
        ],
    },
    {
        id: 4,
        subjectCode: "CS 320",
        subjectName: "Software Engineering",
        instructor: "Prof. David Brown",
        semester: "1st Semester",
        year: "2024-2025",
        totalSessions: 30,
        present: 29,
        absent: 0,
        late: 1,
        excused: 0,
        attendanceRate: 96.7,
        recentRecords: [
            { date: "2024-11-19", status: "present" },
            { date: "2024-11-15", status: "present" },
            { date: "2024-11-12", status: "present" },
            { date: "2024-11-08", status: "late" },
            { date: "2024-11-05", status: "present" },
        ],
    },
    {
        id: 5,
        subjectCode: "MATH 301",
        subjectName: "Linear Algebra",
        instructor: "Dr. Jennifer Lee",
        semester: "1st Semester",
        year: "2024-2025",
        totalSessions: 28,
        present: 22,
        absent: 4,
        late: 0,
        excused: 2,
        attendanceRate: 78.6,
        recentRecords: [
            { date: "2024-11-18", status: "present" },
            { date: "2024-11-16", status: "absent" },
            { date: "2024-11-13", status: "excused" },
            { date: "2024-11-11", status: "present" },
            { date: "2024-11-09", status: "absent" },
        ],
    },
    {
        id: 6,
        subjectCode: "CS 201",
        subjectName: "Data Structures",
        instructor: "Prof. Robert Chen",
        semester: "2nd Semester",
        year: "2023-2024",
        totalSessions: 42,
        present: 40,
        absent: 1,
        late: 1,
        excused: 0,
        attendanceRate: 95.2,
        recentRecords: [
            { date: "2024-05-20", status: "present" },
            { date: "2024-05-18", status: "present" },
            { date: "2024-05-15", status: "present" },
            { date: "2024-05-13", status: "late" },
            { date: "2024-05-10", status: "present" },
        ],
    },
];

export default function AttendancePage() {
    const [semesterFilter, setSemesterFilter] = useState("1st Semester");
    const [yearFilter, setYearFilter] = useState("2024-2025");

    // Filter attendance based on selected semester and year
    const filteredAttendance = attendanceData.filter((record) => {
        const matchesSemester = semesterFilter === "all" || record.semester === semesterFilter;
        const matchesYear = yearFilter === "all" || record.year === yearFilter;
        return matchesSemester && matchesYear;
    });

    // Calculate overall stats
    const totalSessions = filteredAttendance.reduce((sum, r) => sum + r.totalSessions, 0);
    const totalPresent = filteredAttendance.reduce((sum, r) => sum + r.present, 0);
    const totalAbsent = filteredAttendance.reduce((sum, r) => sum + r.absent, 0);
    const totalLate = filteredAttendance.reduce((sum, r) => sum + r.late, 0);
    const totalExcused = filteredAttendance.reduce((sum, r) => sum + r.excused, 0);
    const overallRate = totalSessions > 0 ? ((totalPresent / totalSessions) * 100).toFixed(1) : "0";

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "present":
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Present
                    </Badge>
                );
            case "absent":
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        <XCircle className="h-3 w-3 mr-1" />
                        Absent
                    </Badge>
                );
            case "late":
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                        <Clock className="h-3 w-3 mr-1" />
                        Late
                    </Badge>
                );
            case "excused":
                return (
                    <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        <Calendar className="h-3 w-3 mr-1" />
                        Excused
                    </Badge>
                );
        }
    };

    const getAttendanceColor = (rate: number) => {
        if (rate >= 95) return "text-green-600 dark:text-green-400";
        if (rate >= 85) return "text-blue-600 dark:text-blue-400";
        if (rate >= 75) return "text-yellow-600 dark:text-yellow-400";
        return "text-red-600 dark:text-red-400";
    };

    const getAttendanceStatus = (rate: number) => {
        if (rate >= 95) return { text: "Excellent", color: "bg-green-500" };
        if (rate >= 85) return { text: "Good", color: "bg-blue-500" };
        if (rate >= 75) return { text: "Fair", color: "bg-yellow-500" };
        return { text: "At Risk", color: "bg-red-500" };
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Attendance</h1>
                    <p className="text-muted-foreground mt-2">
                        Track your class attendance and participation
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

            {/* Overall Stats */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Overall Rate
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{overallRate}%</div>
                        <Progress value={parseFloat(overallRate)} className="h-2 mt-2" />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Sessions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalSessions}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Across {filteredAttendance.length} subjects
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Present
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">{totalPresent}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalSessions > 0 ? ((totalPresent / totalSessions) * 100).toFixed(1) : 0}% of total
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Absences
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-red-600">{totalAbsent}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {totalExcused > 0 && `${totalExcused} excused`}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                            <Clock className="h-4 w-4 text-yellow-600" />
                            Late
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-600">{totalLate}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Tardiness count
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Subject Attendance Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Subject Attendance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[120px]">Code</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="text-center">Sessions</TableHead>
                                    <TableHead className="text-center">Present</TableHead>
                                    <TableHead className="text-center">Absent</TableHead>
                                    <TableHead className="text-center">Late</TableHead>
                                    <TableHead className="text-center">Excused</TableHead>
                                    <TableHead className="text-center">Rate</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredAttendance.map((record) => {
                                    const status = getAttendanceStatus(record.attendanceRate);
                                    return (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">{record.subjectCode}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{record.subjectName}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {record.instructor}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold">
                                                {record.totalSessions}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                    {record.present}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-red-600 dark:text-red-400">
                                                    {record.absent}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                                                    {record.late}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {record.excused}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className={`font-bold text-lg ${getAttendanceColor(record.attendanceRate)}`}>
                                                        {record.attendanceRate}%
                                                    </span>
                                                    <Progress value={record.attendanceRate} className="h-1.5 w-16" />
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`${status.color} text-white border-0`}>
                                                    {status.text}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Recent Attendance Records */}
            <div className="grid gap-4 md:grid-cols-2">
                {filteredAttendance.slice(0, 4).map((record) => (
                    <Card key={record.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div>
                                    <CardTitle className="text-base">{record.subjectCode}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {record.subjectName}
                                    </p>
                                </div>
                                <Badge variant="outline" className="font-semibold">
                                    {record.attendanceRate}%
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground mb-3">
                                    Recent Attendance
                                </p>
                                {record.recentRecords.map((attendance, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between py-2 border-b last:border-0"
                                    >
                                        <span className="text-sm">{attendance.date}</span>
                                        {getStatusBadge(attendance.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Warning Section */}
            {totalAbsent > 5 && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
                    <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                                    Attendance Warning
                                </h3>
                                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                                    You have {totalAbsent} absences this semester. Please ensure you maintain
                                    at least 75% attendance to avoid academic penalties.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
