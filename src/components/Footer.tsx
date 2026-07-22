import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowUp } from "lucide-react";
import { siteContainer } from "@/src/lib/brandLayout";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { BRAND_LOCATION, brandMapsUrl } from "@/src/lib/brandLocation";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

type FooterLink = { label: string; to: string; external?: boolean };

const FOOTER_COLUMNS: { heading: string; links: FooterLink[] }[] = [
  {
    heading: "Shop",
    links: [
      { label: "Ultimate Frisbee Line", to: "/shop?category=Ultimate Frisbee" },
      { label: "Shop By Sport", to: "/#collections" },
      { label: "Shop By Collection", to: "/collections" },
      { label: "All Products", to: "/shop" },
    ],
  },
  {
    heading: "Custom",
    links: [
      { label: "Start a team order", to: "/custom/order" },
      { label: "Custom orders", to: "/#custom-orders" },
      { label: "Templates", to: "/custom/templates" },
      { label: "Ordering guide", to: "/custom" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "Our story", to: "/#who-we-are" },
      { label: "Events and Sports", to: "/community" },
      { label: "FAQ", to: "/faq" },
      { label: "Contact", to: "/contact" },
    ],
  },
];

export function Footer() {
  const footer = useSiteContentStore((s) => s.landingContent.footer);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-offgrid-lime text-offgrid-cream">
      <div className={siteContainer}>
        {/* Main */}
        <div className="grid gap-x-8 gap-y-12 border-b border-offgrid-cream/15 pb-12 pt-16 md:grid-cols-12">
          {/* Brand */}
          <div className="md:col-span-4">
            <Link to="/" className="inline-flex items-center">
              <img src={LOGO_WORDMARK_WHITE} alt="OFFGRID® Lifestyle" className="h-9 w-auto" />
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-offgrid-cream/80">
              {footer.taglineLine1}
              <br />
              {footer.taglineLine2}
            </p>
            <a
              href={brandMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block max-w-xs text-sm leading-relaxed text-offgrid-cream/75 transition-colors hover:text-white"
            >
              <span className="mb-1 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-offgrid-cream/55">
                Location
              </span>
              {BRAND_LOCATION.line}
            </a>
          </div>

          {/* Nav columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 md:col-span-7 md:col-start-6"
          >
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <h4 className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-offgrid-cream/55">
                  {column.heading}
                </h4>
                <ul className="space-y-3 text-sm">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.to}
                          className="group inline-flex items-center gap-1 text-offgrid-cream/75 transition-colors hover:text-white"
                        >
                          {link.label}
                          <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                        </a>
                      ) : (
                        <Link to={link.to} className="text-offgrid-cream/75 transition-colors hover:text-white">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 text-xs text-offgrid-cream/65 sm:flex-row sm:items-center sm:gap-5">
            <p>{footer.copyright}</p>
            <span aria-hidden className="hidden h-3 w-px bg-offgrid-cream/25 sm:block" />
            <span className="font-mono uppercase tracking-[0.12em] text-offgrid-cream/55">
              {BRAND_LOCATION.street} · {BRAND_LOCATION.city}, {BRAND_LOCATION.postalCode}
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-offgrid-cream/65">
            <Link to="/legal/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link to="/legal/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="group inline-flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-offgrid-cream transition-colors hover:text-white"
            >
              Back to top
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-offgrid-cream/30 transition-colors group-hover:border-offgrid-cream group-hover:bg-offgrid-cream group-hover:text-offgrid-lime">
                <ArrowUp className="h-3.5 w-3.5" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
