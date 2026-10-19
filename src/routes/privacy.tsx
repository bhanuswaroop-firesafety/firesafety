import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Shield, Lock, FileText, CheckCircle, Mail, MapPin, Phone } from "lucide-react";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/privacy")({
  head: () =>
    seoHead({
      title: "Privacy Policy | Sri Udharchi Enterprises - Fire & Industrial Safety",
      description:
        "Privacy Policy for Sri Udharchi Enterprises. Understand how we collect, safeguard, and process your industrial safety quotation data, order information, and personal credentials.",
      path: "/privacy",
      jsonLd: schemas.breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Privacy Policy", path: "/privacy" },
      ]),
    }),
  component: PrivacyPage,
});

export function PrivacyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main id="main-content" className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          {/* Header */}
          <div className="border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Shield className="size-3.5" />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {lastUpdated} &bull; Effective for Sri Udharchi Enterprises (sriudharchi.com)
            </p>
          </div>

          {/* Content */}
          <div className="mt-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                1. Overview and Commitment
              </h2>
              <p>
                Sri Udharchi Enterprises (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is committed to respecting and protecting the privacy of our commercial, industrial, and individual clients. This Privacy Policy outlines our procedures regarding the collection, storage, transfer, and utilization of information collected through our official website, digital product catalog, quotation requests, and customer portal.
              </p>
              <p>
                Our privacy framework operates in accordance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act (DPDPA), 2023 of India.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Lock className="size-4 text-primary" />
                2. Information We Collect
              </h2>
              <p>We collect information that you directly provide when you interact with our platform:</p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-foreground">Contact & Identity Data:</strong> Full name, corporate email address, contact phone number, company name, industrial sector, and designation.
                </li>
                <li>
                  <strong className="text-foreground">Billing & Shipping Details:</strong> Corporate GSTIN (for B2B invoicing), physical site or delivery address, landmark, state, and PIN code.
                </li>
                <li>
                  <strong className="text-foreground">Quotation & Order Records:</strong> Product SKUs, quantity requirements, engineering specifications, BOQ details, and transaction history.
                </li>
                <li>
                  <strong className="text-foreground">Technical Device Data:</strong> IP address, device operating system, browser type, and navigation timestamps collected automatically for fraud detection and performance optimization.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle className="size-4 text-primary" />
                3. Purpose of Processing Your Information
              </h2>
              <p>Your data is processed strictly for legitimate operational purposes:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <h3 className="font-semibold text-foreground text-sm">Quotation & Order Execution</h3>
                  <p className="mt-1 text-xs">
                    Preparing official engineering proposals, processing equipment orders, issuing GST invoices, and scheduling on-site fire system inspections.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <h3 className="font-semibold text-foreground text-sm">Logistics & Delivery</h3>
                  <p className="mt-1 text-xs">
                    Dispatching heavy fire protection equipment, hydrants, safety pumps, and PPE kits via verified freight carriers with real-time transit updates.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <h3 className="font-semibold text-foreground text-sm">Statutory Compliance & Audits</h3>
                  <p className="mt-1 text-xs">
                    Issuing hydro-testing reports, AMC certificates, and Fire NOC maintenance documentation compliant with NBC 2016 and state fire services.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <h3 className="font-semibold text-foreground text-sm">Account Security</h3>
                  <p className="mt-1 text-xs">
                    Authenticating registered enterprise clients via secure phone OTP and Google OAuth tokens.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                4. Data Sharing and Third-Party Disclosures
              </h2>
              <p>
                Sri Udharchi Enterprises does not sell, rent, or trade your personal or business information to third-party advertisers. Information is disclosed solely to authorized service providers under strict non-disclosure obligations:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li><strong className="text-foreground">Logistics & Freight Partners:</strong> To fulfill ground delivery of physical equipment to your plant or facility.</li>
                <li><strong className="text-foreground">Payment Gateways & Banking Networks:</strong> To process secure UPI, NEFT/RTGS, and card payments under PCI-DSS compliance.</li>
                <li><strong className="text-foreground">Statutory Authorities:</strong> If required by court order, law enforcement, or state fire service compliance verification.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                5. Data Security and Storage
              </h2>
              <p>
                All sensitive information is encrypted in transit using industry-standard Transport Layer Security (TLS 1.3) and stored in high-security cloud infrastructure. Access to client databases and quotation archives is strictly restricted to authorized safety engineering and executive personnel.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                6. Your Rights and Preferences
              </h2>
              <p>
                You have the right to access, inspect, correct, or request deletion of your personal contact records stored with us. You may also opt out of promotional quotation notifications at any time by contacting our support team or updating your client portal settings.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3 rounded-2xl border border-border bg-card/60 p-6">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Shield className="size-4 text-primary" />
                7. Grievance Redressal Officer
              </h2>
              <p className="text-xs">
                In compliance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, our designated Grievance Officer details are published below:
              </p>
              <div className="mt-3 space-y-1.5 text-xs text-foreground">
                <p><strong>Grievance Officer:</strong> Sri Udharchi Enterprises Compliance Cell</p>
                <p className="flex items-center gap-2"><MapPin className="size-3.5 text-primary" /> H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, Andhra Pradesh - 515241, India</p>
                <p className="flex items-center gap-2"><Mail className="size-3.5 text-primary" /> <a href="mailto:support@udharchi.in" className="hover:text-primary underline">support@udharchi.in</a></p>
                <p className="flex items-center gap-2"><Phone className="size-3.5 text-primary" /> <a href="tel:+918639858221" className="hover:text-primary underline">+91 8639858221</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
