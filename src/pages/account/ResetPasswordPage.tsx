import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";
import { localAuthService } from "@/src/services";
import { supabase } from "@/src/lib/supabase";
import { AuthPage } from "@/src/components/ui/auth-page";

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setReady(true);
        return;
      }
      setError("Reset link is invalid or expired. Request a new one from the forgot password page.");
    };
    void check();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
        setError(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleSubmit = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const result = await localAuthService.updatePassword(password);
      if (!result.ok) {
        setError(result.message ?? "Could not update password.");
        return;
      }
      navigate(CUSTOMER_SIGN_IN_PATH, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthPage
      mode="sign-up"
      title="Choose a new password"
      description="Set a new password for your OffGrid account."
      email=""
      hideEmail
      password={password}
      confirmPassword={confirmPassword}
      onEmailChange={() => {}}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
      submitLabel={busy ? "Saving…" : "Update password"}
      error={ready ? error : error ?? "Verifying reset link…"}
    />
  );
}
