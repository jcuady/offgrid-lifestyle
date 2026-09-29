import { Printer } from "lucide-react";
import { OrderReceiptView, type OrderReceiptViewProps } from "@/src/components/orders/OrderReceiptView";
import { Button } from "@/src/components/ui/Button";

type OrderInvoiceSectionProps = OrderReceiptViewProps & {
  audience: "customer" | "staff";
  /** Custom orders stay a confirmation until operations posts an official total. */
  officialQuote?: boolean;
};

export function OrderInvoiceSection({
  audience,
  officialQuote = false,
  ...receipt
}: OrderInvoiceSectionProps) {
  const pendingOfficial = receipt.orderType === "custom" && !officialQuote;
  const title = pendingOfficial ? "Order confirmation" : "Invoice";
  const note = pendingOfficial
    ? "This is the confirmation emailed with the order. The official invoice total shows here after the team posts it."
    : audience === "staff"
      ? "Same invoice the customer can open on this order and in their email."
      : "Same invoice emailed for this order. Print or save it from here.";

  return (
    <section
      id="invoice"
      aria-labelledby="order-invoice-heading"
      className="mt-6 scroll-mt-24 rounded-2xl border border-offgrid-green/10 bg-white p-5 shadow-sm sm:mt-8 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div className="min-w-0">
          <h2 id="order-invoice-heading" className="text-lg font-display font-bold text-offgrid-green">
            {title}
          </h2>
          <p className="mt-1 max-w-prose text-sm leading-relaxed text-offgrid-green/70">{note}</p>
        </div>
        <Button type="button" variant="outline" className="min-h-11 shrink-0" onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
          Print invoice
        </Button>
      </div>
      <div className="mt-5 print:mt-0">
        <OrderReceiptView {...receipt} />
      </div>
    </section>
  );
}
