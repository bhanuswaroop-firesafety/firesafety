import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  ShieldCheck,
  ClipboardCheck,
  Wrench,
  HardHat,
  Camera,
  Boxes,
  CheckCircle2,
  ArrowRight,
  Search,
  Check,
  PhoneCall,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Button } from "@/components/button";

import hydrantImg from "@/assets/fire-hydrant-system.jpg";
import installationImg from "@/assets/images/service_installation_1790861578577.jpg";
import consultationImg from "@/assets/images/service_consultation_1790861559415.jpg";
import inspectionImg from "@/assets/images/service_inspection_1790861596452.jpg";
import maintenanceImg from "@/assets/images/service_maintenance_1790861611461.jpg";
import supplyImg from "@/assets/images/service_supply_1790861624690.jpg";
import cctvImg from "@/assets/cctv-camera.jpg";
import cableImg from "@/assets/cable-management.jpg";

import { NanoIcon, type NanoIconName } from "@/components/nano-icon";

export interface ServiceItem {
  id: string;
  title: string;
  category:
    | "Fire Protection"
    | "Audit & Compliance"
    | "Inspection & AMC"
    | "Workplace & PPE"
    | "Surveillance & Containment";
  tag: string;
  icon: typeof Flame;
  nanoIcon?: NanoIconName;
  image: string;
  description: string;
  deliverables: string[];
  standards: string;
  linkHref: string;
}

