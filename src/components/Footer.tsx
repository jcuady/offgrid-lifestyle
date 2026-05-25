import { Link } from "react-router-dom";
import { Instagram, Facebook } from "lucide-react";
import { siteContainer } from "@/src/lib/brandLayout";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";

export function Footer() {
  const footer = useSiteContentStore((s) => s.landingContent.footer);
  return (
    <footer className="bg-offgrid-dark text-offgrid-cream pt-16 pb-8 border-t border-offgrid-cream/8">
      <div className={siteContainer}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-14">
          
          <div className="md:col-span-2">
            <Link to="/" className="mb-5 flex items-center">
              <img
                src={LOGO_WORDMARK_WHITE}
                alt="OFF GRID® — OffGrid Lifestyle"
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-offgrid-cream/50 text-sm max-w-xs mb-7 leading-relaxed">
              Play Different. Live Off Grid.<br />
              Proudly made for Filipino athletes.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full border border-offgrid-cream/15 flex items-center justify-center hover:bg-offgrid-cream hover:text-offgrid-green transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-offgrid-cream/15 flex items-center justify-center hover:bg-offgrid-cream hover:text-offgrid-green transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-offgrid-cream/15 flex items-center justify-center hover:bg-offgrid-cream hover:text-offgrid-green transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-5 tracking-wide">Shop</h4>
            <ul className="space-y-3 text-sm text-offgrid-cream/50">
              <li><Link to="/#collections" className="hover:text-offgrid-lime transition-colors">Collections</Link></li>
              <li><Link to="/#shop" className="hover:text-offgrid-lime transition-colors">Best Sellers</Link></li>
              <li><Link to="/custom" className="hover:text-offgrid-lime transition-colors">Custom Order</Link></li>
              <li><Link to="/events" className="hover:text-offgrid-lime transition-colors">Events</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-5 tracking-wide">Support</h4>
            <ul className="space-y-3 text-sm text-offgrid-cream/50">
              <li><Link to="/#about" className="hover:text-offgrid-lime transition-colors">About</Link></li>
              <li><a href="#" className="hover:text-offgrid-lime transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-offgrid-lime transition-colors">Sizing Guide</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-7 border-t border-offgrid-cream/8 text-xs text-offgrid-cream/35">
          <p>{footer.copyright}</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-offgrid-cream transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-offgrid-cream transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
