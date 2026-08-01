/** Upsert by id — replace existing row or prepend. Keeps session cache aligned with DB. */
export function upsertById<T extends { id: string }>(list: T[], item: T): T[] {
  const i = list.findIndex((o) => o.id === item.id);
  if (i < 0) return [item, ...list];
  const next = list.slice();
  next[i] = item;
  return next;
}
