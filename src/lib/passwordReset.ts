/** Shared password-reset URL helpers (customer + portal use the same reset page). */

import {
  classifyAuthCallback,
  isPasswordRecoveryCallback,
} from "@/src/lib/authCallbackRouting";

export type PasswordResetAudience = "customer" | "portal";

const RECOVERY_INTENT_KEY = "og-pw-recovery";
const RECOVERY_TOKENS_KEY = "og-pw-recovery-tokens";

export type ImplicitAuthTokens = {
  access_token: string;
  refresh_token: string;
  type?: string;
};

export function passwordResetRedirectUrl(
  origin: string,
  audience: PasswordResetAudience = "customer",
): string {
  const base = `${origin.replace(/\/$/, "")}/account/reset-password`;
  return audience === "portal" ? `${base}?portal=1` : base;
}

/** Persist recovery intent before Supabase strips hash/?code= from the URL. */
export function markPasswordRecoveryIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(RECOVERY_INTENT_KEY, "1");
  } catch {
    // ignore quota / private mode
  }
}

export function hasPasswordRecoveryIntent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(RECOVERY_INTENT_KEY) === "1";
  } catch {
    return false;
  }
}

export function clearPasswordRecoveryIntent(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(RECOVERY_INTENT_KEY);
    sessionStorage.removeItem(RECOVERY_TOKENS_KEY);
  } catch {
    // ignore
  }
}

/** Parse implicit-grant tokens from a location hash (with or without leading #). */
export function parseImplicitAuthHash(hash: string): ImplicitAuthTokens | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return null;
  const params = new URLSearchParams(raw);
  const access_token = params.get("access_token");
  const refresh_token = params.get("refresh_token");
  if (!access_token || !refresh_token) return null;
  return {
    access_token,
    refresh_token,
    type: params.get("type") ?? undefined,
  };
}

/**
 * Snapshot recovery tokens from the URL before detectSessionInUrl clears the hash.
 * Never call signOut during recovery — that races auto URL session detection and
 * destroys the recovery session after tokens are already stripped from the URL.
 */
export function stashRecoveryTokensFromUrl(): ImplicitAuthTokens | null {
  if (typeof window === "undefined") return null;
  const tokens = parseImplicitAuthHash(window.location.hash);
  if (!tokens) return null;
  const onResetPath = window.location.pathname.startsWith("/account/reset-password");
  if (tokens.type !== "recovery" && !onResetPath) return null;
  try {
    sessionStorage.setItem(RECOVERY_TOKENS_KEY, JSON.stringify(tokens));
  } catch {
    // ignore
  }
  markPasswordRecoveryIntent();
  return tokens;
}

export function readStashedRecoveryTokens(): ImplicitAuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(RECOVERY_TOKENS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ImplicitAuthTokens;
    if (!parsed?.access_token || !parsed?.refresh_token) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** @deprecated use isPasswordRecoveryUrlHint — kept name for existing imports */
export function hasPasswordRecoveryUrlHint(): boolean {
  return isPasswordRecoveryUrlHint();
}

/** True only for password-recovery callbacks (not signup email confirm). */
export function isPasswordRecoveryUrlHint(): boolean {
  if (typeof window === "undefined") return false;
  return isPasswordRecoveryCallback({
    pathname: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search,
  });
}

/** URL hint, sticky intent, or stashed tokens after the hash was cleared. */
export function canContinuePasswordRecovery(): boolean {
  return (
    isPasswordRecoveryUrlHint() ||
    hasPasswordRecoveryIntent() ||
    Boolean(readStashedRecoveryTokens())
  );
}

/** True when this load is a password-recovery callback (for UI bootstrap). */
export function isRecoveryAuthBootstrap(input: {
  pathname: string;
  hash: string;
  search: string;
}): boolean {
  return classifyAuthCallback(input) === "recovery";
}

/** @deprecated was wrongly used to signOut and race detectSessionInUrl */
export function mustClearSessionBeforeRecovery(input: {
  pathname: string;
  hash: string;
  search: string;
}): boolean {
  return isRecoveryAuthBootstrap(input);
}

/** Skip push-link / shipping hydrate while completing a password reset. */
export function shouldSkipPostLoginSideEffects(): boolean {
  return hasPasswordRecoveryIntent() || isPasswordRecoveryUrlHint();
}

/**
 * Ensure a recovery session exists. Prefers live auth session; falls back to
 * hash tokens or stashed tokens via setSession (survives clock-skew warnings
 * and detectSessionInUrl races).
 */
export async function ensureRecoverySession(client: {
  auth: {
    getSession: () => Promise<{ data: { session: unknown } }>;
    setSession: (tokens: {
      access_token: string;
      refresh_token: string;
    }) => Promise<{ error: { message: string } | null }>;
  };
}): Promise<boolean> {
  const existing = await client.auth.getSession();
  if (existing.data.session) return true;

  const fromHash =
    typeof window !== "undefined" ? parseImplicitAuthHash(window.location.hash) : null;
  const tokens = fromHash ?? readStashedRecoveryTokens();
  if (!tokens) return false;

  const { error } = await client.auth.setSession({
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  });
  if (error) return false;

  if (typeof window !== "undefined" && window.location.hash) {
    const url = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(window.history.state, "", url);
  }
  try {
    sessionStorage.removeItem(RECOVERY_TOKENS_KEY);
  } catch {
    // ignore
  }
  markPasswordRecoveryIntent();
  return true;
}

export function isPortalPasswordReset(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("portal") === "1";
}
