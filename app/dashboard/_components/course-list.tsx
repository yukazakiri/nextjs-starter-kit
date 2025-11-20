import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const courses = [
    {
        id: 1,
        name: "Advanced Web Development",
        code: "CS 401",
        instructor: "Dr. Smith",
        progress: 75,
        grade: "A",
        color: "bg-blue-500",
    },
    {
        id: 2,
        name: "Database Systems",
        code: "CS 305",
        instructor: "Prof. Johnson",
        progress: 60,
        grade: "A-",
        color: "bg-green-500",
    },
    {
        id: 3,
        name: "Machine Learning",
        code: "CS 450",
        instructor: "Dr. Williams",
        progress: 45,
        grade: "B+",
        color: "bg-purple-500",
    },
    {
        id: 4,
        name: "Software Engineering",
        code: "CS 320",
        instructor: "Prof. Brown",
        progress: 80,
        grade: "A",
        color: "bg-orange-500",
    },
];

export function CourseList() {
    return (
        <Card className="col-span-full lg:col-span-2">
            <CardHeader>
                <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`w-1 h-16 rounded ${course.color}`} />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-semibold truncate">{course.name}</h4>
                                        <Badge variant="outline" className="text-xs">
                                            {course.code}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        {course.instructor}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Progress value={course.progress} className="h-2 flex-1" />
                                        <span className="text-xs text-muted-foreground min-w-[3ch]">
                                            {course.progress}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="ml-4">
                                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                    {course.grade}
                                </Badge>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
