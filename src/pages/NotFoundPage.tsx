import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { siteContainer } from "@/src/lib/brandLayout";

export function NotFoundPage() {
  const location = useLocation();
  const inPortal = location.pathname.startsWith("/portal") || location.pathname.startsWith("/account");

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center bg-offgrid-cream px-6 py-24 text-center">
      <div className={siteContainer}>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em] text-offgrid-green/45">404</p>
        <h1 className="mt-3 font-display text-4xl font-black text-offgrid-green sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-offgrid-green/65">
          {inPortal
            ? "This portal page does not exist or you may not have access. Check the URL or return to your dashboard."
            : "The page you are looking for may have moved or no longer exists."}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {inPortal ? (
            <>
              <Button asChild>
                <Link to="/account/orders">
                  <ArrowLeft className="me-2 h-4 w-4" />
                  My orders
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/portal/admin">Admin dashboard</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild>
                <Link to="/">
                  <Home className="me-2 h-4 w-4" />
                  Back home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/shop">Browse shop</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
