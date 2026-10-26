import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/button";
import { CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import projectHydrantImg from "@/assets/project-hydrant.jpg";
import projectPumpImg from "@/assets/project-pump.jpg";
import projectCctvImg from "@/assets/project-cctv.jpg";
import projectCableImg from "@/assets/project-cable.jpg";
import cleanAgentImg from "@/assets/images/project_clean_agent_gas.jpg";
import warehouseSprinklerImg from "@/assets/images/project_warehouse_sprinkler_1790949802340.jpg";
import hydrantNetworkImg from "@/assets/images/project_hydrant_network_1790949784743.jpg";
import hydrantImg from "@/assets/fire-hydrant-system.jpg";
import warehousesImg from "@/assets/warehouses.jpg";
import { NanoIcon, type NanoIconName } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/projects")({
  head: () =>
    seoHead({
      title: "Featured Projects & Portfolio | Sri Udharchi Enterprises",
      description:
        "Explore real-world fire protection installations, industrial pump houses, automated sprinkler networks, and cable management projects delivered by Sri Udharchi Enterprises.",
      path: "/projects",
      jsonLd: schemas.breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Projects", path: "/projects" },
      ]),
    }),
  component: ProjectsPage,
});

const projectsList: Array<{
  id: string;
  title: string;
  category: string;
  image: string;
  nanoIcon: NanoIconName;
  location: string;
  client: string;
  scope: string;
  metrics: string[];
}> = [
  {
    id: "heavy-manufacturing-hydrant",
    title: "Heavy Manufacturing Facility Fire Hydrant Network",
    category: "Hydrant Systems",
    image: hydrantNetworkImg,
    nanoIcon: "hydrant",
    location: "Visakhapatnam Industrial Corridor, AP",
    client: "Heavy Machinery & Fabrication Plant (45,000 sq.m)",
    scope:
      "Design, supply, and installation of a 3.2 km underground external fire hydrant ring main, 28 double-headed landing valves, 14 outdoor hose boxes, and dual jockey pump skids.",
    metrics: ["3.2 km Piping Network", "28 Hydrant Stations", "Zero Compliance Violations"],
  },
  {
    id: "industrial-pump-house",
    title: "Automated Main & Standby Diesel Fire Pump House",
    category: "Fire Pumps",
    image: projectPumpImg,
    nanoIcon: "pump",
    location: "Kakinada Port Special Economic Zone, AP",
    client: "Chemical Processing & Bulk Liquid Storage Terminal",
    scope:
      "Complete civil and mechanical installation of a 2500 GPM main electric fire pump, 2500 GPM heavy-duty diesel standby pump, and 150 GPM jockey pump with synchronized auto-start PLC panel.",
    metrics: ["2500 GPM Capacity", "Under 8-Sec Auto-Start", "NBC & TAC Approved"],
  },
  {
    id: "logistics-warehouse-sprinkler",
    title: "Mega Logistics Warehouse ESFR Sprinkler Grid",
    category: "Sprinkler Systems",
    image: warehouseSprinklerImg,
    nanoIcon: "fire",
    location: "Vijayawada Logistics Hub, AP",
    client: "E-Commerce Regional Fulfillment Center (120,000 sq.ft)",
    scope:
      "Installation of high-ceiling Early Suppression Fast Response (ESFR) pendent sprinkler network, 4 alarm check valve stations, and integration with the central fire alarm system.",
    metrics: ["1,400+ ESFR Heads", "4 Alarm Check Valves", "Full Fire Dept. NOC Issued"],
  },
  {
    id: "industrial-cctv-flame-detection",
    title: "Explosion-Proof IP CCTV & Optical Flame Detection",
    category: "Surveillance & CCTV",
    image: projectCctvImg,
    nanoIcon: "cctv",
    location: "Visakhapatnam Refinery Zone, AP",
    client: "Petrochemical Intermediate Storage & Transfer Terminal",
    scope:
      "Engineering and commissioning of 48 explosion-proof ATEX-rated IP cameras with integrated optical thermal flame sensing, NVR server racks, and remote control room dashboard.",
    metrics: ["48 Explosion-Proof Cameras", "Optical Flame Detection", "24/7 Redundant Recording"],
  },
  {
    id: "fire-rated-cable-management",
    title: "High-Temp Fire-Rated Industrial Cable Tray Network",
    category: "Cable Management",
    image: projectCableImg,
    nanoIcon: "cable",
    location: "Rayalaseema Industrial Estate, AP",
    client: "Continuous Process Steel Rolling Mill",
    scope:
      "Installation of 4.5 km heavy gauge perforated and ladder cable trays with 2-hour fire-rated intumescent barrier coatings and firestop penetration seals through floor slabs.",
    metrics: ["4.5 km Cable Trays", "2-Hour Fire Integrity", "100+ Firestop Wall Seals"],
  },
  {
    id: "hospital-clean-agent-suppression",
    title: "Multi-Specialty Hospital Clean Agent Gas Suppression",
    category: "Gas Suppression",
    image: cleanAgentImg,
    nanoIcon: "medical",
    location: "Guntur Healthcare District, AP",
    client: "350-Bed Tertiary Care Hospital Campus",
    scope:
      "Complete installation of FM-200 clean agent gas flooding systems for 6 server rooms, MRI diagnostics suite, and central electrical LT panel room with zero water damage risk.",
    metrics: ["6 Clean Agent Zones", "10-Sec Discharge Time", "Zero Equipment Residue"],
  },
];

const categories = [
  "All",
  "Hydrant Systems",
  "Fire Pumps",
  "Sprinkler Systems",
  "Surveillance & CCTV",
  "Cable Management",
  "Gas Suppression",
];

function ProjectsPage() {
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filteredProjects =
    selectedFilter === "All"
      ? projectsList
      : projectsList.filter((p) => p.category === selectedFilter);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Proven Track Record
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl lg:text-6xl">
            Delivered Fire Protection <span className="text-primary">Projects</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            A portfolio of real-world system installations, engineering audits, and industrial
            suppression systems commissioned for leading enterprises across India.
          </p>

          {/* Filter Pills */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedFilter(cat)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all sm:text-sm ${
                  selectedFilter === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Showcase */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2">
            {filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-primary/50 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-md bg-background/90 px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground backdrop-blur">
                    {proj.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6 sm:p-8">
                  <div className="text-xs font-semibold text-primary">{proj.location}</div>
                  <h3 className="mt-1 font-display text-2xl font-bold text-foreground">
                    {proj.title}
                  </h3>
                  <div className="mt-2 text-xs font-medium text-muted-foreground">
                    <strong className="text-foreground">Client:</strong> {proj.client}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{proj.scope}</p>

                  <div className="mt-6 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                    {proj.metrics.map((m) => (
                      <div
                        key={m}
                        className="rounded-lg bg-muted/60 p-2 text-xs font-semibold text-foreground"
                      >
                        {m}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-2">
                    <a href="/contact">
                      <Button variant="outline" className="w-full">
                        Inquire About Similar Setup
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-black text-foreground">
            Plan Your Next Project with Sri Udharchi Enterprises
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Our engineering team prepares detailed drawings, hydraulic simulations, and comprehensive BOQ
            estimates with fast turnaround times.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="/contact">
              <Button size="lg">Request a Project Consultation</Button>
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
      </section>

      <SiteFooter />
    </main>
  );
}
