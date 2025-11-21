"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PhoneInput } from "@/components/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";

interface StudentInfo {
  studentId: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  dateOfBirth: string;
  major: string;
  yearLevel: string;
  enrollmentDate: string;
  gpa: string;
}

interface ValidationErrors {
  [key: string]: string;
}

export function StudentInfoForm() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Get current values from user's public metadata
  const currentData: StudentInfo = {
    studentId: (user?.publicMetadata?.studentId as string) || "",
    phone: (user?.publicMetadata?.phone as string) || "",
    address: (user?.publicMetadata?.address as string) || "",
    emergencyContact: (user?.publicMetadata?.emergencyContact as string) || "",
    emergencyPhone: (user?.publicMetadata?.emergencyPhone as string) || "",
    dateOfBirth: (user?.publicMetadata?.dateOfBirth as string) || "",
    major: (user?.publicMetadata?.major as string) || "",
    yearLevel: (user?.publicMetadata?.yearLevel as string) || "",
    enrollmentDate: (user?.publicMetadata?.enrollmentDate as string) || "",
    gpa: (user?.publicMetadata?.gpa as string) || "",
  };

  const [formData, setFormData] = useState<StudentInfo>(currentData);

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        studentId: (user.publicMetadata?.studentId as string) || "",
        phone: (user.publicMetadata?.phone as string) || "",
        address: (user.publicMetadata?.address as string) || "",
        emergencyContact: (user.publicMetadata?.emergencyContact as string) || "",
        emergencyPhone: (user.publicMetadata?.emergencyPhone as string) || "",
        dateOfBirth: (user.publicMetadata?.dateOfBirth as string) || "",
        major: (user.publicMetadata?.major as string) || "",
        yearLevel: (user.publicMetadata?.yearLevel as string) || "",
        enrollmentDate: (user.publicMetadata?.enrollmentDate as string) || "",
        gpa: (user.publicMetadata?.gpa as string) || "",
      });
    }
  }, [user]);

  // Validation functions
  const validateStudentId = (value: string): string => {
    if (!value.trim()) return "Student ID is required";
    if (value.length < 4) return "Student ID must be at least 4 characters";
    return "";
  };

  const validatePhone = (value: string): string => {
    if (!value.trim()) return "Phone number is required";
    if (!isValidPhoneNumber(value)) return "Please enter a valid phone number with country code";
    return "";
  };

  const validateDateOfBirth = (value: string): string => {
    if (!value) return "Date of birth is required";
    const birthDate = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13 || age > 100) return "Please enter a valid date of birth";
    return "";
  };

  const validateGPA = (value: string): string => {
    if (!value) return "";
    const gpaNum = parseFloat(value);
    if (isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4.0) {
      return "GPA must be between 0.0 and 4.0";
    }
    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Required field validations
    newErrors.studentId = validateStudentId(formData.studentId);
    newErrors.dateOfBirth = validateDateOfBirth(formData.dateOfBirth);
    newErrors.phone = validatePhone(formData.phone);

    // Optional but validated if filled
    if (formData.emergencyPhone) {
      newErrors.emergencyPhone = validatePhone(formData.emergencyPhone);
    }

    if (formData.gpa) {
      newErrors.gpa = validateGPA(formData.gpa);
    }

    // Remove empty error messages
    const filteredErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== "")
    );

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validate form
    if (!validateForm()) {
      setMessage({ type: "error", text: "Please fix the errors below before saving." });
      return;
    }

    setIsLoading(true);

    try {
      // Update user's public metadata via server-side API
      const response = await fetch("/api/students/update-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata: {
            ...user?.publicMetadata,
            studentId: formData.studentId,
            phone: formData.phone,
            address: formData.address,
            emergencyContact: formData.emergencyContact,
            emergencyPhone: formData.emergencyPhone,
            dateOfBirth: formData.dateOfBirth,
            major: formData.major,
            yearLevel: formData.yearLevel,
            enrollmentDate: formData.enrollmentDate,
            gpa: formData.gpa,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update information");
      }

      setMessage({ type: "success", text: "Student information updated successfully!" });

      // Refresh the page to get updated metadata
      window.location.reload();
    } catch (error) {
      console.error("Error updating student info:", error);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update student information. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof StudentInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Student Information</CardTitle>
        <CardDescription>
          Update your student profile and contact information. Fields marked with * are required.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Personal Information</h3>

            <div className="space-y-2">
              <Label htmlFor="studentId">
                Student ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="studentId"
                type="text"
                value={formData.studentId}
                onChange={(e) => handleChange("studentId", e.target.value)}
                placeholder="e.g., STU-2024-001"
                className={errors.studentId ? "border-red-500" : ""}
                required
              />
              {errors.studentId && (
                <p className="text-sm text-red-600">{errors.studentId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                className={errors.dateOfBirth ? "border-red-500" : ""}
                required
              />
              {errors.dateOfBirth && (
                <p className="text-sm text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <PhoneInput
                id="phone"
                value={formData.phone}
                onChange={(value) => handleChange("phone", value || "")}
                placeholder="Enter phone number"
                className={errors.phone ? "border-red-500" : ""}
                required
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="text-xs text-gray-500">Defaults to Philippines (+63)</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="123 Main St, City, State, ZIP"
              />
            </div>
          </div>

          {/* Academic Information Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Academic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="major">Major / Program</Label>
              <Input
                id="major"
                type="text"
                value={formData.major}
                onChange={(e) => handleChange("major", e.target.value)}
                placeholder="e.g., Computer Science"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="yearLevel">Year Level</Label>
              <Select
                value={formData.yearLevel}
                onValueChange={(value) => handleChange("yearLevel", value)}
              >
                <SelectTrigger id="yearLevel">
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="freshman">Freshman (1st Year)</SelectItem>
                  <SelectItem value="sophomore">Sophomore (2nd Year)</SelectItem>
                  <SelectItem value="junior">Junior (3rd Year)</SelectItem>
                  <SelectItem value="senior">Senior (4th Year)</SelectItem>
                  <SelectItem value="graduate">Graduate Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="enrollmentDate">Enrollment Date</Label>
              <Input
                id="enrollmentDate"
                type="date"
                value={formData.enrollmentDate}
                onChange={(e) => handleChange("enrollmentDate", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={formData.gpa}
                onChange={(e) => handleChange("gpa", e.target.value)}
                placeholder="e.g., 3.75"
                className={errors.gpa ? "border-red-500" : ""}
              />
              {errors.gpa && (
                <p className="text-sm text-red-600">{errors.gpa}</p>
              )}
              <p className="text-xs text-gray-500">Scale: 0.0 - 4.0</p>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">Emergency Contact</h3>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Emergency Contact Name</Label>
              <Input
                id="emergencyContact"
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => handleChange("emergencyContact", e.target.value)}
                placeholder="Full name of emergency contact"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
              <PhoneInput
                id="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={(value) => handleChange("emergencyPhone", value || "")}
                placeholder="Enter emergency contact phone"
                className={errors.emergencyPhone ? "border-red-500" : ""}
              />
              {errors.emergencyPhone && (
                <p className="text-sm text-red-600">{errors.emergencyPhone}</p>
              )}
            </div>
          </div>

          {message && (
            <div
              className={`p-3 rounded-md text-sm ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
