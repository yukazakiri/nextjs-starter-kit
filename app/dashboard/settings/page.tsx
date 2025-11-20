"use client";

import dynamic from "next/dynamic";

const UserProfile = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.UserProfile),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center p-6">
        <div className="w-full max-w-2xl h-96 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    ),
  }
);

export default function SettingsPage() {
  return (
    <div className="flex justify-center p-6">
      <UserProfile routing="hash" />
    </div>
  );
}
