import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Gauge,
  Phone,
  ShieldCheck,
} from "lucide-react";
import inspectionImg from "@/assets/images/service_inspection_1790861596452.jpg";
import { NanoIcon } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/services/inspection")({
  head: () =>
    seoHead({
      title: "Testing, Inspection & Certification | Sri Udharchi Enterprises",
      description:
        "Statutory fire safety audits, extinguisher hydrostatic pressure testing, hydrant pump performance checks, and Form B safety compliance certificates.",
      path: "/services/inspection",
      jsonLd: [
        schemas.breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "Inspection & Certification", path: "/services/inspection" },
        ]),
        schemas.service(
          "Fire Safety Testing, Inspection & Form B Certification",
          "NABL/PESO-calibrated hydrostatic pressure testing, fire pump flow rate calibration, smoke detector sensitivity auditing, and statutory Form B certificates.",
          "/services/inspection"
        ),
      ],
    }),
  component: InspectionServicePage,
});

export function InspectionServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <ClipboardCheck className="size-3.5" /> Service Pillar 03
              </div>
              <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl">
                Testing, Inspection & <span className="text-primary">Safety Certification</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Fire fighting systems are useless if they fail when an emergency strikes. Our
                licensed inspectors perform hydrostatic pressure testing, pump discharge
                calibration, valve seat leakage checks, and issue official safety audit
                certificates.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/contact?service=Inspection">
                  <Button size="lg">Schedule an Inspection</Button>
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
                src={inspectionImg}
                alt="Fire safety inspector testing high pressure valves and gauges"
                referrerPolicy="no-referrer"
                className="aspect-[16/10] w-full object-cover"
              />
              <div className="absolute right-4 top-4 rounded-xl bg-background/90 p-2 shadow-lg backdrop-blur-md border border-border/60">
                <NanoIcon name="shield" size="md" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Testing Capabilities */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Rigorous Verification
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">
              Certified Testing Protocols We Perform
            </h2>
            <p className="mt-3 text-muted-foreground">
              All testing is performed using calibrated digital gauges and documented with
              timestamped inspection logs for insurance and statutory authorities.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Hydrostatic Pressure Testing (Hydraulic Test)",
                desc: "Pressure testing of fire extinguisher cylinders up to 35 bar and hydrant pipeline networks to detect micro-fissures, seam leaks, and corrosion.",
              },
              {
                title: "Fire Pump Discharge & Flow Rate Calibration",
                desc: "Testing electrical and diesel standby pumps at 0%, 100%, and 150% rated flow capacity to verify pressure curves and auto-cut-in sequences.",
              },
              {
                title: "Smoke & Heat Detector Sensitivity Auditing",
                desc: "Aerosol smoke testing and calibrated thermal heat gun checks on optical detectors across all building loops to detect blind spots.",
              },
              {
                title: "Hydrant Landing Valve & Hose Proof Testing",
                desc: "Static and dynamic pressure tests on landing valves, instantaneous couplings, branch pipe nozzles, and rubberized fabric hoses.",
              },
              {
                title: "Clean Agent Enclosure Integrity (Door Fan Test)",
                desc: "Ensuring server rooms and control centers maintain room airtightness so suppression gas does not leak before extinguishing the fire.",
              },
              {
                title: "Statutory Form B Inspection Certificates",
                desc: "Biannual and annual inspection reports required by local fire safety authorities for commercial and industrial license renewals.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Gauge className="size-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspection CTA Banner */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-black text-foreground">
            Due for an Annual Fire Safety Audit?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Stay fully compliant and avoid penalties. Book your comprehensive inspection today.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="/contact?service=Inspection">
              <Button size="lg">Book Inspection Today</Button>
            </a>
            <a href="/services/maintenance">
              <Button variant="outline" size="lg">
                Next: AMC & Maintenance <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
