import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import { ArrowRight, Boxes, CheckCircle2, HardHat, Phone, ShieldCheck, Wrench } from "lucide-react";
import installationImg from "@/assets/services/sprinkler-gas-flooding.jpg";
import { NanoIcon } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/services/installation")({
  head: () =>
    seoHead({
      title: "Fire Safety System Installation | Sri Udharchi Enterprises",
      description:
        "Complete installation of fire hydrant systems, automatic sprinkler networks, fire alarm panels, gas suppression systems, and industrial CCTV.",
      path: "/services/installation",
      jsonLd: [
        schemas.breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Services", path: "/services" },
          { name: "System Installation", path: "/services/installation" },
        ]),
        schemas.service(
          "Complete Fire Safety System Installation",
          "Engineered installation of industrial fire hydrants, automatic sprinkler rings, diesel pump houses, FM-200 clean agent gas flooding, and intelligent detection systems.",
          "/services/installation",
        ),
      ],
    }),
  component: InstallationServicePage,
});

export function InstallationServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <HardHat className="size-3.5" /> Service Pillar 02
              </div>
              <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl">
                Comprehensive Fire Safety <span className="text-primary">System Installation</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">
                We handle the complete execution cycle of industrial and commercial fire protection
                infrastructure. Our in-house engineering team designs, fabricates, welds, tests, and
                commissions systems with zero subcontracting shortcuts.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="/contact?service=Installation">
                  <Button size="lg">Request Installation Proposal</Button>
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
                src={installationImg}
                alt="Engineers installing industrial fire sprinkler piping and hydrant network"
                referrerPolicy="no-referrer"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Systems We Install */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="max-w-2xl">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Systems & Capabilities
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">
              Engineered Protection Systems We Install
            </h2>
            <p className="mt-3 text-muted-foreground">
              Every system is installed by certified pipefitters and technicians in strict
              conformance with IS 13039, IS 15105, and NFPA standards.
            </p>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Internal & External Fire Hydrant Systems",
                desc: "Complete ring main networks, landing valves, fire hose reel cabinets, branch pipes, and underground ductile iron or MS piping.",
              },
              {
                title: "Automatic Fire Sprinkler Networks",
                desc: "Wet pipe, dry pipe, pre-action, and deluge sprinkler grids with UL/FM certified quick-response sprinkler heads and alarm check valves.",
              },
              {
                title: "Fire Pump House & Automation",
                desc: "Complete installation of main electric driven pumps, diesel engine standby pumps, jockey pumps, and auto-start synchronized control panels.",
              },
              {
                title: "Clean Agent Gas Flooding (FM-200 / Novec)",
                desc: "Total flooding gaseous suppression for server rooms, data centers, electrical control rooms, and sub-stations where water cannot be used.",
              },
              {
                title: "Addressable Fire Alarm & Smoke Detection",
                desc: "Intelligent optical smoke detectors, multi-sensor heat sensors, manual call points, response indicators, and central control panels.",
              },
              {
                title: "Explosion-Proof Industrial CCTV & Flame Detection",
                desc: "Specialized flame-sensing optical CCTV networks for hazardous chemical process zones, oil storage terminals, and manufacturing plants.",
              },
            ].map((sys) => (
              <div
                key={sys.title}
                className="rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
              >
                <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">{sys.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sys.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Installation Banner */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-black text-foreground">
            Have an Upcoming Facility Build or System Retrofit?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Get accurate Bill of Quantities (BOQ), certified engineering drawings, and transparent
            pricing.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="/contact?service=Installation">
              <Button size="lg">Request Installation Quote</Button>
            </a>
            <a href="/services/inspection">
              <Button variant="outline" size="lg">
                Next: Testing & Inspection <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
