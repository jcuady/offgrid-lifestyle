import { useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/input";
import { PasswordField } from "@/src/components/ui/PasswordField";
import { validateChangeEmailInput } from "@/src/lib/accountCredentials";
import { localAuthService } from "@/src/services";
import { usePortalStore } from "@/src/store/usePortalStore";

export function ChangeEmailForm() {
  const currentEmail = usePortalStore((s) => s.currentUser?.email ?? "");
  const [newEmail, setNewEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);

    const validationError = validateChangeEmailInput({
      currentEmail,
      newEmail,
      confirmEmail,
    });
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!currentPassword) {
      setError("Enter your current password to confirm this change.");
      return;
    }

    setBusy(true);
    try {
      const verified = await localAuthService.verifyPassword(currentPassword);
      if (!verified.ok) {
        setError(verified.message ?? "Current password is incorrect.");
        return;
      }

      const result = await localAuthService.updateEmail(newEmail);
      if (!result.ok) {
        setError(result.message ?? "Could not update email.");
        return;
      }

      setNewEmail("");
      setConfirmEmail("");
      setCurrentPassword("");
      setMessage(result.message ?? "Email updated.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-w-0 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-offgrid-green/[0.08]">
      <h2 className="font-display text-lg font-bold text-offgrid-green">Change email</h2>
      <p className="mt-1 text-sm text-offgrid-green/60">
        Current sign-in email: <span className="font-medium text-offgrid-green">{currentEmail || "—"}</span>
      </p>

      <div className="mt-5 space-y-3">
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            New email
          </label>
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
            placeholder="new.email@example.com"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Confirm new email
          </label>
          <Input
            type="email"
            value={confirmEmail}
            onChange={(e) => setConfirmEmail(e.target.value)}
            autoComplete="email"
            placeholder="Re-enter new email"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Current password
          </label>
          <PasswordField
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            placeholder="Confirm with your password"
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-xs text-red-600">{error}</p> : null}
      {message ? <p className="mt-3 text-xs font-medium text-offgrid-green">{message}</p> : null}

      <Button size="sm" className="mt-4" disabled={busy} onClick={() => void handleSubmit()}>
        {busy ? "Saving…" : "Update email"}
      </Button>
    </section>
  );
}
