"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

interface ImpersonationData {
  isImpersonating: boolean;
  impersonatorId: string | null;
  impersonatedUserId: string | null;
}

/**
 * Hook to detect and manage Clerk impersonation state
 * This hook checks both the actor property from useAuth and response headers
 */
export function useImpersonation() {
  const { user, actor } = useUser();
  const [impersonation, setImpersonation] = useState<ImpersonationData>({
    isImpersonating: false,
    impersonatorId: null,
    impersonatedUserId: null,
  });

  useEffect(() => {
    // Check for impersonation from actor property (direct from Clerk)
    const hasActor = !!actor;
    if (hasActor) {
      setImpersonation({
        isImpersonating: true,
        impersonatorId: actor?.sub || null,
        impersonatedUserId: user?.id || null,
      });
      return;
    }

    // Fallback: Check response headers (for middleware-set headers)
    const checkHeaders = async () => {
      try {
        const response = await fetch(window.location.href, {
          method: "HEAD",
        });

        const impersonatorId = response.headers.get("x-clerk-impersonator-id");
        const isImpersonationActive = response.headers.get(
          "x-clerk-impersonation-active",
        );
        const impersonatedUserId =
          response.headers.get("x-clerk-impersonated-user-id");

        if (isImpersonationActive === "true" && impersonatorId) {
          setImpersonation({
            isImpersonating: true,
            impersonatorId,
            impersonatedUserId,
          });
        }
      } catch (error) {
        // Silently fail if request fails
        console.debug("Could not check impersonation headers:", error);
      }
    };

    checkHeaders();
  }, [actor, user?.id]);

  return impersonation;
}
