"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { laravelApi, type LaravelGrade } from "@/lib/laravel-api";
import { useUser } from "@clerk/nextjs";
import { Download, Edit, FileText, Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface GradeData {
    id: number;
    subjectCode: string;
    subjectName: string;
    section: string;
    students: LaravelGrade[];
}

export default function FacultyGradesPage() {
    const router = useRouter();
    const { user } = useUser();
    const [classes, setClasses] = useState<GradeData[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Redirect non-faculty users to student dashboard
    useEffect(() => {
        if (user) {
            const userRole = user.publicMetadata?.role as string;
            if (userRole !== "faculty") {
                router.push("/dashboard/student");
                return;
            }

            // Fetch classes and grades
            fetchClassesAndGrades();
        }
    }, [user]);

    const fetchClassesAndGrades = async () => {
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
                setClasses([]);
                return;
            }
            const classData: GradeData[] = [];

            for (const laravelClass of facultyData.data.classes) {
                const grades = await laravelApi.getClassGrades(laravelClass.id);

                classData.push({
                    id: laravelClass.id,
                    subjectCode: laravelClass.subject_code,
                    subjectName: laravelClass.subject_title,
                    section: laravelClass.section,
                    students: grades,
                });
            }

            setClasses(classData);
            if (classData.length > 0) {
                setSelectedClass(classData[0].subjectCode);
            }
        } catch (error) {
            console.error("Error fetching grades from Laravel API:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentClass = classes.find(c => c.subjectCode === selectedClass);
    const filteredStudents =
        currentClass?.students.filter(
            student =>
                student.student_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                student.student_id?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];

    const calculateAverage = (field: keyof LaravelGrade) => {
        if (!currentClass || currentClass.students.length === 0) return "0.0";
        const sum = currentClass.students.reduce((acc, student) => {
            const value = student[field];
            return acc + (typeof value === "number" ? value : 0);
        }, 0);
        return (sum / currentClass.students.length).toFixed(1);
    };

    const getGradeColor = (grade: string) => {
        if (grade === "A" || grade === "A+")
            return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
        if (grade === "A-" || grade === "B+") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
        if (grade === "B" || grade === "B-")
            return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold tracking-tight">Grades Management</h1>
                    <p className="text-muted-foreground mt-2">View and manage student grades for your classes</p>
                </div>
                <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Export Grades
                </Button>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid gap-4 md:grid-cols-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="h-32 animate-pulse bg-muted/20" />
                    ))}
                </div>
            )}

            {!loading && (
                <>
                    {/* Class Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{currentClass?.students.length || 0}</div>
                                <p className="text-xs text-muted-foreground">In {currentClass?.subjectCode}</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Class Average</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{calculateAverage("prelim_grade")}%</div>
                                <p className="text-xs text-muted-foreground">Prelim average</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Final Average</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{calculateAverage("total_average")}%</div>
                                <p className="text-xs text-muted-foreground">Final average</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Filters and Search */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Class" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {classes.map(cls => (
                                                <SelectItem key={cls.subjectCode} value={cls.subjectCode}>
                                                    {cls.subjectCode} - {cls.subjectName} (Section {cls.section})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search students..."
                                            value={searchQuery}
                                            onChange={e => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Grades Table */}
            {!loading && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {currentClass?.subjectCode} - {currentClass?.subjectName}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead className="text-center">Prelim</TableHead>
                                        <TableHead className="text-center">Midterm</TableHead>
                                        <TableHead className="text-center">Finals</TableHead>
                                        <TableHead className="text-center">Average</TableHead>
                                        <TableHead className="text-center">Remarks</TableHead>
                                        <TableHead className="text-center">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredStudents.map(student => (
                                        <TableRow key={student.id}>
                                            <TableCell className="font-medium">{student.student_id}</TableCell>
                                            <TableCell>
                                                {student.first_name} {student.last_name}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.prelim_grade ? `${student.prelim_grade}%` : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.midterm_grade ? `${student.midterm_grade}%` : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.finals_grade ? `${student.finals_grade}%` : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.total_average ? `${student.total_average}%` : "N/A"}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline">{student.remarks || "N/A"}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {filteredStudents.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12">
                                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No students found</h3>
                                <p className="text-muted-foreground text-center">Try adjusting your search query</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Class Summary */}
            {!loading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Grade Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {["A", "B+", "B", "C+", "C"].map(grade => {
                                const count = currentClass?.students.filter(s => s.remarks === grade).length || 0;
                                return (
                                    <div key={grade} className="text-center p-4 border rounded-lg">
                                        <div className="text-2xl font-bold">{count}</div>
                                        <div className="text-sm text-muted-foreground">Grade {grade}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
