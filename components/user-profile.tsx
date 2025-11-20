"use client";

import dynamic from "next/dynamic";

const UserButton = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserButton),
  {
    ssr: false,
    loading: () => <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse" />,
  }
);

export default function UserProfile() {
  return <UserButton />;
}
