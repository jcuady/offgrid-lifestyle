import { useEffect, useState } from "react";
import { localOrderService } from "@/src/services";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useEnsureOrdersLoaded } from "@/src/hooks/useEnsureOrdersLoaded";
import { normalizeOrderId } from "@/src/lib/orderId";

/** Resolve an order by ID, fetching from Supabase when the store is empty (deep links). */
export function useOrderDetail(rawOrderId: string | undefined) {
  useEnsureOrdersLoaded();
  const orderId = normalizeOrderId(rawOrderId) || undefined;

  const retail = usePortalStore((s) => s.retailOrders.find((o) => o.id === orderId));
  const custom = usePortalStore((s) => s.customOrders.find((o) => o.id === orderId));
  const [loading, setLoading] = useState(Boolean(orderId) && !retail && !custom);
  const [lookupDone, setLookupDone] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    if (retail || custom) {
      setLoading(false);
      return;
    }
    if (lookupDone) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    localOrderService.fetchOrderById(orderId).finally(() => {
      if (!cancelled) {
        setLookupDone(true);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [orderId, retail, custom, lookupDone]);

  return {
    retail,
    custom,
    loading,
    found: Boolean(retail || custom),
    orderId,
  };
}
