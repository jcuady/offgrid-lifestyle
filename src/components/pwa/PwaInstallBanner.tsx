import { useLayoutEffect, useRef } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { openInstallGuide } from "@/src/lib/pwa";
import { usePwaInstall } from "@/src/hooks/usePwaInstall";

const BANNER_HEIGHT_VAR = "--pwa-install-banner-height";

export function PwaInstallBanner() {
  const { showAutoBanner, canNativeInstall, install, dismiss } = usePwaInstall();
  const bannerRef = useRef<HTMLDivElement | null>(null);

  // The header is offset by this CSS var. On notched iOS the banner's
  // safe-area padding makes it taller than any hard-coded value, so we measure
  // the real rendered height and keep it in sync across resize/orientation.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!showAutoBanner) {
      root.style.removeProperty(BANNER_HEIGHT_VAR);
      return;
    }

    const node = bannerRef.current;
    if (!node) return;

    const sync = () => {
      root.style.setProperty(BANNER_HEIGHT_VAR, `${Math.ceil(node.offsetHeight)}px`);
    };
    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(node);
    window.addEventListener("orientationchange", sync);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", sync);
      root.style.removeProperty(BANNER_HEIGHT_VAR);
    };
  }, [showAutoBanner]);

  if (!showAutoBanner) return null;

  const handleDismiss = () => {
    document.documentElement.style.removeProperty(BANNER_HEIGHT_VAR);
    dismiss();
  };

  const handleInstall = async () => {
    if (canNativeInstall) {
      const accepted = await install();
      if (accepted) dismiss();
      return;
    }
    openInstallGuide();
  };

  return (
    <div
      ref={bannerRef}
      role="dialog"
      aria-label="Install OffGrid app"
      className="fixed inset-x-0 top-0 z-[58] border-b border-offgrid-green/10 bg-offgrid-green px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-offgrid-cream shadow-lg"
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-offgrid-cream/10">
          <Download className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-bold">Install OffGrid</p>
          <p className="mt-0.5 text-xs leading-relaxed text-offgrid-cream/75">
            Faster access, offline browsing, and order push notifications.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          className="h-9 shrink-0 bg-offgrid-cream text-offgrid-green hover:bg-white"
          onClick={() => void handleInstall()}
        >
          {canNativeInstall ? "Install" : "How to"}
        </Button>
        <button
          type="button"
          aria-label="Dismiss install prompt"
          className="shrink-0 rounded-full p-1.5 text-offgrid-cream/60 transition-colors hover:bg-offgrid-cream/10 hover:text-offgrid-cream"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
