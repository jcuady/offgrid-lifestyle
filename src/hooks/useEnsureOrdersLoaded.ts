import { useEffect } from "react";
import { localOrderService } from "@/src/services";
import { usePortalStore } from "@/src/store/usePortalStore";
import { logger } from "@/src/lib/logger";

/** Sync orders from Supabase into the portal session cache. */
export function useEnsureOrdersLoaded() {
  useEffect(() => {
    localOrderService
      .listOrders()
      .then(({ retailOrders, customOrders }) => {
        usePortalStore.setState({ retailOrders, customOrders });
      })
      .catch((err: unknown) => {
        logger.warn("Orders hydrate failed; keeping empty session cache", {
          service: "useEnsureOrdersLoaded",
          error: err instanceof Error ? err.message : String(err),
        });
      });
  }, []);
}
