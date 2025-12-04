"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, FileText, TrendingUp } from "lucide-react";

interface StatsCardsProps {
    classCount: number;
    totalStudents: number;
    pendingTasks: number;
    attendanceRate: number;
    semester: string;
}

export function StatsCards({
    classCount,
    totalStudents,
    pendingTasks,
    attendanceRate,
    semester,
}: StatsCardsProps) {
    const stats = [
        {
            title: "My Classes",
            value: classCount,
            description: `${semester === "1" ? "1st" : semester === "2" ? "2nd" : semester} semester classes`,
            icon: BookOpen,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Total Students",
            value: totalStudents,
            description: "Enrolled this semester",
            icon: Users,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Pending Tasks",
            value: pendingTasks,
            description: "Assignments to grade",
            icon: FileText,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: "Attendance Rate",
            value: `${attendanceRate}%`,
            description: "Average across classes",
            icon: TrendingUp,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
                <Card key={index} className="border-none shadow-sm bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                        </CardTitle>
                        <div className={`p-2 rounded-full ${stat.bg}`}>
                            <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stat.description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
