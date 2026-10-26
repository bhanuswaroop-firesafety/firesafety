import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import { ArrowRight, Clock, Gauge, Phone, ShieldCheck, Wrench, Zap } from "lucide-react";
import maintenanceImg from "@/assets/services/amc-maintenance.jpg";
import { NanoIcon } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/services/maintenance")({
  head: () =>
    seoHead({
      title: "AMC & Preventive Maintenance | Sri Udharchi Enterprises",
      description:
        "Annual Maintenance Contracts (AMC), periodic extinguisher refilling, diesel fire pump service, and 24/7 on-call emergency response across India.",
      path: "/services/maintenance",
      jsonLd: [
        schemas.breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "AMC & Maintenance", path: "/services/maintenance" },
        ]),
        schemas.service(
          "Fire Fighting AMC & Preventive Maintenance",
          "Comprehensive annual maintenance contracts (AMC), periodic extinguisher refilling, diesel booster pump test runs, gasket care, and 24/7 emergency dispatch.",
          "/services/maintenance",
        ),
      ],
    }),
  component: MaintenanceServicePage,
});

export function MaintenanceServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Wrench className="size-3.5" /> Service Pillar 04
              </div>
              <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl">
                Annual Maintenance Contracts & <span className="text-primary">Preventive Care</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Ensure your fire infrastructure operates at peak readiness 365 days a year. Our
                structured AMC plans include monthly checkups, scheduled refilling, automated pump
                trial runs, and prioritized emergency technician dispatch.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/contact?service=Maintenance">
                  <Button size="lg">Get an AMC Proposal</Button>
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
                src={maintenanceImg}
                alt="Technician servicing industrial diesel fire pumps and valves"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Maintenance Inclusions */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Zero Downtime
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">
              What Is Covered Under Our AMC
            </h2>
            <p className="mt-3 text-muted-foreground">
              We offer comprehensive (with spares) and non-comprehensive preventive maintenance
              packages tailored to your facility size and risk profile.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Periodic Extinguisher Refilling & Tagging",
                desc: "Scheduled weighing of CO2 cylinders, nitrogen pressure check for ABC powder, chemical foam replacement, and tamper-evident statutory inspection tags.",
              },
              {
                title: "Diesel Engine & Pump Test Runs",
                desc: "Weekly/monthly test runs of diesel standby pumps, battery health checks, oil changes, radiator coolant top-ups, and automated switchover simulation.",
              },
              {
                title: "Hydrant Ring Main Flushing & Gasket Care",
                desc: "Flushing hydrant ring mains to clear pipe sediment, lubricating landing valve spindles, and replacing aged rubber washers to prevent drip leaks.",
              },
              {
                title: "Fire Alarm Sensor Cleaning & Battery Backup",
                desc: "Cleaning chamber dust from optical smoke detectors, testing manual call points, verifying siren decibel levels, and checking backup battery UPS banks.",
              },
              {
                title: "Sprinkler Flow Switch & Control Valve Audits",
                desc: "Exercising OS&Y isolation valves, testing tamper switches, and running water through inspector's test connections to verify mechanical alarm bells.",
              },
              {
                title: "24/7 Guaranteed Emergency Dispatch",
                desc: "Round-the-clock priority technical hotline with guaranteed on-site arrival within 2-4 hours for critical system faults or accidental discharge.",
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

      {/* Maintenance CTA */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-black text-foreground">
            Switch Your Facility to Sri Udharchi AMC
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Get an instant evaluation of your current safety setup and save up to 25% on annual
            maintenance costs.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="/contact?service=Maintenance">
              <Button size="lg">Request AMC Proposal</Button>
            </a>
            <a href="/services/equipment-supply">
              <Button variant="outline" size="lg">
                Next: Equipment Supply <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
