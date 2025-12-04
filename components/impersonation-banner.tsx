"use client";

import { useImpersonation } from "@/hooks/use-impersonation";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";

interface ImpersonationBannerProps {
  onExitImpersonation?: () => void;
}

/**
 * Component to display when a user is being impersonated
 * Shows who is impersonating and provides a way to exit impersonation
 */
export function ImpersonationBanner({ onExitImpersonation }: ImpersonationBannerProps) {
  const { isImpersonating, impersonatorId } = useImpersonation();
  const { user: impersonatedUser } = useUser();

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
          <span className="font-semibold">Impersonation Mode Active</span>
          <span className="text-sm opacity-90">
            {impersonatorId && (
              <>
                Impersonator ID: <code className="bg-black/20 px-1 rounded">{impersonatorId}</code>
              </>
            )}
            {impersonatedUser && (
              <>
                {" "}→ Viewing as:{" "}
                <code className="bg-black/20 px-1 rounded">{impersonatedUser.emailAddresses[0]?.emailAddress || impersonatedUser.id}</code>
              </>
            )}
          </span>
        </div>
      </div>

      {onExitImpersonation && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onExitImpersonation}
          className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit Impersonation
        </Button>
      )}
    </div>
  );
}

/**
 * Server component version that doesn't use hooks
 * Use this when you need to display impersonation info in server components
 */
export function ImpersonationBannerServer({
  isImpersonating,
  impersonatorId,
  impersonatedUserId,
}: {
  isImpersonating: boolean;
  impersonatorId: string | null;
  impersonatedUserId: string | null;
}) {
  if (!isImpersonating || !impersonatorId || !impersonatedUserId) {
    return null;
  }

  return (
    <div className="bg-amber-500 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <div className="flex items-center gap-2">
          <span className="font-semibold">Impersonation Mode Active</span>
          <span className="text-sm opacity-90">
            Impersonator:{" "}
            <code className="bg-black/20 px-1 rounded">{impersonatorId}</code>
            {" "}→ Impersonated User:{" "}
            <code className="bg-black/20 px-1 rounded">{impersonatedUserId}</code>
          </span>
        </div>
      </div>
    </div>
  );
}
