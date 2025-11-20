"use client";

import dynamic from "next/dynamic";

const SignUp = dynamic(
  () => import("@clerk/nextjs").then((mod) => mod.SignUp),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-96 h-96 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    ),
  }
);

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <SignUp />
    </div>
  );
}
