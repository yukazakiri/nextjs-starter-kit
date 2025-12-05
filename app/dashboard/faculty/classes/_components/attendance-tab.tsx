"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Users, UserCheck, Clock, Save } from "lucide-react";
import { format } from "date-fns";

interface AttendanceTabProps {
  classId: string;
  enrolledStudents: any[];
}

export function AttendanceTab({ classId, enrolledStudents = [] }: AttendanceTabProps) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});

  // Get today's attendance records (in a real app, fetch from API)
  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = () => {
    // TODO: Save attendance records to API
    // console.log("Saving attendance:", { classId, date: selectedDate, records: attendanceRecords });
    alert("Attendance saved successfully!");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Attendance</h2>
          <p className="text-sm text-muted-foreground">Track student attendance for your class</p>
        </div>

        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Student List</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {enrolledStudents.length} students
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {enrolledStudents.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Students</h3>
              <p className="text-sm text-muted-foreground">
                No students are enrolled in this class yet.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b">
                <span className="w-8">#</span>
                <span className="flex-1">Student Name</span>
                <span className="w-40 text-center">Status</span>
                <span className="w-16 text-center">Select</span>
              </div>

              <div className="space-y-2">
                {enrolledStudents.map((student, index) => (
                  <div
                    key={student?.id || index}
                    className="flex items-center gap-2 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <span className="w-8 text-sm text-muted-foreground">{index + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {student?.first_name} {student?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {student?.student_number || `Student #${index + 1}`}
                      </p>
                    </div>

                    <div className="w-40 flex items-center justify-center gap-1">
                      <Button
                        size="sm"
                        variant={attendanceRecords[student.id] === 'present' ? 'default' : 'outline'}
                        className="h-7 text-xs"
                        onClick={() => handleAttendanceChange(student.id, 'present')}
                      >
                        <UserCheck className="h-3 w-3 mr-1" />
                        Present
                      </Button>
                      <Button
                        size="sm"
                        variant={attendanceRecords[student.id] === 'late' ? 'default' : 'outline'}
                        className="h-7 text-xs"
                        onClick={() => handleAttendanceChange(student.id, 'late')}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        Late
                      </Button>
                      <Button
                        size="sm"
                        variant={attendanceRecords[student.id] === 'absent' ? 'destructive' : 'outline'}
                        className="h-7 text-xs"
                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                      >
                        Absent
                      </Button>
                    </div>

                    <div className="w-16 flex justify-center">
                      <Checkbox
                        checked={attendanceRecords[student.id] === 'present'}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            handleAttendanceChange(student.id, 'present');
                          }
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-primary"></div>
                    <span className="text-muted-foreground">
                      Present: {Object.values(attendanceRecords).filter(s => s === 'present').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                    <span className="text-muted-foreground">
                      Late: {Object.values(attendanceRecords).filter(s => s === 'late').length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span className="text-muted-foreground">
                      Absent: {Object.values(attendanceRecords).filter(s => s === 'absent').length}
                    </span>
                  </div>
                </div>

                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Attendance
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
