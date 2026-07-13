import { useCallback, useEffect, useState } from "react";
import {
  canNativeInstall,
  dismissPwaInstallPrompt,
  initPwaInstall,
  isIosDevice,
  isPwaInstallDismissed,
  isStandalonePwa,
  promptNativeInstall,
  subscribePwaInstall,
  wasInstalledThisSession,
} from "@/src/lib/pwa";

export function usePwaInstall() {
  const [nativeReady, setNativeReady] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    initPwaInstall();
    setStandalone(isStandalonePwa());
    setNativeReady(canNativeInstall());
    setInstalled(wasInstalledThisSession());
    setDismissed(isPwaInstallDismissed());

    const sync = () => {
      setNativeReady(canNativeInstall());
      setInstalled(wasInstalledThisSession());
      setDismissed(isPwaInstallDismissed());
    };
    const unsubscribe = subscribePwaInstall(sync);

    const mq = window.matchMedia("(display-mode: standalone)");
    const onDisplayMode = () => setStandalone(isStandalonePwa());
    mq.addEventListener("change", onDisplayMode);

    return () => {
      unsubscribe();
      mq.removeEventListener("change", onDisplayMode);
    };
  }, []);

  const install = useCallback(async () => {
    const outcome = await promptNativeInstall();
    return outcome === "accepted";
  }, []);

  const dismiss = useCallback(() => {
    dismissPwaInstallPrompt();
    setDismissed(true);
  }, []);

  // Soft auto-offer only when installable (Chrome) or iOS (manual Add to Home Screen).
  const shouldAutoPrompt =
    !standalone && !installed && !dismissed && (nativeReady || isIosDevice());

  return {
    shouldAutoPrompt,
    canNativeInstall: nativeReady,
    isIos: isIosDevice(),
    standalone,
    installed,
    install,
    dismiss,
  };
}
