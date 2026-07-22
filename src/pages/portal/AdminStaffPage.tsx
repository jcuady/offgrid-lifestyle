import {
  Fragment,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useTransition,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Button } from "@/src/components/ui/Button";
import { PortalDrawer } from "@/src/components/portal/PortalDrawer";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { PortalPagination } from "@/src/components/portal/PortalPagination";
import { localStaffService } from "@/src/services";
import { userService, type PortalUserRow } from "@/src/services/userService";
import { usePortalStore } from "@/src/store/usePortalStore";
import type { ManagedStaffAccount } from "@/src/types/portal";
import { formatAuditTimestamp } from "@/src/lib/portalAudit";
import { cn } from "@/src/lib/utils";

const inputClass =
  "w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25";

const PAGE_SIZE = 25;
const SUGGEST_LIMIT = 8;
const SEARCH_DEBOUNCE_MS = 280;

type UserTab = "team" | "customer";
type StatusFilter = "all" | "active" | "inactive";
type TeamRoleFilter = "team" | "staff" | "admin";

function StatusBadge({ status }: { status: PortalUserRow["status"] }) {
  const active = status === "active";
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em]",
        active
          ? "border-offgrid-lime/40 bg-offgrid-lime/15 text-offgrid-green"
          : "border-red-200 bg-red-50 text-red-700",
      )}
    >
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

function FilterChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors duration-200",
        active
          ? "border-offgrid-green bg-offgrid-green text-offgrid-cream"
          : "border-offgrid-green/15 bg-white text-offgrid-green/70 hover:border-offgrid-lime/60 hover:text-offgrid-green",
      )}
    >
      {children}
    </button>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function syncManagedStaff(rows: PortalUserRow[]) {
  const staffAccounts: ManagedStaffAccount[] = rows
    .filter((u) => u.role === "staff")
    .map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      password: "••••••••",
      role: "staff" as const,
      status: row.status,
      createdBy: "",
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      lastLoginAt: row.lastLoginAt,
    }));
  usePortalStore.setState({ managedStaffAccounts: staffAccounts });
}

async function refreshManagedStaffStore() {
  const { rows } = await userService.list({ role: "staff", limit: 100 });
  syncManagedStaff(rows);
}

