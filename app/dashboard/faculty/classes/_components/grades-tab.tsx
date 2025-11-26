"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface StudentGrade {
  id: string;
  name: string;
  avatar?: string;
  overallGrade: number | null;
  assignments: {
    id: string;
    title: string;
    score: number | null;
    total: number;
  }[];
}

export function GradesTab() {
  const params = useParams();
  const { user } = useUser();
  const [students, setStudents] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(true);

  const classId = params?.classId as string;
  const facultyId = user?.publicMetadata?.facultyId as string | undefined;

  // Mock assignments for now
  const mockAssignments = [
    { id: "1", title: "Midterm Exam", total: 100 },
    { id: "2", title: "Project 1", total: 50 },
    { id: "3", title: "Quiz 1", total: 20 },
  ];

  useEffect(() => {
    async function fetchGrades() {
      if (!facultyId || !classId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/faculty/classes/${classId}/students?facultyId=${facultyId}`,
        );
        if (response.ok) {
          const data = await response.json();
          // Transform student data to include mock grades for demonstration
          const mappedStudents = (data.students || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            avatar: s.avatar,
            overallGrade: s.grade,
            assignments: mockAssignments.map(a => ({
              ...a,
              score: Math.floor(Math.random() * a.total) // Random score for demo
            }))
          }));
          setStudents(mappedStudents);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchGrades();
  }, [facultyId, classId]);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Loading grades...</div>;
  }

  return (
    <div className="max-w-full overflow-x-auto px-4 sm:px-6">
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[250px] min-w-[200px] border-r bg-muted/30">
                Student
              </TableHead>
              <TableHead className="w-[100px] text-center border-r bg-muted/30">
                Overall Grade
              </TableHead>
              {mockAssignments.map((assignment) => (
                <TableHead
                  key={assignment.id}
                  className="min-w-[120px] text-center border-r last:border-r-0"
                >
                  <div className="flex flex-col py-2">
                    <span className="font-medium text-foreground">
                      {assignment.title}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      out of {assignment.total}
                    </span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="hover:bg-muted/30">
                <TableCell className="font-medium border-r bg-background sticky left-0 z-10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{student.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center border-r font-semibold text-primary">
                  {student.overallGrade ? student.overallGrade.toFixed(2) : "N/A"}
                </TableCell>
                {student.assignments.map((assignment) => (
                  <TableCell
                    key={assignment.id}
                    className="text-center border-r last:border-r-0 p-0"
                  >
                    <div className="h-full w-full py-4 hover:bg-muted/50 transition-colors cursor-pointer">
                      {assignment.score ?? "-"}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
