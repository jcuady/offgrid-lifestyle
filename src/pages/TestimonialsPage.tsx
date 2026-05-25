import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Star } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Footer } from "@/src/components/Footer";
import { testimonialEntries } from "@/src/data/testimonials";

export function TestimonialsPage() {
  const reduceMotion = useReducedMotion();
  const cardTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.45, ease: "easeOut" as const };

  const featured = testimonialEntries[0];
  const others = testimonialEntries.slice(1);

  return (
    <>
      <section className="bg-offgrid-green pt-28 pb-14 sm:pt-36 sm:pb-20">
        <div className="container mx-auto px-6 md:px-12">
          <Link
            to="/"
            className="mb-6 inline-flex items-center text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream/70 hover:text-offgrid-lime"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to home
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-lime">
            Testimonials
          </p>
          <h1 className="mt-3 text-5xl md:text-7xl font-display font-black leading-[0.9] text-offgrid-cream">
            Built for teams.
            <br />
            <span className="italic font-normal text-offgrid-lime">Trusted by real players.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-sm md:text-base text-offgrid-cream/70">
            Customer feedback focused on fit, performance, ordering clarity, and reliability.
            Every order is crafted to match Off Grid&apos;s premium performance/lifestyle identity.
          </p>
        </div>
      </section>

      <section className="bg-offgrid-cream py-14 md:py-20">
        <div className="container mx-auto px-6 md:px-12">
          <motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={cardTransition}
            className="rounded-3xl border border-offgrid-green/10 bg-white p-6 md:p-8 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green/45">
                  Featured voice
                </p>
                <h2 className="mt-1 text-2xl md:text-3xl font-display font-black text-offgrid-green">
                  {featured.author}
                </h2>
                <p className="mt-1 text-xs text-offgrid-green/50">
                  {featured.handle} · {featured.location}
                </p>
              </div>
              <span className="rounded-full border border-offgrid-green/15 bg-offgrid-green/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/70">
                {featured.tag}
              </span>
            </div>
            <div className="mt-5 flex gap-1">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-offgrid-green text-offgrid-green" />
              ))}
            </div>
            <p className="mt-4 text-base md:text-lg leading-relaxed italic text-offgrid-green/85">
              &quot;{featured.quote}&quot;
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/55">
              Outcome: {featured.outcome}
            </p>
          </motion.article>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {others.map((entry, index) => (
              <motion.article
                key={entry.id}
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : { ...cardTransition, delay: Math.min(index * 0.06, 0.18) }
                }
                className="rounded-2xl border border-offgrid-green/10 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-display font-bold text-offgrid-green">{entry.author}</p>
                  <span className="rounded-full bg-offgrid-green/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/60">
                    {entry.tag}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-offgrid-green/50">
                  {entry.handle} · {entry.location}
                </p>
                <p className="mt-4 text-sm italic leading-relaxed text-offgrid-green/80">
                  &quot;{entry.quote}&quot;
                </p>
                <p className="mt-4 border-t border-offgrid-green/10 pt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/55">
                  Outcome: {entry.outcome}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-offgrid-dark py-14 md:py-16">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-black text-offgrid-cream">
            Ready to build yours?
          </h2>
          <p className="mt-3 text-sm md:text-base text-offgrid-cream/65 max-w-2xl mx-auto">
            Start with templates and the ordering guide, then submit your custom request with full
            specs.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="secondary" size="lg" className="group" asChild>
              <Link to="/custom/order">
                Start custom order
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-offgrid-cream/40 text-offgrid-cream hover:bg-offgrid-cream hover:text-offgrid-green"
              asChild
            >
              <Link to="/shop">Shop now</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
