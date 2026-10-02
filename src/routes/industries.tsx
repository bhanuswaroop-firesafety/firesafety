import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/button";
import { ArrowRight, CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import manufacturingImg from "@/assets/manufacturing.jpg";
import warehousesImg from "@/assets/warehouses.jpg";
import hospitalsImg from "@/assets/hospitals.jpg";
import commercialImg from "@/assets/commercial-buildings.jpg";
import hotelsImg from "@/assets/hotels.jpg";
import schoolsImg from "@/assets/schools.jpg";
import constructionImg from "@/assets/construction.jpg";
import marineImg from "@/assets/marine-safety.jpg";
import infrastructureImg from "@/assets/infrastructure.jpg";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries Served | Sri Udharchi Enterprises - Industrial Fire Safety" },
      {
        name: "description",
        content:
          "Specialized fire safety, hydrant systems, and hazard suppression solutions for Manufacturing, Warehouses, Hospitals, Commercial Real Estate, Marine Ports, and Schools.",
      },
      { property: "og:title", content: "Industries Served | Sri Udharchi Enterprises" },
    ],
  }),
  component: IndustriesPage,
});

const industriesList = [
  {
    name: "Manufacturing & Heavy Industry",
    image: manufacturingImg,
    summary:
      "High fire load environments with volatile raw materials, furnaces, combustible dust, and high-voltage power networks.",
    solutions: [
      "Medium & high velocity water deluge systems",
      "Gas suppression for electrical switchgear rooms",
      "Heavy duty external fire hydrant ring mains",
      "Explosion-proof optical flame detection",
    ],
  },
  {
    name: "Warehousing & Logistics Hubs",
    image: warehousesImg,
    summary:
      "Expansive floorplans with high-density vertical racking, packaging combustibles, and rapid fire-spread risks.",
    solutions: [
      "Early Suppression Fast Response (ESFR) ceiling sprinklers",
      "In-rack automatic sprinkler networks",
      "Perimeter fire hydrants and high-flow diesel pumps",
      "Thermal heat sensing beam detectors",
    ],
  },
  {
    name: "Hospitals & Healthcare Facilities",
    image: hospitalsImg,
    summary:
      "Sensitive non-ambulatory patient populations where evacuation is slow and toxic smoke or water damage must be strictly avoided.",
    solutions: [
      "Clean agent (FM-200 / Novec 1230) for ICU & MRI rooms",
      "Zoned addressable voice evacuation broadcast",
      "Staircase pressurization smoke control",
      "Photoluminescent low-location exit pathways",
    ],
  },
  {
    name: "Commercial Complexes & IT Parks",
    image: commercialImg,
    summary:
      "High-rise towers with thousands of occupants, subterranean parking garages, and multi-tenant compliance demands.",
    solutions: [
      "Wet riser downcomer systems with landing valves",
      "Basement car park sprinkler & exhaust systems",
      "Centralized graphic fire alarm management panels",
      "Fire-rated doors and compartmentalization dampers",
    ],
  },
  {
    name: "Hotels & Hospitality Resorts",
    image: hotelsImg,
    summary:
      "Guest safety requires silent, aesthetic, and ultra-reliable fire protection that integrates discreetly into luxury architecture.",
    solutions: [
      "Concealed flush residential sprinkler heads",
      "Kitchen hood wet chemical fire suppression (Class K)",
      "Automated smoke dampers and corridor sounders",
      "Staff emergency response & guest evacuation protocols",
    ],
  },
  {
    name: "Schools, Colleges & Universities",
    image: schoolsImg,
    summary:
      "Large congregate student assemblies, science laboratories with chemical reagents, and sprawling campus footprints.",
    solutions: [
      "Classroom and lab fire extinguishers (ABC & CO2)",
      "Campus-wide manual call point alarm networks",
      "Fire hydrant points with pre-connected canvas hoses",
      "Periodic student fire drill & safety awareness sessions",
    ],
  },
  {
    name: "Marine Ports & Offshore Facilities",
    image: marineImg,
    summary:
      "Corrosive maritime environments, cargo container yards, fuel bunkering docks, and heavy marine machinery.",
    solutions: [
      "Seawater-resistant bronze & gunmetal hydrant valves",
      "High-expansion foam systems for fuel fires",
      "Marine-certified (Class NK / DNV) fire gear",
      "Stainless steel SS 316 piping networks",
    ],
  },
  {
    name: "Infrastructure & Highway Road Safety",
    image: infrastructureImg,
    summary:
      "Tunnels, flyovers, metro stations, toll plazas, and transit hubs requiring continuous public safety infrastructure.",
    solutions: [
      "Deluge water spray curtain systems for road tunnels",
      "Road safety barriers and reflective hazard bollards",
      "Linear heat detection cables along tunnel ceilings",
      "Automated emergency phone call boxes & alarms",
    ],
  },
  {
    name: "Construction & Infrastructure Projects",
    image: constructionImg,
    summary:
      "Temporary high-hazard construction sites with hot work welding, open structural bays, and heavy plant operations.",
    solutions: [
      "Temporary dry riser installation during construction",
      "Mobile wheeled 50kg foam and powder extinguishers",
      "Full body fall arrest safety harnesses & helmets",
      "Hot work permit auditing and continuous safety oversight",
    ],
  },
];

function IndustriesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Sector-Specific Engineering
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl lg:text-6xl">
            Custom Safety Systems for <span className="text-primary">Every Industry</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Every sector faces unique hazard profiles and statutory bylaws. Sri Udharchi Enterprises
            designs, supplies, and certifies fire systems matched to your exact operational risks.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {industriesList.map((ind) => (
              <div
                key={ind.name}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={ind.image}
                    alt={ind.name}
                    referrerPolicy="no-referrer"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-bold text-foreground">{ind.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {ind.summary}
                  </p>

                  <div className="mt-5 space-y-2 border-t border-border pt-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      Key Protection Systems:
                    </span>
                    {ind.solutions.map((sol) => (
                      <div
                        key={sol}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>{sol}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-2">
                    <a
                      href={`/contact?industry=${encodeURIComponent(ind.name)}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full justify-between">
                        <span>Consult Our Engineers</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Callout */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-black text-foreground">
            Don't See Your Specific Industry Listed?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Our fire safety consultants work with specialty facilities including pharmaceutical
            clean rooms, power generation plants, textile mills, and aerospace hangars.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="/contact">
              <Button size="lg">Discuss Your Project</Button>
            </a>
            <a href="tel:+918639858221">
              <Button variant="outline" size="lg">
                <Phone className="size-4" /> Call +91 8639858221
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
