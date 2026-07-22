import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { safeNavigationUrl } from "@/src/lib/safeUrl";

/** Handle service-worker postMessage deep links (push click / OS notification). */
export function PushNavigateListener() {
  const navigate = useNavigate();

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const data = event.data as { type?: string; url?: string } | null;
      if (data?.type !== "OG_NAVIGATE" || typeof data.url !== "string") return;
      navigate(safeNavigationUrl(data.url, "/"));
    };
    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", onMessage);
  }, [navigate]);

  return null;
}
