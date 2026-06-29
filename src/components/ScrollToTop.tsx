import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets window scroll to the top on every route (pathname) change so a new
 * page always starts at the top. When the URL contains a hash, we defer to the
 * target section instead of forcing the top — this preserves the in-page deep
 * links used by the custom-order guide (e.g. /custom#sizing-chart).
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Let lazily-rendered content mount, then scroll the anchor into view.
      const id = hash.replace("#", "");
      let frame = 0;
      const timer = window.setTimeout(() => {
        frame = window.requestAnimationFrame(() => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: "auto", block: "start" });
          } else {
            window.scrollTo({ top: 0, left: 0, behavior: "auto" });
          }
        });
      }, 0);
      return () => {
        window.clearTimeout(timer);
        window.cancelAnimationFrame(frame);
      };
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, hash]);

  return null;
}
