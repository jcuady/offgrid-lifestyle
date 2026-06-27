import { Navigate } from "react-router-dom";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";

/** Legacy `/login` — customer storefront sign-in only. */
export function LoginPage() {
  return <Navigate to={CUSTOMER_SIGN_IN_PATH} replace />;
}
