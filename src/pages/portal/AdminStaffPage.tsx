import { useEffect, useMemo, useState } from "react";
import { KeyRound, Plus, Shield, UserCheck, UserX, Users } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { localStaffService } from "@/src/services";
import { usePortalStore } from "@/src/store/usePortalStore";
import type { ManagedStaffAccount } from "@/src/types/portal";
import { formatAuditTimestamp } from "@/src/lib/portalAudit";
import { cn } from "@/src/lib/utils";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25";

function StatusBadge({ status }: { status: ManagedStaffAccount["status"] }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]",
        active
          ? "border-offgrid-lime/40 bg-offgrid-lime/15 text-offgrid-green"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
      {active ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}

export function AdminStaffPage() {
  const staffAccounts = usePortalStore((s) => s.managedStaffAccounts);
  const demoStaffEmail = "staff@offgrid.test";

  useEffect(() => {
    localStaffService.list().then((accounts) => {
      usePortalStore.setState({ managedStaffAccounts: accounts });
    });
  }, []);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<ManagedStaffAccount | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const sorted = useMemo(
    () => [...staffAccounts].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [staffAccounts],
  );

  const activeCount = staffAccounts.filter((a) => a.status === "active").length;

  const closeCreateDrawer = () => {
    setDrawerOpen(false);
    setFormError(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const closeResetDrawer = () => {
    setResetTarget(null);
    setFormError(null);
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const submitCreate = async () => {
    setFormError(null);
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    const result = await localStaffService.create({ name, email, password });
    if (!result.ok) {
      setFormError(result.message ?? "Could not create account.");
      return;
    }
    closeCreateDrawer();
  };

  const submitReset = async () => {
    if (!resetTarget) return;
    setFormError(null);
    if (newPassword !== confirmNewPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    const result = await localStaffService.resetPassword(resetTarget.id, newPassword);
    if (!result.ok) {
      setFormError(result.message ?? "Could not reset password.");
      return;
    }
    closeResetDrawer();
  };

  const toggleStatus = async (account: ManagedStaffAccount) => {
    const next = account.status === "active" ? "inactive" : "active";
    const label = next === "inactive" ? "deactivate" : "reactivate";
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${account.email}?`)) return;
    const result = await localStaffService.setStatus(account.id, next);
    if (!result.ok) window.alert(result.message ?? "Update failed.");
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Team access"
        title="Staff accounts"
        description="Provision staff logins for order operations. Every create, deactivate, and password reset is recorded in the audit log."
        actions={
          <Button size="sm" className="gap-2" onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            Create staff
          </Button>
        }
      />

      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Provisioned
          </dt>
          <dd className="mt-1 font-display text-3xl font-black tabular-nums text-offgrid-green">{staffAccounts.length}</dd>
        </div>
        <div className="rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Active
          </dt>
          <dd className="mt-1 font-display text-3xl font-black tabular-nums text-offgrid-lime">{activeCount}</dd>
        </div>
        <div className="col-span-2 rounded-2xl border border-offgrid-green/10 bg-offgrid-green/[0.04] p-4 sm:col-span-1">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Demo staff
          </dt>
          <dd className="mt-1 text-sm font-semibold text-offgrid-green">{demoStaffEmail}</dd>
          <p className="mt-1 text-xs text-offgrid-green/55">Built-in seed account — not editable here.</p>
        </div>
      </dl>

      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-offgrid-green/25" />
          <p className="mt-4 font-display text-lg font-bold text-offgrid-green">No staff accounts yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-offgrid-green/60">
            Create the first staff login so your team can access orders and analytics without sharing admin credentials.
          </p>
          <Button className="mt-6 gap-2" onClick={() => setDrawerOpen(true)}>
            <Plus className="h-4 w-4" />
            Create staff account
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sorted.map((account) => (
            <article
              key={account.id}
              className="flex flex-col rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-offgrid-green/8 font-display text-sm font-black text-offgrid-green">
                    {account.name
                      .split(/\s+/)
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-bold text-offgrid-green">{account.name}</h3>
                    <p className="truncate font-mono text-[11px] text-offgrid-green/55">{account.email}</p>
                  </div>
                </div>
                <StatusBadge status={account.status} />
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-offgrid-green/8 pt-4 text-xs text-offgrid-green/60">
                <div className="flex justify-between gap-2">
                  <dt>Created</dt>
                  <dd className="font-mono text-offgrid-green/75">{formatAuditTimestamp(account.createdAt)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Last sign-in</dt>
                  <dd className="font-mono text-offgrid-green/75">
                    {account.lastLoginAt ? formatAuditTimestamp(account.lastLoginAt) : "Never"}
                  </dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setResetTarget(account);
                    setFormError(null);
                  }}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Reset password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "gap-1.5",
                    account.status === "active" && "border-red-200 text-red-700 hover:bg-red-50",
                  )}
                  onClick={() => toggleStatus(account)}
                >
                  {account.status === "active" ? (
                    <>
                      <UserX className="h-3.5 w-3.5" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-3.5 w-3.5" />
                      Reactivate
                    </>
                  )}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-offgrid-green/10 bg-offgrid-green/[0.04] p-4 text-sm text-offgrid-green/70">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-offgrid-green" />
        <p>
          Production: staff rows map to <code className="font-mono text-xs">og_portal_users</code> + Supabase Auth.
          Passwords are stored locally for this MVP only — migrate to hashed auth before go-live.
        </p>
      </div>

      <PortalDrawer
        open={drawerOpen}
        onClose={closeCreateDrawer}
        title="Create staff account"
        description="Staff can access orders and analytics. They cannot manage products, payments, or other staff."
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={closeCreateDrawer}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={submitCreate}>
              Create account
            </Button>
          </div>
        }
      >
        {formError ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        ) : null}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green">
              Full name
            </label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Marco Reyes" />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green">
              Work email
            </label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="marco@offgrid.test"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green">
              Temporary password
            </label>
            <input
              type="password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green">
              Confirm password
            </label>
            <input
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </PortalDrawer>

      <PortalDrawer
        open={Boolean(resetTarget)}
        onClose={closeResetDrawer}
        title="Reset staff password"
        description={resetTarget ? `Set a new password for ${resetTarget.email}` : undefined}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={closeResetDrawer}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={submitReset}>
              Save password
            </Button>
          </div>
        }
      >
        {formError ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        ) : null}
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green">
              New password
            </label>
            <input
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green">
              Confirm password
            </label>
            <input
              type="password"
              className={inputClass}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
        </div>
      </PortalDrawer>
    </div>
  );
}
