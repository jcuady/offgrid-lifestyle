import { useEffect, useState } from "react";
import { isStandalonePwa } from "@/src/lib/pwa";

export function usePwaStandalone(): boolean {
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setStandalone(isStandalonePwa());
    const mq = window.matchMedia("(display-mode: standalone)");
    const onChange = () => setStandalone(isStandalonePwa());
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return standalone;
}
