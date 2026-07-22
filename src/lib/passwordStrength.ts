/**
 * Password strength guide for signup / reset UX.
 * Hard gate stays validatePassword (≥8). This scores guidance only.
 */

export type PasswordStrengthLevel = "empty" | "weak" | "fair" | "good" | "strong";

export type PasswordStrengthCheckId =
  | "minLength"
  | "lowercase"
  | "uppercase"
  | "number"
  | "symbol";

export interface PasswordStrengthCheck {
  id: PasswordStrengthCheckId;
  label: string;
  met: boolean;
}

export interface PasswordStrength {
  level: PasswordStrengthLevel;
  score: number;
  label: string;
  checks: PasswordStrengthCheck[];
  /** True when all checklist items pass (good enough to recommend). */
  isStrongEnough: boolean;
}

const CHECK_DEFS: { id: PasswordStrengthCheckId; label: string; test: (p: string) => boolean }[] = [
  { id: "minLength", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { id: "lowercase", label: "A lowercase letter", test: (p) => /[a-z]/.test(p) },
  { id: "uppercase", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { id: "number", label: "A number", test: (p) => /\d/.test(p) },
  { id: "symbol", label: "A symbol (!@#$…)", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function getPasswordStrength(password: string): PasswordStrength {
  const value = password ?? "";
  const checks = CHECK_DEFS.map((def) => ({
    id: def.id,
    label: def.label,
    met: def.test(value),
  }));

  if (!value) {
    return {
      level: "empty",
      score: 0,
      label: "",
      checks,
      isStrongEnough: false,
    };
  }

  const metCount = checks.filter((c) => c.met).length;
  const longBonus = value.length >= 12 ? 1 : 0;
  const score = metCount + longBonus;

  let level: PasswordStrengthLevel;
  let label: string;
  if (metCount < 3 || !checks[0]!.met) {
    level = "weak";
    label = "Weak";
  } else if (metCount === 3) {
    level = "fair";
    label = "Fair";
  } else if (metCount === 4) {
    level = "good";
    label = "Good";
  } else {
    level = "strong";
    label = "Strong";
  }

  return {
    level,
    score,
    label,
    checks,
    isStrongEnough: metCount >= 4 && checks[0]!.met,
  };
}