export function AdminStaffPage() {
  const [tab, setTab] = useState<UserTab>("team");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [teamRole, setTeamRole] = useState<TeamRoleFilter>("team");
  const [page, setPage] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PortalUserRow[]>([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [highlight, setHighlight] = useState(-1);

  const [rows, setRows] = useState<PortalUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [activeTotal, setActiveTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

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

  const searchWrapRef = useRef<HTMLDivElement>(null);
  const listRequestId = useRef(0);
  const suggestRequestId = useRef(0);

  const listRole = tab === "customer" ? ("customer" as const) : teamRole;

  const loadList = useEffectEvent(async () => {
    const requestId = ++listRequestId.current;
    setLoading(true);
    const offset = page * PAGE_SIZE;
    const [listResult, activeResult] = await Promise.all([
      userService.list({
        role: listRole,
        status: statusFilter,
        query: appliedQuery,
        limit: PAGE_SIZE,
        offset,
      }),
      userService.list({
        role: listRole,
        status: "active",
        query: appliedQuery,
        limit: 1,
        offset: 0,
      }),
    ]);
    if (requestId !== listRequestId.current) return;
    setRows(listResult.rows);
    setTotal(listResult.total);
    setActiveTotal(activeResult.total);
    if (tab === "team") void refreshManagedStaffStore();
    setLoading(false);
  });

  useEffect(() => {
    void loadList();
  }, [tab, teamRole, statusFilter, appliedQuery, page]);

  useEffect(() => {
    const q = searchInput.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestLoading(false);
      setHighlight(-1);
      return;
    }

    setSuggestLoading(true);
    const timer = window.setTimeout(() => {
      const requestId = ++suggestRequestId.current;
      void userService
        .list({
          role: listRole,
          status: statusFilter,
          query: q,
          limit: SUGGEST_LIMIT,
          offset: 0,
        })
        .then((result) => {
          if (requestId !== suggestRequestId.current) return;
          setSuggestions(result.rows);
          setSuggestLoading(false);
          setHighlight(result.rows.length > 0 ? 0 : -1);
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput, listRole, statusFilter]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!searchWrapRef.current?.contains(event.target as Node)) {
        setSuggestOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const rangeStart = total === 0 ? 0 : page * PAGE_SIZE + 1;
  const rangeEnd = Math.min(total, (page + 1) * PAGE_SIZE);
  const currentPage = page + 1;

  // Keep page in range when filters shrink the result set.
  useEffect(() => {
    if (page > 0 && page >= pageCount) setPage(Math.max(0, pageCount - 1));
  }, [page, pageCount]);

  const switchTab = (next: UserTab) => {
    startTransition(() => {
      setTab(next);
      setPage(0);
      setSearchInput("");
      setAppliedQuery("");
      setSuggestions([]);
      setSuggestOpen(false);
      setStatusFilter("all");
      if (next === "team") setTeamRole("team");
    });
  };

  const applySearch = (value: string) => {
    const next = value.trim();
    setSearchInput(next);
    setAppliedQuery(next);
    setPage(0);
    setSuggestOpen(false);
  };

  const pickSuggestion = (user: PortalUserRow) => {
    applySearch(user.email);
    openEdit(user);
  };

  const onSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!suggestOpen || suggestions.length === 0) {
      if (event.key === "Enter") {
        event.preventDefault();
        applySearch(searchInput);
      }
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((i) => (i + 1) % suggestions.length);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const pick = suggestions[highlight] ?? suggestions[0];
      if (pick) pickSuggestion(pick);
      return;
    }
    if (event.key === "Escape") {
      setSuggestOpen(false);
    }
  };

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
    await loadList();
  };

  const submitEdit = async () => {
    if (!editTarget) return;
    setFormError(null);
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
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
      email: trimmedEmail !== editTarget.email ? trimmedEmail : undefined,
      password: password || undefined,
    });

    if (!result.ok) {
      setFormError(result.message ?? "Could not update user.");
      return;
    }

    const actor = usePortalStore.getState().currentUser;
    if (actor) {
      const emailChanged = trimmedEmail !== editTarget.email;
      usePortalStore.getState().recordAudit({
        action: emailChanged ? "staff.email_changed" : "staff.updated",
        actorId: actor.id,
        actorEmail: actor.email,
        actorRole: actor.role,
        targetType: "user",
        targetId: editTarget.id,
        summary: emailChanged
          ? `Changed email for ${editTarget.email} → ${trimmedEmail}`
          : `Updated user ${editTarget.email}`,
        metadata: { userId: editTarget.id, from: editTarget.email, to: trimmedEmail },
      });
    }

    closeEdit();
    await loadList();
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
    await loadList();
  };

  const deleteUser = async (user: PortalUserRow) => {
    if (user.role === "admin") return;
    if (!window.confirm(`Permanently deactivate ${user.email}? They will not be able to sign in.`)) return;
    const result = await userService.deleteUser(user.id);
    if (!result.ok) {
      window.alert(result.message ?? "Delete failed.");
      return;
    }
    await loadList();
  };

  const busy = loading || isPending;

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,rgba(45,90,61,0.04)_0%,transparent_220px)] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Access"
        title="Team & customers"
        description="Manage portal staff and look up shoppers by name or email. Customer lists are searched and paged — never loaded in full."
        actions={
          tab === "team" ? (
            <Button size="sm" className="cursor-pointer" onClick={() => setCreateOpen(true)}>
              Create staff
            </Button>
          ) : null
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <FilterChip active={tab === "team"} onClick={() => switchTab("team")}>
          Team
        </FilterChip>
        <FilterChip active={tab === "customer"} onClick={() => switchTab("customer")}>
          Customers
        </FilterChip>
      </div>

      <section className="rounded-2xl border border-offgrid-green/10 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div ref={searchWrapRef} className="relative min-w-0 flex-1 lg:max-w-xl">
            <label
              htmlFor="portal-user-search"
              className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45"
            >
              Search
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="portal-user-search"
                type="search"
                autoComplete="off"
                role="combobox"
                aria-expanded={suggestOpen}
                aria-controls="portal-user-suggestions"
                aria-autocomplete="list"
                placeholder={tab === "customer" ? "Name or email…" : "Find team member…"}
                className={inputClass}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSuggestOpen(true);
                }}
                onFocus={() => setSuggestOpen(true)}
                onKeyDown={onSearchKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                className="shrink-0 cursor-pointer"
                onClick={() => applySearch(searchInput)}
              >
                Search
              </Button>
            </div>
            {suggestOpen && searchInput.trim().length >= 2 ? (
              <ul
                id="portal-user-suggestions"
                role="listbox"
                className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-xl border border-offgrid-green/15 bg-white py-1 shadow-lg"
              >
                {suggestLoading ? (
                  <li className="px-4 py-3 text-sm text-offgrid-green/55">Searching…</li>
                ) : suggestions.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-offgrid-green/55">No matches. Press Enter to search the full list.</li>
                ) : (
                  suggestions.map((user, index) => (
                    <li key={user.id} role="option" aria-selected={index === highlight}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 text-left transition-colors duration-150",
                          index === highlight ? "bg-offgrid-green/8" : "hover:bg-offgrid-green/[0.04]",
                        )}
                        onMouseEnter={() => setHighlight(index)}
                        onClick={() => pickSuggestion(user)}
                      >
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-offgrid-green/8 font-display text-xs font-black text-offgrid-green">
                          {initials(user.name)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-sm font-bold text-offgrid-green">
                            {user.name}
                          </span>
                          <span className="block truncate font-mono text-[11px] text-offgrid-green/55">
                            {user.email}
                          </span>
                        </span>
                        <RoleBadge role={user.role} />
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            {tab === "team" ? (
              <>
                <FilterChip
                  active={teamRole === "team"}
                  onClick={() => {
                    setTeamRole("team");
                    setPage(0);
                  }}
                >
                  All team
                </FilterChip>
                <FilterChip
                  active={teamRole === "staff"}
                  onClick={() => {
                    setTeamRole("staff");
                    setPage(0);
                  }}
                >
                  Staff
                </FilterChip>
                <FilterChip
                  active={teamRole === "admin"}
                  onClick={() => {
                    setTeamRole("admin");
                    setPage(0);
                  }}
                >
                  Admin
                </FilterChip>
              </>
            ) : null}
            {(
              [
                { id: "all", label: "Any status" },
                { id: "active", label: "active" },
                { id: "inactive", label: "inactive" },
              ] as const
            ).map((item) => (
              <Fragment key={item.id}>
                <FilterChip
                  active={statusFilter === item.id}
                  onClick={() => {
                    setStatusFilter(item.id);
                    setPage(0);
                  }}
                >
                  {item.label}
                </FilterChip>
              </Fragment>
            ))}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 px-4 py-3">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
              Matching
            </dt>
            <dd className="mt-1 font-display text-2xl font-black tabular-nums text-offgrid-green">{total}</dd>
          </div>
          <div className="rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 px-4 py-3">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
              Active in results
            </dt>
            <dd className="mt-1 font-display text-2xl font-black tabular-nums text-offgrid-lime">{activeTotal}</dd>
          </div>
          <div className="col-span-2 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/40 px-4 py-3 sm:col-span-1">
            <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">
              Showing
            </dt>
            <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-offgrid-green/80">
              {total === 0 ? "0" : `${rangeStart}–${rangeEnd}`} of {total}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white shadow-sm">
        {busy ? (
          <p className="px-5 py-10 text-sm text-offgrid-green/55">Loading accounts…</p>
        ) : rows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-lg font-bold text-offgrid-green">
              {appliedQuery ? "No accounts match this search" : tab === "customer" ? "No customers yet" : "No team accounts yet"}
            </p>
            <p className="mt-2 text-sm text-offgrid-green/55">
              {appliedQuery
                ? "Try a different name or email, or clear the search."
                : tab === "team"
                  ? "Create a staff account to give someone portal access."
                  : "Customers appear here when they create a storefront account."}
            </p>
            {appliedQuery ? (
              <Button
                variant="outline"
                size="sm"
                className="mt-4 cursor-pointer"
                onClick={() => applySearch("")}
              >
                Clear search
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-offgrid-green/10 bg-offgrid-green/[0.03]">
                    <th className="px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      Person
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      Role
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      Status
                    </th>
                    <th className="px-3 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      Created
                    </th>
                    <th className="px-5 py-3 text-right font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-offgrid-green/[0.06] transition-colors duration-150 last:border-0 hover:bg-offgrid-green/[0.02]"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-offgrid-green/8 font-display text-xs font-black text-offgrid-green">
                            {initials(user.name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-display font-bold text-offgrid-green">{user.name}</p>
                            <p className="truncate font-mono text-[11px] text-offgrid-green/55">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusBadge status={user.status} />
                      </td>
                      <td className="px-3 py-3.5 font-mono text-xs text-offgrid-green/65">
                        {formatAuditTimestamp(user.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => openEdit(user)}>
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="cursor-pointer"
                            onClick={() => {
                              setResetTarget(user);
                              setFormError(null);
                            }}
                          >
                            Reset password
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className={cn(
                              "cursor-pointer",
                              user.status === "active" && "border-red-200 text-red-700 hover:bg-red-50",
                            )}
                            onClick={() => void toggleStatus(user)}
                          >
                            {user.status === "active" ? "Deactivate" : "Reactivate"}
                          </Button>
                          {user.role !== "admin" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer border-red-200 text-red-700 hover:bg-red-50"
                              onClick={() => void deleteUser(user)}
                            >
                              Remove
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile stacked rows */}
            <ul className="divide-y divide-offgrid-green/[0.07] md:hidden">
              {rows.map((user) => (
                <li key={user.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-offgrid-green/8 font-display text-xs font-black text-offgrid-green">
                        {initials(user.name)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-display font-bold text-offgrid-green">{user.name}</p>
                        <p className="truncate font-mono text-[11px] text-offgrid-green/55">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <StatusBadge status={user.status} />
                      <RoleBadge role={user.role} />
                    </div>
                  </div>
                  <p className="mt-3 font-mono text-[11px] text-offgrid-green/50">
                    Created {formatAuditTimestamp(user.createdAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="cursor-pointer" onClick={() => openEdit(user)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="cursor-pointer"
                      onClick={() => {
                        setResetTarget(user);
                        setFormError(null);
                      }}
                    >
                      Reset password
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "cursor-pointer",
                        user.status === "active" && "border-red-200 text-red-700 hover:bg-red-50",
                      )}
                      onClick={() => void toggleStatus(user)}
                    >
                      {user.status === "active" ? "Deactivate" : "Reactivate"}
                    </Button>
                    {user.role !== "admin" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="cursor-pointer border-red-200 text-red-700 hover:bg-red-50"
                        onClick={() => void deleteUser(user)}
                      >
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {total > 0 ? (
          <PortalPagination
            page={currentPage}
            pageSize={PAGE_SIZE}
            total={total}
            disabled={busy}
            onPageChange={(next) => setPage(Math.max(0, next - 1))}
          />
        ) : null}
      </section>

      <p className="mt-6 max-w-3xl text-sm text-offgrid-green/60">
        Credentials live in Supabase Auth. Email and password changes apply immediately. Customers can also reset their
        own password from storefront sign-in.
      </p>

      <PortalDrawer
        open={createOpen}
        onClose={closeCreate}
        title="Create staff account"
        description="Staff can access orders and day-to-day operations."
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={closeCreate}>
              Cancel
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={() => void submitCreate()}>
              Create
            </Button>
          </div>
        }
      >
        {formError ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        ) : null}
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              Full name
            </label>
            <input className={cn(inputClass, "mt-2")} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              Work email
            </label>
            <input
              type="email"
              className={cn(inputClass, "mt-2")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              Temporary password
            </label>
            <input
              type="password"
              className={cn(inputClass, "mt-2")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-offgrid-green/50">At least 8 characters.</p>
          </div>
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              Confirm password
            </label>
            <input
              type="password"
              className={cn(inputClass, "mt-2")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </PortalDrawer>

      <PortalDrawer
        open={Boolean(editTarget)}
        onClose={closeEdit}
        title="Edit account"
        description={editTarget?.email}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={closeEdit}>
              Cancel
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={() => void submitEdit()}>
              Save changes
            </Button>
          </div>
        }
      >
        {formError ? (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</p>
        ) : null}
        <div className="space-y-4">
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              Full name
            </label>
            <input className={cn(inputClass, "mt-2")} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              Email
            </label>
            <input
              type="email"
              className={cn(inputClass, "mt-2")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              New password
            </label>
            <input
              type="password"
              className={cn(inputClass, "mt-2")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave blank to keep current"
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              Confirm new password
            </label>
            <input
              type="password"
              className={cn(inputClass, "mt-2")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      </PortalDrawer>

      <PortalDrawer
        open={Boolean(resetTarget)}
        onClose={closeReset}
        title="Reset password"
        description={resetTarget?.email}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={closeReset}>
              Cancel
            </Button>
            <Button className="flex-1 cursor-pointer" onClick={() => void submitReset()}>
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
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              New password
            </label>
            <input
              type="password"
              className={cn(inputClass, "mt-2")}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
              Confirm password
            </label>
            <input
              type="password"
              className={cn(inputClass, "mt-2")}
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
            />
          </div>
        </div>
      </PortalDrawer>
    </div>
  );
}
