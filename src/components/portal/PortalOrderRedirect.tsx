import { Navigate, useParams } from "react-router-dom";
import { usePortalStore } from "@/src/store/usePortalStore";

/** Resolves push/in-app links that use the neutral `/portal/orders/:id` path. */
export function PortalOrderRedirect() {
  const { orderId } = useParams<{ orderId: string }>();
  const user = usePortalStore((s) => s.currentUser);

  if (!orderId) {
    return <Navigate to="/portal" replace />;
  }

  if (!user) {
    return <Navigate to="/portal/login" replace state={{ from: `/portal/orders/${orderId}` }} />;
  }

  if (user.role === "admin") {
    return <Navigate to={`/portal/admin/orders/${orderId}`} replace />;
  }

  if (user.role === "staff") {
    return <Navigate to={`/portal/staff/orders/${orderId}`} replace />;
  }

  return <Navigate to={`/account/orders/${orderId}`} replace />;
}
