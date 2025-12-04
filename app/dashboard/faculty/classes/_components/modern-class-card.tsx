"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
    Clock,
    Users,
    ArrowRight,
    ClipboardCheck,
    Award,
    Bell,
    MapPin,
    MoreVertical
} from "lucide-react";
import Link from "next/link";
import { FacultyClass } from "./class-card";
import { ClassActionsDropdown } from "./class-actions-dropdown";

interface ModernClassCardProps {
    classItem: FacultyClass;
    viewMode?: "grid" | "list";
}

// Generate a vibrant gradient based on the subject code
function getSubjectGradient(subjectCode: string) {
    const gradients = [
        "linear-gradient(135deg, #FF6B6B 0%, #EE5D5D 100%)", // Red
        "linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%)", // Blue
        "linear-gradient(135deg, #43E97B 0%, #38F9D7 100%)", // Green
        "linear-gradient(135deg, #FA709A 0%, #FEE140 100%)", // Orange/Pink
        "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)", // Purple
        "linear-gradient(135deg, #F6D365 0%, #FDA085 100%)", // Yellow/Orange
    ];

    const index = subjectCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
    return gradients[index];
}

// Helper to get a matching solid color for progress bars etc
function getSubjectColor(subjectCode: string) {
    const colors = [
        "#EE5D5D", // Red
        "#00C6FB", // Blue
        "#38F9D7", // Green
        "#FA709A", // Orange/Pink
        "#764BA2", // Purple
        "#FDA085", // Yellow/Orange
    ];
    const index = subjectCode.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
}