export const SAFETY_SERVICES: ServiceItem[] = [
  {
    id: "fire-hydrant-systems",
    title: "Fire Hydrant & Riser Networks",
    category: "Fire Protection",
    tag: "Active Fire Protection",
    icon: Flame,
    nanoIcon: "hydrant",
    image: hydrantImg,
    description:
      "Heavy-duty internal and external hydrant networks, wet and dry riser downcomers, landing valves, and automated hose reel stations engineered for high-pressure industrial response.",
    deliverables: [
      "IS 5290 certified landing valves & instantaneous couplings",
      "Reinforced canvas RRL fire hoses & dual-flow nozzles",
      "Automated pressure regulation & pump discharge skids",
    ],
    standards: "IS 5290 / IS 3844 / NBC 2016",
    linkHref: "/services/installation",
  },
  {
    id: "sprinkler-gas-suppression",
    title: "Automatic Sprinklers & Gas Flooding",
    category: "Fire Protection",
    tag: "Automated Suppression",
    icon: ShieldCheck,
    nanoIcon: "shield",
    image: installationImg,
    description:
      "Ceiling sprinkler grids and specialized clean-agent gas suppression (CO2, FM-200, Novec 1230) protecting high-value server rooms, electrical rooms, and factory floors without water damage.",
    deliverables: [
      "UL/FM rapid-response glass bulb sprinkler heads",
      "Clean agent total flooding with zero ozone depletion",
      "Cross-zoned smoke detection & automated dump valves",
    ],
    standards: "NFPA 13 / NFPA 2001 / IS 15105",
    linkHref: "/services/installation",
  },
  {
    id: "fire-safety-audit",
    title: "Safety Audits & Fire Dept. NOC Advisory",
    category: "Audit & Compliance",
    tag: "Regulatory Compliance",
    icon: ClipboardCheck,
    nanoIcon: "award",
    image: consultationImg,
    description:
      "Comprehensive on-site hazard profiling, life safety reviews, and complete documentation assistance for securing provisional and final Fire Safety NOC from statutory authorities.",
    deliverables: [
      "Hazard Identification & Risk Assessment (HIRA)",
      "Emergency evacuation flow & exit capacity analysis",
      "NBC 2016 Part IV gap analysis & compliance documentation",
    ],
    standards: "NBC 2016 Part IV / AP Fire Services Act",
    linkHref: "/services/consultation",
  },
  {
    id: "testing-inspection",
    title: "Hydro-Testing & Performance Audits",
    category: "Inspection & AMC",
    tag: "Testing & Validation",
    icon: CheckCircle2,
    nanoIcon: "wrench",
    image: inspectionImg,
    description:
      "Statutory hydrostatic stretch testing of high-pressure cylinders, hydrant flow and head pressure verification, and certified periodic Form-B inspection certificates.",
    deliverables: [
      "Hydrostatic cylinder pressure testing up to 300 Bar",
      "Hydrant pitot tube flow & pump churn pressure testing",
      "Detailed diagnostic reports accepted by insurance underwriters",
    ],
    standards: "PESO / IS 2190 / NBC Norms",
    linkHref: "/services/inspection",
  },
  {
    id: "amc-preventive-maintenance",
    title: "Annual Maintenance Contracts (AMC)",
    category: "Inspection & AMC",
    tag: "24/7 Reliability",
    icon: Wrench,
    nanoIcon: "wrench",
    image: maintenanceImg,
    description:
      "Scheduled preventive maintenance programs ensuring round-the-clock operational readiness of all fire fighting systems, routine refilling, and priority emergency technician support.",
    deliverables: [
      "Quarterly mechanical servicing & valve exercise routines",
      "Extinguisher weighing, nitrogen repressurization & tagging",
      "24/7 emergency repair hotline and on-site restoration",
    ],
    standards: "IS 2190 Scheduled Protocols",
    linkHref: "/services/maintenance",
  },
  {
    id: "certified-ppe-supply",
    title: "Certified Industrial PPE & Signage",
    category: "Workplace & PPE",
    tag: "Workplace Protection",
    icon: HardHat,
    nanoIcon: "helmet",
    image: supplyImg,
    description:
      "Authorized wholesale supply of personal protective gear and photoluminescent emergency signage ensuring worker safety across construction, manufacturing, and refineries.",
    deliverables: [
      "IS 2925 certified electrical-resistant safety helmets",
      "Heat-resistant Kevlar & chemical nitrile protective gloves",
      "Glow-in-the-dark escape route signs & full body harness kits",
    ],
    standards: "EN 388 / EN 397 / IS 2925",
    linkHref: "/services/equipment-supply",
  },
  {
    id: "industrial-cctv-surveillance",
    title: "Explosion-Proof CCTV & Flame Detection",
    category: "Surveillance & Containment",
    tag: "Intelligent Monitoring",
    icon: Camera,
    nanoIcon: "cctv",
    image: cctvImg,
    description:
      "Industrial surveillance cameras and thermal flame detection networks designed for explosive environments, fuel yards, hazardous chemical storage, and factory perimeters.",
    deliverables: [
      "ATEX / Ex-d explosion-proof stainless steel camera housings",
      "Thermal radiation sensing for early smoldering & flame alerts",
      "High-definition NVR recording with remote cloud monitoring",
    ],
    standards: "IP67 / ATEX Certified / ONVIF",
    linkHref: "/products",
  },
  {
    id: "cable-management-firestop",
    title: "Fire-Rated Cable Trays & Firestops",
    category: "Surveillance & Containment",
    tag: "Passive Fire Defense",
    icon: Boxes,
    nanoIcon: "cable",
    image: cableImg,
    description:
      "Engineered perforated and ladder cable trays coupled with intumescent firestop barriers that prevent flame and toxic smoke propagation through building penetrations.",
    deliverables: [
      "2-Hour fire-rated galvanized & stainless steel trays",
      "Intumescent sealants expanding 5x under heat exposure",
      "Thermal barrier wraps preserving critical emergency circuits",
    ],
    standards: "BS 476 Part 20 / UL 1479",
    linkHref: "/products",
  },
];

const CATEGORIES = [
  "All Solutions",
  "Fire Protection",
  "Audit & Compliance",
  "Inspection & AMC",
  "Workplace & PPE",
  "Surveillance & Containment",
] as const;

interface ServiceShowcaseGridProps {
  className?: string;
  showCategoryFilter?: boolean;
  showSearchBar?: boolean;
  limit?: number;
  onSelectService?: (service: ServiceItem) => void;
}

