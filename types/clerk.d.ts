export interface PublicMetadata {
  // Student Information
  studentId?: string;
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: string;
  age?: number;

  // Emergency Contact
  emergencyContact?: string;
  emergencyPhone?: string;

  // Academic Information
  major?: string;
  yearLevel?: string;
  enrollmentDate?: string;
  gpa?: string;
  courseId?: number;
  academicYear?: number;
  status?: string;

  // Verification
  verifiedAt?: string;
}

declare global {
  interface CustomJwtSessionClaims extends PublicMetadata {}

  interface UserPublicMetadata extends PublicMetadata {}
}

export {};
