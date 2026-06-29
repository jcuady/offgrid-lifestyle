import { useState } from "react";
import { Link } from "react-router-dom";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";
import { localAuthService } from "@/src/services";
import { AuthPage } from "@/src/components/ui/auth-page";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      const result = await localAuthService.requestPasswordReset(email);
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
      title="Reset your password"
      description="Enter the email on your account. We'll send a secure link to choose a new password."
      email={email}
      password=""
      hidePassword
      onEmailChange={setEmail}
      onPasswordChange={() => {}}
      onSubmit={handleSubmit}
      submitLabel={busy ? "Sending…" : "Send reset link"}
      error={error}
      alternateLink={{
        prompt: "Remembered it?",
        label: "Back to sign in",
        href: CUSTOMER_SIGN_IN_PATH,
      }}
      footer={
        message ? (
          <p className="rounded-lg border border-offgrid-lime/30 bg-offgrid-lime/10 px-3 py-2 text-xs text-offgrid-green">
            {message}
          </p>
        ) : (
          <p className="text-center text-xs text-offgrid-green/55">
            Team portal accounts should contact an admin for password help.{" "}
            <Link to="/portal/login" className="font-semibold underline">
              Portal sign in
            </Link>
          </p>
        )
      }
    />
  );
}
