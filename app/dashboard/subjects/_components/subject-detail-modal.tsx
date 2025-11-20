"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import {
    Calendar,
    Clock,
    MapPin,
    User,
    Mail,
    Phone,
    BookOpen,
    FileText,
    Video,
    Link as LinkIcon,
    Users,
    GraduationCap,
    CalendarDays,
} from "lucide-react";

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
    schedule: {
        day: string;
        time: string;
        room: string;
        type: string;
    }[];
    grade: string;
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

interface SubjectDetailModalProps {
    subject: Subject | null;
    open: boolean;
    onClose: () => void;
}

export function SubjectDetailModal({
    subject,
    open,
    onClose,
}: SubjectDetailModalProps) {
    if (!subject) return null;

    return (
        <Drawer open={open} onOpenChange={onClose}>
            <DrawerContent className="max-h-[90vh]">
                <div className="mx-auto w-full max-w-4xl overflow-y-auto max-h-[85vh] px-4 pb-6">
                    <DrawerHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <DrawerTitle className="text-2xl">{subject.name}</DrawerTitle>
                                <DrawerDescription className="text-base mt-1">
                                    {subject.code} • {subject.credits} Credits
                                </DrawerDescription>
                            </div>
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                {subject.grade}
                            </Badge>
                        </div>
                    </DrawerHeader>

                    <div className="mt-6 space-y-6">
                        {/* Course Details */}
                        <div>
                            <h3 className="font-semibold mb-3">Course Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Units</p>
                                        <p className="font-medium">{subject.units} Units</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Course Type</p>
                                        <p className="font-medium">{subject.courseType}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Enrollment Date</p>
                                        <p className="font-medium">{subject.enrollmentDate}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                        <p className="text-xs text-muted-foreground">Class Size</p>
                                        <p className="font-medium">{subject.totalStudents} Students</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Instructor Information */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Instructor Information
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-sm">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">{subject.instructor}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <a
                                        href={`mailto:${subject.instructorEmail}`}
                                        className="text-primary hover:underline"
                                    >
                                        {subject.instructorEmail}
                                    </a>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{subject.instructorPhone}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Class Schedule */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Class Schedule
                            </h3>
                            <div className="space-y-3">
                                {subject.schedule.map((session, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-3 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium">{session.day}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {session.type}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    <span>{session.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    <span>{session.room}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator />

                        {/* Course Resources */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Course Resources
                            </h3>
                            <div className="space-y-2">
                                {subject.resources.map((resource, idx) => {
                                    const Icon =
                                        resource.type === "syllabus"
                                            ? FileText
                                            : resource.type === "video"
                                                ? Video
                                                : LinkIcon;
                                    return (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            className="w-full justify-start"
                                            asChild
                                        >
                                            <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                                <Icon className="h-4 w-4 mr-2" />
                                                {resource.name}
                                            </a>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
