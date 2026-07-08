import { useEffect } from "react";
import type { PageSeoInput } from "@/src/lib/siteSeo";
import { applyPageSeo } from "@/src/lib/siteSeo";

export function usePageSeo(input: PageSeoInput | null | undefined) {
  useEffect(() => {
    if (!input) return;
    applyPageSeo(input);
  }, [input?.title, input?.description, input?.path, input?.imagePath, input?.noindex, input?.type]);
}
