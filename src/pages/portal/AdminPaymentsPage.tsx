import { useEffect, useState, type ChangeEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { usePortalStore } from "@/src/store/usePortalStore";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { fileAcceptAttribute, fileRuleHint, validateUploadedFile } from "@/src/lib/fileValidation";
import { paymongoWebhookPath } from "@/src/lib/paymongo";
import { maskPaymongoPublicKey, paymongoKeyConfigured } from "@/src/lib/paymongoKeyDisplay";
import type { PayMongoMode } from "@/src/types/payments";
import { hydratePaymentSettingsFromSupabase, persistPaymentSettings } from "@/src/services";
import { supabase } from "@/src/lib/supabase";
import { cn } from "@/src/lib/utils";

const fieldClass =
  "mt-2 w-full rounded-xl border border-offgrid-green/20 bg-white px-4 py-3 text-sm text-offgrid-green outline-none transition-colors focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
      <div className="border-b border-offgrid-green/[0.07] pb-4">
        <h2 className="font-display text-xl font-bold text-offgrid-green">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-offgrid-green/55">{description}</p>
      </div>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className="block font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1.5 text-xs text-offgrid-green/50">{hint}</p> : null}
    </div>
  );
}

export function AdminPaymentsPage() {
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState<string | null>(null);
  const [keyDraft, setKeyDraft] = useState("");
  const [editingKey, setEditingKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);

  useEffect(() => {
    void hydratePaymentSettingsFromSupabase();
  }, []);

  const saveSettings = async (patch: Parameters<typeof persistPaymentSettings>[0], okMessage?: string) => {
    setSaveError(null);
    setSaveOk(null);
    try {
      await persistPaymentSettings(patch);
      if (okMessage) setSaveOk(okMessage);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save payment settings.");
    }
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

      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-assets").getPublicUrl(storageData.path);

      await persistPaymentSettings({ gcashQrImageUrl: publicUrl });
      setSaveOk("GCash QR image updated.");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const patchPaymongo = (patch: Partial<typeof paymentSettings.paymongo>) => {
    void saveSettings({ paymongo: { ...paymentSettings.paymongo, ...patch } });
  };

  const patchCod = (patch: Partial<typeof paymentSettings.cod>) => {
    void saveSettings({ cod: { ...paymentSettings.cod, ...patch } });
  };

  const savePublicKey = async () => {
    const next = keyDraft.trim();
    if (next && !paymongoKeyConfigured(next)) {
      setSaveError("Public key must start with pk_test_ or pk_live_.");
      return;
    }
    setSavingKey(true);
    try {
      await saveSettings(
        { paymongo: { ...paymentSettings.paymongo, publicKey: next } },
        next ? "PayMongo public key saved." : "PayMongo public key cleared.",
      );
      setKeyDraft("");
      setEditingKey(false);
    } finally {
      setSavingKey(false);
    }
  };

  const keyStatus = paymongoKeyConfigured(paymentSettings.paymongo.publicKey)
    ? maskPaymongoPublicKey(paymentSettings.paymongo.publicKey)
    : "Not configured";

  const hasQr =
    Boolean(paymentSettings.gcashQrImageUrl) &&
    !paymentSettings.gcashQrImageUrl.includes("placehold.co");

  return (
    <div className="min-w-0 overflow-x-hidden p-4 sm:p-6 lg:p-10">
      <PortalPageHeader
        eyebrow="Commerce · Payments"
        title="Payment methods"
        description="Manage the GCash QR customers scan at checkout and PayMongo QR Ph. Secret API keys stay on the server — never in this browser."
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link to="/shop" target="_blank" rel="noreferrer">
              Preview storefront
            </Link>
          </Button>
        }
      />

      {saveError ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {saveError}
        </p>
      ) : null}
      {saveOk ? (
        <p className="mb-4 rounded-xl border border-offgrid-lime/30 bg-offgrid-lime/10 px-4 py-3 text-sm text-offgrid-green" role="status">
          {saveOk}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Section
            title="GCash (manual QR)"
            description="Shown when a customer chooses GCash at retail checkout. Upload your merchant QR and write clear payment steps."
          >
            <Field
              label="QR image"
              hint={fileRuleHint("imageAsset")}
            >
              <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <label className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-xl border border-dashed border-offgrid-green/25 bg-offgrid-cream/40 px-4 py-3 text-sm font-semibold text-offgrid-green transition-colors hover:border-offgrid-lime/50 hover:bg-offgrid-cream/70">
                  {uploading ? "Uploading…" : "Upload QR image"}
                  <input
                    type="file"
                    accept={fileAcceptAttribute("imageAsset")}
                    className="sr-only"
                    onChange={onUploadQr}
                    disabled={uploading}
                  />
                </label>
              </div>
              {uploadError ? (
                <p className="mt-2 text-xs font-medium text-red-600" role="alert">
                  {uploadError}
                </p>
              ) : null}
            </Field>

            <Field
              label="Image URL"
              hint="Filled automatically after upload. You can paste a CDN URL if needed."
            >
              <input
                type="url"
                value={paymentSettings.gcashQrImageUrl}
                onChange={(e) => void saveSettings({ gcashQrImageUrl: e.target.value })}
                className={fieldClass}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            <Field label="Checkout instructions" hint="Shown under the QR on the checkout confirmation screen.">
              <textarea
                value={paymentSettings.gcashInstructions}
                onChange={(e) => void saveSettings({ gcashInstructions: e.target.value })}
                rows={4}
                className={cn(fieldClass, "resize-y min-h-[6rem]")}
              />
            </Field>
          </Section>

          <Section
            title="PayMongo QR Ph"
            description="Hosted QR Ph checkout. Customers pay the order total; OFFGRID absorbs processing fees. Secret keys are never stored in the admin UI."
          >
            <Field label="Availability">
              <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-offgrid-green">
                <input
                  type="checkbox"
                  checked={paymentSettings.paymongo.enabled}
                  onChange={(e) => patchPaymongo({ enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-offgrid-green/30"
                />
                Offer PayMongo at checkout
              </label>
            </Field>

            <Field label="Environment" hint="Must match the public key prefix (test vs live).">
              <select
                value={paymentSettings.paymongo.mode}
                onChange={(e) => patchPaymongo({ mode: e.target.value as PayMongoMode })}
                className={fieldClass}
              >
                <option value="test">Test</option>
                <option value="live">Live</option>
              </select>
            </Field>

            <Field
              label="Public key"
              hint="Only the publishable key (pk_…). Secret keys belong in server environment variables — they are not editable here."
            >
              {!editingKey ? (
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <p className="min-h-11 flex-1 rounded-xl border border-offgrid-green/15 bg-offgrid-cream/50 px-4 py-3 font-mono text-sm text-offgrid-green/80">
                    {keyStatus}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-11 shrink-0"
                    onClick={() => {
                      setEditingKey(true);
                      setKeyDraft("");
                      setSaveOk(null);
                    }}
                  >
                    {paymongoKeyConfigured(paymentSettings.paymongo.publicKey) ? "Replace key" : "Add key"}
                  </Button>
                </div>
              ) : (
                <div className="mt-2 space-y-2">
                  <input
                    type="password"
                    value={keyDraft}
                    onChange={(e) => setKeyDraft(e.target.value)}
                    placeholder="pk_test_… or pk_live_…"
                    className={fieldClass}
                    autoComplete="off"
                    spellCheck={false}
                    autoFocus
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" disabled={savingKey} onClick={() => void savePublicKey()}>
                      {savingKey ? "Saving…" : "Save key"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={savingKey}
                      onClick={() => {
                        setEditingKey(false);
                        setKeyDraft("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Field>

            <Field label="Checkout description">
              <textarea
                value={paymentSettings.paymongo.checkoutDescription}
                onChange={(e) => patchPaymongo({ checkoutDescription: e.target.value })}
                rows={3}
                className={cn(fieldClass, "resize-y")}
              />
            </Field>

            <Field
              label="Webhook endpoint"
              hint="Register this URL in the PayMongo dashboard. The signing secret is configured only in server secrets — never pasted into this page."
            >
              <p className="mt-2 break-all rounded-xl border border-offgrid-green/10 bg-offgrid-cream/50 px-4 py-3 font-mono text-xs text-offgrid-green/75">
                {paymongoWebhookPath()}
              </p>
            </Field>
          </Section>

          <Section
            title="Cash on delivery"
            description="Optional. Leave off until courier COD is ready to operate."
          >
            <Field label="Availability">
              <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-3 text-sm text-offgrid-green">
                <input
                  type="checkbox"
                  checked={paymentSettings.cod.enabled}
                  onChange={(e) => patchCod({ enabled: e.target.checked })}
                  className="h-4 w-4 rounded border-offgrid-green/30"
                />
                Offer COD at checkout
              </label>
            </Field>

            <Field label="Checkout description">
              <textarea
                value={paymentSettings.cod.checkoutDescription}
                onChange={(e) => patchCod({ checkoutDescription: e.target.value })}
                rows={2}
                className={cn(fieldClass, "resize-y")}
              />
            </Field>
          </Section>
        </div>

        <aside className="xl:col-span-2">
          <div className="sticky top-20 space-y-4">
            <section className="rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:p-6">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                GCash checkout preview
              </p>
              <p className="mt-1 text-sm text-offgrid-green/55">How the QR appears to customers after they place an order.</p>
              <div className="mt-5 flex justify-center rounded-xl border border-offgrid-green/10 bg-offgrid-cream/60 p-6">
                {hasQr ? (
                  <img
                    src={paymentSettings.gcashQrImageUrl}
                    alt="GCash QR as shown at checkout"
                    className="h-52 w-52 rounded-lg bg-white object-contain shadow-sm"
                  />
                ) : (
                  <div className="flex h-52 w-52 items-center justify-center rounded-lg border border-dashed border-offgrid-green/20 bg-white px-4 text-center text-xs text-offgrid-green/45">
                    Upload a QR image to preview it here
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-offgrid-green/70">
                {paymentSettings.gcashInstructions.trim() || "Add checkout instructions so customers know what to do after scanning."}
              </p>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/40">
                Status · {hasQr ? "QR ready" : "QR missing"}
              </p>
            </section>

            <section className="rounded-2xl border border-offgrid-green/10 bg-offgrid-cream/40 p-5">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-offgrid-green/45">
                Security
              </p>
              <ul className="mt-3 space-y-2 text-sm text-offgrid-green/65">
                <li>Public keys are masked after save.</li>
                <li>Secret API keys and webhook signing secrets are server-only.</li>
                <li>Never paste sk_ keys into this admin page.</li>
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
