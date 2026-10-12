import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Flame,
  Phone,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import consultationImg from "@/assets/images/service_consultation_1790861559415.jpg";
import { NanoIcon } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/services/consultation")({
  head: () =>
    seoHead({
      title: "Fire Safety Consultation & Audits | Sri Udharchi Enterprises",
      description:
        "Professional fire safety risk assessment, NBC 2016 compliance consultation, fire department NOC approvals, and emergency evacuation plans.",
      path: "/services/consultation",
      jsonLd: [
        schemas.breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Consultation & Audits", path: "/services/consultation" },
        ]),
        schemas.service(
          "Fire Safety Consultation, NBC Compliance & NOC Advisory",
          "Professional fire safety risk assessments (HIRA), NBC 2016 alignment, hydraulic calculations, and statutory Fire Department NOC approvals.",
          "/services/consultation"
        ),
      ],
    }),
  component: ConsultationServicePage,
});

export function ConsultationServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <Flame className="size-3.5" /> Service Pillar 01
              </div>
              <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl">
                Fire Safety Consultation & <span className="text-primary">Hazard Audits</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Before purchasing or installing equipment, every facility needs an unbiased,
                comprehensive hazard evaluation. We analyze your physical layouts, occupant loads,
                chemical and electrical risks to design tailored protection plans.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/contact?service=Consultation">
                  <Button size="lg">Schedule a Safety Audit</Button>
                </a>
                <a href="tel:+918639858221">
                  <Button variant="outline" size="lg">
                    <Phone className="size-4" /> Call +91 8639858221
                  </Button>
                </a>
                <a href="tel:+919030609171">
                  <Button variant="outline" size="lg">
                    <Phone className="size-4" /> Call +91 9030609171
                  </Button>
                </a>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
              <img
                src={consultationImg}
                alt="Fire safety consultant reviewing architectural blueprints"
                referrerPolicy="no-referrer"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="absolute right-4 top-4 rounded-xl bg-background/90 p-2 shadow-lg backdrop-blur-md border border-border/60">
                <NanoIcon name="fire" size="md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scope of Consultation */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Our Advisory Scope
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">
              What Our Consultation Covers
            </h2>
            <p className="mt-3 text-muted-foreground">
              We provide end-to-end regulatory and engineering guidance to ensure 100% compliance
              with local and national fire protection mandates.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Hazard Identification & Risk Assessment (HIRA)",
                desc: "Thorough physical inspection of factories, refineries, warehouses, and multi-story structures to locate ignition points, fuel sources, and ventilation risks.",
              },
              {
                title: "National Building Code (NBC 2016) Alignment",
                desc: "Detailed structural review of travel distances, egress doors, staircase pressurization, fire separation walls, and sprinkler density requirements.",
              },
              {
                title: "Fire Department NOC & License Advisory",
                desc: "Preparation of technical documentation, drawings, hydraulic calculations, and liaison assistance for obtaining provisional and final Fire NOCs.",
              },
              {
                title: "Emergency Evacuation & Route Mapping",
                desc: "Design of photoluminescent evacuation floorplans, assembly zone designation, emergency lighting placement, and warden protocols.",
              },
              {
                title: "Hydraulic Calculation & Pipeline Sizing",
                desc: "Computerized hydraulic modeling of pipe friction loss, water reservoir capacity sizing, and pump head requirement calculations.",
              },
              {
                title: "Workplace Mock Drills & Staff Training",
                desc: "Practical hands-on training for staff in handling fire extinguishers, understanding alarm sounds, and executing orderly evacuations.",
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

      {/* Consultation Request Banner */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-black text-foreground">
            Schedule a Confidential Site Assessment
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Our certified safety engineers are available across Andhra Pradesh and Pan-India.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="/contact?service=Consultation">
              <Button size="lg">Book a Safety Audit</Button>
            </a>
            <a href="/services/installation">
              <Button variant="outline" size="lg">
                Next: Installation Services <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
