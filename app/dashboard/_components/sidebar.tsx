"use client";

import UserProfile from "@/components/user-profile";
import clsx from "clsx";
import {
  BookOpen,
  Calendar,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  HelpCircle,
  HomeIcon,
  Library,
  LucideIcon,
  Megaphone,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    items: [
      {
        label: "Home",
        href: "/dashboard",
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
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: ClipboardList,
      },
      {
        label: "Teachers",
        href: "/dashboard/teachers",
        icon: Users,
      },
      {
        label: "Schedule",
        href: "/dashboard/schedule",
        icon: Calendar,
      },
      {
        label: "Timetable",
        href: "/dashboard/timetable",
        icon: FileText,
      },
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

const accountItems: NavItem[] = [
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

export default function DashboardSideBar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="min-[1024px]:block hidden w-64 border-r h-full bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-[3.45rem] items-center border-b px-4">
          <Link
            prefetch={true}
            className="flex items-center font-semibold hover:cursor-pointer"
            href="/"
          >
            <span>Student Portal</span>
          </Link>
        </div>

        <nav className="flex flex-col h-full justify-between items-start w-full overflow-y-auto">
          <div className="w-full space-y-4 p-4">
            {navSections.map((section, idx) => (
              <div key={idx} className="space-y-1">
                {section.title && (
                  <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {section.title}
                  </h3>
                )}
                {section.items.map((item) => (
                  <div
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={clsx(
                      "flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:cursor-pointer",
                      pathname === item.href
                        ? "bg-primary/10 text-primary hover:bg-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 w-full border-t pt-4">
            <div className="px-4 space-y-1">
              {accountItems.map((item) => (
                <div
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={clsx(
                    "flex items-center w-full gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:cursor-pointer",
                    pathname === item.href
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </div>
              ))}
            </div>
            <UserProfile />
          </div>
        </nav>
      </div>
    </div>
  );
}
