import { useEffect } from "react";
import { localOrderService } from "@/src/services";
import { usePortalStore } from "@/src/store/usePortalStore";
import { supabase } from "@/src/lib/supabase";
import { logger } from "@/src/lib/logger";

/** Sync orders from Supabase into the portal session cache, including live status changes. */
export function useEnsureOrdersLoaded() {
  const userId = usePortalStore((s) => s.currentUser?.id);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;
    const refresh = () => {
      localOrderService
        .listOrders()
        .then(({ retailOrders, customOrders }) => {
          if (!cancelled) usePortalStore.setState({ retailOrders, customOrders });
        })
        .catch((err: unknown) => {
          logger.warn("Orders hydrate failed; keeping empty session cache", {
            service: "useEnsureOrdersLoaded",
            error: err instanceof Error ? err.message : String(err),
          });
        });
    };

    refresh();

    const channel = supabase
      .channel(`og-orders:${userId}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "og_orders" },
        () => refresh(),
      )
      .subscribe();

    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      void supabase.removeChannel(channel);
    };
  }, [userId]);
}
