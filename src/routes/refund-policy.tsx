import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { RefreshCcw, CheckCircle2, AlertTriangle, Clock, HelpCircle, Mail, Phone, MapPin } from "lucide-react";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/refund-policy")({
  head: () =>
    seoHead({
      title: "Cancellation & Refund Policy | Sri Udharchi Enterprises",
      description:
        "Cancellation, return, and refund policies for certified fire safety equipment, extinguishers, hydrant parts, and technical testing services provided by Sri Udharchi Enterprises.",
      path: "/refund-policy",
      jsonLd: schemas.breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Refund Policy", path: "/refund-policy" },
      ]),
    }),
  component: RefundPolicyPage,
});

export function RefundPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main id="main-content" className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          {/* Header */}
          <div className="border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <RefreshCcw className="size-3.5" />
              <span>Consumer Protection & Transparency</span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Cancellation & Refund Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {lastUpdated} &bull; Applicable to equipment purchases and service contracts at Sri Udharchi Enterprises.
            </p>
          </div>

          {/* Content */}
          <div className="mt-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                1. Order Cancellation Policy
              </h2>
              <p>
                We understand that project requirements may change. Clients may cancel orders under the following conditions:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  <strong className="text-foreground">Standard Catalog Items (Extinguishers, PPE, Standard Valves):</strong> Cancellations requested before the equipment has been dispatched from our central warehouse will be processed with a 100% full refund with no restocking charges.
                </li>
                <li>
                  <strong className="text-foreground">After Dispatch:</strong> Once equipment has been loaded onto freight or courier transit, the order cannot be canceled mid-transit. The customer may initiate an authorized return after receiving the shipment, subject to return shipping costs.
                </li>
                <li>
                  <strong className="text-foreground">Custom Fabricated Assemblies:</strong> Custom-piped manifolds, specialized gas suppression cylinders, or engineered fire pump sets ordered to specific non-standard blueprints cannot be canceled once fabrication or hydro-testing has commenced.
                </li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <CheckCircle2 className="size-4 text-primary" />
                2. Replacement for Damaged, Defective, or Incorrect Shipments
              </h2>
              <p>
                All fire safety equipment undergoes quality control inspection prior to packaging. If your shipment arrives damaged, missing parts, or differing from your order:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Notify us within <strong className="text-foreground">48 hours</strong> of physical receipt by emailing photos of the shipment and delivery note to <a href="mailto:support@udharchi.in" className="text-primary hover:underline">support@udharchi.in</a> or calling <a href="tel:+918639858221" className="text-primary hover:underline">+91 8639858221</a>.
                </li>
                <li>
                  We will arrange reverse pickup of the defective/damaged hardware at our own expense and dispatch a replacement unit promptly, or issue a complete refund if a replacement is unavailable.
                </li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <AlertTriangle className="size-4 text-primary" />
                3. On-Site Inspection & Technical Service Bookings
              </h2>
              <p>
                For booked service appointments (including annual maintenance contract inspections, hydro-testing pickups, or fire audit visits):
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  Cancellations or rescheduling requested at least <strong className="text-foreground">24 hours prior</strong> to the scheduled engineer visit are completely free of charge.
                </li>
                <li>
                  Once engineering teams have completed on-site testing, hydrostatic pressure reports, or statutory audit documentation, the service fee is non-refundable.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">
                4. Refund Processing Timelines & Modes
              </h2>
              <p>
                Approved refunds are processed to the original payment method utilized during order placement:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <h3 className="font-semibold text-foreground text-sm">UPI & Card Payments</h3>
                  <p className="mt-1 text-xs">
                    Refunds are credited directly to your original bank account or card within <strong className="text-foreground">5 to 7 business days</strong> depending on your bank&rsquo;s clearing cycle.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <h3 className="font-semibold text-foreground text-sm">NEFT / RTGS & Cash on Delivery</h3>
                  <p className="mt-1 text-xs">
                    Refunds will be processed via direct NEFT/RTGS bank transfer to your verified corporate bank account within <strong className="text-foreground">3 to 5 business days</strong> after receiving bank verification.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 5 */}
            <section className="space-y-3 rounded-2xl border border-border bg-card/60 p-6">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="size-4 text-primary" />
                5. How to Initiate a Return or Refund Request
              </h2>
              <p className="text-xs">
                To initiate a cancellation, replacement, or refund, contact our dedicated customer support team with your order reference number:
              </p>
              <div className="mt-3 space-y-1.5 text-xs text-foreground">
                <p><strong>Entity Name:</strong> Sri Udharchi Enterprises (Proprietor: <strong>Dabbara Bhanu Swaroop</strong>)</p>
                <p className="flex items-start gap-2">
                  <MapPin className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span><strong>Registered Address:</strong> 4-169-B, Dharmapuram, Peddapappur, Dharmapuram, Ananthapuramu, Andhra Pradesh, 515445, India</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <span><strong>Physical Return Facility &amp; Central Depot:</strong> Sri Udharchi Enterprises, H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, Andhra Pradesh - 515241</span>
                </p>
                <p className="flex items-center gap-2"><Mail className="size-3.5 text-primary" /> <strong>Email:</strong> <a href="mailto:support@udharchi.in" className="hover:text-primary underline">support@udharchi.in</a></p>
                <p className="flex items-center gap-2"><Phone className="size-3.5 text-primary" /> <strong>Support Line:</strong> <a href="tel:+918639858221" className="hover:text-primary underline">+91 8639858221</a> / <a href="tel:+919390326541" className="hover:text-primary underline">+91 9390326541</a></p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
