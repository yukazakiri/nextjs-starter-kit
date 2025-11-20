"use client";

import { UserProfile } from "@clerk/nextjs";

export default function SettingsPage() {
  return (
    <div className="flex justify-center p-6">
      <UserProfile routing="hash" />
    </div>
  );
}