export function ModernClassCard({ classItem, viewMode = "grid" }: ModernClassCardProps) {
    const subjectGradient = getSubjectGradient(classItem.subjectCode);
    const subjectColor = getSubjectColor(classItem.subjectCode);
    const enrollmentPercentage = (classItem.enrolledStudents / classItem.maximumSlots) * 100;
    const isFull = classItem.enrolledStudents >= classItem.maximumSlots;

    // Get the next schedule
    const nextSchedule = classItem.schedules?.[0];

    if (viewMode === "list") {
        return (
            <Card className="group hover:shadow-md transition-all duration-200 border-l-4 overflow-hidden" style={{ borderLeftColor: subjectColor }}>
                <CardContent className="p-4 flex items-center gap-4">
                    <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm"
                        style={{ background: subjectGradient }}
                    >
                        {classItem.subjectCode.substring(0, 3)}
                    </div>

                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4">
                            <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">{classItem.subjectName}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                                <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px]">{classItem.subjectCode}</span>
                                <span>•</span>
                                <span>Section {classItem.section}</span>
                            </p>
                        </div>

                        <div className="hidden md:flex md:col-span-3 flex-col text-sm">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span className="truncate text-xs">
                                    {nextSchedule ? `${nextSchedule.day} ${nextSchedule.timeRange}` : "No Schedule"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="truncate text-xs">{nextSchedule?.room.name || "TBA"}</span>
                            </div>
                        </div>

                        <div className="hidden md:block md:col-span-3">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                                <span className="text-muted-foreground">Enrollment</span>
                                <span className={cn("font-medium", isFull ? "text-destructive" : "text-primary")}>
                                    {classItem.enrolledStudents}/{classItem.maximumSlots}
                                </span>
                            </div>
                            <Progress
                                value={enrollmentPercentage}
                                className="h-2 bg-secondary"
                                style={{ ["--progress-background" as any]: subjectColor } as React.CSSProperties}
                            />
                        </div>

                        <div className="flex items-center justify-end gap-1 md:col-span-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" asChild>
                                            <Link href={`/dashboard/faculty/classes/${classItem.id}?tab=attendance`}>
                                                <ClipboardCheck className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Attendance</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" asChild>
                                <Link href={`/dashboard/faculty/classes/${classItem.id}`}>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>

                            <ClassActionsDropdown classItem={classItem} />
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="group relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border-0 bg-card/50 backdrop-blur-sm ring-1 ring-border/50">
            {/* Decorative Background Blob */}
            <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 blur-3xl transition-opacity group-hover:opacity-20"
                style={{ background: subjectColor }}
            />

            <CardHeader className="p-0">
                <div className="p-5 pb-4 space-y-3 relative">
                    {/* Top Row */}
                    <div className="flex justify-between items-start z-10">
                        <Badge
                            variant="secondary"
                            className="font-mono text-[10px] uppercase tracking-wider bg-background/80 backdrop-blur shadow-sm border-0"
                        >
                            {classItem.subjectCode}
                        </Badge>
                        <ClassActionsDropdown classItem={classItem} />
                    </div>

                    {/* Title Area */}
                    <div className="space-y-1 relative z-10">
                        <Link href={`/dashboard/faculty/classes/${classItem.id}`} className="block group/title">
                            <h3 className="font-bold text-xl leading-tight line-clamp-2 min-h-[3.5rem] group-hover/title:text-primary transition-colors">
                                {classItem.subjectName}
                            </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant="outline" className="text-xs font-normal px-2 py-0.5 h-auto border-primary/20 bg-primary/5 text-primary">
                                Section {classItem.section}
                            </Badge>
                            <span className="text-xs">•</span>
                            <span className="text-xs">{classItem.credits} Units</span>
                        </div>
                    </div>
                </div>

                {/* Gradient Line Separator */}
                <div className="h-[2px] w-full opacity-80" style={{ background: subjectGradient }} />
            </CardHeader>

            <CardContent className="p-5 pt-4 flex-1 flex flex-col gap-5">
                {/* Schedule Card */}
                <div className="bg-secondary/40 rounded-xl p-3 border border-border/50 hover:bg-secondary/60 transition-colors">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-background shadow-sm shrink-0 text-primary">
                            <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate">
                                {nextSchedule ? `${nextSchedule.day}, ${nextSchedule.timeRange}` : "No Schedule"}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">
                                    {nextSchedule ? `${nextSchedule.room.name} (${nextSchedule.room.building})` : "Room TBA"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enrollment Stats */}
                <div className="space-y-2 mt-auto">
                    <div className="flex justify-between items-end text-xs">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Users className="h-3.5 w-3.5" />
                            <span>Students Enrolled</span>
                        </div>
                        <span className={cn("font-bold", isFull ? "text-destructive" : "text-foreground")}>
                            {classItem.enrolledStudents} <span className="text-muted-foreground font-normal">/ {classItem.maximumSlots}</span>
                        </span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${enrollmentPercentage}%`,
                                background: subjectGradient
                            }}
                        />
                    </div>
                </div>
            </CardContent>

            <CardFooter className="p-0 mt-2">
                <div className="grid grid-cols-3 w-full border-t divide-x">
                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-12 rounded-none hover:bg-primary/5 hover:text-primary transition-colors"
                                    asChild
                                >
                                    <Link href={`/dashboard/faculty/classes/${classItem.id}?tab=attendance`}>
                                        <ClipboardCheck className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-medium">Attend</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Take Attendance</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-12 rounded-none hover:bg-primary/5 hover:text-primary transition-colors"
                                    asChild
                                >
                                    <Link href={`/dashboard/faculty/classes/${classItem.id}?tab=grades`}>
                                        <Award className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-medium">Grades</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Manage Grades</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                        <Tooltip delayDuration={0}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="h-12 rounded-none hover:bg-primary/5 hover:text-primary transition-colors"
                                    asChild
                                >
                                    <Link href={`/dashboard/faculty/classes/${classItem.id}?tab=announcements`}>
                                        <Bell className="h-4 w-4 mr-2" />
                                        <span className="text-xs font-medium">Post</span>
                                    </Link>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Post Announcement</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </CardFooter>
        </Card>
    );
}
