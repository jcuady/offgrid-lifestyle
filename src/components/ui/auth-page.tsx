import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { AtSignIcon, ChevronLeftIcon, LockKeyhole, Phone, UserRound } from "lucide-react";
import { Button } from "./Button";
import { Input } from "./input";
import { cn } from "@/src/lib/utils";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";

export type AuthPageMode = "sign-in" | "sign-up";

export interface AuthDemoAccount {
  label: string;
  hint: string;
  onSelect: () => void;
}

export interface AuthPageProps {
  mode: AuthPageMode;
  title: string;
  description: string;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
  name?: string;
  phone?: string;
  confirmPassword?: string;
  onNameChange?: (value: string) => void;
  onPhoneChange?: (value: string) => void;
  onConfirmPasswordChange?: (value: string) => void;
  error?: string | null;
  fieldErrors?: Partial<Record<"name" | "phone" | "email" | "password" | "confirmPassword" | "acceptedTerms" | "form", string>>;
  alternateLink?: { prompt: string; label: string; href: string };
  homeHref?: string;
  badge?: ReactNode;
  submitLabel?: string;
  quote?: { text: string; attribution: string };
  demoAccounts?: AuthDemoAccount[];
  footer?: ReactNode;
  hidePassword?: boolean;
  hideEmail?: boolean;
  acceptedTerms?: boolean;
  onAcceptedTermsChange?: (value: boolean) => void;
}

