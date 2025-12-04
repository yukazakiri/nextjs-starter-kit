import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Calendar, Users } from "lucide-react";
import Link from "next/link";
import { getClassColor } from "../_utils/colors";
import { ClassActionsDropdown } from "./class-actions-dropdown";

export interface FacultyClass {
    id: number;
    subjectCode: string;
    subjectName: string;
    section: string;
    semester: string; // Normalized for filtering (e.g., "1st", "2nd")
    originalSemester?: string; // Original format for display (e.g., "1st Semester", "2nd Semester")
    schoolYear: string;
    enrolledStudents: number;
    maximumSlots: number;
    credits: number;
    lecture: number;
    laboratory: number;
    classification: string;
    gradeLevel: string;
    faculty: string;
    department: string;
    color: string;
    status: string;
    progress: number;
    completionRate: number;
    gradeDistribution: Array<{ grade: string; count: number }>;
    schedules: Array<{
        day: string;
        startTime: string;
        endTime: string;
        timeRange: string;
        room: {
            id: string;
            name: string;
            building: string;
            floor: string;
            capacity: string;
        };
    }>;
    formattedSchedule: string;
    isFull: boolean;
    availableSlots: number;
}

interface ClassCardProps {
    classItem: FacultyClass;
    onActionComplete?: () => void;
}

export function ClassCard({ classItem, onActionComplete }: ClassCardProps) {
    const theme = getClassColor(classItem.subjectCode);

    return (
        <Link href={`/dashboard/faculty/classes/${classItem.id}`} className="block group h-full">
            <Card className="h-full flex flex-col overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card group-hover:-translate-y-1">
                {/* Gradient Cover Header */}
                <div
                    className="relative h-32 w-full p-6 flex flex-col justify-between"
                    style={{ background: theme.gradient }}
                >
                    <div className="flex justify-between items-start">
                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm">
                            {classItem.subjectCode}
                        </Badge>

                        <ClassActionsDropdown classItem={classItem} onActionComplete={onActionComplete} />
                    </div>

                    <div className="flex justify-between items-end">
                        <Badge
                            variant="secondary"
                            className="bg-white/90 text-black hover:bg-white font-semibold shadow-sm"
                        >
                            Section {classItem.section}
                        </Badge>
                    </div>
                </div>

                <CardContent className="p-6 flex-1 flex flex-col gap-4">
                    {/* Subject Name */}
                    <div>
                        <h3 className="font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                            {classItem.subjectName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>
                                {classItem.schoolYear} • {classItem.originalSemester || classItem.semester}
                            </span>
                        </div>
                    </div>

                    {/* Progress Information */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Progress</span>
                            <div className="flex items-center gap-2">
                                <div className="w-32 bg-muted rounded-full h-2">
                                    <div
                                        className="h-2 bg-primary rounded-full transition-all duration-500"
                                        style={{ width: `${classItem.progress}%` }}
                                    />
                                </div>
                            </div>
                            <span className="text-sm font-medium">{classItem.progress}%</span>
                        </div>
                    </div>

                    {/* Class Information */}
                    <div className="flex flex-col gap-2">
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                            Students
                        </span>
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-semibold text-foreground">
                                {classItem.enrolledStudents}
                                <span className="text-muted-foreground font-normal text-xs ml-1">
                                    / {classItem.maximumSlots}
                                </span>
                            </span>
                        </div>

                        {/* Schedule Information */}
                        {classItem.schedules && classItem.schedules.length > 0 && (
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                    Schedule
                                </span>
                                <div className="text-sm text-foreground space-y-1">
                                    {classItem.schedules.slice(0, 3).map((schedule, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <Badge
                                                variant="outline"
                                                className="bg-blue-50 text-blue-700 border-blue-200"
                                            >
                                                {schedule.day}
                                            </Badge>
                                            <span className="text-muted-foreground">{schedule.timeRange}</span>
                                            <span className="text-muted-foreground">
                                                {schedule.room.name} ({schedule.room.building})
                                            </span>
                                        </div>
                                    ))}
                                    {classItem.schedules.length > 3 && (
                                        <span className="text-xs text-muted-foreground">
                                            ...and {classItem.schedules.length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                                Credits
                            </span>
                            <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary" />
                                <span className="font-semibold text-foreground">{classItem.credits} Units</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
