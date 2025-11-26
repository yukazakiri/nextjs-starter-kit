"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ScheduleItem {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
}

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const timeSlots = [
  "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"
];

export function ClassSchedule() {
  const params = useParams();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const classId = params?.classId as string;

  useEffect(() => {
    async function fetchSchedule() {
      if (!classId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/faculty/classes/${classId}/schedule`);
        if (response.ok) {
          const data = await response.json();
          setSchedule(data.schedule || []);
        }
      } catch (error) {
        console.error("Error fetching schedule:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSchedule();
  }, [classId]);

  const getScheduleAtTime = (day: string, time: string) => {
    return schedule.find((item) => {
      const sessionStart = item.startTime.replace(":", "");
      const sessionEnd = item.endTime.replace(":", "");
      const currentTime = time.replace(":", "");
      return (
        item.dayOfWeek === day &&
        sessionStart <= currentTime &&
        currentTime < sessionEnd
      );
    });
  };

  const getScheduleForDay = (day: string) => {
    return schedule.filter((item) => item.dayOfWeek === day);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading schedule...</p>
        </CardContent>
      </Card>
    );
  }

  if (schedule.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Schedule Set</h3>
          <p className="text-sm text-muted-foreground text-center">
            There is no schedule configured for this class yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Timetable Grid View */}
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
                    <th
                      key={day}
                      className="border p-3 bg-muted/50 text-center font-semibold"
                    >
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
                      const scheduleItem = getScheduleAtTime(day, time);
                      const isStart = scheduleItem && time === scheduleItem.startTime;

                      return (
                        <td
                          key={`${day}-${time}`}
                          className="border p-2 h-16"
                        >
                          {isStart && scheduleItem && (
                            <div className="bg-primary text-primary-foreground rounded p-2 h-full flex flex-col justify-center">
                              <div className="font-semibold text-sm">
                                Class Session
                              </div>
                              <div className="text-xs opacity-90 mt-1 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {scheduleItem.startTime} - {scheduleItem.endTime}
                              </div>
                              {scheduleItem.room && (
                                <div className="text-xs opacity-90 mt-0.5 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {scheduleItem.room}
                                </div>
                              )}
                            </div>
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

      {/* List View */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {daysOfWeek.map((day) => {
              const daySchedule = getScheduleForDay(day);
              if (daySchedule.length === 0) return null;

              return (
                <div key={day} className="space-y-2">
                  <h4 className="font-semibold text-sm text-muted-foreground">
                    {day}
                  </h4>
                  {daySchedule.map((item) => (
                    <Card key={item.id} className="p-4">
                      <div className="space-y-2">
                        <Badge variant="secondary">Class Session</Badge>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                        </div>
                        {item.room && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{item.room}</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
