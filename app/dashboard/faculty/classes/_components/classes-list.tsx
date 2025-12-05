"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Plus, Search } from "lucide-react";
import { useState } from "react";
import { ClassCard, type FacultyClass } from "./class-card";
import { useSemester } from "@/contexts/semester-context";

interface ClassesListProps {
    initialClasses: FacultyClass[];
}

export function ClassesList({ initialClasses }: ClassesListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { semester, schoolYear } = useSemester();

    const handleActionComplete = () => {
        setRefreshTrigger(prev => prev + 1);
        // Could also trigger a refetch of data here
    };

    const filteredClasses = initialClasses.filter(classItem => {
        const matchesSearch =
            classItem.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            classItem.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            classItem.section.toLowerCase().includes(searchQuery.toLowerCase());

        // Filter by global academic period
        const matchesSemester = classItem.semester === semester;
        const matchesYear = classItem.schoolYear.includes(schoolYear);

        const matches = matchesSearch && matchesSemester && matchesYear;

        if (!matchesSemester || !matchesYear) {
            console.log(`❌ EXCLUDED: ${classItem.subjectCode} (semester: ${classItem.semester} vs ${semester}, year: ${classItem.schoolYear} vs ${schoolYear})`);
        }

        return matches;
    });

    console.log(`📊 Global Filter Result: showing ${filteredClasses.length} of ${initialClasses.length} classes for ${semester} semester, ${schoolYear} school year`);

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

            {/* Search Section */}
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
            </div>

            {/* Classes Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredClasses.map(classItem => (
                    <ClassCard key={classItem.id} classItem={classItem} onActionComplete={handleActionComplete} />
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
                                : `No classes found for ${semester} semester, ${schoolYear} school year`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Use the academic period selector in the sidebar to change semester or school year
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
