import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/button";
import {
  ArrowRight,
  ClipboardCheck,
  Flame,
  HardHat,
  PackageCheck,
  Phone,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import consultationImg from "@/assets/services/safety-audit-noc.jpg";
import installationImg from "@/assets/services/sprinkler-gas-flooding.jpg";
import inspectionImg from "@/assets/services/hydro-testing.jpg";
import maintenanceImg from "@/assets/services/amc-maintenance.jpg";
import supplyImg from "@/assets/services/ppe-supply.jpg";
import { NanoIcon, type NanoIconName } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/services/")({
  head: () =>
    seoHead({
      title: "Fire Protection Engineering Services & AMC Maintenance | Sri Udharchi Enterprises",
      description:
        "Comprehensive fire protection engineering services across India: Fire Safety Audits & NOCs, Hydrant & Sprinkler Installation, Hydro-Testing Inspections, and 24/7 AMC Maintenance.",
      path: "/services",
      jsonLd: [
        schemas.breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
        ]),
        schemas.service(
          "Comprehensive Fire Protection & Industrial Safety Services",
          "Comprehensive engineering services including fire hydrant networks, automatic sprinklers, gas suppression, AMC maintenance, hydro-testing, and NBC compliance audits.",
          "/services",
        ),
      ],
    }),
  component: ServicesIndexPage,
});

const servicePillars: Array<{
  slug: string;
  title: string;
  icon: typeof Flame;
  nanoIcon: NanoIconName;
  image: string;
  summary: string;
  bullets: string[];
}> = [
  {
    slug: "consultation",
    title: "Fire Safety Consultation & Audit",
    icon: Flame,
    nanoIcon: "fire",
    image: consultationImg,
    summary:
      "Expert safety audits, hazard risk profiling, evacuation blueprints, and regulatory compliance consulting adhering strictly to the National Building Code (NBC 2016) and NFPA guidelines.",
    bullets: [
      "Hazard identification & risk assessment (HIRA)",
      "NBC 2016 & local fire dept. NOC advisory",
      "Emergency evacuation & crisis management planning",
    ],
  },
  {
    slug: "installation",
    title: "Fire Protection System Installation",
    icon: HardHat,
    nanoIcon: "helmet",
    image: installationImg,
    summary:
      "Complete civil and mechanical installation of automated sprinkler grids, fire hydrants, riser downcomer systems, addressable fire alarms, and clean agent gas flooding systems.",
    bullets: [
      "Hydrant piping networks & landing valve risers",
      "Automated ceiling fire sprinkler networks",
      "Gas suppression systems (CO2, FM-200, Novec 1230)",
    ],
  },
  {
    slug: "inspection",
    title: "Testing, Inspection & Certification",
    icon: ClipboardCheck,
    nanoIcon: "shield",
    image: inspectionImg,
    summary:
      "Rigorous statutory inspections, hydrostatic pressure testing of cylinders, hydrant flow and head performance testing, and safety audit certification reports.",
    bullets: [
      "Extinguisher cylinder hydrostatic pressure testing",
      "Hydrant pump discharge & pressure verification",
      "Form B periodic safety inspection certificates",
    ],
  },
  {
    slug: "maintenance",
    title: "AMC & Preventive Maintenance",
    icon: Wrench,
    nanoIcon: "wrench",
    image: maintenanceImg,
    summary:
      "Comprehensive Annual Maintenance Contracts (AMC) ensuring zero downtime, routine testing of alarms, prompt refilling of extinguishers, and 24/7 on-call emergency technician dispatch.",
    bullets: [
      "Scheduled monthly / quarterly preventative servicing",
      "Routine extinguisher weighing, refilling & tagging",
      "24/7 emergency repair & system restoration hotline",
    ],
  },
  {
    slug: "equipment-supply",
    title: "Certified Safety Equipment Supply",
    icon: PackageCheck,
    nanoIcon: "boxes",
    image: supplyImg,
    summary:
      "Direct authorized wholesale distribution of BIS/ISI certified fire extinguishers, hoses, branch pipes, hydrant valves, pump skids, PPE gear, and industrial signage.",
    bullets: [
      "All extinguisher types (ABC, CO2, Foam, Water Mist)",
      "Heavy industrial PPE (helmets, suits, Kevlar gloves)",
      "Direct bulk contractor & institutional pricing",
    ],
  },
];

function ServicesIndexPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Full Lifecycle Protection
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl lg:text-6xl">
            Complete Industrial <span className="text-primary">Safety Services</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            From initial hazard assessment and blueprint consultation to certified end-to-end
            installation, rigorous testing, and round-the-clock maintenance.
          </p>
        </div>
      </section>

      {/* 5 Service Pillars */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl space-y-16 px-5 lg:px-8">
          {servicePillars.map((srv, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={srv.slug}
                className="grid items-center gap-10 rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-lg sm:p-10 lg:grid-cols-2"
              >
                <div className={isEven ? "lg:order-1" : "lg:order-2"}>
                  <div className="relative overflow-hidden rounded-xl border border-border shadow-md">
                    <img
                      src={srv.image}
                      alt={srv.title}
                      referrerPolicy="no-referrer"
                      className="aspect-[16/10] w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                </div>

                <div className={isEven ? "lg:order-2" : "lg:order-1"}>
                  <div className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    <srv.icon className="size-4" />
                    <span>Service Pillar 0{index + 1}</span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-black text-foreground sm:text-3xl">
                    {srv.title}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {srv.summary}
                  </p>

                  <div className="mt-6 space-y-2.5">
                    {srv.bullets.map((b) => (
                      <div
                        key={b}
                        className="flex items-center gap-2.5 text-sm font-medium text-foreground"
                      >
                        <div className="size-1.5 rounded-full bg-primary" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap gap-4">
                    <a href={`/services/${srv.slug}`}>
                      <Button>
                        <span>View Detailed Service Page</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </a>
                    <a href={`/contact?service=${encodeURIComponent(srv.title)}`}>
                      <Button variant="outline">Request Quote</Button>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Engineering Process Banner */}
      <section className="border-t border-border bg-muted/40 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Our Proven Methodology"
            title="The Sri Udharchi 5-Stage Implementation Workflow"
            description="How we ensure zero defects, complete compliance, and seamless commissioning on every project."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                num: "01",
                title: "Consultation",
                desc: "Detailed site survey and risk evaluation",
              },
              {
                num: "02",
                title: "Design",
                desc: "Hydraulic calculations & engineering CAD blueprints",
              },
              { num: "03", title: "Supply", desc: "Procurement of ISI/BIS certified equipment" },
              { num: "04", title: "Installation", desc: "Certified civil & mechanical execution" },
              {
                num: "05",
                title: "AMC & Testing",
                desc: "Form B certification & 24/7 maintenance",
              },
            ].map((step) => (
              <div
                key={step.num}
                className="relative rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <div className="font-display text-3xl font-black text-primary/40">{step.num}</div>
                <h3 className="mt-2 font-display text-lg font-bold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
