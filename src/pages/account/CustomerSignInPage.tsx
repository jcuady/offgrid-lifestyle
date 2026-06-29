import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/src/lib/utils";
import { CUSTOMER_SIGN_UP_PATH, PORTAL_LOGIN_PATH } from "@/src/lib/authRoutes";
import {
  resolvePostLoginPath,
  usePortalStore,
} from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { AuthPage } from "@/src/components/ui/auth-page";

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

  const handleSubmit = async () => {
    setError(null);
    const result = await localAuthService.login(email, password);
    if (!result.ok) {
      // Give a clear, actionable message for email confirmation
      if (result.message?.toLowerCase().includes("email not confirmed")) {
        setError("Please confirm your email first. Check your inbox for the confirmation link we sent when you signed up.");
        return;
      }
      setError(result.message ?? "Unable to sign in.");
      return;
    }

    const user = localAuthService.currentUser();
    if (!user) return;

    if (user.role !== "customer") {
      await localAuthService.logout();
      setError("This email is for the team portal. Use the portal sign-in instead.");
      return;
    }

    navigate(resolvePostLoginPath("customer", redirectedFrom), { replace: true });
  };

  return (
    <AuthPage
      mode="sign-in"
      title="Welcome back"
      description="Sign in to track orders, delivery updates, and your account."
      email={email}
      password={password}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={handleSubmit}
      error={error}
      demoAccounts={[
        {
          label: "Demo customer",
          hint: "customer@offgrid.test · Autofill",
          onSelect: () => {
            setEmail("customer@offgrid.test");
            setPassword("offgrid123");
            setError(null);
          },
        },
      ]}
      alternateLink={{
        prompt: "New here?",
        label: "Create an account",
        href: CUSTOMER_SIGN_UP_PATH,
      }}
      footer={
        error?.includes("team portal") ? (
          <Link
            to={PORTAL_LOGIN_PATH}
            className={cn(
              "block text-center text-xs font-semibold uppercase tracking-[0.12em] text-foreground hover:underline",
            )}
          >
            Go to portal sign in
          </Link>
        ) : null
      }
    />
  );
}
