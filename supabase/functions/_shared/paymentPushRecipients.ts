/** Pure helpers for resolving who should receive payment-confirmed Web Push. */

export function resolvePaymentPushUserIds(input: {
  customerId: string | null | undefined;
  emailMatchedUserIds: string[];
}): string[] {
  const ids = new Set<string>();
  if (input.customerId) ids.add(input.customerId);
  for (const id of input.emailMatchedUserIds) {
    if (id) ids.add(id);
  }
  return [...ids];
}
