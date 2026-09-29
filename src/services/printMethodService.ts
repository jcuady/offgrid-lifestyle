import { supabase } from "@/src/lib/supabase";
import { MATERIAL_OPTIONS, type PrintMethodOption } from "@/src/data/customOptions";
import type { FabricType } from "@/src/types/commerce";

type PrintMethodRow = {
  id: string;
  label: string;
  description: string;
  price_modifier: number | string;
  fabric_ids: string[] | null;
  sort_order: number;
  is_published: boolean;
};

const SELECT = "id, label, description, price_modifier, fabric_ids, sort_order, is_published";
const FABRIC_IDS = new Set<string>(MATERIAL_OPTIONS.map((o) => o.id));

function rowToMethod(row: PrintMethodRow): PrintMethodOption {
  return {
    id: row.id,
    label: row.label,
    description: row.description ?? "",
    priceModifier: Number(row.price_modifier) || 1,
    fabricIds: (row.fabric_ids ?? []).filter((id): id is FabricType => FABRIC_IDS.has(id)),
    sortOrder: row.sort_order ?? 0,
    isPublished: row.is_published ?? true,
  };
}

/** RLS returns published rows to everyone and every row to admins. */
export async function listPrintMethods(): Promise<PrintMethodOption[]> {
  const { data, error } = await supabase
    .from("og_custom_print_methods")
    .select(SELECT)
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });
  if (error) throw new Error(`Could not load print methods: ${error.message}`);
  return ((data ?? []) as PrintMethodRow[]).map(rowToMethod);
}

export async function upsertPrintMethod(method: PrintMethodOption): Promise<PrintMethodOption> {
  const label = method.label.trim();
  if (!label) throw new Error("Label is required.");
  if (!/^[a-z0-9][a-z0-9_-]{0,47}$/.test(method.id)) {
    throw new Error("ID must be lowercase letters, numbers, dashes or underscores.");
  }
  if (!(method.priceModifier > 0 && method.priceModifier <= 10)) {
    throw new Error("Price modifier must be between 0 and 10.");
  }
  if (method.isPublished && method.fabricIds.length === 0) {
    throw new Error("Pick at least one fabric before publishing.");
  }

  const { data, error } = await supabase
    .from("og_custom_print_methods")
    .upsert({
      id: method.id,
      label,
      description: method.description.trim(),
      price_modifier: method.priceModifier,
      fabric_ids: method.fabricIds.filter((id) => FABRIC_IDS.has(id)),
      sort_order: method.sortOrder,
      is_published: method.isPublished,
    })
    .select(SELECT)
    .single();
  if (error) throw new Error(`Could not save print method: ${error.message}`);
  return rowToMethod(data as PrintMethodRow);
}

export async function deletePrintMethod(id: string): Promise<void> {
  const { error } = await supabase.from("og_custom_print_methods").delete().eq("id", id);
  if (error) throw new Error(`Could not delete print method: ${error.message}`);
}
