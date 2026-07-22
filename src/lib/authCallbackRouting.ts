/**
 * Classify Supabase auth redirect URLs (hash tokens or PKCE ?code=).
 * Signup confirm must NOT be treated as password recovery.
 */

export type AuthCallbackKind = "recovery" | "signup_confirm" | "session" | "none";

export function classifyAuthCallback(input: {
  pathname: string;
  hash: string;
  search: string;
}): AuthCallbackKind {
  const hashParams = new URLSearchParams(input.hash.replace(/^#/, ""));
  const type = (hashParams.get("type") ?? "").toLowerCase();

  if (type === "recovery") return "recovery";
  if (type === "signup" || type === "email" || type === "invite" || type === "magiclink") {
    return "signup_confirm";
  }

  const search = new URLSearchParams(input.search.startsWith("?") ? input.search.slice(1) : input.search);
  const hasCode = search.has("code");
  const hasAccessToken = hashParams.has("access_token");

  // PKCE: emailRedirectTo path is the source of truth (type is not in the URL).
  if (hasCode) {
    if (input.pathname.startsWith("/account/reset-password")) return "recovery";
    if (
      input.pathname.startsWith("/account/orders") ||
      input.pathname.startsWith("/account/sign-in") ||
      input.pathname.startsWith("/account/sign-up")
    ) {
      return "signup_confirm";
    }
    return "session";
  }

  if (hasAccessToken) return "session";
  return "none";
}

/** Where to send the browser so the right page owns the callback. null = stay. */
export function authCallbackRedirectPath(input: {
  pathname: string;
  hash: string;
  search: string;
}): string | null {
  const kind = classifyAuthCallback(input);
  const hash = input.hash.startsWith("#") || !input.hash ? input.hash : `#${input.hash}`;
  const rawSearch = input.search.startsWith("?") ? input.search.slice(1) : input.search;
  const params = new URLSearchParams(rawSearch);

  if (kind === "recovery") {
    if (input.pathname.startsWith("/account/reset-password")) return null;
    const portal = params.get("portal") === "1" ? "?portal=1" : "";
    return `/account/reset-password${portal}${hash}`;
  }

  if (kind === "signup_confirm") {
    if (input.pathname.startsWith("/account/orders")) return null;
    // Preserve PKCE code / tokens so detectSessionInUrl can finish on /account/orders.
    params.delete("confirmed");
    const q = params.toString();
    return `/account/orders${q ? `?${q}` : ""}${hash}`;
  }

  return null;
}

/** True only for password-recovery callbacks (not signup confirm). */
export function isPasswordRecoveryCallback(input: {
  pathname: string;
  hash: string;
  search: string;
}): boolean {
  return classifyAuthCallback(input) === "recovery";
}
