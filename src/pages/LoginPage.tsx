import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LockKeyhole, UserRound, Sparkles } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { cn } from "@/src/lib/utils";
import { getPortalLandingByRole, usePortalStore, type UserRole } from "@/src/store/usePortalStore";

const roleButtons: { role: UserRole; label: string; helper: string }[] = [
  { role: "customer", label: "Customer", helper: "customer@offgrid.test" },
  { role: "admin", label: "Admin", helper: "admin@offgrid.test" },
  { role: "staff", label: "Staff", helper: "staff@offgrid.test" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = usePortalStore((state) => state.login);
  const loginAsRole = usePortalStore((state) => state.loginAsRole);
  const currentUser = usePortalStore((state) => state.currentUser);

  const [email, setEmail] = useState("customer@offgrid.test");
  const [password, setPassword] = useState("offgrid123");
  const [error, setError] = useState<string | null>(null);

  const redirectedFrom = (location.state as { from?: string } | null)?.from;

  useEffect(() => {
    if (!currentUser) return;
    navigate(getPortalLandingByRole(currentUser.role), { replace: true });
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-offgrid-dark px-6 py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-offgrid-cream/10 bg-offgrid-green shadow-2xl lg:grid-cols-2">
        <section className="relative hidden overflow-hidden p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(197,211,48,0.25),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(248,246,236,0.15),transparent_40%)]" />
          <div className="relative">
            <img src={LOGO_WORDMARK_WHITE} alt="OFF GRID" className="mb-12 h-9 w-auto" />
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/60">
              Portal Access
            </p>
            <h1 className="max-w-md text-5xl font-display font-black leading-[0.92] text-offgrid-cream">
              Team ordering, customer tracking, and production control.
            </h1>
            <p className="mt-6 max-w-sm text-sm text-offgrid-cream/70">
              MVP login is localStorage-backed and API-ready. Use one-click demo autofill to test
              each role quickly.
            </p>
          </div>
        </section>

        <section className="bg-offgrid-cream p-6 sm:p-10">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
            OffGrid Portal Login
          </p>
          <h2 className="text-3xl font-display font-black text-offgrid-green">Welcome back</h2>
          <p className="mt-2 text-sm text-offgrid-green/60">
            Sign in to your customer, admin, or staff dashboard.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {roleButtons.map((roleButton) => (
              <button
                key={roleButton.role}
                onClick={() => {
                  setEmail(roleButton.helper);
                  setPassword("offgrid123");
                  setError(null);
                }}
                className="rounded-xl border border-offgrid-green/15 bg-white px-3 py-2 text-left transition-colors hover:border-offgrid-green/40"
              >
                <p className="text-xs font-semibold text-offgrid-green">{roleButton.label}</p>
                <p className="text-[10px] text-offgrid-green/45">Autofill</p>
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/55">
                <UserRound className="h-3.5 w-3.5" />
                Email
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-green"
              />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/55">
                <LockKeyhole className="h-3.5 w-3.5" />
                Password
              </span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-green"
              />
            </label>

            <Button
              size="lg"
              className="w-full"
              onClick={() => {
                const result = login(email, password);
                if (!result.ok) {
                  setError(result.message ?? "Unable to sign in");
                  return;
                }

                const freshUser = usePortalStore.getState().currentUser;
                if (!freshUser) return;
                if (redirectedFrom) {
                  navigate(redirectedFrom, { replace: true });
                  return;
                }
                navigate(getPortalLandingByRole(freshUser.role), { replace: true });
              }}
            >
              Sign In
            </Button>

            <button
              onClick={() => {
                loginAsRole("customer");
                navigate("/portal/customer", { replace: true });
              }}
              className={cn(
                "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-offgrid-green/20 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green transition-colors",
                "hover:border-offgrid-green hover:bg-offgrid-green/5",
              )}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Quick Enter As Customer
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
