import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initAnalytics, isAnalyticsConfigured, trackPageView } from "@/src/lib/analytics";
import { getCookieConsent } from "@/src/lib/consent";
import { resolveRouteSeo } from "@/src/lib/routeSeo";
import { applyPageSeo, organizationJsonLd, upsertJsonLd, upsertMeta } from "@/src/lib/siteSeo";

const GSC_VERIFICATION = import.meta.env.VITE_GSC_VERIFICATION as string | undefined;

/** Applies route-level SEO, analytics page views, and global structured data. */
export function RouteSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (GSC_VERIFICATION) {
      upsertMeta("name", "google-site-verification", GSC_VERIFICATION);
    }
    upsertJsonLd("jsonld-organization", organizationJsonLd());
  }, []);

  useEffect(() => {
    const seo = resolveRouteSeo(pathname);
    if (seo) applyPageSeo(seo);

    if (isAnalyticsConfigured() && getCookieConsent() === "accepted") {
      initAnalytics();
      trackPageView(pathname, seo?.title);
    }
  }, [pathname]);

  return null;
}