export function ServiceShowcaseGrid({
  className = "",
  showCategoryFilter = true,
  showSearchBar = true,
  limit,
  onSelectService,
}: ServiceShowcaseGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All Solutions");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalService, setActiveModalService] = useState<ServiceItem | null>(null);

  const filteredServices = useMemo(() => {
    return SAFETY_SERVICES.filter((service) => {
      const matchesCategory =
        selectedCategory === "All Solutions" || service.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        service.title.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.tag.toLowerCase().includes(q) ||
        service.deliverables.some((d) => d.toLowerCase().includes(q)) ||
        service.standards.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    }).slice(0, limit ?? SAFETY_SERVICES.length);
  }, [selectedCategory, searchQuery, limit]);

  const handleInquire = (service: ServiceItem) => {
    if (onSelectService) {
      onSelectService(service);
      return;
    }
    // Auto-fill query parameter or smooth scroll to contact form
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
      const requirementInput = document.querySelector<HTMLInputElement | HTMLSelectElement>(
        'input[name="requirement"], select[name="requirement"], textarea[name="message"]',
      );
      if (requirementInput) {
        requirementInput.focus();
      }
    } else {
      window.location.href = `/#contact`;
    }
  };

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Search and Filters Bar */}
      {(showCategoryFilter || showSearchBar) && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Tabs */}
          {showCategoryFilter && (
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                const count =
                  cat === "All Solutions"
                    ? SAFETY_SERVICES.length
                    : SAFETY_SERVICES.filter((s) => s.category === cat).length;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`grid size-4 place-items-center rounded-full text-[10px] ${
                        isSelected
                          ? "bg-primary-foreground/20 text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Search Input */}
          {showSearchBar && (
            <div className="relative w-full sm:w-72 lg:w-80">
              <input
                type="text"
                placeholder="Search solutions (e.g. hydrant, audit, PPE)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-2.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grid of Safety Solution Cards */}
      {filteredServices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
          <Filter className="mx-auto size-10 text-muted-foreground/60" />
          <h3 className="mt-3 font-display text-base font-bold text-foreground">
            No matching safety solutions found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Try adjusting your search keywords or resetting the category filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("All Solutions");
              setSearchQuery("");
            }}
            className="mt-4"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.article
                  key={service.id}
                  layout
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
                  className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:border-primary/50 hover:shadow-xl"
                >
                  <div>
                    {/* Image Header with Overlay Badge */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      <img
                        src={service.image}
                        alt={service.title}
                        loading="lazy"
                        width={600}
                        height={380}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      {/* Tag pill top left */}
                      <div className="absolute left-3 top-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 text-[11px] font-bold tracking-tight text-white backdrop-blur-md">
                          <ShieldCheck className="size-3 text-brand-gold" />
                          <span>{service.tag}</span>
                        </span>
                      </div>

                      {/* Floating Service Icon bottom left */}
                      <div className="absolute -bottom-4 left-4 z-10 flex size-12 items-center justify-center rounded-xl border border-border bg-card p-1.5 shadow-lg ring-4 ring-card">
                        {service.nanoIcon ? (
                          <NanoIcon name={service.nanoIcon} size="md" />
                        ) : (
                          <Icon className="size-6 text-primary" />
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 pt-7">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                        <span className="uppercase tracking-wider text-primary">
                          {service.category}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono font-medium">
                          {service.standards}
                        </span>
                      </div>

                      <h3 className="mt-2 font-display text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {service.title}
                      </h3>

                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
                        {service.description}
                      </p>

                      {/* Key Deliverables Bullet Points */}
                      <div className="mt-4 space-y-1.5 border-t border-border/60 pt-4">
                        <span className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                          Key Capabilities
                        </span>
                        <ul className="space-y-1 text-[11px] text-foreground/80">
                          {service.deliverables.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-1.5 leading-snug">
                              <Check className="mt-0.5 size-3 shrink-0 text-success" />
                              <span className="line-clamp-1">{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA Actions */}
                  <div className="border-t border-border bg-muted/20 p-4">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleInquire(service)}
                        className="flex-1 text-xs font-bold"
                      >
                        <span>Inquire Solution</span>
                        <ArrowRight className="size-3.5" />
                      </Button>

                      <a
                        href={service.linkHref}
                        className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition hover:border-primary hover:text-primary"
                        title={`Explore ${service.title} details`}
                      >
                        <ChevronRight className="size-4" />
                      </a>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Bottom Summary Callout */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-background to-primary/5 p-6 text-center sm:flex-row sm:text-left">
        <div>
          <div className="flex items-center justify-center gap-2 font-display text-base font-bold text-foreground sm:justify-start">
            <ShieldCheck className="size-5 text-primary" />
            <span>Need a Customized Industrial Safety Proposal?</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Our certified fire protection engineers conduct site inspections and provide tailored
            NBC/NFPA bill-of-quantities (BOQ).
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <a href="#contact">
            <Button size="sm">
              <span>Request Site Assessment</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </a>
          <a href="tel:+918639858221">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <PhoneCall className="size-3.5" />
              <span>Call Specialist</span>
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
