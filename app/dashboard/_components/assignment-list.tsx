import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

const assignments = [
    {
        id: 1,
        title: "Final Project Proposal",
        course: "CS 401",
        dueDate: "2025-11-25",
        status: "pending",
        priority: "high",
    },
    {
        id: 2,
        title: "Database Design Assignment",
        course: "CS 305",
        dueDate: "2025-11-22",
        status: "in-progress",
        priority: "high",
    },
    {
        id: 3,
        title: "ML Model Implementation",
        course: "CS 450",
        dueDate: "2025-11-28",
        status: "pending",
        priority: "medium",
    },
    {
        id: 4,
        title: "Code Review Exercise",
        course: "CS 320",
        dueDate: "2025-11-24",
        status: "in-progress",
        priority: "medium",
    },
    {
        id: 5,
        title: "Weekly Quiz",
        course: "CS 305",
        dueDate: "2025-11-21",
        status: "pending",
        priority: "low",
    },
];

function getDaysUntil(dateString: string) {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

export function AssignmentList() {
    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader>
                <CardTitle>Upcoming Assignments</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {assignments.map((assignment) => {
                        const daysUntil = getDaysUntil(assignment.dueDate);
                        const isUrgent = daysUntil <= 2;

                        return (
                            <div
                                key={assignment.id}
                                className="p-3 border rounded-lg hover:bg-accent transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h4 className="font-medium text-sm leading-tight flex-1">
                                        {assignment.title}
                                    </h4>
                                    {assignment.status === "in-progress" && (
                                        <Badge variant="outline" className="text-xs">
                                            In Progress
                                        </Badge>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <span className="font-medium">{assignment.course}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        <span className={isUrgent ? "text-red-500 font-medium" : ""}>
                                            {isUrgent ? "Due soon" : `${daysUntil} days left`}
                                        </span>
                                    </div>
                                    {assignment.priority === "high" && (
                                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">
                                            High Priority
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
