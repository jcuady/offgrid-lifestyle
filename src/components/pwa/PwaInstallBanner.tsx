import { useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { dismissPwaInstallPrompt, openInstallGuide } from "@/src/lib/pwa";
import { usePwaInstall } from "@/src/hooks/usePwaInstall";

export function PwaInstallBanner() {
  const { showAutoBanner, canNativeInstall, install } = usePwaInstall();

  useEffect(() => {
    if (!showAutoBanner) {
      document.documentElement.style.removeProperty("--pwa-install-banner-height");
      return;
    }
    document.documentElement.style.setProperty("--pwa-install-banner-height", "5.75rem");
    return () => document.documentElement.style.removeProperty("--pwa-install-banner-height");
  }, [showAutoBanner]);

  if (!showAutoBanner) return null;

  const handleDismiss = () => {
    dismissPwaInstallPrompt();
    document.documentElement.style.removeProperty("--pwa-install-banner-height");
  };

  const handleInstall = async () => {
    if (canNativeInstall) {
      const accepted = await install();
      if (accepted) dismissPwaInstallPrompt();
      return;
    }
    openInstallGuide();
  };

  return (
    <div
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
