# Clerk Impersonation Guide

This guide explains how to use Clerk's impersonation feature to allow admin users to sign in as students or faculty members.

## Overview

Impersonation allows authorized users (typically administrators) to temporarily sign in as another user for support, testing, or troubleshooting purposes. When impersonation is active, the session includes an `actor` property that identifies both the impersonator and the impersonated user.

## How It Works

### 1. Clerk Impersonation (Admin → User)

When an admin impersonates a user in the Clerk Dashboard:
- The session token includes an `actor` claim
- `actor.sub` = Admin's user ID (the impersonator)
- `userId` = Student's/Faculty's user ID (the impersonated user)
- The middleware detects this and logs the activity
- Response headers are set to inform the frontend

### 2. Backend Detection (proxy.ts)

The middleware in `proxy.ts` automatically detects impersonation:

```typescript
const { userId, actor, sessionId } = await auth();
const isImpersonating = !!actor;

if (isImpersonating) {
  console.log(`User ${actor.sub} is impersonating user ${userId}`);
  // Add headers to response
  response.headers.set("x-clerk-impersonator-id", actor.sub);
  response.headers.set("x-clerk-impersonated-user-id", userId);
  response.headers.set("x-clerk-impersonation-active", "true");
}
```

### 3. Frontend Detection (useImpersonation Hook)

The `useImpersonation` hook detects when impersonation is active:

```typescript
const { isImpersonating, impersonatorId, impersonatedUserId } = useImpersonation();

if (isImpersonating) {
  // Show impersonation banner
  // Adjust UI/UX as needed
}
```

## Configuration

### 1. Configure Redirect URLs in Clerk Dashboard

Go to **Clerk Dashboard → Configure → Redirects** and add:

**For Development:**
```
http://localhost:3000
http://localhost:3000/sign-in
http://localhost:3000/sign-up
http://localhost:3000/dashboard/student
http://localhost:3000/dashboard/faculty
```

**For Production:**
```
https://your-app.vercel.app
https://your-app.vercel.app/sign-in
https://your-app.vercel.app/sign-up
https://your-app.vercel.app/dashboard/student
https://your-app.vercel.app/dashboard/faculty
```

### 2. Enable Impersonation

In Clerk Dashboard → **Configure → User & Authentication → Session**:
- Ensure "User impersonation" is enabled

### 3. Configure Impersonation Users

Only users with the appropriate role can impersonate others. Configure this in Clerk Dashboard → **Users**.

## Using Impersonation

### For Administrators

1. **Start Impersonation:**
   - Go to Clerk Dashboard
   - Navigate to a user's profile
   - Click "Impersonate user"
   - You'll be redirected to your app as that user

2. **While Impersonating:**
   - An amber banner appears at the top of the dashboard
   - Shows the impersonator ID and the impersonated user's email
   - You can access the impersonated user's dashboard and data

3. **Exit Impersonation:**
   - Click "Exit Impersonation" button on the banner, OR
   - Sign out and sign back in as yourself

### For Developers

#### Detecting Impersonation in Components

```tsx
"use client";

import { useImpersonation } from "@/hooks/use-impersonation";

function MyComponent() {
  const { isImpersonating, impersonatorId } = useImpersonation();

  return (
    <div>
      {isImpersonating && (
        <div className="warning">
          Being viewed by admin: {impersonatorId}
        </div>
      )}
      {/* Your component content */}
    </div>
  );
}
```

#### Detecting Impersonation in Server Components

```tsx
import { auth } from "@clerk/nextjs/server";

export default async function MyServerComponent() {
  const { userId, actor } = await auth();
  const isImpersonating = !!actor;

  return (
    <div>
      {isImpersonating && (
        <div>Impersonated session active</div>
      )}
    </div>
  );
}
```

#### Accessing Session Information

```tsx
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { actor, userId, sessionId } = await auth();

  console.log("Impersonated user ID:", userId);
  console.log("Impersonator ID:", actor?.sub);
  console.log("Session ID:", sessionId);

  return <div>...</div>;
}
```

## Security Considerations

1. **Impersonation is logged:** All impersonation activity is logged to the console with `🚨 IMPERSONATION ACTIVE` prefix
2. **Headers are set:** Response headers inform the frontend of active impersonation
3. **Role checks:** During impersonation, role-based access checks still apply to the impersonated user's role
4. **Session tracking:** Session ID is logged for auditing purposes

## Troubleshooting

### "Redirecting to sign-in" Issue

If impersonation redirects to sign-in:

1. ✅ **Check redirect URLs** - Ensure all URLs are configured in Clerk Dashboard
2. ✅ **Check middleware** - Verify `proxy.ts` is in the root directory and properly configured
3. ✅ **Clear browser cache** - Hard refresh with Ctrl+Shift+R
4. ✅ **Check console logs** - Look for `[PROXY]` logs in dev tools

### Impersonation Banner Not Showing

1. Check browser console for the `actor` object
2. Verify headers are being set (check Network tab → Response Headers)
3. Ensure the hook is imported correctly: `import { useImpersonation } from "@/hooks/use-impersonation";`

### Permission Denied Errors

1. Verify the impersonator has admin/impersonator role in Clerk
2. Check that impersonation is enabled in Clerk Dashboard settings
3. Ensure the impersonated user exists and is active

## Best Practices

1. **Always log impersonation:** The middleware already logs to console
2. **Show visual indicators:** Use the ImpersonationBanner component
3. **Audit access:** Consider logging to a database or external service
4. **Limit impersonation scope:** Only admins should be able to impersonate
5. **Time limit:** Consider implementing automatic session expiry for impersonated sessions

## API Reference

### useImpersonation Hook

Returns:
```typescript
{
  isImpersonating: boolean;
  impersonatorId: string | null;
  impersonatedUserId: string | null;
}
```

### ImpersonationBanner Component

Props:
```typescript
{
  onExitImpersonation?: () => void;  // Optional callback for exit button
}
```

### Middleware Headers

When impersonation is active, these headers are added to responses:

```
x-clerk-impersonator-id: <actor-sub>
x-clerk-impersonated-user-id: <userId>
x-clerk-impersonation-active: true
```

## Additional Resources

- [Clerk Impersonation Docs](https://clerk.com/docs/custom-flows/impersonation)
- [Clerk auth() Helper](https://clerk.com/docs/references/nextjs/auth)
- [Clerk useAuth Hook](https://clerk.com/docs/references/react/useauth)
