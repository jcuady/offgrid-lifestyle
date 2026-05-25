import { Navigate } from "react-router-dom";

/** Legacy route — templates CMS is on Custom pages (#templates-cms). */
export function AdminCustomContentPage() {
  return <Navigate to="/portal/admin/custom-pages#templates-cms" replace />;
}
