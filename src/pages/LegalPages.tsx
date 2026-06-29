import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { siteContainer } from "@/src/lib/brandLayout";

interface LegalPageProps {
  title: string;
  updated: string;
  children: ReactNode;
}

export function LegalPageLayout({ title, updated, children }: LegalPageProps) {
  return (
    <main className="bg-offgrid-cream pb-20 pt-28 sm:pt-32">
      <div className={siteContainer}>
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">Legal</p>
        <h1 className="mt-2 font-display text-3xl font-black text-offgrid-green sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm text-offgrid-green/55">Last updated {updated}</p>
        <article className="prose-offgrid mt-10 max-w-3xl space-y-6 text-sm leading-relaxed text-offgrid-green/80">
          {children}
        </article>
        <p className="mt-12 text-sm text-offgrid-green/60">
          Questions?{" "}
          <Link to="/contact" className="font-semibold text-offgrid-green underline underline-offset-4">
            Contact us
          </Link>
          .
        </p>
      </div>
    </main>
  );
}

export function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" updated="June 29, 2026">
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">1. Agreement</h2>
        <p>
          By creating an account, placing an order, or using the OffGrid Lifestyle website and customer portal, you agree
          to these Terms &amp; Conditions. If you do not agree, please do not use our services.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">2. Accounts</h2>
        <p>
          You are responsible for keeping your login credentials secure and for all activity under your account. Provide
          accurate contact and shipping information so we can fulfill orders and send status updates.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">3. Orders &amp; payments</h2>
        <p>
          Retail and custom orders are subject to availability, production timelines, and deposit requirements stated at
          checkout or in your official quote. Payment proofs (e.g. GCash) must match the order reference provided.
          OffGrid may cancel or hold orders with invalid or unverifiable payments.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">4. Custom production</h2>
        <p>
          Custom apparel and team orders require approved artwork and signed-off quotes before production. Lead times
          begin after deposit confirmation and final design approval. Color and sizing variations within normal
          manufacturing tolerance are not grounds for rejection.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">5. Shipping &amp; returns</h2>
        <p>
          Delivery timelines are estimates. Risk of loss passes upon handoff to the courier. Defective or incorrect items
          must be reported within seven (7) days of delivery with photos. Custom-made goods are generally non-returnable
          unless defective.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">6. Intellectual property</h2>
        <p>
          You warrant that designs you submit do not infringe third-party rights. OffGrid branding, site content, and
          product photography remain our property. You grant us a license to use submitted artwork solely to produce your
          order.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">7. Limitation of liability</h2>
        <p>
          To the fullest extent permitted by Philippine law, OffGrid Lifestyle is not liable for indirect or consequential
          damages. Our total liability for any order is limited to the amount you paid for that order.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">8. Changes</h2>
        <p>
          We may update these terms from time to time. Continued use after changes constitutes acceptance. Material
          changes will be noted on this page.
        </p>
      </section>
    </LegalPageLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="June 29, 2026">
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">What we collect</h2>
        <p>
          We collect information you provide: name, email, phone, shipping address, order details, payment references,
          and uploaded design files for custom orders. We also store essential cookies for sign-in and cart state, and
          optional push notification subscriptions when you enable them.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">How we use it</h2>
        <p>
          Data is used to process orders, communicate status updates, prevent fraud, improve our services, and comply
          with legal obligations. Order-related notifications are sent only to the account or email associated with the
          order.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">Cookies</h2>
        <p>
          Essential cookies keep you signed in and remember your cart. With your consent we may enable additional
          preferences and browser push notifications. You can choose &ldquo;Essential only&rdquo; in the cookie banner
          at any time; push notifications require broader consent.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">Sharing</h2>
        <p>
          We use trusted processors (hosting, email, payment verification) who handle data only on our instructions. We
          do not sell your personal information.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">Retention &amp; security</h2>
        <p>
          We retain order and account records as needed for operations and legal compliance. We apply reasonable
          technical and organizational safeguards; no method of transmission over the internet is 100% secure.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="font-display text-lg font-bold text-offgrid-green">Your rights</h2>
        <p>
          You may request access, correction, or deletion of your personal data by contacting{" "}
          <a href="mailto:hello@offgridlifestyle.ph" className="font-semibold text-offgrid-green underline">
            hello@offgridlifestyle.ph
          </a>
          . We will respond within a reasonable period as required by applicable law.
        </p>
      </section>
    </LegalPageLayout>
  );
}
