import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { LockKeyhole, UserRound } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { cn } from "@/src/lib/utils";
import { CUSTOMER_SIGN_UP_PATH, CUSTOMER_SIGN_IN_PATH, PORTAL_LOGIN_PATH } from "@/src/lib/authRoutes";
import {
  getPortalLandingByRole,
  resolvePostLoginPath,
  usePortalStore,
} from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { AuthErrorBanner, AuthField, AuthShell, authInputProps } from "@/src/components/auth/AuthShell";

export function CustomerSignInPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentUser = usePortalStore((state) => state.currentUser);
  const logout = usePortalStore((state) => state.logout);

  const [email, setEmail] = useState(() => searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const redirectedFrom = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.role === "customer") {
      navigate(resolvePostLoginPath("customer", redirectedFrom), { replace: true });
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

    if (user.role !== "customer") {
      logout();
      setError("This email is for the team portal. Use the portal sign-in instead.");
      return;
    }

    navigate(resolvePostLoginPath("customer", redirectedFrom), { replace: true });
  };

  return (
    <AuthShell
      variant="customer-sign-in"
      title="Welcome back"
      description="Sign in to view orders, track delivery, and manage your account."
      footer={
        <p className="text-center text-offgrid-green/60">
          New here?{" "}
          <Link to={CUSTOMER_SIGN_UP_PATH} className="font-semibold text-offgrid-green hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <button
        type="button"
        onClick={() => {
          setEmail("customer@offgrid.test");
          setPassword("offgrid123");
          setError(null);
        }}
        className="mb-5 w-full rounded-xl border border-offgrid-green/15 bg-white px-3 py-2.5 text-left transition-colors hover:border-offgrid-green/35"
      >
        <p className="text-xs font-semibold text-offgrid-green">Demo customer</p>
        <p className="text-[10px] text-offgrid-green/45">customer@offgrid.test · Autofill</p>
      </button>

      <div className="space-y-4">
        <AuthField label="Email" icon={<UserRound className="h-3.5 w-3.5" />}>
          <input
            type="email"
            autoComplete="email"
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
          Sign in
        </Button>
      </div>

      {error ? (
        <div className="mt-4 space-y-3">
          <AuthErrorBanner message={error} />
          {error.includes("team portal") ? (
            <Link
              to={PORTAL_LOGIN_PATH}
              className={cn(
                "block text-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green hover:underline",
              )}
            >
              Go to portal sign in
            </Link>
          ) : null}
        </div>
      ) : null}
    </AuthShell>
  );
}
