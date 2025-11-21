"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { isValidPhoneNumber } from "react-phone-number-input";

interface StudentData {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  studentId: number;
  birthDate: string;
  address: string;
  courseId: number;
  gender: string;
  age: number;
  academicYear: number;
  status: string;
  contacts: string;
}

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState<"validate" | "complete">("validate");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Validation step data
  const [email, setEmail] = useState("");
  const [studentId, setStudentId] = useState("");

  // Validated student data
  const [validatedStudent, setValidatedStudent] = useState<StudentData | null>(null);

  // Additional required fields
  const [phone, setPhone] = useState("");

  // Check if user already completed onboarding and redirect to dashboard
  useEffect(() => {
    if (isLoaded && user) {
      const hasRequiredInfo =
        user.publicMetadata?.studentId &&
        user.publicMetadata?.dateOfBirth &&
        user.publicMetadata?.phone;

      console.log("[ONBOARDING] User metadata:", {
        studentId: user.publicMetadata?.studentId,
        dateOfBirth: user.publicMetadata?.dateOfBirth,
        phone: user.publicMetadata?.phone,
        hasRequiredInfo,
      });

      // If user already has required info, redirect to dashboard
      if (hasRequiredInfo) {
        console.log("[ONBOARDING] User already completed onboarding, redirecting to dashboard");
        window.location.href = "/dashboard";
        return;
      }

      // Pre-fill email if available from Clerk
      if (user.emailAddresses && user.emailAddresses.length > 0) {
        setEmail(user.emailAddresses[0].emailAddress);
      }
    }
  }, [isLoaded, user]);

  const handleValidateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/students/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, studentId }),
      });

      const data = await response.json();

      if (data.valid) {
        setValidatedStudent(data.student);
        // Pre-fill phone if available from database
        if (data.student.contacts) {
          setPhone(data.student.contacts);
        }
        setStep("complete");
        setMessage({
          type: "success",
          text: `Welcome, ${data.student.firstName} ${data.student.lastName}! Your student record has been verified.`,
        });
      } else {
        setMessage({
          type: "error",
          text: data.error || "Validation failed. Please check your credentials.",
        });
      }
    } catch (error) {
      console.error("Error validating student:", error);
      setMessage({
        type: "error",
        text: "An error occurred. Please try again or contact the School MIS Administration.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validatedStudent) {
      setMessage({ type: "error", text: "Student validation required." });
      return;
    }

    if (!phone || !isValidPhoneNumber(phone)) {
      setMessage({ type: "error", text: "Please enter a valid phone number with country code." });
      return;
    }

    setIsLoading(true);

    try {
      console.log("[ONBOARDING] Starting metadata update...");

      // Update Clerk user metadata via server-side API
      const response = await fetch("/api/students/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            studentId: validatedStudent.studentId.toString(),
            dateOfBirth: validatedStudent.birthDate,
            phone: phone,
            email: validatedStudent.email,
            firstName: validatedStudent.firstName,
            lastName: validatedStudent.lastName,
            middleName: validatedStudent.middleName,
            address: validatedStudent.address,
            courseId: validatedStudent.courseId,
            gender: validatedStudent.gender,
            age: validatedStudent.age,
            academicYear: validatedStudent.academicYear,
            status: validatedStudent.status,
            verifiedAt: new Date().toISOString(),
          },
        }),
      });

      console.log("[ONBOARDING] Response status:", response.status);
      const data = await response.json();
      console.log("[ONBOARDING] Response data:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.error || data.details || "Failed to update profile");
      }

      setMessage({ type: "success", text: "Profile completed successfully! Redirecting to dashboard..." });

      // Shorter wait since middleware now checks currentUser() which has immediate metadata
      console.log("[ONBOARDING] Metadata updated, redirecting...");
      setTimeout(() => {
        console.log("[ONBOARDING] Redirecting to dashboard...");
        // Use window.location for a hard redirect to ensure middleware re-runs
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      console.error("[ONBOARDING] Error completing onboarding:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to complete profile setup. Please try again.",
      });
      setIsLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-800">
            {step === "validate" ? "Verify Your Student Account" : "Complete Your Profile"}
          </CardTitle>
          <CardDescription className="text-base">
            {step === "validate"
              ? "Please enter your Student ID and email to verify your account."
              : "Just one more step! Add your contact information to access the dashboard."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "validate" ? (
            <form onSubmit={handleValidateStudent} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    required
                    disabled={isLoading}
                    className="text-base"
                  />
                  <p className="text-xs text-gray-500">Use the email registered with the school</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="studentId">
                    Student ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentId"
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g., 202400123"
                    required
                    disabled={isLoading}
                    className="text-base"
                  />
                  <p className="text-xs text-gray-500">Enter your numeric student ID</p>
                </div>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-sm flex items-start gap-3 ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{message.text}</p>
                    {message.type === "error" && (
                      <p className="mt-2 text-xs">
                        If you continue to experience issues, please contact the School MIS Administration
                        for assistance with your student account verification.
                      </p>
                    )}
                  </div>
                </div>
              )}

              <Button type="submit" disabled={isLoading} className="w-full text-base py-6" size="lg">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  "Verify Student Account"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCompleteOnboarding} className="space-y-6">
              {/* Display validated student info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-green-800 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Account Verified</span>
                </div>
                <div className="text-sm text-green-700 space-y-1 ml-7">
                  <p>
                    <strong>Name:</strong> {validatedStudent?.firstName} {validatedStudent?.middleName}{" "}
                    {validatedStudent?.lastName}
                  </p>
                  <p>
                    <strong>Student ID:</strong> {validatedStudent?.studentId}
                  </p>
                  <p>
                    <strong>Status:</strong> {validatedStudent?.status || "Active"}
                  </p>
                  {validatedStudent?.academicYear && (
                    <p>
                      <strong>Academic Year:</strong> {validatedStudent?.academicYear}
                    </p>
                  )}
                </div>
              </div>

              {/* Phone number field */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <PhoneInput
                  id="phone"
                  value={phone}
                  onChange={(value) => setPhone(value || "")}
                  placeholder="Enter phone number"
                  required
                  disabled={isLoading}
                  className="text-base"
                />
                <p className="text-xs text-gray-500">
                  Select your country code and enter your contact number (defaults to Philippines +63)
                </p>
              </div>

              {message && (
                <div
                  className={`p-4 rounded-lg text-sm flex items-start gap-3 ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  )}
                  <p className="font-medium">{message.text}</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("validate");
                    setValidatedStudent(null);
                    setMessage(null);
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={isLoading} className="flex-1 text-base py-6" size="lg">
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Completing...
                    </span>
                  ) : (
                    "Complete Profile & Continue"
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
