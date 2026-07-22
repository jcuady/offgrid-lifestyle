/**
 * Cross-tab handoff for signup email confirmation.
 * Email clients open a new tab — we cannot force focus to an existing one.
 * Instead: the pending signup tab claims leadership; the confirm tab defers.
 */

const CHANNEL = "og-auth-tabs-v1";

type Msg =
  | { type: "anyone-pending-signup"; id: string }
  | { type: "pending-signup-here"; replyTo: string }
  | { type: "email-confirmed" };

const HANDOFF_KEY = "og_email_confirm_handoff";

export function markEmailConfirmHandoffTab(): void {
  try {
    sessionStorage.setItem(HANDOFF_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function consumeEmailConfirmHandoffTab(): boolean {
  try {
    if (sessionStorage.getItem(HANDOFF_KEY) !== "1") return false;
    sessionStorage.removeItem(HANDOFF_KEY);
    return true;
  } catch {
    return false;
  }
}

function openChannel(): BroadcastChannel | null {
  try {
    return typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CHANNEL) : null;
  } catch {
    return null;
  }
}

/** Pending "check your email" tab: answer polls + navigate when confirm succeeds elsewhere. */
export function subscribePendingSignupTab(onConfirmed: () => void): () => void {
  const ch = openChannel();
  if (!ch) return () => {};

  ch.onmessage = (event: MessageEvent<Msg>) => {
    const data = event.data;
    if (!data || typeof data !== "object") return;
    if (data.type === "anyone-pending-signup") {
      ch.postMessage({ type: "pending-signup-here", replyTo: data.id } satisfies Msg);
    }
    if (data.type === "email-confirmed") onConfirmed();
  };

  return () => ch.close();
}

export function announceEmailConfirmed(): void {
  const ch = openChannel();
  if (!ch) return;
  ch.postMessage({ type: "email-confirmed" } satisfies Msg);
  ch.close();
}

/** True when another tab is still on the check-your-email screen. */
export function hasPendingSignupPeer(timeoutMs = 280): Promise<boolean> {
  const ch = openChannel();
  if (!ch) return Promise.resolve(false);

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: boolean) => {
      if (settled) return;
      settled = true;
      ch.close();
      resolve(value);
    };

    ch.onmessage = (event: MessageEvent<Msg>) => {
      const data = event.data;
      if (data?.type === "pending-signup-here" && data.replyTo === id) finish(true);
    };

    ch.postMessage({ type: "anyone-pending-signup", id } satisfies Msg);
    window.setTimeout(() => finish(false), timeoutMs);
  });
}
