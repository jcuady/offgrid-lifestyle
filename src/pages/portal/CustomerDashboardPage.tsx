import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Package2, Palette, ShoppingBag } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { formatMoney } from "@/src/types/commerce";
import { formatOrderStatus, orderStatusClass } from "@/src/lib/portal";
import { cn } from "@/src/lib/utils";
import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";

export function CustomerDashboardPage() {
  const navigate = useNavigate();
  const cart = useStore((state) => state.cart);
  const toggleCart = useStore((state) => state.toggleCart);
  const user = usePortalStore((state) => state.currentUser);
  const retailOrders = usePortalStore((state) => state.retailOrders);
  const customOrders = usePortalStore((state) => state.customOrders);

  const customerRetailOrders = useMemo(
    () => retailOrders.filter((order) => !user || order.customerId === user.id),
    [retailOrders, user],
  );
  const customerCustomOrders = useMemo(
    () => customOrders.filter((order) => !user || order.customerId === user.id || order.customerEmail === user.email),
    [customOrders, user],
  );

  const latestOrders = [...customerRetailOrders, ...customerCustomOrders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);
  const monthlyOrders = Array.from({ length: 6 }).map((_, index) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - index));
    const label = d.toLocaleString("en-PH", { month: "short" });
    const count = [...customerRetailOrders, ...customerCustomOrders].filter((order) => {
      const created = new Date(order.createdAt);
      return created.getMonth() === d.getMonth() && created.getFullYear() === d.getFullYear();
    }).length;
    return { label, count };
  });
  const maxMonthCount = Math.max(...monthlyOrders.map((entry) => entry.count), 1);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        Customer Dashboard
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">
        Welcome, {user?.name ?? "Customer"}
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-offgrid-green/60">
        Track all your retail and custom orders in one place. This MVP is local-first and ready to
        connect to a backend API.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/40">
            Retail Orders
          </p>
          <p className="mt-2 text-3xl font-display font-black text-offgrid-green">
            {customerRetailOrders.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/40">
            Custom Orders
          </p>
          <p className="mt-2 text-3xl font-display font-black text-offgrid-green">
            {customerCustomOrders.length}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/40">
            Cart Value
          </p>
          <p className="mt-2 text-3xl font-display font-black text-offgrid-green">
            ₱{cartSubtotal.toLocaleString("en-PH")}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-offgrid-green/10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-display font-bold text-offgrid-green">Recent Orders</h2>
            <button
              onClick={() => navigate("/portal/customer/orders")}
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/60 transition-colors hover:text-offgrid-green"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {latestOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-offgrid-green/20 bg-offgrid-green/5 p-6 text-sm text-offgrid-green/60">
              No orders yet. Start shopping or submit your first custom order request.
            </div>
          ) : (
            <div className="space-y-3">
              {latestOrders.map((order) => {
                const isRetail = "lines" in order;
                const total = isRetail ? formatMoney(order.total) : formatMoney(order.estimatedTotal ?? { amount: 0, currency: "PHP" });
                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-3 rounded-xl border border-offgrid-green/10 bg-offgrid-cream/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
                        {isRetail ? "Retail Order" : "Custom Order"} · {order.id}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-offgrid-green">{total}</p>
                    </div>
                    <span
                      className={cn(
                        "inline-flex rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
                        orderStatusClass(order.status),
                      )}
                    >
                      {formatOrderStatus(order.status)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-white p-5 sm:p-6 shadow-sm ring-1 ring-offgrid-green/10 xl:col-span-1">
          <h2 className="text-xl font-display font-bold text-offgrid-green">Order Activity</h2>
          <p className="mt-1 text-xs text-offgrid-green/55">Last 6 months</p>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {monthlyOrders.map((entry) => (
              <div key={entry.label} className="flex flex-col items-center">
                <div className="flex h-24 w-full items-end rounded-lg bg-offgrid-green/5">
                  <div
                    className="w-full rounded-lg bg-offgrid-green"
                    style={{ height: `${(entry.count / maxMonthCount) * 100}%` }}
                  />
                </div>
                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-offgrid-green/50">{entry.label}</p>
                <p className="text-[10px] text-offgrid-green/45">{entry.count}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl bg-offgrid-green p-5 text-offgrid-cream shadow-sm">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/50">
            Quick Cart
          </p>
          <h3 className="mt-2 text-2xl font-display font-black">Ready to checkout?</h3>
          <p className="mt-2 text-sm text-offgrid-cream/65">
            Open cart drawer to review items and proceed to secure checkout.
          </p>

          <div className="mt-5 space-y-3">
            <div className="rounded-xl bg-offgrid-dark/25 p-3">
              <p className="text-xs text-offgrid-cream/60">Items</p>
              <p className="text-xl font-display font-black">{cartCount}</p>
            </div>
            <div className="rounded-xl bg-offgrid-dark/25 p-3">
              <p className="text-xs text-offgrid-cream/60">Subtotal</p>
              <p className="text-xl font-display font-black">₱{cartSubtotal.toLocaleString("en-PH")}</p>
            </div>
          </div>

          <Button
            size="lg"
            variant="secondary"
            className="mt-5 w-full"
            onClick={() => toggleCart(true)}
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            View Cart
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="mt-3 w-full border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green"
            onClick={() => navigate("/custom/order")}
          >
            <Palette className="mr-2 h-4 w-4" />
            New Custom Order
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="mt-3 w-full border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green"
            onClick={() => navigate("/shop")}
          >
            <Package2 className="mr-2 h-4 w-4" />
            Shop Retail
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="mt-3 w-full border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green"
            onClick={() => navigate("/custom")}
          >
            <ArrowRight className="mr-2 h-4 w-4" />
            Ordering guide
          </Button>
        </aside>
      </div>
    </div>
  );
}
