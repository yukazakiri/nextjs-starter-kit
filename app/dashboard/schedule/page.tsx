"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
} from "lucide-react";
import { useState } from "react";

interface ClassSession {
  id: number;
  subjectCode: string;
  subjectName: string;
  instructor: string;
  type: "Lecture" | "Lab" | "Tutorial";
  room: string;
  startTime: string;
  endTime: string;
  day: string;
  color: string;
}

const scheduleData: ClassSession[] = [
  // Monday
  {
    id: 1,
    subjectCode: "CS 401",
    subjectName: "Advanced Web Development",
    instructor: "Dr. Sarah Smith",
    type: "Lecture",
    room: "Room 301, Building A",
    startTime: "09:00",
    endTime: "10:30",
    day: "Monday",
    color: "bg-blue-500",
  },
  {
    id: 2,
    subjectCode: "MATH 301",
    subjectName: "Linear Algebra",
    instructor: "Dr. Jennifer Lee",
    type: "Lecture",
    room: "Room 201, Building D",
    startTime: "11:00",
    endTime: "12:30",
    day: "Monday",
    color: "bg-pink-500",
  },
  {
    id: 3,
    subjectCode: "CS 450",
    subjectName: "Machine Learning",
    instructor: "Dr. Emily Williams",
    type: "Lecture",
    room: "Room 501, Building C",
    startTime: "14:00",
    endTime: "15:30",
    day: "Monday",
    color: "bg-purple-500",
  },
  // Tuesday
  {
    id: 4,
    subjectCode: "CS 305",
    subjectName: "Database Systems",
    instructor: "Prof. Michael Johnson",
    type: "Lecture",
    room: "Room 402, Building A",
    startTime: "11:00",
    endTime: "12:30",
    day: "Tuesday",
    color: "bg-green-500",
  },
  {
    id: 5,
    subjectCode: "CS 320",
    subjectName: "Software Engineering",
    instructor: "Prof. David Brown",
    type: "Lecture",
    room: "Room 302, Building A",
    startTime: "16:00",
    endTime: "17:30",
    day: "Tuesday",
    color: "bg-orange-500",
  },
  // Wednesday
  {
    id: 6,
    subjectCode: "CS 401",
    subjectName: "Advanced Web Development",
    instructor: "Dr. Sarah Smith",
    type: "Lecture",
    room: "Room 301, Building A",
    startTime: "09:00",
    endTime: "10:30",
    day: "Wednesday",
    color: "bg-blue-500",
  },
  {
    id: 7,
    subjectCode: "MATH 301",
    subjectName: "Linear Algebra",
    instructor: "Dr. Jennifer Lee",
    type: "Lecture",
    room: "Room 201, Building D",
    startTime: "11:00",
    endTime: "12:30",
    day: "Wednesday",
    color: "bg-pink-500",
  },
  {
    id: 8,
    subjectCode: "CS 450",
    subjectName: "Machine Learning",
    instructor: "Dr. Emily Williams",
    type: "Lecture",
    room: "Room 501, Building C",
    startTime: "14:00",
    endTime: "15:30",
    day: "Wednesday",
    color: "bg-purple-500",
  },
  // Thursday
  {
    id: 9,
    subjectCode: "CS 305",
    subjectName: "Database Systems",
    instructor: "Prof. Michael Johnson",
    type: "Lecture",
    room: "Room 402, Building A",
    startTime: "11:00",
    endTime: "12:30",
    day: "Thursday",
    color: "bg-green-500",
  },
  {
    id: 10,
    subjectCode: "CS 305",
    subjectName: "Database Systems",
    instructor: "Prof. Michael Johnson",
    type: "Lab",
    room: "Lab 301, Building B",
    startTime: "14:00",
    endTime: "16:00",
    day: "Thursday",
    color: "bg-green-500",
  },
  // Friday
  {
    id: 11,
    subjectCode: "CS 401",
    subjectName: "Advanced Web Development",
    instructor: "Dr. Sarah Smith",
    type: "Lab",
    room: "Lab 205, Building B",
    startTime: "14:00",
    endTime: "16:00",
    day: "Friday",
    color: "bg-blue-500",
  },
  {
    id: 12,
    subjectCode: "CS 320",
    subjectName: "Software Engineering",
    instructor: "Prof. David Brown",
    type: "Tutorial",
    room: "Room 302, Building A",
    startTime: "10:00",
    endTime: "12:00",
    day: "Friday",
    color: "bg-orange-500",
  },
];

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

