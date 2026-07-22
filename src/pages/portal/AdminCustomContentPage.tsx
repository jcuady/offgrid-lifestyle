import { Navigate } from "react-router-dom";

/** Legacy route — template CRUD lives at /portal/admin/templates. */
export function AdminCustomContentPage() {
  return <Navigate to="/portal/admin/templates" replace />;
}
