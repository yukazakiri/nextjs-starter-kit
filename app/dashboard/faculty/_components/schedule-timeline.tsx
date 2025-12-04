"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";

interface ScheduleItem {
    subjectCode: string;
    subjectName: string;
    startTime: string;
    endTime: string;
    room: string;
    section: string;
}

interface ScheduleTimelineProps {
    schedule: ScheduleItem[];
}

export function ScheduleTimeline({ schedule }: ScheduleTimelineProps) {
    return (
        <Card className="h-full border-none shadow-sm bg-card/50 backdrop-blur-sm flex flex-col">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle>Today&apos;s Schedule</CardTitle>
                        <CardDescription>Your classes for today</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                {schedule.length > 0 ? (
                    <div className="relative space-y-0">
                        {schedule.map((item, index) => (
                            <div key={index} className="flex gap-4 pb-6 last:pb-0 relative group">
                                {/* Timeline line */}
                                {index !== schedule.length - 1 && (
                                    <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-border group-hover:bg-primary/50 transition-colors" />
                                )}

                                {/* Time bubble */}
                                <div className="flex-none w-10 pt-1">
                                    <div className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 bg-background rounded-lg border p-4 hover:border-primary/50 transition-colors shadow-sm">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-primary">{item.subjectCode}</h4>
                                            <p className="text-sm font-medium">{item.subjectName}</p>
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md">
                                            {item.section}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>
                                                {item.startTime} - {item.endTime}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" />
                                            <span>{item.room}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                        <div className="p-3 bg-muted rounded-full">
                            <Calendar className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">No classes today</p>
                            <p className="text-sm text-muted-foreground">Enjoy your free time!</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
