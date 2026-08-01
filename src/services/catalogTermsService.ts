import { supabase } from "@/src/lib/supabase";
import {
  normalizeCatalogLabel,
  slugifyCatalogLabel,
  type CatalogLabelKind,
} from "@/src/lib/catalogTaxonomy";

export interface CatalogTerm {
  id: string;
  kind: CatalogLabelKind;
  label: string;
  slug: string;
  sortOrder: number;
}

type TermRow = {
  id: string;
  kind: CatalogLabelKind;
  label: string;
  slug: string;
  sort_order: number;
};

function rowToTerm(row: TermRow): CatalogTerm {
  return {
    id: row.id,
    kind: row.kind,
    label: row.label,
    slug: row.slug,
    sortOrder: row.sort_order,
  };
}

export async function listCatalogTerms(kind?: CatalogLabelKind): Promise<CatalogTerm[]> {
  let query = supabase
    .from("og_catalog_terms")
    .select("id, kind, label, slug, sort_order")
    .order("sort_order", { ascending: true })
    .order("label", { ascending: true });

  if (kind) query = query.eq("kind", kind);

  const { data, error } = await query;
  if (error) {
    // Table may not exist yet on older environments — fail soft for list.
    if (/og_catalog_terms|schema cache/i.test(error.message)) return [];
    throw new Error(`Could not load catalog terms: ${error.message}`);
  }
  return (data as TermRow[] | null)?.map(rowToTerm) ?? [];
}

export async function addCatalogTerm(kind: CatalogLabelKind, label: string): Promise<CatalogTerm> {
  const normalized = normalizeCatalogLabel(label);
  if (!normalized) throw new Error("Label is required.");
  if (normalized.length > 40) throw new Error("Label must be 40 characters or fewer.");

  const { data, error } = await supabase
    .from("og_catalog_terms")
    .upsert(
      {
        kind,
        label: normalized,
        slug: slugifyCatalogLabel(normalized),
        sort_order: 100,
      },
      { onConflict: "kind,slug" },
    )
    .select("id, kind, label, slug, sort_order")
    .single();

  if (error) throw new Error(`Could not add ${kind}: ${error.message}`);
  return rowToTerm(data as TermRow);
}

export async function renameCatalogTerm(
  kind: CatalogLabelKind,
  fromLabel: string,
  toLabel: string,
): Promise<void> {
  const from = normalizeCatalogLabel(fromLabel);
  const to = normalizeCatalogLabel(toLabel);
  if (!from || !to) throw new Error("Both labels are required.");
  if (to.length > 40) throw new Error("Label must be 40 characters or fewer.");

  const { error } = await supabase.rpc("og_rename_catalog_term", {
    p_kind: kind,
    p_from_label: from,
    p_to_label: to,
  });
  if (error) throw new Error(`Could not rename ${kind}: ${error.message}`);
}

export async function deleteCatalogTerm(kind: CatalogLabelKind, label: string): Promise<void> {
  const normalized = normalizeCatalogLabel(label);
  if (!normalized) throw new Error("Label is required.");

  const { error } = await supabase.rpc("og_delete_catalog_term", {
    p_kind: kind,
    p_label: normalized,
  });
  if (error) throw new Error(`Could not delete ${kind}: ${error.message}`);
}
