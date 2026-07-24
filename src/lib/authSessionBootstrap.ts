/**
 * Auth session bootstrap — single owner of URL callback consume + auth events.
 *
 * Standard SPA pattern with detectSessionInUrl: true:
 * 1. Stash recovery tokens before GoTrue clears the hash
 * 2. Never signOut during URL consume
 * 3. One singleton onAuthStateChange (StrictMode-safe)
 * 4. Gate post-login side effects (push / shipping) via policy
 */

import { supabase } from "@/src/lib/supabase";
import { logger } from "@/src/lib/logger";
import {
  maySignOutDuringUrlSessionConsume,
  planAuthBootstrap,
  planAuthEvent,
} from "@/src/lib/authSessionPolicy";
import {
  ensureRecoverySession,
  markPasswordRecoveryIntent,
  shouldSkipPostLoginSideEffects,
  stashRecoveryTokensFromUrl,
} from "@/src/lib/passwordReset";
import { markEmailConfirmHandoffTab } from "@/src/lib/authTabSync";
import {
  clearLocalShipping,
  hydrateCheckoutShipping,
} from "@/src/services/customerShippingService";
import { linkPushSubscriptionToUser } from "@/src/lib/pushSubscription";
import { usePortalStore, type PortalUser } from "@/src/store/usePortalStore";

export type ResolvePortalUser = () => Promise<PortalUser | null>;

type BootstrapDeps = {
  resolvePortalUser: ResolvePortalUser;
  replaceLocation?: (path: string) => void;
};

let bootstrapPromise: Promise<void> | null = null;
let unsubscribe: (() => void) | null = null;
const recoveryReadyListeners = new Set<() => void>();

/** ResetPasswordPage (and tests) subscribe instead of a second GoTrue listener. */
export function subscribeRecoverySessionReady(listener: () => void): () => void {
  recoveryReadyListeners.add(listener);
  return () => {
    recoveryReadyListeners.delete(listener);
  };
}

function notifyRecoverySessionReady(): void {
  for (const listener of recoveryReadyListeners) {
    try {
      listener();
    } catch (err) {
      logger.warn("Recovery ready listener failed", {
        operation: "notifyRecoverySessionReady",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

function runPostLoginSideEffects(user: PortalUser): void {
  void linkPushSubscriptionToUser();
  if (user.role === "customer") {
    void hydrateCheckoutShipping(user.id);
  }
}

/** Returns true when the document is navigating away. */
function applyUrlBootstrapPlan(replaceLocation: (path: string) => void): boolean {
  if (typeof window === "undefined") return false;

  const plan = planAuthBootstrap({
    pathname: window.location.pathname,
    hash: window.location.hash,
    search: window.location.search,
  });

  // Invariant — if this ever flips, recovery will race detectSessionInUrl again.
  if (plan.allowSignOut || maySignOutDuringUrlSessionConsume()) {
    throw new Error("authSessionBootstrap: signOut during URL consume is forbidden");
  }

  if (plan.stashRecoveryTokens) {
    stashRecoveryTokensFromUrl();
  }
  if (plan.markRecoveryIntent) {
    markPasswordRecoveryIntent();
  }
  if (plan.clearPortalChromeOnly) {
    usePortalStore.getState().setCurrentUser(null);
  }
  if (plan.markSignupHandoff) {
    markEmailConfirmHandoffTab();
  }
  if (plan.redirectTo) {
    replaceLocation(plan.redirectTo);
    return true;
  }
  return false;
}

function attachAuthListener(resolvePortalUser: ResolvePortalUser): void {
  if (unsubscribe) return;

  const { data } = supabase.auth.onAuthStateChange(async (event) => {
    const recoveryActive = shouldSkipPostLoginSideEffects();
    const previousPortalUserId = usePortalStore.getState().currentUser?.id ?? null;

    const early = planAuthEvent(event, {
      recoveryActive,
      previousPortalUserId,
      nextPortalUserId: null,
    });

    if (early.markRecoveryIntent) {
      markPasswordRecoveryIntent();
      notifyRecoverySessionReady();
      return;
    }

    if (early.clearUserAndShipping) {
      usePortalStore.getState().setCurrentUser(null);
      clearLocalShipping();
      return;
    }

    if (!early.resolvePortalUser) {
      if (recoveryActive && event === "SIGNED_IN") {
        notifyRecoverySessionReady();
      }
      return;
    }

    const resolved = await resolvePortalUser();
    const plan = planAuthEvent(event, {
      recoveryActive: shouldSkipPostLoginSideEffects(),
      previousPortalUserId,
      nextPortalUserId: resolved?.id ?? null,
    });

    if (plan.resolvePortalUser) {
      usePortalStore.getState().setCurrentUser(resolved);
    }

    if (plan.runPostLoginSideEffects && resolved) {
      runPostLoginSideEffects(resolved);
    }

    if (shouldSkipPostLoginSideEffects() && event === "SIGNED_IN") {
      notifyRecoverySessionReady();
    }
  });

  unsubscribe = () => {
    data.subscription.unsubscribe();
    unsubscribe = null;
  };
}

async function runBootstrap(deps: BootstrapDeps): Promise<void> {
  const replaceLocation =
    deps.replaceLocation ??
    ((path: string) => {
      window.location.replace(path);
    });

  if (typeof window !== "undefined") {
    const navigatedAway = applyUrlBootstrapPlan(replaceLocation);
    if (navigatedAway) {
      usePortalStore.getState().setAuthHydrated(true);
      return;
    }
  }

  try {
    // Wait for detectSessionInUrl / PKCE exchange before route guards.
    await supabase.auth.getSession();

    if (shouldSkipPostLoginSideEffects()) {
      const ok = await ensureRecoverySession(supabase);
      if (ok) notifyRecoverySessionReady();
    } else {
      const portalUser = await deps.resolvePortalUser();
      usePortalStore.getState().setCurrentUser(portalUser);
      // Session restore does not always emit SIGNED_IN — hydrate shipping once.
      if (portalUser?.role === "customer") {
        void hydrateCheckoutShipping(portalUser.id);
      }
    }
  } finally {
    usePortalStore.getState().setAuthHydrated(true);
  }

  attachAuthListener(deps.resolvePortalUser);
}

/**
 * Idempotent app-start bootstrap. Safe under React StrictMode double-mount.
 */
export function bootstrapAuthSession(deps: BootstrapDeps): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = runBootstrap(deps).catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

/** Test-only reset of singleton state. */
export function resetAuthSessionBootstrapForTests(): void {
  if (unsubscribe) unsubscribe();
  bootstrapPromise = null;
  recoveryReadyListeners.clear();
}

/**
 * Used by login/register when SIGNED_IN may lag or already saw the same user.
 * Pass previousPortalUserId from before setCurrentUser.
 */
export function applyPostLoginSideEffectsIfNeeded(
  user: PortalUser,
  previousPortalUserId: string | null,
): void {
  if (shouldSkipPostLoginSideEffects()) return;
  const plan = planAuthEvent("SIGNED_IN", {
    recoveryActive: false,
    previousPortalUserId,
    nextPortalUserId: user.id,
  });
  if (plan.runPostLoginSideEffects) {
    runPostLoginSideEffects(user);
  }
}
