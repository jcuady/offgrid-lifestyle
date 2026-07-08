import { useEffect } from "react";
import { initAnalytics } from "@/src/lib/analytics";

/** Re-initializes GA when user accepts cookies (RouteSeo handles page views). */
export function GoogleAnalytics() {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === "og-cookie-consent" && event.newValue === "accepted") {
        initAnalytics();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return null;
}
