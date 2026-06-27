import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";

export type AuthShellVariant = "customer-sign-in" | "customer-sign-up" | "portal";

const PANEL_COPY: Record<
  AuthShellVariant,
  { kicker: string; title: string; body: string; footnote?: string }
> = {
  "customer-sign-in": {
    kicker: "Customer account",
    title: "Your orders, custom requests, and delivery updates — one place.",
    body: "Sign in to track shop purchases, view custom order quotes, and follow production through delivery.",
  },
  "customer-sign-up": {
    kicker: "Join OffGrid",
    title: "Create your account to track every order.",
    body: "Register once to follow retail shipments, custom team orders, and official quotes from our production team.",
  },
  portal: {
    kicker: "Team portal",
    title: "Production control, order operations, and storefront CMS.",
    body: "Admin and staff sign in here. Customer accounts use the storefront sign-in.",
    footnote: "MVP auth is local and API-ready. Use demo autofill to test admin or staff quickly.",
  },
};

const FORM_KICKER: Record<AuthShellVariant, string> = {
  "customer-sign-in": "Customer sign in",
  "customer-sign-up": "Create account",
  portal: "Portal sign in",
};

interface AuthShellProps {
  variant: AuthShellVariant;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** Split auth layout shared by customer and portal login flows. */
export function AuthShell({ variant, title, description, children, footer }: AuthShellProps) {
  const panel = PANEL_COPY[variant];

  return (
    <div className="flex min-h-screen min-w-0 items-center overflow-x-hidden bg-offgrid-dark px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto grid w-full min-w-0 max-w-5xl overflow-hidden rounded-2xl border border-offgrid-cream/10 bg-offgrid-green shadow-2xl sm:rounded-3xl lg:grid-cols-2">
        <section className="relative hidden overflow-hidden p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,112,255,0.22),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(248,246,236,0.12),transparent_40%)]" />
          <div className="relative flex h-full flex-col">
            <img src={LOGO_WORDMARK_WHITE} alt="OFF GRID" className="mb-12 h-9 w-auto" />
            <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime">
              {panel.kicker}
            </p>
            <h1 className="max-w-md font-display text-4xl font-black leading-[0.95] text-offgrid-cream xl:text-5xl">
              {panel.title}
            </h1>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-offgrid-cream/70">{panel.body}</p>
            {panel.footnote ? (
              <p className="mt-auto pt-10 text-xs leading-relaxed text-offgrid-cream/45">{panel.footnote}</p>
            ) : null}
          </div>
        </section>

        <section className="bg-offgrid-cream p-6 sm:p-10">
          <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
            {FORM_KICKER[variant]}
          </p>
          <h2 className="font-display text-3xl font-black text-offgrid-green">{title}</h2>
          <p className="mt-2 text-sm text-offgrid-green/60">{description}</p>

          <div className="mt-8">{children}</div>

          {footer ? <div className="mt-6 border-t border-offgrid-green/10 pt-6 text-sm">{footer}</div> : null}

          {variant === "portal" ? (
            <p className="mt-6 text-center text-xs text-offgrid-green/50">
              Shopping as a customer?{" "}
              <Link to={CUSTOMER_SIGN_IN_PATH} className="font-semibold text-offgrid-green hover:underline">
                Storefront sign in
              </Link>
            </p>
          ) : null}
        </section>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/20";

interface AuthFieldProps {
  label: string;
  icon?: ReactNode;
  error?: string;
  children: ReactNode;
}

export function AuthField({ label, icon, error, children }: AuthFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/55">
        {icon}
        {label}
      </span>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : null}
    </label>
  );
}

export function authInputProps(className?: string) {
  return { className: className ? `${inputClass} ${className}` : inputClass };
}

export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700" role="alert">
      {message}
    </p>
  );
}
