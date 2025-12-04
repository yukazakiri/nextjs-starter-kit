"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, FileText, CalendarCheck } from "lucide-react";
import Link from "next/link";

export function QuickActions() {
    const actions = [
        {
            title: "My Classes",
            description: "Manage courses",
            icon: BookOpen,
            href: "/dashboard/faculty/classes",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Students",
            description: "View records",
            icon: Users,
            href: "/dashboard/faculty/students",
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Grades",
            description: "Submit grades",
            icon: FileText,
            href: "/dashboard/faculty/grades",
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
        {
            title: "Attendance",
            description: "Mark present",
            icon: CalendarCheck,
            href: "/dashboard/faculty/attendance",
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
    ];

    return (
        <Card className="border-none shadow-sm bg-card/50 backdrop-blur-sm h-full">
            <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common faculty tasks</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actions.map((action, index) => (
                        <Link
                            key={index}
                            href={action.href}
                            className="flex flex-col items-center justify-center p-6 rounded-xl border bg-background/50 hover:bg-accent/50 hover:border-primary/50 transition-all duration-300 group text-center space-y-3"
                        >
                            <div className={`p-4 rounded-full ${action.bg} group-hover:scale-110 transition-transform duration-300`}>
                                <action.icon className={`h-8 w-8 ${action.color}`} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-base">{action.title}</h3>
                                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
