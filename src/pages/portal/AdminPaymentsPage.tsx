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
import { supabase } from "@/src/lib/supabase";

export function AdminPaymentsPage() {
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const updatePaymentSettings = usePortalStore((s) => s.updatePaymentSettings);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // On mount: sync GCash QR URL from Supabase so all admins see the latest.
  useEffect(() => {
    supabase
      .from("og_payment_settings")
      .select("gcash_qr_image_url")
      .single()
      .then(({ data }) => {
        if (data?.gcash_qr_image_url) {
          updatePaymentSettings({ gcashQrImageUrl: data.gcash_qr_image_url });
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

      // Upsert the global payment settings row with the new QR URL
      const { data: existing } = await supabase
        .from("og_payment_settings")
        .select("id")
        .limit(1)
        .single();

      if (existing) {
        await supabase
          .from("og_payment_settings")
          .update({ gcash_qr_image_url: publicUrl })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("og_payment_settings")
          .insert({ gcash_qr_image_url: publicUrl });
      }

      updatePaymentSettings({ gcashQrImageUrl: publicUrl });
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const patchPaymongo = (patch: Partial<typeof paymentSettings.paymongo>) => {
    updatePaymentSettings({
      paymongo: { ...paymentSettings.paymongo, ...patch },
    });
  };

  const patchCod = (patch: Partial<typeof paymentSettings.cod>) => {
    updatePaymentSettings({
      cod: { ...paymentSettings.cod, ...patch },
    });
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Payments"
        title="Checkout payments"
        description="GCash is live at checkout. PayMongo and COD are prepared — enable each in admin when ready."
        actions={
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <Link to="/shop" target="_blank" rel="noreferrer">
              <ExternalLink className="h-3.5 w-3.5" />
              Preview checkout
            </Link>
          </Button>
        }
      />

      <CmsSectionPanel title="Global GCash settings" description="Manual GCash QR shown at retail checkout.">
        <CmsField label="QR image URL" className="sm:col-span-2">
          <CmsImageInput
            value={paymentSettings.gcashQrImageUrl}
            onChange={(v) => updatePaymentSettings({ gcashQrImageUrl: v })}
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
            onChange={(v) => updatePaymentSettings({ gcashInstructions: v })}
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
        title="PayMongo (coming soon)"
        description="Prepared for hosted checkout — GCash, Maya, GrabPay, and cards. Maps to og_payment_settings in Supabase."
      >
        <CmsField
          label="Enable PayMongo at checkout"
          hint="Leave off until your server creates PayMongo Checkout Sessions. Customers see PayMongo as “Coming soon” while disabled."
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

        <CmsField label="Webhook endpoint (production)" className="sm:col-span-2">
          <p className="mt-2 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50 px-4 py-3 font-mono text-xs text-offgrid-green/80">
            {typeof window !== "undefined" ? `${window.location.origin}${paymongoWebhookPath()}` : paymongoWebhookPath()}
          </p>
          <p className="mt-2 text-[10px] text-offgrid-green/50">
            Register this URL in PayMongo Dashboard. Verify with PAYMONGO_WEBHOOK_SECRET server env. Events update{" "}
            <code className="text-offgrid-green/70">og_payment_transactions</code>.
          </p>
        </CmsField>
      </CmsSectionPanel>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-offgrid-gold/25 bg-offgrid-gold/[0.06] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Zap className="mt-0.5 h-5 w-5 shrink-0 text-offgrid-gold" />
            <div className="space-y-2 text-sm text-offgrid-green/80">
              <p className="font-semibold text-offgrid-green">PayMongo — coming soon</p>
              <p className="text-xs">
                Enable after server checkout + webhook. Supports GCash, Maya, GrabPay, and cards online.
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-offgrid-gold/25 bg-offgrid-gold/[0.06] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Banknote className="mt-0.5 h-5 w-5 shrink-0 text-offgrid-gold" />
            <div className="space-y-2 text-sm text-offgrid-green/80">
              <p className="font-semibold text-offgrid-green">COD — coming soon</p>
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
