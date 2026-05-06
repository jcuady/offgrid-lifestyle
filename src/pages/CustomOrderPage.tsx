import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CustomOrderWizard } from "@/src/components/custom-order/CustomOrderWizard";
import { Footer } from "@/src/components/Footer";

export function CustomOrderPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <section className="relative bg-offgrid-green pt-28 pb-10 sm:pt-32 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(197,211,48,0.08),transparent_70%)]" />
        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <Link
            to="/custom"
            className="mb-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream/70 hover:text-offgrid-lime"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to ordering guide
          </Link>
          <span className="inline-block py-1.5 px-4 rounded-full bg-offgrid-cream/10 backdrop-blur-md border border-offgrid-cream/15 text-offgrid-cream text-[10px] font-semibold tracking-[0.2em] uppercase mb-5">
            Custom quote
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-offgrid-cream leading-[0.95] tracking-tight max-w-3xl">
            Place your custom order
          </h1>
          <p className="mt-4 max-w-xl text-sm sm:text-base text-offgrid-cream/70">
            Submit your design and specs — our team will follow up with a finalized quote and deposit steps.
          </p>
        </div>
      </section>

      <CustomOrderWizard />

      <Footer />
    </>
  );
}
