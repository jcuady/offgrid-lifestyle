import type { Database } from "@/src/types/database";
import { supabase } from "@/src/lib/supabase";
import {
  isPlanStatus,
  moveCardInBoard,
  validatePlanCardInput,
  type PlanCard,
  type PlanStatus,
} from "@/src/lib/planBoard";
import { usePortalStore } from "@/src/store/usePortalStore";

type PlanCardRow = Database["public"]["Tables"]["og_plan_cards"]["Row"];

function rowToCard(row: PlanCardRow): PlanCard {
  return {
    id: row.id,
    status: isPlanStatus(row.status) ? row.status : "upcoming",
    title: row.title,
    label: row.label ?? "",
    dueDate: row.due_date,
    notes: row.notes ?? "",
    sortOrder: row.sort_order,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const planTable = () => supabase.from("og_plan_cards");

export async function listPlanCards(): Promise<{ ok: true; cards: PlanCard[] } | { ok: false; message: string }> {
  const { data, error } = await planTable()
    .select("*")
    .order("status", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) return { ok: false, message: error.message };
  return { ok: true, cards: ((data ?? []) as unknown as PlanCardRow[]).map(rowToCard) };
}

export async function createPlanCard(input: {
  title: string;
  label?: string;
  dueDate?: string | null;
  notes?: string;
  status?: PlanStatus;
}): Promise<{ ok: true; card: PlanCard } | { ok: false; message: string }> {
  const validationError = validatePlanCardInput(input);
  if (validationError) return { ok: false, message: validationError };

  const status = input.status ?? "upcoming";
  const existing = await listPlanCards();
  if (existing.ok === false) return { ok: false, message: existing.message };
  const sortOrder = existing.cards.filter((c) => c.status === status).length;
  const createdBy = usePortalStore.getState().currentUser?.id ?? null;

  const { data, error } = await planTable()
    .insert({
      title: input.title.trim(),
      label: (input.label ?? "").trim(),
      due_date: input.dueDate || null,
      notes: (input.notes ?? "").trim(),
      status,
      sort_order: sortOrder,
      created_by: createdBy,
    } as never)
    .select("*")
    .single();

  if (error || !data) return { ok: false, message: error?.message ?? "Could not create card." };
  return { ok: true, card: rowToCard(data as unknown as PlanCardRow) };
}

export async function updatePlanCard(
  id: string,
  input: {
    title: string;
    label?: string;
    dueDate?: string | null;
    notes?: string;
    status?: PlanStatus;
  },
): Promise<{ ok: true; card: PlanCard } | { ok: false; message: string }> {
  const validationError = validatePlanCardInput(input);
  if (validationError) return { ok: false, message: validationError };

  const patch: Record<string, unknown> = {
    title: input.title.trim(),
    label: (input.label ?? "").trim(),
    due_date: input.dueDate || null,
    notes: (input.notes ?? "").trim(),
  };
  if (input.status) patch.status = input.status;

  const { data, error } = await planTable()
    .update(patch as never)
    .eq("id", id)
    .select("*")
    .single();

  if (error || !data) return { ok: false, message: error?.message ?? "Could not update card." };
  return { ok: true, card: rowToCard(data as unknown as PlanCardRow) };
}

export async function deletePlanCard(id: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await planTable().delete().eq("id", id);
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}

/** Persist a drag move: rewrite sort_order for cards that changed. */
export async function persistCardMove(
  cards: PlanCard[],
  cardId: string,
  toStatus: PlanStatus,
  toIndex: number,
): Promise<{ ok: true; cards: PlanCard[] } | { ok: false; message: string }> {
  const next = moveCardInBoard(cards, cardId, toStatus, toIndex);
  const before = new Map(cards.map((c) => [c.id, c]));
  const changed = next.filter((c) => {
    const prev = before.get(c.id);
    return !prev || prev.status !== c.status || prev.sortOrder !== c.sortOrder;
  });

  for (const card of changed) {
    const { error } = await planTable()
      .update({ status: card.status, sort_order: card.sortOrder } as never)
      .eq("id", card.id);
    if (error) return { ok: false, message: error.message };
  }

  return { ok: true, cards: next };
}
