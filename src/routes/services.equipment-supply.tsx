import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  PackageCheck,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import supplyImg from "@/assets/services/ppe-supply.jpg";
import { NanoIcon } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/services/equipment-supply")({
  head: () =>
    seoHead({
      title: "Fire Safety Products & Certified Equipment Supply | Sri Udharchi Enterprises",
      description:
        "Wholesale distributor of certified fire safety products: BIS/ISI fire extinguishers, hydrant valves, fire hoses, pumps, PPE safety equipment, and industrial emergency hardware.",
      path: "/services/equipment-supply",
      keywords: [
        "fire safety products",
        "fire safety product supply",
        "certified safety equipment",
        "fire extinguishers wholesale",
        "fire fighting products Andhra Pradesh",
        "industrial PPE gear",
        "Sri Udharchi Enterprises",
      ],
      jsonLd: [
        schemas.breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Equipment Supply", path: "/services/equipment-supply" },
        ]),
        schemas.service(
          "Industrial Fire Safety Products & Equipment Supply",
          "Distributor of BIS/ISI certified fire extinguishers, hydrant landing valves, RRL hoses, PPE safety gear, photoluminescent safety signage, and fire pumps.",
          "/services/equipment-supply",
        ),
      ],
    }),
  component: EquipmentSupplyServicePage,
});

export function EquipmentSupplyServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <PackageCheck className="size-3.5" /> Service Pillar 05
              </div>
              <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl">
                Certified Safety Hardware & <span className="text-primary">Equipment Supply</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                As an authorized distributor and manufacturer-direct supplier, Sri Udharchi
                Enterprises stocks certified fire fighting hardware, PPE gear, and suppression
                accessories with guaranteed test certificates and immediate dispatch.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/contact?service=Equipment%20Supply">
                  <Button size="lg">Request Wholesale Catalog</Button>
                </a>
                <a href="tel:+918639858221">
                  <Button variant="outline" size="lg">
                    <Phone className="size-4" /> Call +91 8639858221
                  </Button>
                </a>
                <a href="tel:+919390326541">
                  <Button variant="outline" size="lg">
                    <Phone className="size-4" /> Call +91 9390326541
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
              <img
                src={supplyImg}
                alt="Modern safety equipment showroom stocked with fire extinguishers and PPE gear"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Supply Categories */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Direct Sourcing
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">
              Equipment Categories We Distribute
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every unit supplied comes with manufacturing batch numbers, third-party laboratory
              test reports, and Bureau of Indian Standards (BIS) holographic tags.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Portable & Trolley Fire Extinguishers",
                desc: "Complete portfolio: ABC Stored Pressure (1kg-9kg), CO2 (2kg-4.5kg-9kg), Clean Agent (HFC 236fa), AFFF Mechanical Foam, and 50kg industrial wheeled mobile units.",
              },
              {
                title: "Hydrant Valves, Hoses & Branch Pipes",
                desc: "Single & double outlet landing valves (IS 5290), Reinforced Rubber Lined (RRL) Type A & B canvas hoses (IS 636), stainless steel branch pipes, and fog nozzles.",
              },
              {
                title: "Personal Protective Equipment (PPE)",
                desc: "IS 2925 safety helmets with ratchet adjustment, heat-resistant Kevlar gloves, high-visibility reflective jackets, safety boots with steel toe-caps, and full-body harnesses.",
              },
              {
                title: "Fire Pumps, Valves & Flow Control",
                desc: "Horizontal split-case electrical pumps, diesel standby engine assemblies, multi-stage vertical jockey pumps, gate valves, check valves, and butterfly valves.",
              },
              {
                title: "Photoluminescent Signage & Emergency Lights",
                desc: "Glow-in-the-dark fire exit signs, fire alarm call point signs, extinguisher location boards, chemical hazard placards, and battery-backed twin LED emergency spotlights.",
              },
              {
                title: "Industrial Cable Trays & Firestop Sealants",
                desc: "Perforated and ladder cable trays, intumescent firestop pillows, cable coating compounds, and fire-resistant mineral-insulated electrical cables.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Supply Banner */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Truck className="size-6" />
          </div>
          <h2 className="font-display text-3xl font-black text-foreground">
            Direct Delivery Across Andhra Pradesh & Pan-India
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Fast dispatch from our Palasamudram, AP inventory hub with competitive wholesale rates
            for contractors, factories, and builders.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="/products">
              <Button size="lg">Explore Products Catalog</Button>
            </a>
            <a href="/contact">
              <Button variant="outline" size="lg">
                Request Price Quote
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
