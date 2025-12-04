"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import HeroSection from "@/components/homepage/hero-section";

export default function Home() {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const role = user.publicMetadata?.role as string | undefined;
      if (role === "faculty") {
        router.push("/dashboard/faculty");
      } else if (role === "student") {
        router.push("/dashboard/student");
      } else {
        router.push("/onboarding");
      }
    }
  }, [isLoaded, isSignedIn, user, router]);

  // Show loading while checking auth status
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="w-96 h-96 bg-gray-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  // If user is signed in, they'll be redirected above, so show landing page to non-authenticated users
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
      <HeroSection />
    </div>
  );
}
