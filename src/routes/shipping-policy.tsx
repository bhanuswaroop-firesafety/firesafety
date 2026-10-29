import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Truck, MapPin, Clock, ShieldCheck, PackageCheck, AlertCircle } from "lucide-react";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/shipping-policy")({
  head: () =>
    seoHead({
      title: "Shipping & Delivery Policy | Sri Udharchi Enterprises",
      description:
        "Shipping and delivery guidelines for industrial fire safety equipment, extinguishers, hydrant systems, and emergency gear across Andhra Pradesh and Pan-India.",
      path: "/shipping-policy",
      jsonLd: schemas.breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Shipping Policy", path: "/shipping-policy" },
      ]),
    }),
  component: ShippingPolicyPage,
});

export function ShippingPolicyPage() {
  const lastUpdated = "October 2026";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main id="main-content" className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-4xl px-5 lg:px-8">
          {/* Header */}
          <div className="border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
              <Truck className="size-3.5" />
              <span>Logistics & Industrial Transport</span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Shipping & Delivery Policy
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Last updated: {lastUpdated} &bull; Delivery timelines and transit guidelines for Sri Udharchi Enterprises.
            </p>
          </div>

          {/* Content */}
          <div className="mt-8 space-y-10 text-sm leading-relaxed text-muted-foreground">
            {/* Section 1 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <MapPin className="size-4 text-primary" />
                1. Serviceable Locations & Hubs
              </h2>
              <p>
                <strong>Sri Udharchi Enterprises</strong> (Proprietor: <strong>Dabbara Bhanu Swaroop</strong>) is legally registered at 4-169-B, Dharmapuram, Peddapappur, Dharmapuram, Ananthapuramu, Andhra Pradesh, 515445, India, and operates central logistics depots in Palasamudram (H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241), offering comprehensive pan-India freight and shipping coverage. We deliver to industrial zones, SEZs, manufacturing plants, corporate tech parks, and commercial complexes across all states and union territories of India.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                2. Standard Delivery Timelines
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <span className="text-xs font-bold text-primary uppercase">Andhra Pradesh & Rayalaseema</span>
                  <p className="mt-1 font-display text-xl font-extrabold text-foreground">24 – 48 Hours</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Direct dispatch to Anantapur, Hindupur, Sri City, Tirupati, Kurnool, and Vijayawada.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <span className="text-xs font-bold text-primary uppercase">South India Regional</span>
                  <p className="mt-1 font-display text-xl font-extrabold text-foreground">2 – 4 Days</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Fast-track surface courier to Bengaluru, Hyderabad, Chennai, and Coimbatore industrial clusters.
                  </p>
                </div>
                <div className="rounded-xl border border-border/70 bg-card p-4">
                  <span className="text-xs font-bold text-primary uppercase">Rest of India / Pan-India</span>
                  <p className="mt-1 font-display text-xl font-extrabold text-foreground">4 – 7 Days</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Reliable ground freight for heavy industrial fire systems and palletized equipment.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <PackageCheck className="size-4 text-primary" />
                3. Heavy Industrial Freight & Pressurized Cylinders
              </h2>
              <p>
                Fire extinguishers, CO2 suppression cylinders, diesel fire pump engines, and ductile iron hydrant valves are categorized as heavy/pressurized industrial equipment:
              </p>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>
                  All charged pressure vessels are inspected, tagged, and packaged according to statutory safety standards for surface transport.
                </li>
                <li>
                  Heavy consignments (over 50 kg) are strapped on standard wooden pallets and dispatched via licensed heavy freight logistics partners with hydraulic lift-gate capability where requested.
                </li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                <Truck className="size-4 text-primary" />
                4. Order Tracking & Dispatch Documentation
              </h2>
              <p>
                Once your consignment is handed over to the freight carrier, a notification containing the Lorry Receipt (LR) number, Courier Tracking ID, and carrier helpline is sent via email and SMS. You can also monitor your live dispatch status within the Client Portal under your Order History tab.
              </p>
            </section>

            {/* Section 5 */}
            <section className="space-y-3 rounded-2xl border border-border bg-card/60 p-6">
              <h2 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                5. Transit Insurance & Delivery Receipt Verification
              </h2>
              <p className="text-xs">
                All bulk shipments sent by Sri Udharchi Enterprises carry comprehensive transit insurance against loss, transit fire, or vehicular accidents. Clients are requested to inspect the outer packaging and tamper-evident security tape before signing the proof of delivery (POD). In the unlikely event of physical carton breach or shortage, record remarks on the carrier&rsquo;s LR copy and notify our logistics desk within 48 hours.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