export function AuthPage({
  mode,
  title,
  description,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  name = "",
  phone = "",
  confirmPassword = "",
  onNameChange,
  onPhoneChange,
  onConfirmPasswordChange,
  error,
  fieldErrors = {},
  alternateLink,
  homeHref = "/",
  badge,
  submitLabel,
  quote,
  demoAccounts,
  footer,
  hidePassword = false,
  hideEmail = false,
  acceptedTerms = false,
  onAcceptedTermsChange,
}: AuthPageProps) {
  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const formError = error ?? fieldErrors.form;

  return (
    <main className="relative min-h-screen bg-background md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden h-full flex-col border-r border-border bg-offgrid-dark p-10 text-offgrid-cream lg:flex">
        <div className="absolute inset-0 bg-gradient-to-t from-offgrid-dark via-offgrid-dark/80 to-transparent" />
        <div className="relative z-10 flex items-center gap-3">
          <img src={LOGO_WORDMARK_WHITE} alt="OFF GRID" className="h-8 w-auto" />
        </div>
        <div className="relative z-10 mt-auto">
          <blockquote className="space-y-3">
            <p className="font-display text-xl font-bold leading-snug text-offgrid-cream">
              &ldquo;{quote?.text ??
                "Premium Filipino sportswear built for movement — on and off the grid."}&rdquo;
            </p>
            <footer className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-offgrid-cream/55">
              {quote?.attribution ?? "OffGrid Lifestyle"}
            </footer>
          </blockquote>
        </div>
        <div className="absolute inset-0">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex min-h-screen flex-col justify-center p-4 sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 isolate opacity-60 contain-strict"
        >
          <div className="absolute top-0 right-0 h-80 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,#000AFF_14%,transparent)_0%,transparent_70%)]" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_srgb,#000000_6%,transparent)_0%,transparent_70%)]" />
        </div>

        <Button variant="ghost" className="absolute top-6 left-4 sm:top-8 sm:left-6" asChild>
          <Link to={homeHref}>
            <ChevronLeftIcon className="me-2 size-4" />
            Home
          </Link>
        </Button>

        <div className="mx-auto w-full max-w-sm space-y-5 pt-14 sm:pt-0">
          <div className="flex items-center gap-3 lg:hidden">
            <img src={LOGO_WORDMARK_WHITE} alt="OFF GRID" className="h-7 w-auto invert" />
          </div>

          <div className="flex flex-col space-y-2">
            {badge ? (
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                {badge}
              </span>
            ) : null}
            <h1 className="font-heading text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="text-base text-muted-foreground">{description}</p>
          </div>

          {demoAccounts && demoAccounts.length > 0 ? (
            <div
              className={cn(
                "grid gap-2",
                demoAccounts.length > 1 ? "grid-cols-2" : "grid-cols-1",
              )}
            >
              {demoAccounts.map((demo) => (
                <button
                  key={demo.label}
                  type="button"
                  onClick={demo.onSelect}
                  className="rounded-xl border border-border bg-muted/40 px-3 py-2.5 text-left transition-colors hover:border-offgrid-lime/40 hover:bg-muted/70"
                >
                  <p className="text-xs font-semibold text-foreground">{demo.label}</p>
                  <p className="text-[10px] text-muted-foreground">{demo.hint}</p>
                </button>
              ))}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleFormSubmit} noValidate>
            {mode === "sign-up" && onNameChange ? (
              <Field label="Full name" error={fieldErrors.name}>
                <div className="relative">
                  <Input
                    placeholder="Your full name"
                    className="peer ps-9"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                    <UserRound className="size-4" aria-hidden />
                  </div>
                </div>
              </Field>
            ) : null}

            {mode === "sign-up" && onPhoneChange ? (
              <Field label="Mobile number" error={fieldErrors.phone}>
                <div className="relative">
                  <Input
                    placeholder="+63 917 000 0000"
                    className="peer ps-9"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => onPhoneChange(e.target.value)}
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                    <Phone className="size-4" aria-hidden />
                  </div>
                </div>
              </Field>
            ) : null}

            {!hideEmail ? (
            <Field label="Email" error={fieldErrors.email}>
              <div className="relative">
                <Input
                  placeholder="your.email@example.com"
                  className="peer ps-9"
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                  <AtSignIcon className="size-4" aria-hidden />
                </div>
              </div>
            </Field>
            ) : null}

            {!hidePassword ? (
            <Field label="Password" error={fieldErrors.password}>
              <div className="relative">
                <Input
                  placeholder={mode === "sign-up" ? "At least 8 characters" : "Your password"}
                  className="peer ps-9"
                  type="password"
                  autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                  <LockKeyhole className="size-4" aria-hidden />
                </div>
              </div>
            </Field>
            ) : null}

            {mode === "sign-up" && onConfirmPasswordChange ? (
              <Field label="Confirm password" error={fieldErrors.confirmPassword}>
                <div className="relative">
                  <Input
                    placeholder="Re-enter password"
                    className="peer ps-9"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => onConfirmPasswordChange(e.target.value)}
                  />
                  <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
                    <LockKeyhole className="size-4" aria-hidden />
                  </div>
                </div>
              </Field>
            ) : null}

            {mode === "sign-up" && onAcceptedTermsChange ? (
              <label className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-offgrid-green focus:ring-offgrid-lime"
                  checked={acceptedTerms}
                  onChange={(e) => onAcceptedTermsChange(e.target.checked)}
                />
                <span className="text-xs leading-relaxed text-muted-foreground">
                  I agree to the{" "}
                  <Link to="/legal/terms" className="font-semibold text-foreground underline underline-offset-4">
                    Terms &amp; Conditions
                  </Link>{" "}
                  and{" "}
                  <Link to="/legal/privacy" className="font-semibold text-foreground underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
            ) : null}
            {fieldErrors.acceptedTerms ? (
              <span className="block text-xs text-red-600">{fieldErrors.acceptedTerms}</span>
            ) : null}

            {formError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
                {formError}
              </p>
            ) : null}

            <Button type="submit" size="lg" className="w-full" formNoValidate>
              {submitLabel ?? (mode === "sign-up" ? "Create account" : "Sign in")}
            </Button>
          </form>

          {alternateLink ? (
            <p className="text-center text-sm text-muted-foreground">
              {alternateLink.prompt}{" "}
              <Link to={alternateLink.href} className="font-semibold text-foreground underline-offset-4 hover:underline">
                {alternateLink.label}
              </Link>
            </p>
          ) : null}

          {footer}

          <p className="text-xs leading-relaxed text-muted-foreground">
            {mode === "sign-up" ? (
              <>Create an account only if you agree to our legal terms above.</>
            ) : (
              <>
                By continuing, you agree to our{" "}
                <Link to="/legal/terms" className="underline underline-offset-4 hover:text-foreground">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link to="/legal/privacy" className="underline underline-offset-4 hover:text-foreground">
                  Privacy Policy
                </Link>
                .
              </>
            )}
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </span>
      {children}
      {error ? <span className="block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

function FloatingPaths({ position }: { position: number }) {
  const reduceMotion = useReducedMotion();
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${380 - i * 5 * position} -${189 + i * 6} -${
      312 - i * 5 * position
    } ${216 - i * 6} ${152 - i * 5 * position} ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      <svg className="h-full w-full text-offgrid-lime/70" viewBox="0 0 696 316" fill="none">
        <title>Background paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width + 0.4}
            strokeOpacity={0.18 + path.id * 0.025}
            initial={reduceMotion ? false : { pathLength: 0.3, opacity: 0.6 }}
            animate={
              reduceMotion
                ? { pathLength: 1, opacity: 0.45, pathOffset: 0 }
                : {
                    pathLength: 1,
                    opacity: [0.4, 0.75, 0.4],
                    pathOffset: [0, 1, 0],
                  }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: 20 + (path.id % 10),
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }
            }
          />
        ))}
      </svg>
    </div>
  );
}
