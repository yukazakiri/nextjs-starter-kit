# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **School Management Information System (MIS)** built with Next.js 16, supporting role-based workflows for students and faculty including enrollment, grading, attendance, announcements, and class management.

**Note**: The README mentions Better Auth and Polar.sh, but the actual implementation uses **Clerk** for authentication. The codebase appears to be built on top of a SaaS starter kit template that has been heavily customized for educational institution management.

Always use context7 when I need code generation, setup or configuration steps, or
library/API documentation. This means you should automatically use the Context7 MCP
tools to resolve library id and get library docs without me having to explicitly ask.

## Development Commands

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma generate  # Generate Prisma Client
npx prisma db push   # Push schema changes to database
npx prisma studio    # Open Prisma Studio GUI
```

## Architecture Overview

### Authentication & Authorization

**Clerk Authentication** (not Better Auth):

-   Primary auth provider with pre-built components
-   After Clerk authentication, users complete a 3-step onboarding flow:
    1. **Role Selection**: Choose "student" or "faculty"
    2. **Validation**: Verify email + Student ID or Faculty Code against database
    3. **Phone Number**: Add contact information
-   Role and user data stored in Clerk's `publicMetadata` for performance
-   See `app/onboarding/page.tsx` for onboarding logic

**Middleware-based RBAC**:

-   File: `middleware.ts`
-   Route protection based on role in Clerk metadata
-   Student routes: `/dashboard/subjects`, `/dashboard/grades`, `/dashboard/attendance`
-   Faculty routes: `/dashboard/faculty/classes`, `/dashboard/faculty/students`
-   Automatic redirection prevents cross-role access

**API Authentication Pattern**:

```typescript
const { userId } = await auth(); // Clerk auth
if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const client = await clerkClient();
const user = await client.users.getUser(userId);
const userEmail = user.emailAddresses[0]?.emailAddress;

// Query database using email to get student/faculty record
const student = await prisma.students.findUnique({
    where: { email: userEmail },
});
```

### Database Architecture

**PostgreSQL with Prisma ORM**:

-   190 models in `prisma/schema.prisma` (3,436 lines)
-   Neon PostgreSQL (serverless) with connection pooling
-   Database client singleton: `lib/prisma.ts`

**Key Model Domains**:

**Students**:

-   `students`: Core student records with personal info, contacts (JSON), course_id
-   `student_enrollment`: Semester-based enrollment with downpayment, payment_method
-   `subject_enrollments`: Links students to specific class sections with grades
-   Soft delete pattern: `deleted_at` field

**Faculty**:

-   `faculty`: Faculty members with UUID primary key, faculty_code (unique)
-   Fields: name, email, phone, department, office_hours, biography, status

**Classes & Subjects**:

-   `classes`: Class sections with faculty_id, subject_code, semester, school_year, maximum_slots
-   `subject`: Subject definitions with code, title, units, lecture/lab hours
-   `subject_enrollments`: Junction table for student-class relationships

**Academic Configuration**:

-   `general_settings`: Global config (current semester, curriculum_year, school dates, feature flags)
-   School year calculated from school_starting_date and school_ending_date

**Other Important Models**:

-   `announcements`: Class announcements with attachments (JSON), class_id
-   `attendances`: Student attendance tracking
-   `account_balance`: Student fee and payment tracking by semester
-   `additional_fees`: Dynamic fee structures

**Important Patterns**:

-   **Temporal Filtering**: Everything filtered by semester + academic_year + school_year
-   **Soft Deletes**: Always check `deleted_at: null` in queries
-   **JSON Fields**: contacts, attachments, subject_enrolled stored as JSON
-   **Mixed ID Types**: BigInt (legacy), Int, UUID, String depending on table domain
-   **BigInt Serialization**: Convert BigInt to String for JSON responses

### Academic Period Management

**Global State**: `SemesterContext` (`contexts/semester-context.tsx`)

-   Manages selected semester and school year across the entire app
-   Persisted to localStorage
-   Used for filtering enrollments, classes, grades, etc.

**Helper Functions** (`lib/enrollment.ts`):

-   `getCurrentAcademicSettings()`: Fetches current semester/school_year from general_settings
-   `getStudentEnrollmentStatus()`: Checks if student enrolled for period
-   `formatSchoolYear()`: Converts date range to "YYYY - YYYY" format
-   `extractYear()`: Parses year from "YYYY-MM-DD HH:MM:SS" format

**Academic Period Selector**:

-   Component: `AcademicPeriodSelector`
-   Available periods from `GET /api/academic-periods`

### File Storage (Cloudflare R2)

**Setup** (`lib/r2.ts`):

-   S3-compatible API using `@aws-sdk/client-s3`
-   Endpoint: `https://{ACCOUNT_ID}.r2.cloudflarestorage.com`
-   Environment variables: `CLOUDFLARE_ACCOUNT_ID`, `R2_UPLOAD_IMAGE_ACCESS_KEY_ID`, etc.

