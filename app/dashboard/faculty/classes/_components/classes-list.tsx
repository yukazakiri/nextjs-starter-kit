"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Search } from "lucide-react";
import { useState } from "react";
import { ClassCard, type FacultyClass } from "./class-card";

interface ClassesListProps {
    initialClasses: FacultyClass[];
}

export function ClassesList({ initialClasses }: ClassesListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");

    const filteredClasses = initialClasses.filter(classItem => {
        const matchesSearch =
            classItem.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            classItem.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            classItem.section.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSemester = semesterFilter === "all" || classItem.semester === semesterFilter;

        const matchesYear = yearFilter === "all" || classItem.schoolYear === yearFilter;

        return matchesSearch && matchesSemester && matchesYear;
    });

    const uniqueSchoolYears = Array.from(new Set(initialClasses.map(c => c.schoolYear))).filter(Boolean);

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
                    <p className="text-muted-foreground">Manage your classes and view student progress</p>
                </div>
                <Button className="rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Class
                </Button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by subject, code, or section..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 rounded-full bg-muted/50 border-transparent focus:bg-background transition-colors"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Semester" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Semesters</SelectItem>
                            <SelectItem value="1st">1st Semester</SelectItem>
                            <SelectItem value="2nd">2nd Semester</SelectItem>
                            <SelectItem value="summer">Summer</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="School Year" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Years</SelectItem>
                            {uniqueSchoolYears.map(year => (
                                <SelectItem key={year} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Classes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredClasses.map(classItem => (
                    <ClassCard key={classItem.id} classItem={classItem} />
                ))}
            </div>

            {/* Empty State */}
            {filteredClasses.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center">
                        <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No classes found</h3>
                        <p className="text-muted-foreground max-w-md">
                            {searchQuery
                                ? `No classes found matching "${searchQuery}"`
                                : "No classes match the selected filters"}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
