import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { CUSTOMER_SIGN_IN_PATH, PORTAL_FORGOT_PASSWORD_PATH } from "@/src/lib/authRoutes";
import {
  getPortalLandingByRole,
  resolvePostLoginPath,
  usePortalStore,
  type UserRole,
} from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { AuthPage } from "@/src/components/ui/auth-page";

const PORTAL_DEMOS: { role: Exclude<UserRole, "customer">; label: string; email: string }[] = [
  { role: "admin", label: "Admin", email: "admin@offgrid.test" },
  { role: "staff", label: "Staff", email: "staff@offgrid.test" },
];

const showDemoShortcuts = import.meta.env.DEV;

export function PortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentUser = usePortalStore((state) => state.currentUser);
  const logout = usePortalStore((state) => state.logout);

  const passwordReset = searchParams.get("reset") === "1";

  const [email, setEmail] = useState(showDemoShortcuts ? "admin@offgrid.test" : "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const redirectedFrom = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "admin" || currentUser.role === "staff") {
      navigate(resolvePostLoginPath(currentUser.role, redirectedFrom), { replace: true });
      return;
    }
    logout();
  }, [currentUser, navigate, redirectedFrom, logout]);

  const handleSubmit = async () => {
    setError(null);
    const result = await localAuthService.login(email, password);
    if (!result.ok) {
      setError(result.message ?? "Unable to sign in.");
      return;
    }

    const user = localAuthService.currentUser();
    if (!user) return;

    if (user.role === "customer") {
      await localAuthService.logout();
      setError("Customer accounts sign in on the storefront, not the team portal.");
      return;
    }

    if (redirectedFrom) {
      navigate(resolvePostLoginPath(user.role, redirectedFrom), { replace: true });
      return;
    }
    navigate(getPortalLandingByRole(user.role), { replace: true });
  };

  return (
    <AuthPage
      mode="sign-in"
      badge={passwordReset ? "Password updated — sign in with your new password" : "Team portal · Admin & staff"}
      title="Team sign in"
      description="Admin and staff only — manage orders, production, and storefront content."
      submitLabel="Sign in to portal"
      quote={{
        text: "Run the storefront, production, and fulfillment from one command center.",
        attribution: "OffGrid Operations",
      }}
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      error={error}
      alternateLink={{
        prompt: "Forgot password?",
        label: "Reset portal password",
        href: PORTAL_FORGOT_PASSWORD_PATH,
      }}
      demoAccounts={
        showDemoShortcuts
          ? PORTAL_DEMOS.map((demo) => ({
              label: demo.label,
              hint: `${demo.email} · Autofill email`,
              onSelect: () => {
                setEmail(demo.email);
                setPassword("");
                setError(null);
              },
            }))
          : undefined
      }
      footer={
        error?.includes("storefront") ? (
          <Link
            to={CUSTOMER_SIGN_IN_PATH}
            className={cn(
              "block text-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground hover:underline",
            )}
          >
            Go to customer sign in
          </Link>
        ) : null
      }
    />
  );
}