**Upload Pattern**:

```typescript
uploadFileToR2(file: File, folder: string = "uploads")
// Returns: { success: true, key: "uploads/timestamp_filename.ext" }
```

**Usage**:

-   Faculty announcements with multiple file attachments
-   Files uploaded to R2, URLs stored in `announcements.attachments` (JSON array)
-   Public URL pattern: `https://pub-{hash}.r2.dev/{key}`

### API Route Patterns

**Student APIs**:

-   `POST /api/students/validate`: Validate student ID + email
-   `POST /api/students/update-metadata`: Update Clerk publicMetadata
-   `GET /api/student/subjects`: Enrolled subjects for current semester
-   `GET /api/student/checklist`: Curriculum checklist
-   `GET /api/enrollment-status`: Check enrollment for academic period

**Faculty APIs**:

-   `GET /api/faculty/classes`: Faculty's classes for current semester/year
-   `GET /api/faculty/classes/[classId]/students`: Students in a class
-   `GET /api/faculty/classes/[classId]/grades`: Get grades for a class
-   `POST /api/faculty/classes/[classId]/grades`: Update grades
-   `POST /api/faculty/classes/[classId]/grades/finalize`: Finalize grades
-   `GET /api/faculty/classes/[classId]/announcements`: Class announcements
-   `POST /api/faculty/classes/[classId]/announcements`: Create announcement with R2 file upload

**Utility APIs**:

-   `GET /api/academic-periods`: Available periods from general_settings
-   `GET /api/schedule`: Class schedules
-   `POST /api/chat`: OpenAI chatbot with web search capability

### App Structure

```
app/
├── sign-in/[[...rest]]/          # Clerk SignIn component
├── sign-up/[[...rest]]/          # Clerk SignUp component
├── onboarding/                   # Custom 3-step role verification
├── dashboard/
│   ├── layout.tsx               # SemesterProvider, SidebarProvider, AppSidebar
│   ├── student/                 # Student dashboard
│   ├── faculty/                 # Faculty dashboard
│   ├── subjects/                # Shared route (role-based data)
│   ├── grades/                  # Shared route
│   ├── attendance/              # Shared route
│   └── announcements/           # Shared route
└── api/
    ├── students/                # Student validation & metadata
    ├── faculty/                 # Faculty operations
    └── chat/                    # AI chatbot

components/
├── ui/                          # shadcn/ui components
└── app-sidebar.tsx              # Role-aware navigation

contexts/
└── semester-context.tsx         # Global semester/year state

lib/
├── prisma.ts                    # Database client singleton
├── enrollment.ts                # Academic period helpers
└── r2.ts                        # Cloudflare R2 file upload
```

## Important Conventions

### Dual Identity System

-   **Clerk**: Handles authentication and session management
-   **Database**: Stores student/faculty business records
-   **Link**: Email address bridges Clerk users to database records
-   **Onboarding**: Validates database record exists before allowing dashboard access

### Role-Based Access

