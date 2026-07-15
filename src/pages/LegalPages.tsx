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
        <article className="prose-offgrid mt-10 max-w-3xl space-y-8 text-sm leading-relaxed text-offgrid-green/80">
          {children}
        </article>
        <p className="mt-12 text-sm text-offgrid-green/60">
          Questions?{" "}
          <Link to="/contact" className="font-semibold text-offgrid-green underline underline-offset-4">
            Contact us
          </Link>{" "}
          or email{" "}
          <a href="mailto:hello@offgridlifestyle.ph" className="font-semibold text-offgrid-green underline underline-offset-4">
            hello@offgridlifestyle.ph
          </a>
          .
        </p>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-bold text-offgrid-green">{title}</h2>
      {children}
    </section>
  );
}

export function TermsPage() {
  return (
    <LegalPageLayout title="Terms & Conditions" updated="July 9, 2026">
      <Section title="1. Introduction">
        <p>
          These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your use of the OFFGRID® Lifestyle website at{" "}
          <a href="https://www.oglifestyleph.com" className="font-semibold underline underline-offset-4">
            oglifestyleph.com
          </a>
          , our customer account portal, and all related products and services (collectively, the &ldquo;Services&rdquo;)
          operated by OffGrid Lifestyle (&ldquo;OffGrid,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
          based in Metro Manila, Philippines.
        </p>
        <p>
          By creating an account, placing an order, submitting a custom request, or otherwise using our Services, you
          agree to these Terms. If you do not agree, do not use the Services.
        </p>
      </Section>

      <Section title="2. Eligibility &amp; accounts">
        <p>
          You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account or place
          orders. You are responsible for maintaining the confidentiality of your login credentials and for all activity
          under your account.
        </p>
        <p>
          You agree to provide accurate, current, and complete information — including your full name, email address,
          mobile number, and shipping details — and to update this information when it changes. We may suspend or terminate
          accounts that contain false information or are used for fraud or abuse.
        </p>
      </Section>

      <Section title="3. Products &amp; pricing">
        <p>
          Product images, colors, and descriptions are for reference. Minor variations in shade, fabric texture, or sizing
          within normal manufacturing tolerance are not defects. Prices are listed in Philippine Pesos (PHP) unless stated
          otherwise and may change without notice until an order is confirmed.
        </p>
        <p>
          Retail shop prices shown at checkout are binding once payment is accepted according to our payment process.
          Custom and team orders are subject to official quotes issued after design and roster review.
        </p>
      </Section>

      <Section title="4. Orders, deposits &amp; payments">
        <p>
          Placing an order constitutes an offer to purchase. We may accept, decline, or cancel orders at our discretion —
          for example, due to stock limitations, payment issues, suspected fraud, or errors in pricing or product
          information.
        </p>
        <p>
          Custom production typically requires a deposit (often 60% of the official quote) before manufacturing begins.
          Payment methods available at checkout may include GCash, bank transfer, cash on delivery (where enabled), and
          other channels we support from time to time. You must upload valid payment proof when requested and include
          the correct order reference.
        </p>
        <p>
          Orders are not considered paid until we verify payment. Production timelines begin after deposit confirmation
          and final design approval, not merely upon submission of a payment screenshot.
        </p>
      </Section>

      <Section title="5. Custom orders &amp; artwork">
        <p>
          For custom apparel, headwear, towels, and team kits, you are responsible for the accuracy of quantities,
          sizes, names, numbers, and artwork supplied. You represent that you own or have permission to use all designs,
          logos, and marks submitted, and that they do not infringe any third-party intellectual property rights.
        </p>
        <p>
          You grant OffGrid a limited, non-exclusive license to use submitted artwork solely to produce, fulfill, and
          document your order. Mockups and quotes are provided for approval; production proceeds only after your
          confirmed acceptance of the official quote and applicable deposit.
        </p>
      </Section>

      <Section title="6. Production &amp; lead times">
        <p>
          Stated lead times are estimates, not guarantees. Delays may occur due to fabric availability, holidays, courier
          disruptions, or events outside our reasonable control. We will communicate material delays when practicable.
        </p>
      </Section>

      <Section title="7. Shipping &amp; delivery">
        <p>
          Risk of loss transfers to you when the order is handed to the courier. Delivery addresses must be complete and
          accurate. We are not responsible for failed delivery caused by incorrect information you provided.
        </p>
        <p>
          Shipping fees, if applicable, are shown at checkout or in your custom quote. International shipping, if offered,
          may be subject to customs duties and import taxes borne by the recipient.
        </p>
      </Section>

      <Section title="8. Returns, exchanges &amp; defects">
        <p>
          Ready-made retail items may be eligible for exchange or return within seven (7) days of delivery if unused,
          unworn, with tags attached, and in original condition — except where prohibited by law or stated otherwise at
          purchase.
        </p>
        <p>
          Custom-made, personalized, or team-specific goods are generally final sale and not returnable unless defective
          or materially different from the approved mockup. Defect claims must be reported within seven (7) days of
          delivery with clear photos and your order reference.
        </p>
      </Section>

      <Section title="9. Communications">
        <p>
          By registering, you consent to receive transactional communications about your account and orders — including
          email confirmations, payment updates, shipping notices, and service messages — at the email address and phone
          number you provide. Marketing messages, if any, will comply with applicable consent requirements.
        </p>
      </Section>

      <Section title="10. Prohibited conduct">
        <p>
          You may not misuse the Services, attempt unauthorized access, scrape or harvest data, interfere with site
          operation, submit unlawful content, or use our platform for fraudulent chargebacks or payment abuse.
        </p>
      </Section>

      <Section title="11. Intellectual property">
        <p>
          OffGrid branding, website design, product photography, copy, and proprietary materials remain our property or
          that of our licensors. You may not copy, reproduce, or exploit them without prior written consent.
        </p>
      </Section>

      <Section title="12. Disclaimer">
        <p>
          The Services are provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis to the fullest extent
          permitted by law. We disclaim warranties of merchantability, fitness for a particular purpose, and
          non-infringement where allowed.
        </p>
      </Section>

      <Section title="13. Limitation of liability">
        <p>
          To the maximum extent permitted under Philippine law, OffGrid Lifestyle and its officers, employees, and
          partners are not liable for indirect, incidental, special, consequential, or punitive damages. Our total
          liability for any claim relating to a specific order is limited to the amount you paid for that order.
        </p>
      </Section>

      <Section title="14. Governing law &amp; disputes">
        <p>
          These Terms are governed by the laws of the Republic of the Philippines. Any dispute shall be brought before
          the courts of Metro Manila, Philippines, unless mandatory consumer protection law in your locality requires
          otherwise.
        </p>
      </Section>

      <Section title="15. Changes">
        <p>
          We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top reflects the latest
          revision. Continued use after changes constitutes acceptance. Material changes may also be communicated by
          email or a site notice.
        </p>
      </Section>
    </LegalPageLayout>
  );
}

export function PrivacyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" updated="July 9, 2026">
      <Section title="1. Who we are">
        <p>
          OffGrid Lifestyle (&ldquo;OffGrid,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates{" "}
          <a href="https://www.oglifestyleph.com" className="font-semibold underline underline-offset-4">
            oglifestyleph.com
          </a>{" "}
          and related customer services from Metro Manila, Philippines. This Privacy Policy explains how we collect, use,
          store, and protect personal information when you use our website, create an account, or place orders.
        </p>
      </Section>

      <Section title="2. Information we collect">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account data:</strong> full name, email address, mobile number, password (stored securely by our
            authentication provider), and account preferences.
          </li>
          <li>
            <strong>Order data:</strong> shipping address, barangay/city/province, order items, sizes, custom artwork,
            payment method, payment references, and uploaded proof of payment.
          </li>
          <li>
            <strong>Communications:</strong> messages you send via contact forms, support inquiries, and email replies.
          </li>
          <li>
            <strong>Technical data:</strong> device/browser type, IP address, pages visited, and essential cookies for
            sign-in and cart functionality. With your consent, we may also collect analytics and enable browser push
            notifications.
          </li>
        </ul>
      </Section>

      <Section title="3. How we use information">
        <p>We use personal information to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Create and manage your customer account</li>
          <li>Process retail and custom orders, quotes, deposits, and deliveries</li>
          <li>Send transactional emails and notifications about order status</li>
          <li>Verify payments and prevent fraud</li>
          <li>Respond to inquiries and provide customer support</li>
          <li>Improve our products, website, and operations</li>
          <li>Comply with legal, tax, and regulatory obligations</li>
        </ul>
      </Section>

      <Section title="4. Legal bases">
        <p>
          We process data based on performance of a contract (fulfilling your orders), legitimate interests (security,
          service improvement), consent (optional cookies and push notifications), and legal obligations where
          applicable under Philippine law, including the Data Privacy Act of 2012 (RA 10173).
        </p>
      </Section>

      <Section title="5. Cookies &amp; similar technologies">
        <p>
          Essential cookies keep you signed in and maintain your shopping cart. Optional cookies and analytics run only
          with your consent via our cookie banner. You may withdraw consent at any time by clearing cookies or adjusting
          browser settings; some features may not work without essential cookies.
        </p>
      </Section>

      <Section title="6. Sharing &amp; processors">
        <p>
          We share data with trusted service providers who process information on our instructions, including hosting
          (Vercel), database and authentication (Supabase), email delivery (Resend), and payment verification partners.
          We do not sell your personal information.
        </p>
        <p>
          We may disclose information if required by law, court order, or to protect the rights, safety, and security of
          OffGrid, our customers, or others.
        </p>
      </Section>

      <Section title="7. International transfers">
        <p>
          Some processors may store or process data outside the Philippines (for example, in the United States or Japan).
          Where this occurs, we rely on contractual safeguards and provider security practices appropriate to the nature
          of the data.
        </p>
      </Section>

      <Section title="8. Retention">
        <p>
          We retain account and order records for as long as needed to fulfill orders, resolve disputes, enforce
          agreements, and meet legal and accounting requirements. You may request deletion subject to exceptions where
          retention is required by law.
        </p>
      </Section>

      <Section title="9. Security">
        <p>
          We apply reasonable technical and organizational measures — including encrypted connections (HTTPS), access
          controls, and secure authentication — to protect your information. No method of transmission or storage is 100%
          secure; please use a strong, unique password and keep it confidential.
        </p>
      </Section>

      <Section title="10. Your rights">
        <p>Subject to applicable law, you may request to:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Access the personal data we hold about you</li>
          <li>Correct inaccurate or incomplete information</li>
          <li>Delete your data where no longer necessary</li>
          <li>Object to or restrict certain processing</li>
          <li>Withdraw consent for optional processing</li>
        </ul>
        <p>
          To exercise these rights, contact{" "}
          <a href="mailto:hello@offgridlifestyle.ph" className="font-semibold underline underline-offset-4">
            hello@offgridlifestyle.ph
          </a>
          . We will respond within a reasonable period as required by law.
        </p>
      </Section>

      <Section title="11. Children">
        <p>
          Our Services are not directed to children under 18. We do not knowingly collect personal information from
          minors. If you believe a minor has provided us data, contact us to request deletion.
        </p>
      </Section>

      <Section title="12. Changes">
        <p>
          We may update this Privacy Policy from time to time. The &ldquo;Last updated&rdquo; date reflects the latest
          version. Material changes will be posted on this page.
        </p>
      </Section>
    </LegalPageLayout>
  );
}
