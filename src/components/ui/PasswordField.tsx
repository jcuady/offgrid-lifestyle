import { useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { getPasswordStrength, type PasswordStrengthLevel } from "@/src/lib/passwordStrength";
import { cn } from "@/src/lib/utils";

const BAR_CLASS: Record<Exclude<PasswordStrengthLevel, "empty">, string> = {
  weak: "bg-red-500",
  fair: "bg-amber-500",
  good: "bg-offgrid-lime",
  strong: "bg-emerald-600",
};

const BAR_WIDTH: Record<Exclude<PasswordStrengthLevel, "empty">, string> = {
  weak: "w-1/4",
  fair: "w-2/4",
  good: "w-3/4",
  strong: "w-full",
};

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: InputHTMLAttributes<HTMLInputElement>["autoComplete"];
  /** Show strength meter + checklist (signup / new password). */
  showStrengthGuide?: boolean;
  id?: string;
};

export function PasswordField({
  value,
  onChange,
  placeholder = "Your password",
  autoComplete = "current-password",
  showStrengthGuide = false,
  id,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const reactId = useId();
  const inputId = id ?? reactId;
  const strength = showStrengthGuide ? getPasswordStrength(value) : null;

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          id={inputId}
          placeholder={placeholder}
          className="peer ps-9 pe-11"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground">
          <LockKeyhole className="size-4" aria-hidden />
        </div>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 end-0 flex min-w-11 items-center justify-center rounded-e-xl px-3 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime/30"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
        </button>
      </div>

      {showStrengthGuide && strength && strength.level !== "empty" ? (
        <div className="space-y-2" aria-live="polite">
          <div className="flex items-center justify-between gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-200",
                  BAR_CLASS[strength.level],
                  BAR_WIDTH[strength.level],
                )}
              />
            </div>
            <span
              className={cn(
                "shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.12em]",
                strength.level === "weak" && "text-red-600",
                strength.level === "fair" && "text-amber-700",
                strength.level === "good" && "text-offgrid-green",
                strength.level === "strong" && "text-emerald-700",
              )}
            >
              {strength.label}
            </span>
          </div>
          <ul className="grid gap-1">
            {strength.checks.map((check) => (
              <li
                key={check.id}
                className={cn(
                  "flex items-center gap-2 text-[11px] leading-tight",
                  check.met ? "text-offgrid-green" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold",
                    check.met ? "bg-offgrid-lime/20 text-offgrid-green" : "bg-muted text-muted-foreground",
                  )}
                  aria-hidden
                >
                  {check.met ? "✓" : "·"}
                </span>
                {check.label}
              </li>
            ))}
          </ul>
          {!strength.isStrongEnough ? (
            <p className="text-[11px] text-muted-foreground">
              Tip: mix upper &amp; lower case, a number, and a symbol for a stronger password.
            </p>
          ) : (
            <p className="text-[11px] text-emerald-700">Looks strong enough — you&apos;re good to continue.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
