import { useEffect } from "react";
import { localOrderService } from "@/src/services";
import { usePortalStore } from "@/src/store/usePortalStore";

/** Sync orders from Supabase into the portal store. */
export function useEnsureOrdersLoaded() {
  useEffect(() => {
    localOrderService.listOrders().then(({ retailOrders, customOrders }) => {
      usePortalStore.setState({ retailOrders, customOrders });
    });
  }, []);
}
