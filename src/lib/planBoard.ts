/** Ops planning board — single board, three status columns. */

export type PlanStatus = "upcoming" | "in_progress" | "done";

export interface PlanCard {
  id: string;
  status: PlanStatus;
  title: string;
  label: string;
  dueDate: string | null;
  notes: string;
  sortOrder: number;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PLAN_COLUMNS: { status: PlanStatus; title: string }[] = [
  { status: "upcoming", title: "Upcoming" },
  { status: "in_progress", title: "In Progress" },
  { status: "done", title: "Done" },
];

/** Suggested labels — free text still allowed for customization. */
export const PLAN_LABEL_SUGGESTIONS = [
  "Marketing",
  "Ops",
  "Design",
  "Production",
  "Legal",
  "External",
] as const;

export function isPlanStatus(value: string): value is PlanStatus {
  return value === "upcoming" || value === "in_progress" || value === "done";
}

export function cardsInColumn(cards: PlanCard[], status: PlanStatus): PlanCard[] {
  return cards
    .filter((c) => c.status === status)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.createdAt.localeCompare(b.createdAt));
}

/**
 * Move a card to a column/index and renumber sortOrder in affected columns.
 * Returns the full next card list (immutable).
 */
export function moveCardInBoard(
  cards: PlanCard[],
  cardId: string,
  toStatus: PlanStatus,
  toIndex: number,
): PlanCard[] {
  const moving = cards.find((c) => c.id === cardId);
  if (!moving) return cards;

  const without = cards.filter((c) => c.id !== cardId);
  const dest = cardsInColumn(without, toStatus);
  const clamped = Math.max(0, Math.min(toIndex, dest.length));
  const nextDest = [
    ...dest.slice(0, clamped),
    { ...moving, status: toStatus },
    ...dest.slice(clamped),
  ].map((c, i) => ({ ...c, sortOrder: i }));

  const otherStatuses = PLAN_COLUMNS.map((c) => c.status).filter((s) => s !== toStatus);
  const rest = otherStatuses.flatMap((status) =>
    cardsInColumn(without, status).map((c, i) => ({ ...c, sortOrder: i })),
  );

  return [...rest, ...nextDest];
}

export function validatePlanCardInput(input: {
  title: string;
  label?: string;
  dueDate?: string | null;
  notes?: string;
}): string | null {
  if (!input.title.trim()) return "Title is required.";
  if (input.title.trim().length > 200) return "Title must be 200 characters or fewer.";
  if ((input.label ?? "").length > 40) return "Label must be 40 characters or fewer.";
  if ((input.notes ?? "").length > 4000) return "Notes must be 4000 characters or fewer.";
  if (input.dueDate && Number.isNaN(Date.parse(input.dueDate))) return "Due date is invalid.";
  return null;
}

export function formatPlanDueDate(isoDate: string | null): string | null {
  if (!isoDate) return null;
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function labelToneClass(label: string): string {
  const key = label.trim().toLowerCase();
  if (key.includes("market")) return "bg-amber-500/15 text-amber-800 ring-amber-500/25";
  if (key.includes("legal")) return "bg-emerald-500/15 text-emerald-800 ring-emerald-500/25";
  if (key.includes("design")) return "bg-sky-500/15 text-sky-800 ring-sky-500/25";
  if (key.includes("product")) return "bg-violet-500/15 text-violet-800 ring-violet-500/25";
  if (key.includes("external")) return "bg-cyan-500/15 text-cyan-800 ring-cyan-500/25";
  if (key.includes("ops") || key.includes("operation")) return "bg-offgrid-lime/10 text-offgrid-lime ring-offgrid-lime/25";
  return "bg-offgrid-green/8 text-offgrid-green/80 ring-offgrid-green/15";
}
