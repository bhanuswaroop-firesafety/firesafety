import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Scale, FileCheck, AlertCircle, ShieldCheck, Landmark } from "lucide-react";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/terms")({
  head: () =>
    seoHead({
      title: "Terms of Service | Sri Udharchi Enterprises - Industrial Fire Safety",
      description:
        "Terms and Conditions of Service for Sri Udharchi Enterprises. Guidelines governing equipment supply, fire safety engineering, formal quotations, and AMC maintenance contracts.",
      path: "/terms",
      jsonLd: schemas.breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Terms of Service", path: "/terms" },
      ]),
    }),
  component: TermsPage,
});

export function TermsPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main id="main-content" className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          {/* Header */}
          <div className="border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Scale className="size-3.5" />
              <span>Legal Terms & Conditions</span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Terms of Service
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {lastUpdated} &bull; Applicable to all purchases, quotations, and services provided by Sri Udharchi Enterprises.
            </p>
          </div>

          {/* Content */}
          <div className="mt-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <FileCheck className="size-4 text-primary" />
                1. Acceptance of Terms
              </h2>
              <p>
                By visiting our website (sriudharchi.com), creating an account, requesting engineering quotations, purchasing fire safety products, or commissioning testing and maintenance services, you agree to be bound by these Terms of Service. If you are entering into this agreement on behalf of a company, factory, or corporate entity, you represent that you possess legal authorization to bind that entity.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                2. Scope of Industrial Supplies & Services
              </h2>
              <p>
                Sri Udharchi Enterprises supplies ISI and BIS certified fire safety hardware (including extinguishers, hydrants, hoses, nozzles, pumps, and PPE equipment) and delivers certified engineering services (including fire safety audits, hydro-testing, AMC maintenance, and system installation). All solutions are designed to adhere to the National Building Code of India (NBC 2016) and applicable state fire safety regulations.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                3. Quotations, Pricing & GST
              </h2>
              <p>
                All formal quotations issued through our portal or safety engineers are valid for the timeframe stated in the proposal (standard: 30 calendar days). Prices for fire safety equipment are subject to statutory GST (Goods & Services Tax) at prevailing rates. For corporate buyers claiming input tax credit, valid GSTIN numbers must be submitted prior to invoice generation.
              </p>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                4. Purchase Orders & Payment Terms
              </h2>
              <p>
                We support multiple payment modes including UPI, Credit/Debit cards, NEFT/RTGS bank transfers, Cash on Delivery (subject to order limits), and Corporate Purchase Orders (PO). For approved industrial clients operating under credit agreements, payment terms shall strictly follow the approved Purchase Order schedule. Overdue payments may result in temporary suspension of scheduled AMC visits.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                5. Product Warranties & Technical Certifications
              </h2>
              <p>
                Products supplied by Sri Udharchi Enterprises carry standard manufacturer warranties against manufacturing defects. Fire extinguishers, valves, and mechanical pumps come with relevant test certificates, ISI marks, and batch verification sheets. The warranty does not cover damage caused by unauthorized tampering, improper storage, corrosion from external chemical exposure, or neglect of periodic hydrostatic testing.
              </p>
            </section>

            {/* Section 6 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="size-4 text-primary" />
                6. Client Site Access & Safety Compliance
              </h2>
              <p>
                For testing, hydro-testing, audit, or installation services, the client agrees to grant our certified engineers safe and unhindered access to the installation area, fire pump room, and riser pipe network. The client must ensure that work permits (such as hot work or electrical clearance permits) are granted in advance where applicable.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                7. Limitation of Liability
              </h2>
              <p>
                While Sri Udharchi Enterprises provides industry-standard engineering and certified equipment, overall fire safety at the client&rsquo;s facility depends upon regular maintenance, timely refilling, active monitoring, and adherence to occupancy safety codes. To the maximum extent permitted by Indian law, our total liability for any claim arising from equipment or services shall not exceed the amount actually paid by the client for the specific product or service in question.
              </p>
            </section>

            {/* Section 8 */}
            <section className="space-y-3 rounded-2xl border border-border bg-card/60 p-6">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <Landmark className="size-4 text-primary" />
                8. Governing Law & Jurisdiction
              </h2>
              <p className="text-xs">
                These Terms of Service and any contractual engagements entered into with Sri Udharchi Enterprises shall be governed by and construed in accordance with the laws of India. Any legal dispute, arbitration, or proceedings shall be subject to the exclusive jurisdiction of the competent courts in Ananthapuramu / Sri Sathya Sai District, Andhra Pradesh.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-3 rounded-2xl border border-border bg-card/60 p-6">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                9. Legal Entity Identification &amp; Registered Office
              </h2>
              <div className="space-y-2 text-xs">
                <p>
                  <strong>Commercial Entity Name:</strong> Sri Udharchi Enterprises
                </p>
                <p>
                  <strong>Legal Entity / Proprietor:</strong> Dabbara Bhanu Swaroop
                </p>
                <p>
                  <strong>Registered Office Address:</strong> 4-169-B, Dharmapuram, Peddapappur, Dharmapuram, Ananthapuramu, Andhra Pradesh, 515445, India
                </p>
                <p>
                  <strong>Office &amp; Logistics Depot:</strong> H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241
                </p>
                <p>
                  <strong>Official Contact:</strong> <a href="mailto:support@udharchi.in" className="hover:text-primary underline">support@udharchi.in</a> &bull; <a href="tel:+918639858221" className="hover:text-primary underline">+91 8639858221</a> / <a href="tel:+919390326541" className="hover:text-primary underline">+91 9390326541</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