export default function SchedulePage() {
  const [viewMode, setViewMode] = useState<"timetable" | "daily">("timetable");

  const getClassesForDay = (day: string) => {
    return scheduleData.filter((session) => session.day === day);
  };

  const getClassAtTime = (day: string, time: string) => {
    return scheduleData.find((session) => {
      const sessionStart = session.startTime.replace(":", "");
      const sessionEnd = session.endTime.replace(":", "");
      const currentTime = time.replace(":", "");
      return session.day === day && sessionStart <= currentTime && currentTime < sessionEnd;
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-2">
            View your weekly class schedule
          </p>
        </div>
        <Select value={viewMode} onValueChange={(value: "timetable" | "daily") => setViewMode(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="timetable">Timetable View</SelectItem>
            <SelectItem value="daily">Column View</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{scheduleData.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lectures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {scheduleData.filter((s) => s.type === "Lecture").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Labs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {scheduleData.filter((s) => s.type === "Lab").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tutorials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {scheduleData.filter((s) => s.type === "Tutorial").length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Timetable View - Clean Table */}
      {viewMode === "timetable" && (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-3 bg-muted/50 text-left font-semibold w-24">
                      Time
                    </th>
                    {daysOfWeek.map((day) => (
                      <th key={day} className="border p-3 bg-muted/50 text-center font-semibold">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((time) => (
                    <tr key={time}>
                      <td className="border p-3 text-sm text-muted-foreground font-medium bg-muted/30">
                        {time}
                      </td>
                      {daysOfWeek.map((day) => {
                        const classSession = getClassAtTime(day, time);
                        const isStart = classSession && time === classSession.startTime;
                        
                        return (
                          <td key={`${day}-${time}`} className="border p-2 h-16">
                            {isStart && classSession && (
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <div
                                    className={`${classSession.color} text-white rounded p-2 cursor-pointer hover:opacity-90 transition-opacity h-full flex items-center justify-center`}
                                  >
                                    <div className="text-center">
                                      <div className="font-semibold text-sm">
                                        {classSession.subjectCode}
                                      </div>
                                      <div className="text-xs opacity-90">
                                        {classSession.startTime} - {classSession.endTime}
                                      </div>
                                    </div>
                                  </div>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-80">
                                  <div className="space-y-3">
                                    <div>
                                      <h4 className="font-semibold text-lg">{classSession.subjectCode}</h4>
                                      <p className="text-sm text-muted-foreground">
                                        {classSession.subjectName}
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2 text-sm">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        <span>{classSession.instructor}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{classSession.startTime} - {classSession.endTime}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-4 w-4 text-muted-foreground" />
                                        <span>{classSession.room}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-sm">
                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                        <Badge variant="secondary">{classSession.type}</Badge>
                                      </div>
                                    </div>
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Column View - Kanban Style */}
      {viewMode === "daily" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {daysOfWeek.map((day) => {
            const dayClasses = getClassesForDay(day).sort((a, b) => 
              a.startTime.localeCompare(b.startTime)
            );
            
            return (
              <Card key={day} className="flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-center text-lg">{day}</CardTitle>
                  <p className="text-xs text-center text-muted-foreground">
                    {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                  </p>
                </CardHeader>
                <CardContent className="flex-1 space-y-3">
                  {dayClasses.length > 0 ? (
                    dayClasses.map((classSession) => (
                      <Card 
                        key={classSession.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`w-1 h-full rounded ${classSession.color} min-h-[60px]`} />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm mb-1">
                                {classSession.subjectCode}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                {classSession.subjectName}
                              </p>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3 text-muted-foreground" />
                                  <span>{classSession.startTime} - {classSession.endTime}</span>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span className="truncate">{classSession.room}</span>
                                </div>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {classSession.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Calendar className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground">No classes</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
