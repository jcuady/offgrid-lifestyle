import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CUSTOMER_FORGOT_PASSWORD_PATH,
  CUSTOMER_SIGN_IN_PATH,
  PORTAL_FORGOT_PASSWORD_PATH,
  PORTAL_LOGIN_PATH,
} from "@/src/lib/authRoutes";
import {
  canContinuePasswordRecovery,
  clearPasswordRecoveryIntent,
  ensureRecoverySession,
  isPasswordRecoveryUrlHint,
  isPortalPasswordReset,
  markPasswordRecoveryIntent,
  stashRecoveryTokensFromUrl,
} from "@/src/lib/passwordReset";
import { subscribeRecoverySessionReady } from "@/src/lib/authSessionBootstrap";
import { localAuthService } from "@/src/services";
import { supabase } from "@/src/lib/supabase";
import { AuthPage } from "@/src/components/ui/auth-page";

const RECOVERY_TIMEOUT_MS = 12000;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const isPortal = isPortalPasswordReset();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const failExpired = () => {
      if (cancelled) return;
      setReady(false);
      setError("Reset link is invalid or expired. Request a new one from the forgot password page.");
    };

    const markReady = () => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      markPasswordRecoveryIntent();
      setReady(true);
      setError(null);
    };

    const verifySession = async () => {
      stashRecoveryTokensFromUrl();
      if (isPasswordRecoveryUrlHint()) {
        markPasswordRecoveryIntent();
      }

      if (!canContinuePasswordRecovery()) {
        failExpired();
        return;
      }

      const ok = await ensureRecoverySession(supabase);
      if (cancelled) return;
      if (ok) {
        markReady();
        return;
      }

      timeoutId = setTimeout(() => {
        void (async () => {
          if (cancelled) return;
          const retry = await ensureRecoverySession(supabase);
          if (retry) markReady();
          else failExpired();
        })();
      }, RECOVERY_TIMEOUT_MS);
    };

    void verifySession();

    // Single GoTrue listener lives in authSessionBootstrap — subscribe to its signal.
    const unsubReady = subscribeRecoverySessionReady(() => {
      if (!canContinuePasswordRecovery()) return;
      markReady();
    });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      unsubReady();
    };
  }, []);

  const handleSubmit = async () => {
    if (!ready || busy) return;
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
      const established = await ensureRecoverySession(supabase);
      if (!established) {
        setError("Reset link is invalid or expired. Request a new one from the forgot password page.");
        setReady(false);
        return;
      }
      const result = await localAuthService.updatePassword(password);
      if (!result.ok) {
        setError(result.message ?? "Could not update password.");
        return;
      }
      clearPasswordRecoveryIntent();
      await localAuthService.logout();
      const loginPath = isPortal ? PORTAL_LOGIN_PATH : CUSTOMER_SIGN_IN_PATH;
      navigate(`${loginPath}?reset=1`, { replace: true });
    } finally {
      setBusy(false);
    }
  };

  const forgotHref = isPortal ? PORTAL_FORGOT_PASSWORD_PATH : CUSTOMER_FORGOT_PASSWORD_PATH;
  const statusMessage = ready ? error : (error ?? "Verifying your reset link…");

  return (
    <AuthPage
      mode="sign-up"
      title="Choose a new password"
      description={
        isPortal
          ? "Set a new password for your OffGrid portal account."
          : "Set a new password for your OffGrid account."
      }
      email=""
      hideEmail
      password={password}
      confirmPassword={confirmPassword}
      onEmailChange={() => {}}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={handleSubmit}
      submitLabel={busy ? "Saving…" : "Update password"}
      submitDisabled={!ready || busy}
      error={statusMessage}
      alternateLink={{
        prompt: "Need a new link?",
        label: "Request reset again",
        href: forgotHref,
      }}
    />
  );
}
