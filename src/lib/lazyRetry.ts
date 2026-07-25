import { lazy, type ComponentType, type LazyExoticComponent } from "react";

const RELOAD_KEY = "og:chunk-reload";

/**
 * React.lazy that survives Vite deploy hash churn.
 * If a dynamic import 404s (stale SW/index pointing at old assets), reload once
 * so the browser picks up the current index.html + chunk map.
 */
export function lazyRetry<T extends ComponentType<unknown>>(
  factory: () => Promise<{ default: T }>,
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const mod = await factory();
      try {
        sessionStorage.removeItem(RELOAD_KEY);
      } catch {
        // ignore
      }
      return mod;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const isChunkMiss =
        /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed|error loading dynamically imported module/i.test(
          message,
        );
      if (isChunkMiss && typeof window !== "undefined") {
        try {
          if (!sessionStorage.getItem(RELOAD_KEY)) {
            sessionStorage.setItem(RELOAD_KEY, "1");
            window.location.reload();
            // Hang the lazy promise until unload — avoids flashing error UI.
            return await new Promise<{ default: T }>(() => {});
          }
          sessionStorage.removeItem(RELOAD_KEY);
        } catch {
          // private mode — fall through
        }
      }
      throw err;
    }
  });
}

/** Test seam: detect chunk-miss errors the same way as production recovery. */
export function isDynamicImportChunkError(message: string): boolean {
  return /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed|error loading dynamically imported module/i.test(
    message,
  );
}
