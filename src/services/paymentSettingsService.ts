import type { Database } from "@/src/types/database";
import type { PaymentSettings } from "@/src/store/usePortalStore";
import { usePortalStore } from "@/src/store/usePortalStore";
import { supabase } from "@/src/lib/supabase";

type SettingsRow = Database["public"]["Tables"]["og_payment_settings"]["Row"];
type SettingsUpdate = Database["public"]["Tables"]["og_payment_settings"]["Update"];

function rowToSettings(row: SettingsRow): PaymentSettings {
  return {
    gcashQrImageUrl: row.gcash_qr_image_url,
    gcashInstructions: row.gcash_instructions,
    cod: {
      enabled: row.cod_enabled,
      checkoutDescription: row.cod_checkout_description,
    },
    paymongo: {
      enabled: row.paymongo_enabled,
      mode: row.paymongo_mode as "test" | "live",
      publicKey: row.paymongo_public_key ?? "",
      checkoutDescription: row.paymongo_checkout_description,
    },
  };
}

function settingsToRow(settings: PaymentSettings): SettingsUpdate {
  return {
    gcash_qr_image_url: settings.gcashQrImageUrl,
    gcash_instructions: settings.gcashInstructions,
    cod_enabled: settings.cod.enabled,
    cod_checkout_description: settings.cod.checkoutDescription,
    paymongo_enabled: settings.paymongo.enabled,
    paymongo_mode: settings.paymongo.mode,
    paymongo_public_key: settings.paymongo.publicKey || null,
    paymongo_checkout_description: settings.paymongo.checkoutDescription,
  };
}

async function getSettingsRowId(): Promise<string | null> {
  const { data } = await supabase.from("og_payment_settings").select("id").limit(1).maybeSingle();
  return data?.id ?? null;
}

export async function hydratePaymentSettingsFromSupabase(): Promise<void> {
  const { data, error } = await supabase.from("og_payment_settings").select("*").limit(1).maybeSingle();
  if (error || !data) return;
  usePortalStore.getState().updatePaymentSettings(rowToSettings(data));
}

export async function persistPaymentSettings(patch: Partial<PaymentSettings>): Promise<void> {
  const current = usePortalStore.getState().paymentSettings;
  const merged: PaymentSettings = {
    gcashQrImageUrl: patch.gcashQrImageUrl ?? current.gcashQrImageUrl,
    gcashInstructions: patch.gcashInstructions ?? current.gcashInstructions,
    cod: { ...current.cod, ...patch.cod },
    paymongo: { ...current.paymongo, ...patch.paymongo },
  };

  usePortalStore.getState().updatePaymentSettings(merged);

  const rowId = await getSettingsRowId();
  const dbPatch = settingsToRow(merged);

  const { error } = rowId
    ? await supabase.from("og_payment_settings").update(dbPatch).eq("id", rowId)
    : await supabase.from("og_payment_settings").insert(dbPatch);

  if (error) {
    throw new Error(`Could not save payment settings: ${error.message}`);
  }
}
