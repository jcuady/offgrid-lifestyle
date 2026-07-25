import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export const CHUNK_RELOAD_KEY = "og:chunk-reload";

/** Test seam: detect chunk-miss errors the same way as production recovery. */
export function isDynamicImportChunkError(message: string): boolean {
  return /Failed to fetch dynamically imported module|Loading chunk|Importing a module script failed|error loading dynamically imported module/i.test(
    message,
  );
}

/**
 * One full reload when a hashed Vite chunk 404s after deploy.
 * Returns true if a reload was triggered (caller should stop rendering).
 */
export function reloadOnceOnChunkError(message: string): boolean {
  if (typeof window === "undefined" || !isDynamicImportChunkError(message)) return false;
  try {
    const store = window.sessionStorage;
    if (store.getItem(CHUNK_RELOAD_KEY)) {
      store.removeItem(CHUNK_RELOAD_KEY);
      return false;
    }
    store.setItem(CHUNK_RELOAD_KEY, "1");
    window.location.reload();
    return true;
  } catch {
    return false;
  }
}

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
        window.sessionStorage.removeItem(CHUNK_RELOAD_KEY);
      } catch {
        // ignore
      }
      return mod;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (reloadOnceOnChunkError(message)) {
        // Hang until unload — avoids flashing error UI / ErrorBoundary.
        return await new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}
