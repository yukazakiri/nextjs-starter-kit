"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserPlus, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@clerk/nextjs";

interface Person {
  id: string;
  name: string;
  avatar?: string;
  role: "teacher" | "student";
}

export function PeopleTab() {
  const params = useParams();
  const { user } = useUser();
  const [students, setStudents] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  const classId = params?.classId as string;
  const facultyId = user?.publicMetadata?.facultyId as string | undefined;

  useEffect(() => {
    async function fetchStudents() {
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
          const mappedStudents = (data.students || []).map((s: any) => ({
            id: s.id,
            name: s.name,
            avatar: s.avatar,
            role: "student",
          }));
          setStudents(mappedStudents);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, [facultyId, classId]);

  const teachers: Person[] = [
    {
      id: "teacher-1",
      name: user?.fullName || "Faculty",
      avatar: user?.imageUrl,
      role: "teacher",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Teachers Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-medium text-primary">Teachers</h2>
          <Button variant="ghost" size="icon" className="rounded-full text-primary">
            <UserPlus className="h-5 w-5" />
          </Button>
        </div>
        <Separator className="bg-primary/20 mb-4" />
        <div className="space-y-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={teacher.avatar} />
                  <AvatarFallback>{teacher.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{teacher.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Students Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-medium text-primary">Students</h2>
            <span className="text-sm text-muted-foreground font-medium mt-1">
              {students.length} students
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-primary">
              <UserPlus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <Separator className="bg-primary/20 mb-4" />
        
        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Loading students...</div>
        ) : students.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No students enrolled yet
          </div>
        ) : (
          <div className="space-y-1">
            {students.map((student) => (
              <div
                key={student.id}
                className="flex items-center justify-between py-3 px-2 hover:bg-muted/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>{student.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sm">{student.name}</span>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
