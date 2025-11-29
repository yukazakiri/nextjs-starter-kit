# Elysia Backend API

This project now uses [Elysia](https://elysiajs.com/) as the backend framework, integrated with Next.js and optimized for Bun.

## Structure

```
server/
├── index.ts              # Main Elysia app configuration
├── lib/
│   └── auth.ts          # Authentication helpers and response utilities
└── routes/
    ├── auth.ts          # Student auth routes (/api/student/*)
    ├── students.ts      # Student validation and management
    ├── faculty.ts       # Faculty routes (classes, grades, etc.)
    ├── schedule.ts      # Schedule endpoints
    ├── academic-periods.ts
    ├── chat.ts         # AI chat endpoint
    ├── upload-image.ts
    └── debug.ts        # Debug endpoints
```

## API Routes

All routes are prefixed with `/api`. The Elysia app is mounted at [app/api/[[...slugs]]/route.ts](../app/api/[[...slugs]]/route.ts) using Next.js catch-all routing.

### Available Endpoints

#### Students
- `GET /api/students/test` - Test endpoint
- `POST /api/students/validate` - Validate student credentials
- `POST /api/students/update-metadata` - Update student metadata

#### Faculty
- `GET /api/faculty/classes` - Get faculty classes (requires auth)
- `GET /api/faculty/classes/:classId/grades` - Get grades for a class
- `POST /api/faculty/classes/:classId/grades` - Update grades
- `POST /api/faculty/classes/:classId/grades/finalize` - Finalize grades
- `GET /api/faculty/classes/:classId/students` - Get enrolled students
- `GET /api/faculty/classes/:classId/schedule` - Get class schedule
- `GET /api/faculty/classes/:classId/announcements` - Get announcements
- `POST /api/faculty/classes/:classId/announcements` - Create announcement
- `POST /api/faculty/validate` - Validate faculty
- `POST /api/faculty/update-metadata` - Update faculty metadata

#### Schedule
- `GET /api/schedule?studentId=123` - Get student schedule

#### Student Portal
- `GET /api/student/checklist` - Get curriculum checklist
- `GET /api/student/subjects` - Get enrolled subjects
- `GET /api/student/enrollment-status` - Get enrollment status

#### Other
- `POST /api/chat` - AI chat endpoint
- `POST /api/upload-image` - Upload image
- `GET /api/debug/session` - Debug session
- `GET /api/debug/enrollment` - Debug enrollment
- `GET /api/academic-periods` - Get academic periods

## Type-Safe API Client

Use the Eden Treaty client for type-safe API calls on the frontend:

```typescript
import { api } from "@/lib/api-client";

// Type-safe API calls
const { data, error } = await api.students.test.get();

const result = await api.schedule.get({
  query: {
    studentId: "123"
  }
});
```

## Adding New Routes

1. Create a new file in `server/routes/`
2. Define your routes using Elysia:

```typescript
import { Elysia, t } from "elysia";

export const myRoute = new Elysia({ prefix: "/my-route" })
  .get("/", async () => {
    return { message: "Hello!" };
  })
  .post("/", async ({ body }) => {
    return { received: body };
  }, {
    body: t.Object({
      name: t.String(),
    })
  });
```

3. Import and use it in `server/index.ts`:

```typescript
import { myRoute } from "./routes/my-route";

export const app = new Elysia({ prefix: "/api" })
  // ... other routes
  .use(myRoute);
```

## Authentication

Use the helper functions from `server/lib/auth.ts`:

```typescript
import { requireAuth, getUserEmail, unauthorized } from "../lib/auth";

export const protectedRoute = new Elysia({ prefix: "/protected" })
  .get("/", async () => {
    try {
      const userId = await requireAuth();
      const email = await getUserEmail(userId);
      return { userId, email };
    } catch {
      return unauthorized();
    }
  });
```

## Benefits of Elysia

- **Performance**: Optimized for Bun, significantly faster than traditional Node.js frameworks
- **Type Safety**: End-to-end type safety with Eden Treaty
- **Developer Experience**: Clean, composable API with excellent TypeScript support
- **Validation**: Built-in schema validation with TypeBox
- **Small Bundle Size**: Minimal overhead compared to Express or other frameworks

## Migration Notes

The old Next.js API routes have been replaced with Elysia. The previous routes are backed up in `app/api.backup/` (if you need to reference them).

All endpoints maintain the same URLs and behavior, but now benefit from Elysia's performance and type safety.
