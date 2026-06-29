import type { ShippingInfo } from "@/src/types/commerce";
import { formatCityProvinceZipLine } from "@/src/lib/portal";

interface OrderDeliveryDetailsProps {
  shippingInfo: ShippingInfo | null | undefined;
  emptyMessage?: string;
}

export function OrderDeliveryDetails({
  shippingInfo,
  emptyMessage = "No delivery address on file for this order.",
}: OrderDeliveryDetailsProps) {
  if (!shippingInfo?.regionCode && !shippingInfo?.address) {
    return <p className="mt-4 text-sm text-offgrid-green/55">{emptyMessage}</p>;
  }

  return (
    <dl className="mt-4 space-y-2 text-sm text-offgrid-green/80">
      {shippingInfo.fullName ? (
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Recipient</dt>
          <dd className="font-medium text-offgrid-green">{shippingInfo.fullName}</dd>
        </div>
      ) : null}
      {shippingInfo.phone ? (
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Phone</dt>
          <dd>{shippingInfo.phone}</dd>
        </div>
      ) : null}
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Street address</dt>
        <dd>{shippingInfo.address || "—"}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Barangay</dt>
        <dd>{shippingInfo.barangay || "—"}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">City / province</dt>
        <dd className="mt-1">{formatCityProvinceZipLine(shippingInfo)}</dd>
      </div>
      {shippingInfo.region ? (
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Region</dt>
          <dd>{shippingInfo.region}</dd>
        </div>
      ) : null}
    </dl>
  );
}
