"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  BookOpen,
  Mail,
  Phone,
  MapPin,
  Clock,
  Linkedin,
  Twitter,
  Globe,
  Search,
} from "lucide-react";
import { useState } from "react";

interface Teacher {
  id: number;
  name: string;
  title: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  officeHours: string;
  subjects: string[];
  specialization: string[];
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  initials: string;
  color: string;
}

const teachersData: Teacher[] = [
  {
    id: 1,
    name: "Dr. Sarah Smith",
    title: "Associate Professor",
    department: "Computer Science",
    email: "sarah.smith@university.edu",
    phone: "+1 (555) 123-4567",
    office: "Room 301, Building A",
    officeHours: "Mon & Wed, 2:00 PM - 4:00 PM",
    subjects: ["CS 401 - Advanced Web Development"],
    specialization: ["Web Technologies", "Full-Stack Development", "UI/UX Design"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/sarahsmith",
      twitter: "https://twitter.com/drsarahsmith",
      website: "https://sarahsmith.dev",
    },
    initials: "SS",
    color: "bg-blue-500",
  },
  {
    id: 2,
    name: "Prof. Michael Johnson",
    title: "Professor",
    department: "Computer Science",
    email: "michael.johnson@university.edu",
    phone: "+1 (555) 234-5678",
    office: "Room 402, Building A",
    officeHours: "Tue & Thu, 10:00 AM - 12:00 PM",
    subjects: ["CS 305 - Database Systems"],
    specialization: ["Database Management", "SQL", "Data Modeling"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/michaeljohnson",
      website: "https://mjohnson.edu",
    },
    initials: "MJ",
    color: "bg-green-500",
  },
  {
    id: 3,
    name: "Dr. Emily Williams",
    title: "Assistant Professor",
    department: "Computer Science",
    email: "emily.williams@university.edu",
    phone: "+1 (555) 345-6789",
    office: "Room 501, Building C",
    officeHours: "Mon & Wed, 1:00 PM - 3:00 PM",
    subjects: ["CS 450 - Machine Learning"],
    specialization: ["Artificial Intelligence", "Machine Learning", "Deep Learning"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/emilywilliams",
      twitter: "https://twitter.com/drwilliams",
      website: "https://emilywilliams.ai",
    },
    initials: "EW",
    color: "bg-purple-500",
  },
  {
    id: 4,
    name: "Prof. David Brown",
    title: "Professor",
    department: "Computer Science",
    email: "david.brown@university.edu",
    phone: "+1 (555) 456-7890",
    office: "Room 302, Building A",
    officeHours: "Tue & Fri, 3:00 PM - 5:00 PM",
    subjects: ["CS 320 - Software Engineering"],
    specialization: ["Software Architecture", "Agile Methodologies", "DevOps"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/davidbrown",
      website: "https://davidbrown.tech",
    },
    initials: "DB",
    color: "bg-orange-500",
  },
  {
    id: 5,
    name: "Dr. Jennifer Lee",
    title: "Associate Professor",
    department: "Mathematics",
    email: "jennifer.lee@university.edu",
    phone: "+1 (555) 567-8901",
    office: "Room 201, Building D",
    officeHours: "Mon & Wed, 11:00 AM - 1:00 PM",
    subjects: ["MATH 301 - Linear Algebra"],
    specialization: ["Linear Algebra", "Applied Mathematics", "Numerical Analysis"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/jenniferlee",
    },
    initials: "JL",
    color: "bg-pink-500",
  },
  {
    id: 6,
    name: "Prof. Robert Chen",
    title: "Professor",
    department: "Computer Science",
    email: "robert.chen@university.edu",
    phone: "+1 (555) 678-9012",
    office: "Room 105, Building A",
    officeHours: "Tue & Thu, 2:00 PM - 4:00 PM",
    subjects: ["CS 201 - Data Structures"],
    specialization: ["Algorithms", "Data Structures", "Competitive Programming"],
    socialMedia: {
      linkedin: "https://linkedin.com/in/robertchen",
      twitter: "https://twitter.com/profchen",
      website: "https://robertchen.cs",
    },
    initials: "RC",
    color: "bg-cyan-500",
  },
];

export default function TeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = teachersData.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some((subject) =>
        subject.toLowerCase().includes(searchQuery.toLowerCase())
      ) ||
      teacher.specialization.some((spec) =>
        spec.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Teachers</h1>
        <p className="text-muted-foreground mt-2">
          Connect with your instructors and view their information
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, department, subject, or specialization..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className={`h-16 w-16 ${teacher.color}`}>
                  <AvatarFallback className="text-white text-lg font-semibold">
                    {teacher.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">{teacher.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {teacher.title}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    {teacher.department}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Contact Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${teacher.email}`}
                      className="text-primary hover:underline"
                    >
                      {teacher.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.office}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.officeHours}</span>
                  </div>
                </div>
              </div>

              {/* Subjects */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Teaching
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject, idx) => (
                    <Badge key={idx} variant="secondary">
                      {subject}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Specialization</h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.specialization.map((spec, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Social Media */}
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Connect</h4>
                <div className="flex gap-2">
                  {teacher.socialMedia.linkedin && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={teacher.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                  {teacher.socialMedia.twitter && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={teacher.socialMedia.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </a>
                    </Button>
                  )}
                  {teacher.socialMedia.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                    >
                      <a
                        href={teacher.socialMedia.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teachers found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your search query
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
