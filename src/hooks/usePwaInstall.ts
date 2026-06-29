import { useCallback, useEffect, useState } from "react";
import {
  canNativeInstall,
  initPwaInstall,
  isIosDevice,
  isStandalonePwa,
  promptNativeInstall,
  shouldOfferPwaInstall,
  subscribePwaInstall,
  wasInstalledThisSession,
} from "@/src/lib/pwa";

export function usePwaInstall() {
  const [nativeReady, setNativeReady] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    initPwaInstall();
    setStandalone(isStandalonePwa());
    setNativeReady(canNativeInstall());
    setInstalled(wasInstalledThisSession());

    const sync = () => {
      setNativeReady(canNativeInstall());
      setInstalled(wasInstalledThisSession());
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

  // The auto-banner only shows when not installed/dismissed and either a native
  // prompt is ready (Android/Chrome) or the device is iOS (manual add).
  const showAutoBanner =
    !standalone && !installed && shouldOfferPwaInstall() && (nativeReady || isIosDevice());

  return {
    showAutoBanner,
    canNativeInstall: nativeReady,
    isIos: isIosDevice(),
    standalone,
    installed,
    install,
  };
}
