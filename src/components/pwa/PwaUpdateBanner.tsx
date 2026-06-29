import { useEffect, useRef, useState } from "react";
import { Button } from "@/src/components/ui/Button";
import { registerSW } from "virtual:pwa-register";

export function PwaUpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateSWRef = useRef<((reloadPage?: boolean) => Promise<void>) | undefined>(undefined);

  useEffect(() => {
    updateSWRef.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
      onOfflineReady() {
        // Shell cached for offline use.
      },
    });
  }, []);

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[57] mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl border border-offgrid-green/15 bg-white px-4 py-3 shadow-xl sm:inset-x-auto sm:right-6"
    >
      <p className="text-sm font-medium text-offgrid-green">A new version is ready.</p>
      <Button size="sm" onClick={() => void updateSWRef.current?.(true)}>
        Update
      </Button>
    </div>
  );
}
