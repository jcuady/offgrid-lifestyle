import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, UserRound, Shield } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";
import {
  getPortalLandingByRole,
  resolvePostLoginPath,
  usePortalStore,
  type UserRole,
} from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { AuthErrorBanner, AuthField, AuthShell, authInputProps } from "@/src/components/auth/AuthShell";

const PORTAL_DEMOS: { role: Exclude<UserRole, "customer">; label: string; email: string }[] = [
  { role: "admin", label: "Admin", email: "admin@offgrid.test" },
  { role: "staff", label: "Staff", email: "staff@offgrid.test" },
];

export function PortalLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = usePortalStore((state) => state.currentUser);
  const logout = usePortalStore((state) => state.logout);

  const [email, setEmail] = useState("admin@offgrid.test");
  const [password, setPassword] = useState("offgrid123");
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

  const handleSubmit = () => {
    setError(null);
    const result = localAuthService.login(email, password);
    if (!result.ok) {
      setError(result.message ?? "Unable to sign in.");
      return;
    }

    const user = localAuthService.currentUser();
    if (!user) return;

    if (user.role === "customer") {
      logout();
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
    <AuthShell
      variant="portal"
      title="Team sign in"
      description="Admin and staff only — manage orders, production, and storefront content."
    >
      <div className="mb-5 grid grid-cols-2 gap-2">
        {PORTAL_DEMOS.map((demo) => (
          <button
            key={demo.role}
            type="button"
            onClick={() => {
              setEmail(demo.email);
              setPassword("offgrid123");
              setError(null);
            }}
            className="rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-left transition-colors hover:border-offgrid-green/40"
          >
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-offgrid-green">
              <Shield className="h-3.5 w-3.5 text-offgrid-lime" />
              {demo.label}
            </p>
            <p className="text-[10px] text-offgrid-green/45">Autofill demo</p>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <AuthField label="Work email" icon={<UserRound className="h-3.5 w-3.5" />}>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            {...authInputProps()}
          />
        </AuthField>

        <AuthField label="Password" icon={<LockKeyhole className="h-3.5 w-3.5" />}>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            {...authInputProps()}
          />
        </AuthField>

        <Button size="lg" className="w-full" onClick={handleSubmit}>
          Sign in to portal
        </Button>
      </div>

      {error ? (
        <div className="mt-4 space-y-3">
          <AuthErrorBanner message={error} />
          {error.includes("storefront") ? (
            <Link
              to={CUSTOMER_SIGN_IN_PATH}
              className={cn(
                "block text-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green hover:underline",
              )}
            >
              Go to customer sign in
            </Link>
          ) : null}
        </div>
      ) : null}
    </AuthShell>
  );
}
