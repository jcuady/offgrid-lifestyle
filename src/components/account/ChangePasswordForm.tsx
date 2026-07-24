import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { PasswordField } from "@/src/components/ui/PasswordField";
import { validateChangePasswordInput } from "@/src/lib/accountCredentials";
import { localAuthService } from "@/src/services";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    const validationError = validateChangePasswordInput({
      currentPassword,
      newPassword,
      confirmPassword,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    setBusy(true);
    try {
      const loginCheck = await localAuthService.verifyPassword(currentPassword);
      if (!loginCheck.ok) {
        setError(loginCheck.message ?? "Current password is incorrect.");
        return;
      }

      const result = await localAuthService.updatePassword(newPassword);
      if (!result.ok) {
        setError(result.message ?? "Could not update password.");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("Password updated successfully.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.08] sm:p-6">
      <h2 className="font-display text-lg font-bold text-offgrid-green">Change password</h2>
      <p className="mt-1 text-sm text-offgrid-green/60">
        Update your account password. You will stay signed in on this device.
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Current password
          </label>
          <PasswordField
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            New password
          </label>
          <PasswordField
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            placeholder="At least 8 characters"
            showStrengthGuide
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Confirm new password
          </label>
          <PasswordField
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            placeholder="Re-enter password"
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-xs font-medium text-offgrid-green">{message}</p> : null}

      <Button size="sm" className="mt-4" disabled={busy} onClick={() => void handleSubmit()}>
        {busy ? "Saving…" : "Update password"}
      </Button>
    </section>
  );
}
