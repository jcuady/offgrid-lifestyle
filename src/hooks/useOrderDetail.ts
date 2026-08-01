import { useEffect, useState } from "react";
import { localOrderService } from "@/src/services";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useEnsureOrdersLoaded } from "@/src/hooks/useEnsureOrdersLoaded";
import { normalizeOrderId } from "@/src/lib/orderId";

/** Resolve an order by ID; always refresh from Supabase so stale session cache cannot win. */
export function useOrderDetail(rawOrderId: string | undefined) {
  useEnsureOrdersLoaded();
  const orderId = normalizeOrderId(rawOrderId) || undefined;

  const retail = usePortalStore((s) => s.retailOrders.find((o) => o.id === orderId));
  const custom = usePortalStore((s) => s.customOrders.find((o) => o.id === orderId));
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const hasLocal = Boolean(
      usePortalStore.getState().retailOrders.some((o) => o.id === orderId) ||
        usePortalStore.getState().customOrders.some((o) => o.id === orderId),
    );
    if (!hasLocal) setLoading(true);

    localOrderService.fetchOrderById(orderId).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return {
    retail,
    custom,
    loading,
    found: Boolean(retail || custom),
    orderId,
  };
}
