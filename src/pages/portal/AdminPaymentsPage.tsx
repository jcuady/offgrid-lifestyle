import { useEffect, useState, type ChangeEvent } from "react";
import { ExternalLink, QrCode, Upload, Zap, Banknote } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { CmsField, CmsImageInput, CmsSectionPanel, CmsTextInput } from "@/src/components/admin/landing/CmsField";
import { usePortalStore } from "@/src/store/usePortalStore";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { fileAcceptAttribute, fileRuleHint, validateUploadedFile } from "@/src/lib/fileValidation";
import { paymongoWebhookPath } from "@/src/lib/paymongo";
import type { PayMongoMode } from "@/src/types/payments";
import { hydratePaymentSettingsFromSupabase, persistPaymentSettings } from "@/src/services";
import { supabase } from "@/src/lib/supabase";

export function AdminPaymentsPage() {
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    void hydratePaymentSettingsFromSupabase();
  }, []);

  const saveSettings = (patch: Parameters<typeof persistPaymentSettings>[0]) => {
    setSaveError(null);
    void persistPaymentSettings(patch).catch((err) => {
      setSaveError(err instanceof Error ? err.message : "Could not save payment settings.");
    });
  };

  const onUploadQr = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const check = validateUploadedFile(file, "imageAsset");
    if (check.ok === false) {
      setUploadError(check.error);
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const path = `gcash-qr.${ext}`;

      const { data: storageData, error: storageErr } = await supabase.storage
        .from("payment-assets")
        .upload(path, file, { upsert: true });
      if (storageErr) throw storageErr;

      const { data: { publicUrl } } = supabase.storage
        .from("payment-assets")
        .getPublicUrl(storageData.path);

      await persistPaymentSettings({ gcashQrImageUrl: publicUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const patchPaymongo = (patch: Partial<typeof paymentSettings.paymongo>) => {
    saveSettings({ paymongo: { ...paymentSettings.paymongo, ...patch } });
  };

  const patchCod = (patch: Partial<typeof paymentSettings.cod>) => {
    saveSettings({ cod: { ...paymentSettings.cod, ...patch } });
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Payments"
        title="Checkout payments"
        description="GCash and PayMongo QR Ph are available at checkout when enabled. COD stays optional."
        actions={
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to="/shop" target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Preview checkout
            </Link>
          </Button>
        }
      />

      {saveError ? (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {saveError}
        </p>
      ) : null}

      <CmsSectionPanel title="Global GCash settings" description="Manual GCash QR shown at retail checkout.">
        <CmsField label="QR image URL" className="sm:col-span-2">
          <CmsImageInput
            value={paymentSettings.gcashQrImageUrl}
            onChange={(v) => saveSettings({ gcashQrImageUrl: v })}
            alt="GCash QR"
          />
        </CmsField>

        <CmsField label="Upload QR image" className="sm:col-span-2" hint="Stored in Supabase Storage — visible to all admins globally.">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-offgrid-green/25 px-4 py-3 text-sm text-offgrid-green/70 hover:bg-offgrid-green/[0.03]">
            <Upload className="h-4 w-4" />
            <span className="font-semibold text-offgrid-green">{uploading ? "Uploading..." : "Upload image file"}</span>
            <input type="file" accept={fileAcceptAttribute("imageAsset")} className="hidden" onChange={onUploadQr} />
          </label>
          {uploadError ? (
            <p className="mt-2 text-xs font-medium text-red-600" role="alert">
              {uploadError}
            </p>
          ) : null}
          <p className="mt-1 text-[10px] text-offgrid-green/50">{fileRuleHint("imageAsset")}</p>
        </CmsField>

        <CmsField label="Checkout instructions" className="sm:col-span-2">
          <CmsTextInput
            value={paymentSettings.gcashInstructions}
            onChange={(v) => saveSettings({ gcashInstructions: v })}
            multiline
            rows={3}
          />
        </CmsField>
      </CmsSectionPanel>

      <div className="mt-8 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex items-center gap-2 text-offgrid-green">
          <QrCode className="h-4 w-4" />
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/60">GCash preview</p>
        </div>
        <img
          src={paymentSettings.gcashQrImageUrl}
          alt="GCash QR preview"
          className="h-56 w-56 rounded-xl border border-offgrid-green/10 bg-offgrid-cream object-contain"
        />
        <p className="mt-3 max-w-xl text-xs text-offgrid-green/60">{paymentSettings.gcashInstructions}</p>
      </div>

      <div className="mt-10">
        <CmsSectionPanel
          title="Cash on delivery (coming soon)"
          description="COD at checkout. Maps to og_payment_settings.cod_enabled in Supabase."
        >
          <CmsField
            label="Enable COD at checkout"
            hint="Leave off until courier COD is operational. Customers see COD as “Coming soon” while disabled."
          >
            <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-offgrid-green">
              <input
                type="checkbox"
                checked={paymentSettings.cod.enabled}
                onChange={(e) => patchCod({ enabled: e.target.checked })}
                className="h-4 w-4 rounded border-offgrid-green/30"
              />
              Live at checkout
            </label>
          </CmsField>

          <CmsField label="Checkout description" className="sm:col-span-2">
            <CmsTextInput
              value={paymentSettings.cod.checkoutDescription}
              onChange={(v) => patchCod({ checkoutDescription: v })}
              multiline
              rows={2}
            />
          </CmsField>
        </CmsSectionPanel>
      </div>

      <div className="mt-10">
      <CmsSectionPanel
        title="PayMongo QR Ph"
        description="Hosted Checkout with QR Ph only. OFFGRID sets pass_on_fees=false so customers pay the order total; we absorb the fee."
      >
        <CmsField
          label="Enable PayMongo at checkout"
          hint="Requires Edge Function create-paymongo-checkout + webhook. Public key must be set (pk_test_* / pk_live_*)."
        >
          <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-offgrid-green">
            <input
              type="checkbox"
              checked={paymentSettings.paymongo.enabled}
              onChange={(e) => patchPaymongo({ enabled: e.target.checked })}
              className="h-4 w-4 rounded border-offgrid-green/30"
            />
            Live at checkout
          </label>
        </CmsField>

        <CmsField label="Environment">
          <select
            value={paymentSettings.paymongo.mode}
            onChange={(e) => patchPaymongo({ mode: e.target.value as PayMongoMode })}
            className="mt-2 w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25"
          >
            <option value="test">Test (pk_test_*)</option>
            <option value="live">Live (pk_live_*)</option>
          </select>
        </CmsField>

        <CmsField label="Public key" className="sm:col-span-2" hint="Public key only. Never store the secret key here — use PAYMONGO_SECRET_KEY on your server.">
          <CmsTextInput
            value={paymentSettings.paymongo.publicKey}
            onChange={(v) => patchPaymongo({ publicKey: v })}
            placeholder="pk_test_..."
          />
        </CmsField>

        <CmsField label="Checkout description" className="sm:col-span-2">
          <CmsTextInput
            value={paymentSettings.paymongo.checkoutDescription}
            onChange={(v) => patchPaymongo({ checkoutDescription: v })}
            multiline
            rows={2}
          />
        </CmsField>

        <CmsField label="Webhook endpoint (Supabase Edge)" className="sm:col-span-2">
          <p className="mt-2 break-all rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50 px-4 py-3 font-mono text-xs text-offgrid-green/80">
            {paymongoWebhookPath()}
          </p>
          <p className="mt-2 text-[10px] text-offgrid-green/50">
            Register this URL in PayMongo Dashboard (checkout_session.payment.paid, payment.paid, payment.failed).
            Store the signing secret as Edge secret <code className="text-offgrid-green/70">PAYMONGO_WEBHOOK_SECRET</code>{" "}
            or Vault <code className="text-offgrid-green/70">paymongo_webhook_secret</code>.
          </p>
        </CmsField>
      </CmsSectionPanel>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-offgrid-lime/25 bg-offgrid-lime/[0.06] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-offgrid-lime" />
            <div className="space-y-2 text-sm text-offgrid-green/80">
              <p className="font-semibold text-offgrid-green">PayMongo QR Ph</p>
              <p className="text-xs">
                Retail checkout redirects to hosted QR Ph. Custom deposits and balances pay from My orders. Processing
                fees are absorbed by OFFGRID.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-offgrid-gold/25 bg-offgrid-gold/[0.06] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-offgrid-gold" />
            <div className="space-y-2 text-sm text-offgrid-green/80">
              <p className="font-semibold text-offgrid-green">COD — optional</p>
              <p className="text-xs">
                Enable when courier cash-on-delivery is ready. Orders use <code className="text-[10px]">payment_method = cod</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
