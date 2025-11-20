import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";

const schedule = [
    {
        id: 1,
        course: "Advanced Web Development",
        code: "CS 401",
        time: "9:00 AM - 10:30 AM",
        location: "Room 301",
        type: "Lecture",
        color: "bg-blue-500",
    },
    {
        id: 2,
        course: "Database Systems",
        code: "CS 305",
        time: "11:00 AM - 12:30 PM",
        location: "Lab 205",
        type: "Lab",
        color: "bg-green-500",
    },
    {
        id: 3,
        course: "Machine Learning",
        code: "CS 450",
        time: "2:00 PM - 3:30 PM",
        location: "Room 401",
        type: "Lecture",
        color: "bg-purple-500",
    },
    {
        id: 4,
        course: "Software Engineering",
        code: "CS 320",
        time: "4:00 PM - 5:30 PM",
        location: "Room 302",
        type: "Tutorial",
        color: "bg-orange-500",
    },
];

export function ScheduleWidget() {
    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader>
                <CardTitle>Today&apos;s Schedule</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {schedule.map((item) => (
                        <div
                            key={item.id}
                            className="flex gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
                        >
                            <div className={`w-1 rounded ${item.color}`} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm truncate">{item.course}</h4>
                                    <Badge variant="secondary" className="text-xs">
                                        {item.type}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{item.time}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" />
                                    <span>{item.location}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
