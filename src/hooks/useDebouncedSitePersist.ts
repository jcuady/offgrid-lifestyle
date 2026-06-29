import { useEffect, useRef } from "react";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import {
  schedulePersistCustomPagesFromStore,
  schedulePersistLandingFromStore,
} from "@/src/lib/siteContentPersistence";

/** Auto-save landing CMS edits to Supabase after hydration (avoids overwriting DB on load). */
export function useDebouncedLandingPersist(enabled: boolean) {
  const landingContent = useSiteContentStore((s) => s.landingContent);
  const persistReady = useRef(false);

  useEffect(() => {
    persistReady.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!persistReady.current) return;
    schedulePersistLandingFromStore();
  }, [landingContent]);
}

/** Auto-save custom page CMS edits to Supabase after hydration. */
export function useDebouncedCustomPagesPersist(enabled: boolean) {
  const customPageContent = useSiteContentStore((s) => s.customPageContent);
  const persistReady = useRef(false);

  useEffect(() => {
    persistReady.current = enabled;
  }, [enabled]);

  useEffect(() => {
    if (!persistReady.current) return;
    schedulePersistCustomPagesFromStore();
  }, [customPageContent]);
}
