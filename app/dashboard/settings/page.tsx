"use client";

import { UserProfile } from "@clerk/nextjs";
import { StudentInfoForm } from "@/components/student-info-form";

export default function SettingsPage() {
  return (
    <div className="flex justify-center p-6">
      <UserProfile routing="hash">
        <UserProfile.Page
          label="Student Information"
          labelIcon={<span>🎓</span>}
          url="student-info"
        >
          <StudentInfoForm />
        </UserProfile.Page>
      </UserProfile>
    </div>
  );
}
