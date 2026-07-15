import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CUSTOMER_SIGN_IN_PATH,
  PORTAL_FORGOT_PASSWORD_PATH,
  PORTAL_LOGIN_PATH,
} from "@/src/lib/authRoutes";
import { localAuthService } from "@/src/services";
import { AuthPage } from "@/src/components/ui/auth-page";

export function ForgotPasswordPage() {
  const location = useLocation();
  const isPortal = location.pathname === PORTAL_FORGOT_PASSWORD_PATH;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const result = await localAuthService.requestPasswordReset(trimmed, isPortal ? "portal" : "customer");
      if (!result.ok) {
        setError(result.message ?? "Could not send reset email.");
        return;
      }
      setMessage(result.message ?? "Check your email for a password reset link.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPage
      mode="sign-in"
      badge={isPortal ? "Team portal · Admin & staff" : undefined}
      title="Reset your password"
      description={
        isPortal
          ? "Enter your portal work email. We'll send a secure link to choose a new password."
          : "Enter the email on your account. We'll send a secure link to choose a new password."
      }
      email={email}
      password=""
      hidePassword
      onEmailChange={setEmail}
      onPasswordChange={() => {}}
      onSubmit={handleSubmit}
      submitLabel={busy ? "Sending…" : "Send reset link"}
      submitDisabled={busy}
      error={error}
      alternateLink={{
        prompt: "Remembered it?",
        label: isPortal ? "Back to portal sign in" : "Back to sign in",
        href: isPortal ? PORTAL_LOGIN_PATH : CUSTOMER_SIGN_IN_PATH,
      }}
      footer={
        message ? (
          <p className="rounded-lg border border-offgrid-lime/30 bg-offgrid-lime/10 px-3 py-2 text-xs text-offgrid-green">
            {message}
          </p>
        ) : isPortal ? (
          <p className="text-center text-xs text-offgrid-green/55">
            Customer accounts use the storefront reset flow.{" "}
            <Link to={CUSTOMER_SIGN_IN_PATH} className="font-semibold underline">
              Customer sign in
            </Link>
          </p>
        ) : (
          <p className="text-center text-xs text-offgrid-green/55">
            Admin or staff?{" "}
            <Link to={PORTAL_FORGOT_PASSWORD_PATH} className="font-semibold underline">
              Reset portal password
            </Link>
          </p>
        )
      }
    />
  );
}
