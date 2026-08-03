import { useEffect, useState } from "react";
import { localOrderService } from "@/src/services";

/** Shared proof-read seam for admin guide + PaymentProofAdminSection. */
export function useOrderPaymentProof(orderId: string | undefined) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    if (!orderId) {
      setProofUrl(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void localOrderService.fetchOrderProofUrl(orderId).then((url) => {
      if (cancelled) return;
      setProofUrl(url);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  return {
    proofUrl,
    loading,
    hasPaymentProof: Boolean(proofUrl),
  };
}
