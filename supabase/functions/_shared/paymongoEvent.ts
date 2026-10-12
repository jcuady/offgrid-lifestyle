/**
 * Pure PayMongo webhook event parsing (no Deno deps, unit-tested from src/lib/paymongoEvent.test.ts).
 *
 * Real envelope: { data: { id: "evt_…", type: "event", attributes: { type: "<event name>", livemode, data: <resource> } } }
 * `data.type` is always the literal "event" — the event name is `data.attributes.type`.
 */

export type CheckoutSessionData = {
  id?: string;
  attributes?: {
    reference_number?: string;
    metadata?: Record<string, unknown>;
    payments?: Array<{
      id?: string;
      attributes?: {
        status?: string;
        amount?: number;
        fee?: number;
        net_amount?: number;
        source?: { type?: string };
      };
    }>;
    payment_intent?: { id?: string };
    status?: string;
  };
};

export type ParsedPaymongoEvent = {
  eventId: string;
  eventType: string;
  session: CheckoutSessionData | null;
  livemode: boolean;
};

export function parsePaymongoEvent(payload: unknown): ParsedPaymongoEvent | null {
  const envelope = (payload as { data?: Record<string, unknown> } | null)?.data;
  const attrs = envelope?.attributes as
    | { type?: unknown; livemode?: unknown; data?: unknown }
    | undefined;
  const eventType = typeof attrs?.type === "string" ? attrs.type : "";
  if (!envelope || !eventType) return null;

  const session =
    attrs?.data && typeof attrs.data === "object" ? (attrs.data as CheckoutSessionData) : null;
  const eventId =
    typeof envelope.id === "string" && envelope.id
      ? envelope.id
      : `${eventType}:${session?.id ?? crypto.randomUUID()}`;

  return { eventId, eventType, session, livemode: Boolean(attrs?.livemode) };
}

/**
 * Only the checkout-session event carries the session id, metadata and payments[] needed to verify
 * the paid amount against the ledger. Bare `payment.*` events are acknowledged and ignored.
 */
export function isSettlementEvent(eventType: string): boolean {
  return eventType === "checkout_session.payment.paid";
}
