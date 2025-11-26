"use client";

import * as React from "react";
import {
  BookOpen,
  Calendar as CalendarIcon,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  GraduationCap,
  HelpCircle,
  HomeIcon,
  Library,
  Megaphone,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";

import { Calendars } from "@/components/calendars";
import { DatePicker } from "@/components/date-picker";
import UserProfile from "@/components/user-profile";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";

// This is sample data for calendars.
const data = {
  calendars: [
    {
      name: "My Calendars",
      items: ["Personal", "Work", "Family"],
    },
    {
      name: "Favorites",
      items: ["Holidays", "Birthdays"],
    },
    {
      name: "Other",
      items: ["Travel", "Reminders", "Deadlines"],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const router = useRouter();
  const { has } = useAuth();
  const { user } = useUser();

  // Get user role from publicMetadata
  const userRole = user?.publicMetadata?.role as string | undefined;
  console.log("[SIDEBAR] User role:", userRole);
  // Check if user has calendar access permission
  const hasCalendarAccess = has?.({
    permission: "school_calendar:calendar_access",
  });

  // Student navigation sections
  const studentNavSections = [
    {
      items: [
        {
          label: "Home",
          href: "/dashboard/student",
          icon: HomeIcon,
        },
        {
          label: "My Subjects",
          href: "/dashboard/subjects",
          icon: BookOpen,
        },
        {
          label: "Grades",
          href: "/dashboard/grades",
          icon: GraduationCap,
        },
        {
          label: "Education History",
          href: "/dashboard/education-history",
          icon: ClipboardCheck,
        },
        {
          label: "Attendance",
          href: "/dashboard/attendance",
          icon: ClipboardList,
        },
        {
          label: "Teachers",
          href: "/dashboard/teachers",
          icon: Users,
        },
        ...(hasCalendarAccess
          ? [
              {
                label: "Schedule",
                href: "/dashboard/schedule",
                icon: CalendarIcon,
              },
            ]
          : []),
      ],
    },
    {
      title: "Additional Features",
      items: [
        {
          label: "Assignments",
          href: "/dashboard/assignments",
          icon: ClipboardList,
        },
        {
          label: "Payments",
          href: "/dashboard/payments",
          icon: CreditCard,
        },
        {
          label: "Library",
          href: "/dashboard/library",
          icon: Library,
        },
        {
          label: "Announcements",
          href: "/dashboard/announcements",
          icon: Megaphone,
        },
      ],
    },
  ];

  // Faculty navigation sections
  const facultyNavSections = [
    {
      items: [
        {
          label: "Home",
          href: "/dashboard/faculty",
          icon: HomeIcon,
        },
        {
          label: "My Classes",
          href: "/dashboard/faculty/classes",
          icon: BookOpen,
        },
        {
          label: "Students",
          href: "/dashboard/faculty/students",
          icon: Users,
        },
        {
          label: "Grades",
          href: "/dashboard/faculty/grades",
          icon: GraduationCap,
        },
        {
          label: "Attendance",
          href: "/dashboard/faculty/attendance",
          icon: ClipboardList,
        },
        ...(hasCalendarAccess
          ? [
              {
                label: "Schedule",
                href: "/dashboard/faculty/schedule",
                icon: CalendarIcon,
              },
            ]
          : []),
      ],
    },
    {
      title: "Additional Features",
      items: [
        {
          label: "Assignments",
          href: "/dashboard/faculty/assignments",
          icon: ClipboardList,
        },
        {
          label: "Announcements",
          href: "/dashboard/faculty/announcements",
          icon: Megaphone,
        },
      ],
    },
  ];

  // Select navigation sections based on user role
  const navSections =
    userRole === "faculty" ? facultyNavSections : studentNavSections;

  const accountItems = [
    {
      label: "Profile",
      href: "/dashboard/profile",
      icon: UserCircle,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
    {
      label: "Help & Support",
      href: "/dashboard/help",
      icon: HelpCircle,
    },
  ];

  return (
    <Sidebar {...props}>
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold text-lg hover:cursor-pointer"
          >
            <span>DCCPHub</span>
          </Link>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {hasCalendarAccess && (
          <>
            <DatePicker />
            <SidebarSeparator className="mx-0" />
            <Calendars calendars={data.calendars} />
            <SidebarSeparator className="mx-0" />
          </>
        )}

        {navSections.map((section, idx) => (
          <SidebarGroup key={idx}>
            {section.title && (
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      onClick={() => router.push(item.href)}
                      isActive={pathname === item.href}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    onClick={() => router.push(item.href)}
                    isActive={pathname === item.href}
                  >
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="p-2">
          <UserProfile />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
