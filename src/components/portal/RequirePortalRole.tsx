import { Navigate, useLocation } from "react-router-dom";
import type { ReactElement } from "react";
import { getPortalLandingByRole, usePortalStore, type UserRole } from "@/src/store/usePortalStore";

interface RequirePortalRoleProps {
  roles: UserRole[];
  children: ReactElement;
}

export function RequirePortalRole({ roles, children }: RequirePortalRoleProps) {
  const currentUser = usePortalStore((state) => state.currentUser);
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!roles.includes(currentUser.role)) {
    return <Navigate to={getPortalLandingByRole(currentUser.role)} replace />;
  }

  return children;
}
