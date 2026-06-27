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
  const location = useLocation();

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
