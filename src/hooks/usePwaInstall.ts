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

  // Dismissing must flip local state so the banner unmounts immediately;
  // localStorage alone never re-renders React, which left the banner up while
  // the header slid beneath it.
  const dismiss = useCallback(() => {
    dismissPwaInstallPrompt();
    setDismissed(true);
  }, []);

  // The auto-banner only shows when not installed/dismissed and either a native
  // prompt is ready (Android/Chrome) or the device is iOS (manual add).
  const showAutoBanner =
    !standalone && !installed && !dismissed && (nativeReady || isIosDevice());

  return {
    showAutoBanner,
    canNativeInstall: nativeReady,
    isIos: isIosDevice(),
    standalone,
    installed,
    install,
    dismiss,
  };
}
