import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { localAuthService } from "@/src/services";

const inputCls =
  "w-full rounded-xl border border-offgrid-green/20 bg-white px-3.5 py-2.5 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime/60 focus:ring-2 focus:ring-offgrid-lime/20";

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

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const email = localAuthService.currentUser()?.email;
      if (!email) {
        setError("You must be signed in.");
        return;
      }

      const loginCheck = await localAuthService.login(email, currentPassword);
      if (!loginCheck.ok) {
        setError("Current password is incorrect.");
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
    <section className="min-w-0 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-offgrid-green/[0.08]">
      <h2 className="font-display text-lg font-bold text-offgrid-green">Change password</h2>
      <p className="mt-1 text-sm text-offgrid-green/60">
        Update your account password. You will stay signed in on this device.
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Current password
          </label>
          <input
            type="password"
            className={inputCls}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            New password
          </label>
          <input
            type="password"
            className={inputCls}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Confirm new password
          </label>
          <input
            type="password"
            className={inputCls}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
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
