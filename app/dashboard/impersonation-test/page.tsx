"use client";

import { useImpersonation } from "@/hooks/use-impersonation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ImpersonationTestPage() {
  const { isImpersonating, impersonatorId, impersonatedUserId } = useImpersonation();
  const { user, actor } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Impersonation Test Page</h1>
        <p className="text-muted-foreground">
          This page helps you debug and verify Clerk impersonation is working correctly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>useImpersonation Hook</CardTitle>
            <CardDescription>From the custom hook</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Is Impersonating:</strong>{" "}
              {isImpersonating ? (
                <Badge variant="destructive">Yes</Badge>
              ) : (
                <Badge variant="secondary">No</Badge>
              )}
            </div>
            <div>
              <strong>Impersonator ID:</strong>{" "}
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {impersonatorId || "N/A"}
              </code>
            </div>
            <div>
              <strong>Impersonated User ID:</strong>{" "}
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {impersonatedUserId || "N/A"}
              </code>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>useAuth Hook</CardTitle>
            <CardDescription>Direct from Clerk</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <strong>Current User ID:</strong>{" "}
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {user?.id || "N/A"}
              </code>
            </div>
            <div>
              <strong>Actor (Impersonator):</strong>{" "}
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {actor?.sub || "N/A"}
              </code>
            </div>
            <div>
              <strong>User Email:</strong>{" "}
              <span className="text-sm">
                {user?.emailAddresses?.[0]?.emailAddress || "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
          <CardDescription>Detailed session data</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64">
{JSON.stringify({
  user: user ? {
    id: user.id,
    email: user.emailAddresses?.[0]?.emailAddress,
    role: user.publicMetadata?.role,
  } : null,
  actor: actor ? {
    sub: actor.sub,
  } : null,
  impersonation: {
    isImpersonating,
    impersonatorId,
    impersonatedUserId,
  }
}, null, 2)}
          </pre>
        </CardContent>
      </Card>

      {isImpersonating && (
        <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-700 dark:text-amber-300">
              🚨 Impersonation Active
            </CardTitle>
            <CardDescription>
              You are currently viewing this page as a different user.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              User <code>{impersonatorId}</code> is impersonating{" "}
              {user?.emailAddresses?.[0]?.emailAddress || user?.id}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