-   Roles stored in Clerk's `user.publicMetadata.role` ("student" or "faculty")
-   Middleware enforces route-level access based on role
-   UI components conditionally render based on role
-   API endpoints verify role by querying database with user's email

### Academic Period Filtering

-   **Always filter by**: semester, academic_year, school_year
-   Use `SemesterContext` for user-selected period
-   Default to current period from `general_settings` table
-   Applies to: enrollments, classes, grades, attendance, announcements

### Data Serialization

-   BigInt fields must be converted to strings for JSON responses
-   Use custom serialization helpers when returning Prisma query results
-   Example: `JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v))`

### Soft Deletes

-   Many models have `deleted_at` timestamp field
-   Always filter by `WHERE deleted_at IS NULL` in queries
-   Preserves data integrity and audit trail
-   Example: `prisma.students.findMany({ where: { deleted_at: null } })`

## Environment Variables

Required variables (see `.env.example` for full list):

```env
# Database
DATABASE_URL="postgresql://..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Cloudflare R2 Storage
CLOUDFLARE_ACCOUNT_ID="..."
R2_UPLOAD_IMAGE_ACCESS_KEY_ID="..."
R2_UPLOAD_IMAGE_SECRET_ACCESS_KEY="..."
R2_UPLOAD_IMAGE_BUCKET_NAME="..."
R2_PUBLIC_URL="https://pub-{hash}.r2.dev"

# OpenAI (for chatbot)
OPENAI_API_KEY="sk-..."

# Legacy/Unused (from starter template)
BETTER_AUTH_SECRET="..."          # Not used - using Clerk instead
POLAR_ACCESS_TOKEN="..."          # Not used - no Polar.sh integration
```

## Common Development Workflows

### Adding a New Student Feature

1. Check if student is enrolled: `getStudentEnrollmentStatus(studentId, semester, schoolYear)`
2. Query student data: `prisma.students.findUnique({ where: { email, deleted_at: null } })`
3. Filter by academic period from `SemesterContext`
4. Protect route in `middleware.ts` if needed
5. Add navigation item to `AppSidebar` under student role

### Adding a New Faculty Feature

1. Get faculty record: `prisma.faculty.findUnique({ where: { email } })`
2. Query classes: Filter by `faculty_id`, `semester`, `school_year`
3. Protect route in `middleware.ts` with faculty matcher
4. Add to faculty section in `AppSidebar`

### Working with File Uploads

1. Use FormData on client side for multipart requests
2. Extract files in API route: `const file = formData.get('file') as File`
3. Upload to R2: `const result = await uploadFileToR2(file, 'announcements')`
4. Store file key/URL in database JSON field
5. Construct public URL: `${R2_PUBLIC_URL}/${key}`

### Querying by Academic Period

1. Get current settings: `const settings = await getCurrentAcademicSettings()`
2. Use in queries: `where: { semester: settings.semester, school_year: settings.school_year }`
3. For user-selected period, use `SemesterContext` on client side
4. Always include deleted_at: null for models with soft deletes

### Updating Clerk Metadata

1. Get clerkClient: `const client = await clerkClient()`
2. Update metadata: `await client.users.updateUser(userId, { publicMetadata: { role, studentId, ... } })`
3. Metadata persists across sessions
4. Access in components via `useUser()` hook

## Database Migrations

When modifying schema:

```bash
# 1. Edit prisma/schema.prisma
# 2. Generate Prisma Client
npx prisma generate

# 3. Push changes to database (development)
npx prisma db push

# 4. For production, use migrations instead:
npx prisma migrate dev --name your_migration_name
npx prisma migrate deploy  # In production
```

## Troubleshooting

**"Unauthorized" errors**: Check Clerk session exists and user has required metadata (role, studentId/facultyId)

**Empty data queries**: Verify academic period filters match data in database, check soft delete status

**File upload failures**: Ensure R2 credentials are set, bucket exists, and CORS is configured for your domain

**BigInt serialization errors**: Use custom JSON serializer when returning Prisma results with BigInt fields

**Route access denied**: Check middleware.ts route matchers and user role in Clerk metadata
