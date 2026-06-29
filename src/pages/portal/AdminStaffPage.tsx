import { useEffect, useMemo, useState } from "react";
import { KeyRound, Pencil, Plus, Shield, Trash2, UserCheck, UserX, Users } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { localStaffService } from "@/src/services";
import { userService, type PortalUserRow } from "@/src/services/userService";
import { usePortalStore } from "@/src/store/usePortalStore";
import type { ManagedStaffAccount } from "@/src/types/portal";
import { formatAuditTimestamp } from "@/src/lib/portalAudit";
import { cn } from "@/src/lib/utils";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25";

type UserTab = "staff" | "customer";

function StatusBadge({ status }: { status: PortalUserRow["status"] }) {
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

function RoleBadge({ role }: { role: PortalUserRow["role"] }) {
  return (
    <span className="rounded-full border border-offgrid-green/15 bg-offgrid-green/5 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/70">
      {role}
    </span>
  );
}

export function AdminStaffPage() {
  const [tab, setTab] = useState<UserTab>("staff");
  const [users, setUsers] = useState<PortalUserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PortalUserRow | null>(null);
  const [resetTarget, setResetTarget] = useState<PortalUserRow | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const refresh = async () => {
    setLoading(true);
    const rows = await userService.list();
    setUsers(rows);
    if (tab === "staff") {
      const staffAccounts: ManagedStaffAccount[] = rows
        .filter((u) => u.role === "staff")
        .map((row) => ({
          id: row.id,
          name: row.name,
          email: row.email,
          password: "••••••••",
          role: "staff",
          status: row.status,
          createdBy: "",
          createdAt: row.createdAt,
          updatedAt: row.updatedAt,
          lastLoginAt: row.lastLoginAt,
        }));
      usePortalStore.setState({ managedStaffAccounts: staffAccounts });
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const filtered = useMemo(
    () => users.filter((u) => u.role === tab).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [users, tab],
  );

  const activeCount = filtered.filter((u) => u.status === "active").length;

  const closeCreate = () => {
    setCreateOpen(false);
    setFormError(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const closeEdit = () => {
    setEditTarget(null);
    setFormError(null);
    setName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const closeReset = () => {
    setResetTarget(null);
    setFormError(null);
    setNewPassword("");
    setConfirmNewPassword("");
  };

  const openEdit = (user: PortalUserRow) => {
    setEditTarget(user);
    setName(user.name);
    setEmail(user.email);
    setPassword("");
    setConfirmPassword("");
    setFormError(null);
  };

  const submitCreate = async () => {
    setFormError(null);
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    const result = await localStaffService.create({ name, email, password });
    if (!result.ok) {
      setFormError(result.message ?? "Could not create account.");
      return;
    }
    closeCreate();
    await refresh();
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    setFormError(null);
    if (password && password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (password && password.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    const result = await userService.updateUser({
      portalUserId: editTarget.id,
      name: name.trim() !== editTarget.name ? name.trim() : undefined,
      email: email.trim().toLowerCase() !== editTarget.email ? email.trim().toLowerCase() : undefined,
      password: password || undefined,
    });

    if (!result.ok) {
      setFormError(result.message ?? "Could not update user.");
      return;
    }

    const actor = usePortalStore.getState().currentUser;
    if (actor) {
      usePortalStore.getState().recordAudit({
        action: "staff.updated",
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        targetType: "user",
        targetId: editTarget.id,
        summary: `Updated user ${editTarget.email}`,
        metadata: { userId: editTarget.id },
      });
    }

    closeEdit();
    await refresh();
  };

  const submitReset = async () => {
    if (!resetTarget) return;
    setFormError(null);
    if (newPassword !== confirmNewPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }
    const result = await userService.resetPassword(resetTarget.id, newPassword);
    if (!result.ok) {
      setFormError(result.message ?? "Could not reset password.");
      return;
    }
    closeReset();
  };

  const toggleStatus = async (user: PortalUserRow) => {
    const next = user.status === "active" ? "inactive" : "active";
    const label = next === "inactive" ? "deactivate" : "reactivate";
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${user.email}?`)) return;
    const result = await userService.setStatus(user.id, next);
    if (!result.ok) window.alert(result.message ?? "Update failed.");
    await refresh();
  };

  const deleteUser = async (user: PortalUserRow) => {
    if (user.role === "admin") return;
    if (!window.confirm(`Permanently deactivate ${user.email}? They will not be able to sign in.`)) return;
    const result = await userService.deleteUser(user.id);
    if (!result.ok) {
      window.alert(result.message ?? "Delete failed.");
      return;
    }
    await refresh();
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="User management"
        title="Portal users"
        description="Create staff accounts, manage customers, and reset credentials. Changes apply to Supabase Auth immediately."
        actions={
          tab === "staff" ? (
            <Button size="sm" className="gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Create staff
            </Button>
          ) : null
        }
      />

      <div className="mb-6 flex gap-2">
        {(["staff", "customer"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={cn(
              "rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
              tab === key
                ? "bg-offgrid-green text-offgrid-cream"
                : "border border-offgrid-green/15 bg-white text-offgrid-green/70 hover:bg-offgrid-green/5",
            )}
          >
            {key === "staff" ? "Staff" : "Customers"}
          </button>
        ))}
      </div>

      <dl className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Total
          </dt>
          <dd className="mt-1 font-display text-3xl font-black tabular-nums text-offgrid-green">{filtered.length}</dd>
        </div>
        <div className="rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm">
          <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
            Active
          </dt>
          <dd className="mt-1 font-display text-3xl font-black tabular-nums text-offgrid-lime">{activeCount}</dd>
        </div>
      </dl>

      {loading ? (
        <p className="text-sm text-offgrid-green/55">Loading users…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-offgrid-green/20 bg-white p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-offgrid-green/25" />
          <p className="mt-4 font-display text-lg font-bold text-offgrid-green">No {tab} accounts yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((user) => (
            <article
              key={user.id}
              className="flex flex-col rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.06]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-offgrid-green/8 font-display text-sm font-black text-offgrid-green">
                    {user.name
                      .split(/\s+/)
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-base font-bold text-offgrid-green">{user.name}</h3>
                    <p className="truncate font-mono text-[11px] text-offgrid-green/55">{user.email}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={user.status} />
                  <RoleBadge role={user.role} />
                </div>
              </div>

              <dl className="mt-4 space-y-1.5 border-t border-offgrid-green/8 pt-4 text-xs text-offgrid-green/60">
                <div className="flex justify-between gap-2">
                  <dt>Created</dt>
                  <dd className="font-mono text-offgrid-green/75">{formatAuditTimestamp(user.createdAt)}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(user)}>
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => {
                    setResetTarget(user);
                    setFormError(null);
                  }}
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  Reset password
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn("gap-1.5", user.status === "active" && "border-red-200 text-red-700 hover:bg-red-50")}
                  onClick={() => void toggleStatus(user)}
                >
                  {user.status === "active" ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                  {user.status === "active" ? "Deactivate" : "Reactivate"}
                </Button>
                {user.role !== "admin" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 border-red-200 text-red-700 hover:bg-red-50"
                    onClick={() => void deleteUser(user)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-offgrid-green/10 bg-offgrid-green/[0.04] p-4 text-sm text-offgrid-green/70">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-offgrid-green" />
        <p>
          User credentials are managed in Supabase Auth. Email and password changes take effect immediately. Customers
          can also reset their own password from the storefront sign-in page.
        </p>
      </div>

      <PortalDrawer open={createOpen} onClose={closeCreate} title="Create staff account" description="Staff can access orders and analytics." footer={<div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={closeCreate}>Cancel</Button><Button className="flex-1" onClick={() => void submitCreate()}>Create</Button></div>}>
        {formError ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}
        <div className="space-y-4">
          <input className={inputClass} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" className={inputClass} placeholder="Work email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className={inputClass} placeholder="Temporary password (min 8)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" className={inputClass} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
      </PortalDrawer>

      <PortalDrawer open={Boolean(editTarget)} onClose={closeEdit} title="Edit user" description={editTarget?.email} footer={<div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={closeEdit}>Cancel</Button><Button className="flex-1" onClick={() => void submitEdit()}>Save changes</Button></div>}>
        {formError ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}
        <div className="space-y-4">
          <input className={inputClass} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input type="email" className={inputClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" className={inputClass} placeholder="New password (optional)" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" className={inputClass} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
        </div>
      </PortalDrawer>

      <PortalDrawer open={Boolean(resetTarget)} onClose={closeReset} title="Reset password" description={resetTarget?.email} footer={<div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={closeReset}>Cancel</Button><Button className="flex-1" onClick={() => void submitReset()}>Save password</Button></div>}>
        {formError ? <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p> : null}
        <div className="space-y-4">
          <input type="password" className={inputClass} placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          <input type="password" className={inputClass} placeholder="Confirm password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
        </div>
      </PortalDrawer>
    </div>
  );
}
