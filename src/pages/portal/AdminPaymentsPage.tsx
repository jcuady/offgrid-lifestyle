import { useState, type ChangeEvent } from "react";
import { ExternalLink, QrCode, Upload } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { CmsField, CmsImageInput, CmsSectionPanel, CmsTextInput } from "@/src/components/admin/landing/CmsField";
import { usePortalStore } from "@/src/store/usePortalStore";

export function AdminPaymentsPage() {
  const paymentSettings = usePortalStore((s) => s.paymentSettings);
  const updatePaymentSettings = usePortalStore((s) => s.updatePaymentSettings);
  const [uploading, setUploading] = useState(false);

  const onUploadQr = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Please upload an image file for the QR code.");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      if (result) updatePaymentSettings({ gcashQrImageUrl: result });
      setUploading(false);
    };
    reader.onerror = () => {
      setUploading(false);
      window.alert("Could not read image. Try another file.");
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-full px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Payments</p>
          <h1 className="mt-1 font-display text-3xl font-black text-offgrid-green">GCash QR</h1>
          <p className="mt-2 max-w-xl text-sm text-offgrid-green/60">
            Manage one global GCash QR code used across checkout for all regular orders.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" asChild>
          <Link to="/shop" target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" />
            Preview checkout
          </Link>
        </Button>
      </div>

      <CmsSectionPanel title="Global GCash settings" description="Applies to every retail checkout in this environment.">
        <CmsField label="QR image URL" className="sm:col-span-2">
          <CmsImageInput
            value={paymentSettings.gcashQrImageUrl}
            onChange={(v) => updatePaymentSettings({ gcashQrImageUrl: v })}
            alt="GCash QR"
          />
        </CmsField>

        <CmsField label="Upload QR image" className="sm:col-span-2" hint="Stored in localStorage as image data URL for this MVP.">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-offgrid-green/25 px-4 py-3 text-sm text-offgrid-green/70 hover:bg-offgrid-green/[0.03]">
            <Upload className="h-4 w-4" />
            <span className="font-semibold text-offgrid-green">{uploading ? "Uploading..." : "Upload image file"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={onUploadQr} />
          </label>
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
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/60">Preview</p>
        </div>
        <img
          src={paymentSettings.gcashQrImageUrl}
          alt="GCash QR preview"
          className="h-56 w-56 rounded-xl border border-offgrid-green/10 bg-offgrid-cream object-contain"
        />
        <p className="mt-3 max-w-xl text-xs text-offgrid-green/60">{paymentSettings.gcashInstructions}</p>
      </div>
    </div>
  );
}

