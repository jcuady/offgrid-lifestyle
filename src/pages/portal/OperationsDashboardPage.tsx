import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, Factory, PackageCheck, ShoppingCart } from "lucide-react";
import type { UserRole } from "@/src/store/usePortalStore";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useStore } from "@/src/store/store";

interface OperationsDashboardPageProps {
  role: UserRole;
}

const titleByRole: Record<UserRole, string> = {
  admin: "Admin Dashboard",
  staff: "Staff Dashboard",
  customer: "Dashboard",
};

export function OperationsDashboardPage({ role }: OperationsDashboardPageProps) {
  const navigate = useNavigate();
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);
  const cart = useStore((state) => state.cart);

  const allOrders = useMemo(
    () => [...retailOrders, ...customOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [retailOrders, customOrders],
  );
  const pendingCount = allOrders.filter((order) => order.status === "pending_deposit").length;
  const productionCount = allOrders.filter((order) => order.status === "in_production").length;
  const shippedCount = allOrders.filter((order) => order.status === "shipped" || order.status === "delivered").length;
  const salesTotal = retailOrders.reduce((sum, order) => sum + order.total.amount, 0);
  const cartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        {role === "admin" ? "Admin Console" : "Staff Workspace"}
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">{titleByRole[role]}</h1>
      <p className="mt-3 max-w-2xl text-sm text-offgrid-green/60">
        Monitor retail and custom orders from a single branded operations view.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <div className="inline-flex rounded-xl bg-amber-100 p-2 text-amber-700">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
            Pending
          </p>
          <p className="mt-1 text-3xl font-display font-black text-offgrid-green">{pendingCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <div className="inline-flex rounded-xl bg-blue-100 p-2 text-blue-700">
            <Factory className="h-4 w-4" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
            In Production
          </p>
          <p className="mt-1 text-3xl font-display font-black text-offgrid-green">{productionCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <div className="inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-700">
            <PackageCheck className="h-4 w-4" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
            Shipped / Delivered
          </p>
          <p className="mt-1 text-3xl font-display font-black text-offgrid-green">{shippedCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <div className="inline-flex rounded-xl bg-offgrid-green/10 p-2 text-offgrid-green">
            <ShoppingCart className="h-4 w-4" />
          </div>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
            Cart Units
          </p>
          <p className="mt-1 text-3xl font-display font-black text-offgrid-green">{cartUnits}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-display font-bold text-offgrid-green">Order Queue</h2>
            <p className="text-sm text-offgrid-green/55">
              {allOrders.length} total order(s) · Retail sales ₱{salesTotal.toLocaleString("en-PH")}
            </p>
          </div>
          <button
            onClick={() => navigate(`/portal/${role}/orders`)}
            className="rounded-xl bg-offgrid-green px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
          >
            Open Orders Board
          </button>
        </div>
        <button
          onClick={() => navigate(`/portal/${role}/analytics`)}
          className="mt-4 rounded-xl border border-offgrid-green/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green"
        >
          Open Monthly Sales Analytics
        </button>
      </div>
    </div>
  );
}
