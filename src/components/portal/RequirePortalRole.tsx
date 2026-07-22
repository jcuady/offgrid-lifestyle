import { Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { getLoginPathForRoles } from "@/src/lib/authRoutes";
import { getPortalLandingByRole, usePortalStore, type UserRole } from "@/src/store/usePortalStore";

interface RequirePortalRoleProps {
  roles: UserRole[];
  children: ReactElement;
}

/** Standard route guard — redirects unauthenticated users to the correct sign-in screen. */
export function RequirePortalRole({ roles, children }: RequirePortalRoleProps) {
  const currentUser = usePortalStore((state) => state.currentUser);
  const authHydrated = usePortalStore((state) => state.authHydrated);
  const location = useLocation();

  // Wait for email-link session exchange before bouncing to login.
  if (!authHydrated) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center bg-offgrid-cream px-6 text-sm text-offgrid-green/60">
        Signing you in…
      </div>
    );
  }

  if (!currentUser) {
    return (
      <Navigate
        to={getLoginPathForRoles(roles)}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!roles.includes(currentUser.role)) {
    return <Navigate to={getPortalLandingByRole(currentUser.role)} replace />;
  }

  return children;
}
