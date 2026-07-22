import { useState, type FormEvent, type ReactNode } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Phone,
  Clock,
  MapPin,
  Instagram,
  Facebook,
  Send,
  Check,
  CornerDownRight,
} from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { Input } from "@/src/components/ui/input";
import { BrandLocationMap } from "@/src/components/BrandLocationMap";
import { siteContainer, marketingPageHero } from "@/src/lib/brandLayout";
import { BRAND_LOCATION } from "@/src/lib/brandLocation";
import { isValidEmail } from "@/src/lib/formValidation";
import { submitContactForm } from "@/src/services/emailService";
import { cn } from "@/src/lib/utils";

const CONTACT_EMAIL = "hello@offgridlifestyle.ph";
const CONTACT_PHONE = "+63 917 000 0000";

const PURPOSES = [
  { id: "general", label: "General", desc: "Questions, feedback, or anything else." },
  { id: "custom", label: "Custom / Team Order", desc: "Jerseys, kits, and team apparel." },
  { id: "wholesale", label: "Wholesale", desc: "Bulk and corporate orders." },
  { id: "partnership", label: "Partnership", desc: "Collabs, events, and sponsorships." },
] as const;

type PurposeId = (typeof PURPOSES)[number]["id"];

const INFO_CARDS = [
  { icon: Mail, label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  { icon: Phone, label: "Phone", value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/\s/g, "")}` },
  { icon: Clock, label: "Hours", value: "Mon – Sat · 9:00 AM – 6:00 PM" },
  { icon: MapPin, label: "Location", value: BRAND_LOCATION.line },
];

export function ContactPage() {
  const [purpose, setPurpose] = useState<PurposeId>("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Please enter your name.";
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    if (message.trim().length < 10) next.message = "Tell us a bit more (at least 10 characters).";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const purposeLabel = PURPOSES.find((p) => p.id === purpose)?.label ?? "General";
      await submitContactForm({
        name: name.trim(),
        email: email.trim(),
        topic: purpose,
        message: message.trim(),
      });
      setSubmitted(true);
    } catch {
      setSubmitError("We couldn't send your message. Please try again or email us directly.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setMessage("");
    setPurpose("general");
    setErrors({});
    setSubmitted(false);
    setSubmitError(null);
  };

  return (
    <div className="min-h-screen bg-offgrid-cream">
      {/* Hero */}
      <section className={cn(marketingPageHero, "md:pb-20")}>
        <div className="pointer-events-none absolute -right-16 -top-10 h-72 w-72 rounded-full bg-offgrid-lime/15 blur-3xl" />
        <div className={cn(siteContainer, "relative")}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/80">
              <span className="h-1.5 w-1.5 rounded-full bg-offgrid-lime" />
              Get in touch
            </span>
            <h1 className="mb-4 font-display text-4xl font-black leading-[0.9] md:text-6xl lg:text-7xl">
              Let's build
              <br />
              <span className="italic font-normal text-white">something off grid.</span>
            </h1>
            <p className="max-w-lg text-sm text-offgrid-cream/70 md:text-base">
              Team kits, wholesale, collabs, or just a question — pick a topic and send. We usually reply within one
              business day.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main */}
      <section className={cn(siteContainer, "grid gap-8 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr]")}>
        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-offgrid-green/10 bg-white p-6 shadow-sm sm:p-8 md:p-10"
        >
          {submitted ? (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-offgrid-lime/10">
                <Check className="h-8 w-8 text-offgrid-lime" />
              </div>
              <h2 className="mb-2 font-display text-2xl font-black text-offgrid-green">Message sent</h2>
              <p className="mb-7 max-w-sm text-sm leading-relaxed text-offgrid-green/65">
                Thanks for reaching out. We received your message and sent a confirmation to your inbox. We usually
                reply within one business day.
              </p>
              <Button variant="outline" onClick={resetForm}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate>
              <h2 className="font-display text-2xl font-black text-offgrid-green">Send a message</h2>
              <p className="mt-1 text-sm text-offgrid-green/55">Select a topic so we route you to the right person.</p>

              {/* Purpose */}
              <fieldset className="mt-7">
                <legend className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-offgrid-green/50">
                  I'm reaching out about
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {PURPOSES.map((p) => {
                    const active = purpose === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPurpose(p.id)}
                        aria-pressed={active}
                        className={cn(
                          "rounded-2xl border p-4 text-left transition-all outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime",
                          active
                            ? "border-offgrid-green bg-offgrid-green text-offgrid-cream shadow-md"
                            : "border-offgrid-green/15 bg-offgrid-cream/40 text-offgrid-green hover:border-offgrid-green/40",
                        )}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="text-sm font-bold">{p.label}</span>
                          {active && <Check className="h-4 w-4 shrink-0" />}
                        </span>
                        <span className={cn("mt-1 block text-xs", active ? "text-offgrid-cream/70" : "text-offgrid-green/55")}>
                          {p.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Fields */}
              <div className="mt-6 grid gap-5">
                <Field label="Your name" error={errors.name}>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    aria-invalid={!!errors.name}
                    className={errors.name ? "border-red-500 focus-visible:ring-red-500/25" : undefined}
                  />
                </Field>
                <Field label="Your email" error={errors.email}>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    aria-invalid={!!errors.email}
                    className={errors.email ? "border-red-500 focus-visible:ring-red-500/25" : undefined}
                  />
                </Field>
                <Field label="Message" error={errors.message}>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    placeholder="Share details — quantities, dates, links, or questions."
                    aria-invalid={!!errors.message}
                    className={cn(
                      "flex min-h-[8rem] w-full resize-y rounded-xl border border-offgrid-green/16 bg-white px-3.5 py-2.5 text-base text-offgrid-green transition-colors placeholder:text-offgrid-green/40 focus-visible:border-offgrid-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime/25 sm:text-sm",
                      errors.message && "border-red-500 focus-visible:ring-red-500/25",
                    )}
                  />
                </Field>
              </div>

              <Button type="submit" size="lg" className="group mt-7 w-full" disabled={submitting}>
                {submitting ? "Sending…" : "Send message"}
                <Send className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
              {submitError && (
                <p className="mt-3 text-center text-xs font-medium text-red-600">{submitError}</p>
              )}
              <p className="mt-3 text-center text-[11px] text-offgrid-green/45">
                We'll email you a confirmation and route your message to our team.
              </p>
            </form>
          )}
        </motion.div>

        {/* Info panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col gap-4"
        >
          <BrandLocationMap />

          {/* Info cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {INFO_CARDS.map(({ icon: Icon, label, value, href }) => {
              const content = (
                <>
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-offgrid-green/5 text-offgrid-green">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-offgrid-green/45">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-offgrid-green">{value}</p>
                </>
              );
              return href ? (
                <a
                  key={label}
                  href={href}
                  className="rounded-2xl border border-offgrid-green/10 bg-white p-5 transition-colors hover:border-offgrid-green/30"
                >
                  {content}
                </a>
              ) : (
                <div key={label} className="rounded-2xl border border-offgrid-green/10 bg-white p-5">
                  {content}
                </div>
              );
            })}
          </div>

          {/* Socials */}
          <div className="rounded-2xl border border-offgrid-green/10 bg-white p-5">
            <p className="mb-3 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-offgrid-green/45">
              <CornerDownRight className="h-3.5 w-3.5" />
              Follow the movement
            </p>
            <div className="flex gap-3">
              <a
                href="https://www.instagram.com/offgridlifestyle.ph/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="OffGrid Lifestyle on Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-offgrid-green/15 text-offgrid-green transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-offgrid-cream"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.facebook.com/offgridlifestyleph/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="OffGrid Lifestyle on Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-offgrid-green/15 text-offgrid-green transition-colors hover:border-offgrid-lime hover:bg-offgrid-lime hover:text-offgrid-cream"
              >
                <Facebook className="h-4 w-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-offgrid-green/50">
        {label}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}
