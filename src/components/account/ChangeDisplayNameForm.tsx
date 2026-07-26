import { useState, type FormEvent } from "react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/input";
import { validateDisplayName } from "@/src/lib/displayName";
import { supabase } from "@/src/lib/supabase";
import { usePortalStore } from "@/src/store/usePortalStore";

/** Self-service display name for staff/admin (RLS self-update on og_portal_users). */
export function ChangeDisplayNameForm() {
  const user = usePortalStore((s) => s.currentUser);
  const setCurrentUser = usePortalStore((s) => s.setCurrentUser);
  const recordAudit = usePortalStore((s) => s.recordAudit);
  const [name, setName] = useState(user?.name ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    setError(null);
    setMessage(null);

    const validationError = validateDisplayName(user?.name ?? "", name);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (!user?.id) {
      setError("You must be signed in.");
      return;
    }

    const trimmed = name.trim();
    setBusy(true);
    try {
      const { error: updateError } = await supabase
        .from("og_portal_users")
        .update({ name: trimmed })
        .eq("id", user.id);
      if (updateError) {
        setError(updateError.message || "Could not update name.");
        return;
      }

      setCurrentUser({ ...user, name: trimmed });
      recordAudit({
        action: "staff.updated",
        actorId: user.id,
        actorEmail: user.email,
        actorRole: user.role,
        targetType: "user",
        targetId: user.id,
        summary: `Updated display name to ${trimmed}`,
        metadata: { field: "name", from: user.name, to: trimmed },
      });
      setMessage("Name updated.");
    } catch {
      setError("Something went wrong updating your name. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.08] sm:p-6">
      <h2 className="font-display text-lg font-bold text-offgrid-green">Display name</h2>
      <p className="mt-1 text-sm text-offgrid-green/60">
        Shown in the portal header and on order activity attributed to you.
      </p>

      <form className="mt-5 space-y-3" onSubmit={(e) => void handleSubmit(e)} noValidate>
        <div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Name
          </label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={busy}
            placeholder="Your name"
          />
        </div>

        {error ? (
          <p className="text-xs text-red-600" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-xs font-medium text-offgrid-green" role="status">
            {message}
          </p>
        ) : null}

        <Button type="submit" size="sm" className="mt-1" disabled={busy}>
          {busy ? "Saving…" : "Update name"}
        </Button>
      </form>
    </section>
  );
}
