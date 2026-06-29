import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/src/components/ui/Button";
import { getCookieConsent, setCookieConsent } from "@/src/lib/consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-offgrid-green/15 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-relaxed text-offgrid-green/80">
          We use essential cookies to keep you signed in and remember your cart. With your consent we may also store
          preferences and enable push notifications. See our{" "}
          <Link to="/legal/privacy" className="font-semibold text-offgrid-green underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCookieConsent("essential-only");
              setVisible(false);
            }}
          >
            Essential only
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setCookieConsent("accepted");
              setVisible(false);
            }}
          >
            Accept all
          </Button>
        </div>
      </div>
    </div>
  );
}
