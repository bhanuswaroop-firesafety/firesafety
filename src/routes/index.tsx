import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  Flame,
  HardHat,
  HeartPulse,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  ShipWheel,
  Stethoscope,
  Wrench,
  Zap,
  Camera,
  Construction,
  Factory,
  Warehouse,
  ShoppingBag,
  ShoppingCart,
  FileText,
  Star,
  Award,
  Clock,
  Truck,
  CheckCircle2,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/button";
import { BrandLogo } from "@/components/brand-logo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { ServiceShowcaseGrid } from "@/components/service-showcase-grid";
import { ContactForm } from "@/components/contact-form";
import { NanoIcon, type NanoIconName } from "@/components/nano-icon";
import { useCart } from "@/lib/cart-context";
import hero from "@/assets/udharchi-hero.jpg";
import heroMobile from "@/assets/udharchi-hero-mobile.jpg";
import hydrant from "@/assets/fire-hydrant-system.jpg";
import trust from "@/assets/trusted-safety-partner.jpg";
import extinguisher from "@/assets/fire-extinguisher.jpg";
import valve from "@/assets/hydrant-valve.jpg";
import pump from "@/assets/fire-pump.jpg";
import helmet from "@/assets/safety-helmet.jpg";
import gloves from "@/assets/safety-gloves.jpg";
import cctv from "@/assets/cctv-camera.jpg";
import manufacturing from "@/assets/manufacturing.jpg";
import construction from "@/assets/construction.jpg";
import warehouses from "@/assets/warehouses.jpg";
import hospitals from "@/assets/hospitals.jpg";
import schools from "@/assets/schools.jpg";
import commercial from "@/assets/commercial-buildings.jpg";
import hotels from "@/assets/hotels.jpg";
import infrastructure from "@/assets/infrastructure.jpg";
import projectPump from "@/assets/project-pump.jpg";
import projectCctv from "@/assets/project-cctv.jpg";
import projectCable from "@/assets/project-cable.jpg";
import projectHydrant from "@/assets/project-hydrant.jpg";
import roadSafety from "@/assets/road-safety.jpg";
import medicalSafety from "@/assets/medical-safety.jpg";
import marineSafety from "@/assets/marine-safety.jpg";
import cableManagement from "@/assets/cable-management.jpg";
import { TiltedGridHero } from "@/components/ui/tilted-grid-hero";
import { seoHead, schemas } from "@/lib/seo";

const PROJECT_CYLINDER_IMAGES = [
  { src: projectPump, alt: "Industrial Fire Pump Skids" },
  { src: projectHydrant, alt: "High-Pressure Hydrant Networks" },
  { src: projectCctv, alt: "Hazardous Area CCTV Surveillance" },
  { src: projectCable, alt: "Fire-Rated Cable Containment" },
  { src: manufacturing, alt: "Automotive & Manufacturing Facility Comprehensive Protection" },
  { src: warehouses, alt: "Cold Storage & High-Density Warehouses" },
  { src: marineSafety, alt: "Marine Offshore Safety Engineering" },
  { src: infrastructure, alt: "Public Infrastructure & Metro Life Safety" },
  { src: commercial, alt: "Commercial Complex Fire Safety Systems" },
];

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      title: "Fire Safety Products & Complete Fire Protection Systems | Sri Udharchi Enterprises",
      description:
        "India's certified supplier of fire safety products and comprehensive fire protection engineering. Buy ISI certified fire extinguishers, hydrant systems, fire pumps, PPE safety equipment, and AMC maintenance services.",
      path: "/",
      keywords: [
        "fire safety products",
        "fire safety product",
        "fire safety equipment",
        "buy fire safety products",
        "fire extinguishers online",
        "industrial safety products",
        "fire protection equipment India",
        "fire fighting contractors Andhra Pradesh",
        "fire hydrant valve and hoses",
        "Sri Udharchi Enterprises",
      ],
      jsonLd: schemas.faq([
        {
          question: "What certified fire safety products do you supply?",
          answer:
            "Sri Udharchi Enterprises supplies IS 15683 certified ABC/CO2/Foam fire extinguishers, fire hydrant landing valves, RRL fire hoses, diesel & electric fire pumps, PPE safety helmets, protective boots, and flame detection hardware.",
        },
        {
          question: "What fire protection services does Sri Udharchi Enterprises provide?",
          answer:
            "Sri Udharchi Enterprises provides engineered fire hydrant networks, automatic sprinkler systems, fire pump automation, FM-200 gas flooding, statutory NBC 2016 safety audits, extinguisher refilling, and comprehensive AMC maintenance.",
        },
        {
          question: "Are your fire safety products compliant with Indian standards?",
          answer:
            "Yes, all fire safety products supplied by Sri Udharchi Enterprises comply strictly with BIS/ISI certifications, NBC 2016 codes, PESO guidelines, and CE/NFPA standards.",
        },
        {
          question: "Do you offer Annual Maintenance Contracts (AMC) for fire fighting systems?",
          answer:
            "Yes, we provide 24/7 preventive and breakdown AMC coverage including quarterly pump runs, pressure hydro-testing, detector sensitivity audits, and statutory Form B inspection certificates.",
        },
        {
          question: "Which geographic regions do you deliver fire safety equipment to?",
          answer:
            "We serve industrial clients across Andhra Pradesh, Telangana, Odisha, and provide complete equipment supply and engineering pan-India with GST input tax invoices.",
        },
      ]),
    }),
  component: Index,
});

const PRODUCT_CATEGORIES = [
  {
    name: "Fire Safety & Extinguishers",
    desc: "IS 15683 certified ABC, CO2, and Foam extinguishers",
    image: extinguisher,
    nanoIcon: "fire" as NanoIconName,
  },
  {
    name: "Fire Hydrant Hardware",
    desc: "Landing valves, hose reels, branch pipes and couplings",
    image: valve,
    nanoIcon: "hydrant" as NanoIconName,
  },
  {
    name: "Fire Pumps & Booster Sets",
    desc: "Electric motor and diesel engine centrifugal booster pumps",
    image: pump,
    nanoIcon: "pump" as NanoIconName,
  },
  {
    name: "Personal Protective Equipment",
    desc: "Helmets, Kevlar gloves, safety shoes, reflective vests",
    image: helmet,
    nanoIcon: "helmet" as NanoIconName,
  },
  {
    name: "Electrical & High Voltage Safety",
    desc: "Insulating mats, arc flash protection and safety gloves",
    image: gloves,
    nanoIcon: "zap" as NanoIconName,
  },
  {
    name: "Road & Traffic Safety",
    desc: "Heavy-base cones, speed humps, and reflective batons",
    image: roadSafety,
    nanoIcon: "road" as NanoIconName,
  },
  {
    name: "Emergency Medical & Trauma",
    desc: "Factories Act compliant workplace first-aid & burn kits",
    image: medicalSafety,
    nanoIcon: "medical" as NanoIconName,
  },
  {
    name: "Marine & Weather Protection",
    desc: "Lifebuoys, immersion suits, and marine safety gear",
    image: marineSafety,
    nanoIcon: "marine" as NanoIconName,
  },
  {
    name: "Industrial CCTV Surveillance",
    desc: "Explosion-proof cameras, thermal imaging, and NVRs",
    image: cctv,
    nanoIcon: "cctv" as NanoIconName,
  },
  {
    name: "Cable Management Trays",
    desc: "Hot-dip galvanized perforated trays and wire ladders",
    image: cableManagement,
    nanoIcon: "cable" as NanoIconName,
  },
];

const FEATURED_ACTIONABLE_PRODUCTS = [
  {
    id: "def-extinguisher",
    name: "Commercial ABC Dry Chemical Fire Extinguisher (6kg)",
    category: "Fire Safety",
    price: 2450,
    priceDisplay: "₹2,450",
    image: extinguisher,
    specs: "IS 15683 Certified • 4-A:60-B:C Rating",
    unit: "unit",
    inStock: true,
  },
  {
    id: "def-hydrant-valve",
    name: "Industrial Landing Valve & Instantaneous Coupling",
    category: "Fire Hydrant",
    price: 3800,
    priceDisplay: "₹3,800",
    image: valve,
    specs: "IS 5290 / BS 5041 • 65mm Single Flanged Outlet",
    unit: "piece",
    inStock: true,
  },
  {
    id: "def-fire-pump",
    name: "Industrial Centrifugal End-Suction Fire Pump Skid",
    category: "Fire Pumps",
    price: 68000,
    priceDisplay: "₹68,000",
    image: pump,
    specs: "NBC 2016 Compliant • 1620 LPM Booster Capacity",
    unit: "set",
    inStock: true,
  },
  {
    id: "def-safety-helmet",
    name: "High-Visibility Industrial Safety Hard Hat",
    category: "PPE",
    price: 380,
    priceDisplay: "₹380",
    image: helmet,
    specs: "IS 2925 Certified • 4-Point Ratchet Suspension",
    unit: "piece",
    inStock: true,
  },
  {
    id: "def-safety-gloves",
    name: "Heavy-Duty Kevlar & Cowhide Protective Gloves",
    category: "PPE",
    price: 450,
    priceDisplay: "₹450",
    image: gloves,
    specs: "EN 388 Level 4 Cut & Puncture Resistant",
    unit: "pair",
    inStock: true,
  },
  {
    id: "def-cctv-camera",
    name: "Explosion-Proof Dome IP Surveillance Camera",
    category: "CCTV",
    price: 4200,
    priceDisplay: "₹4,200",
    image: cctv,
    specs: "4K Ultra-HD • Smart IR 40m • IK10 Vandal-Proof",
    unit: "camera",
    inStock: true,
  },
];

const industries = [
  ["Manufacturing", manufacturing],
  ["Construction", construction],
  ["Warehouses", warehouses],
  ["Hospitals", hospitals],
  ["Schools & Institutions", schools],
  ["Commercial Buildings", commercial],
  ["Hotels", hotels],
  ["Infrastructure", infrastructure],
] as const;

const CLIENT_TESTIMONIALS = [
  {
    quote:
      "Sri Udharchi Enterprises engineered and commissioned our entire 120,000 sq ft manufacturing plant hydrant network in Palasamudram. Flawless execution, NBC 2016 adherence, and hassle-free Fire NOC approval.",
    author: "K. R. Venkatraman",
    role: "Head of Plant Infrastructure",
    company: "Automotive Precision Components, AP",
  },
  {
    quote:
      "When we required emergency hydro-testing and supply of 80 fire extinguishers before our safety audit, their team dispatched everything within 24 hours with complete BIS test certificates and GST tax invoice.",
    author: "Dr. S. Meenakshi",
    role: "Director of Facilities & Safety",
    company: "Super Specialty Healthcare Group",
  },
  {
    quote:
      "Outstanding vendor for comprehensive AMC maintenance. Their technician team conducts quarterly pump churn tests, hydrant pressure checks, and emergency staff drills without failing a single schedule.",
    author: "Anand Shekar",
    role: "EHS Manager",
    company: "Global Logistics & Cold Chain Parks",
  },
];

function Index() {
  const [inquiryService, setInquiryService] = useState<string | undefined>(undefined);
  const { addToCart, setIsCartOpen, totalItems } = useCart();

  return (
    <main id="home" className="overflow-hidden bg-background pb-20 sm:pb-0">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative isolate min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] overflow-hidden bg-ink text-primary-foreground">
        {/* Background Hero Banner */}
        <div className="absolute inset-0 -z-20 overflow-hidden bg-ink">
          <picture className="h-full w-full">
            <source media="(max-width: 639px)" srcSet={heroMobile} />
            <img
              src={hero}
              alt="Safety engineer inspecting industrial fire pump equipment"
              className="h-full w-full object-cover object-[68%_center] sm:object-center transition-transform duration-1000 scale-100"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          {/* Deep Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40 sm:bg-gradient-to-r sm:from-ink/95 sm:via-ink/85 sm:to-ink/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink/90 sm:hidden" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Floating Nano Trust Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute bottom-6 right-4 z-20 hidden md:flex flex-col items-end gap-2 md:right-8 lg:right-12"
        >
          <div className="flex items-center gap-3.5 rounded-2xl border border-white/20 bg-ink/90 p-4 shadow-2xl backdrop-blur-xl">
            <NanoIcon name="shield" size="lg" />
            <div className="text-left pr-2">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-brand-warm">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                NBC 2016 & IS 15683 Certified
              </div>
              <div className="text-sm font-bold text-white">Complete Fire Safety Engineering</div>
              <div className="text-[11px] text-white/70">
                Official Contractor in Andhra Pradesh & Pan-India
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mx-auto flex min-h-[560px] sm:min-h-[660px] lg:min-h-[720px] max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-3xl">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand-warm/30 bg-brand-warm/15 px-3 py-1 sm:px-4 sm:py-1.5 text-[11px] sm:text-xs font-bold text-brand-warm backdrop-blur-md mb-3 sm:mb-5">
              <Award className="size-3 sm:size-3.5 shrink-0" />
              <span>Certified Fire Safety Products & Engineering</span>
            </div>

            <h1 className="font-display text-3xl font-black leading-[1.08] sm:text-5xl lg:text-7xl">
              Protecting Lives,
              <br />
              Assets & <span className="text-brand-bright">Every Workplace</span>
            </h1>

            <p className="mt-3 sm:mt-6 max-w-2xl text-xs sm:text-base md:text-lg leading-relaxed text-primary-foreground/90">
              Certified fire safety products, ISI extinguishers, high-pressure hydrant networks, automated
              sprinkler arrays, diesel booster pumps, statutory inspections, hydro-testing, and
              industrial PPE gear.
            </p>

            {/* Value checklist */}
            <div className="mt-4 sm:mt-6 grid grid-cols-2 gap-2 text-[11px] sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-2 sm:text-xs font-semibold text-primary-foreground/90">
              <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 sm:border-0 sm:bg-transparent sm:p-0">
                <Check className="size-3.5 text-emerald-400 shrink-0" /> NBC 2016 & BIS Certified
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 sm:border-0 sm:bg-transparent sm:p-0">
                <Check className="size-3.5 text-emerald-400 shrink-0" /> 24/7 Rapid Dispatch
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 sm:border-0 sm:bg-transparent sm:p-0">
                <Check className="size-3.5 text-emerald-400 shrink-0" /> 18% GST Input Credit
              </span>
              <span className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 sm:border-0 sm:bg-transparent sm:p-0">
                <Check className="size-3.5 text-emerald-400 shrink-0" /> Pan-India Logistics
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-5 sm:mt-8 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
              <a href="/products" className="w-full sm:w-auto">
                <Button className="h-11 sm:h-12 w-full px-2 sm:px-7 text-xs sm:text-sm font-bold shadow-lg shadow-primary/25">
                  <ShoppingBag className="size-3.5 sm:size-4 mr-1 sm:mr-2" /> Shop Catalog
                </Button>
              </a>

              <a href="#contact" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="h-11 sm:h-12 w-full border-white/25 bg-white/10 px-2 sm:px-5 text-xs sm:text-sm font-bold text-white hover:bg-white/20 backdrop-blur-md"
                >
                  <FileText className="size-3.5 sm:size-4 mr-1 sm:mr-2 text-brand-warm" /> Formal
                  Quote
                </Button>
              </a>

              <a href="tel:+918639858221" className="hidden sm:inline-block">
                <Button
                  variant="outline"
                  className="h-12 border-primary-foreground/30 bg-transparent px-5 text-sm font-bold text-white hover:bg-white/10"
                >
                  <Phone className="size-4" /> 8639858221
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="border-t border-white/10 bg-black/50 backdrop-blur-md py-3 sm:py-4">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 px-3 sm:grid-cols-4 sm:gap-4 sm:px-5 lg:px-8">
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center sm:border-0 sm:bg-transparent sm:p-0 sm:text-left backdrop-blur-xs">
              <span className="block font-display text-xl font-black text-brand-warm sm:text-3xl">
                500+
              </span>
              <span className="text-[10px] sm:text-xs text-white/70">
                Industrial Safety Projects
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center sm:border-0 sm:bg-transparent sm:p-0 sm:text-left backdrop-blur-xs">
              <span className="block font-display text-xl font-black text-white sm:text-3xl">
                15+ Yrs
              </span>
              <span className="text-[10px] sm:text-xs text-white/70">Engineering Experience</span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center sm:border-0 sm:bg-transparent sm:p-0 sm:text-left backdrop-blur-xs">
              <span className="block font-display text-xl font-black text-emerald-400 sm:text-3xl">
                100%
              </span>
              <span className="text-[10px] sm:text-xs text-white/70">
                NBC 2016 Audit Compliance
              </span>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-center sm:border-0 sm:bg-transparent sm:p-0 sm:text-left backdrop-blur-xs">
              <span className="block font-display text-xl font-black text-brand-bright sm:text-3xl">
                24/7
              </span>
              <span className="text-[10px] sm:text-xs text-white/70">
                Emergency Spares Dispatch
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Key Strengths Bar */}
      <section className="border-b border-border bg-soft" aria-label="Our strengths">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2 p-3 sm:gap-4 sm:p-4 lg:grid-cols-4 lg:divide-x lg:divide-border lg:gap-0 lg:p-0 lg:px-8">
          {[
            ["shield", "Certified Equipment", "IS 15683 & BIS compliant"],
            ["wrench", "System Installation", "Piping, valves & manifolds"],
            ["boxes", "Complete Safety Store", "Direct distributor pricing"],
            ["map", "Across Andhra Pradesh", "Rapid site dispatch & AMC"],
          ].map(([iconKey, title, copy], index) => {
            return (
              <motion.div
                key={String(title)}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex min-w-0 items-center gap-2.5 sm:gap-3.5 rounded-xl border border-border/80 bg-card p-3 shadow-xs transition-colors hover:bg-muted/40 lg:border-0 lg:bg-transparent lg:rounded-none lg:shadow-none lg:px-6 lg:py-5 group"
              >
                <div className="grid size-10 sm:size-12 shrink-0 place-items-center rounded-xl sm:rounded-2xl bg-primary/10 border border-primary/20 shadow-xs transition-transform duration-300 group-hover:scale-110">
                  <NanoIcon name={iconKey as NanoIconName} size="md" />
                </div>
                <span className="truncate">
                  <strong className="block text-xs sm:text-sm font-bold leading-tight text-foreground group-hover:text-primary transition-colors truncate">
                    {String(title)}
                  </strong>
                  <span className="text-[10px] sm:text-xs text-muted-foreground truncate block">
                    {String(copy)}
                  </span>
                </span>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ACTIONABLE FEATURED PRODUCTS WITH ADD TO CART */}
      <section id="featured-products" className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Certified Equipment Catalog"
            title="Essential Fire & Industrial Safety Products"
            copy="Immediate dispatch available with statutory 18% GST invoices and manufacturer compliance certificates."
            action={
              <a href="/products" className="hidden sm:inline-block">
                <Button>
                  Explore Full Catalog <ArrowRight className="size-4" />
                </Button>
              </a>
            }
          />

          <div className="mt-6 sm:mt-10 grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-3">
            {FEATURED_ACTIONABLE_PRODUCTS.map((prod) => (
              <div
                key={prod.id}
                className="group flex flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card shadow-xs transition-all hover:border-primary/50 hover:shadow-xl"
              >
                <a
                  href={`/products/${prod.id}`}
                  className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-muted block cursor-pointer"
                >
                  <img
                    src={prod.image}
                    alt={`${prod.name} - Fire Safety Product | Sri Udharchi Enterprises`}
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-md bg-background/90 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
                    {prod.category}
                  </span>
                  <span className="absolute right-2 top-2 sm:right-3 sm:top-3 rounded-full bg-emerald-500/90 text-white px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[9px] sm:text-[10px] font-bold backdrop-blur">
                    In Stock
                  </span>
                </a>

                <div className="flex flex-1 flex-col p-2.5 sm:p-5">
                  <a href={`/products/${prod.id}`} className="hover:text-primary transition-colors">
                    <h3 className="font-display text-xs sm:text-base font-bold text-foreground leading-snug line-clamp-2 min-h-[2rem] sm:min-h-0">
                      {prod.name}
                    </h3>
                  </a>
                  <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
                    {prod.specs}
                  </p>

                  <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-t border-border pt-1.5 sm:pt-3 gap-0.5">
                    <div>
                      <span className="font-display text-sm sm:text-xl font-black text-primary">
                        {prod.priceDisplay}
                      </span>
                      <span className="text-[9px] sm:text-xs text-muted-foreground ml-1">
                        / {prod.unit}
                      </span>
                    </div>
                    <span className="text-[9px] sm:text-[11px] text-muted-foreground">
                      Excl. 18% GST
                    </span>
                  </div>

                  <div className="mt-2.5 sm:mt-3 grid grid-cols-2 gap-1.5 sm:gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addToCart(prod, 1)}
                      className="h-8 sm:h-9 w-full px-1 sm:px-2 text-[10px] sm:text-xs font-bold hover:bg-primary hover:text-primary-foreground"
                    >
                      <ShoppingBag className="size-3 mr-1 shrink-0" /> + Cart
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        addToCart(prod, 1);
                        window.location.href = "/checkout";
                      }}
                      className="h-8 sm:h-9 w-full px-1 sm:px-2 text-[10px] sm:text-xs font-bold"
                    >
                      Buy Now
                    </Button>
                  </div>

                  <div className="mt-2 text-center border-t border-border/60 pt-1.5">
                    <a
                      href={`/products/${prod.id}`}
                      className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-bold text-primary hover:underline"
                    >
                      View Product Details <ChevronRight className="size-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 sm:mt-10 text-center">
            <a href="/products">
              <Button size="lg" className="w-full sm:w-auto">
                View All Products & Specifications <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Complete Product Categories Overview Grid */}
      <section
        id="categories"
        className="scroll-mt-24 bg-soft py-12 md:py-20 border-y border-border"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-5 lg:px-8">
          <SectionHeading
            eyebrow="Wide Range of Categories"
            title="Specialized Industrial Protection Categories"
            copy="Comprehensive safety systems engineered for manufacturing plants, high-rises, warehouses, and institutions."
          />

          {/* Mobile Swipeable Category Rail */}
          <div className="mt-6 flex gap-3 overflow-x-auto no-scrollbar pb-2 sm:hidden snap-x snap-mandatory -mx-4 px-4">
            {PRODUCT_CATEGORIES.map(({ name, desc, image, nanoIcon }) => (
              <a
                key={name}
                href="/products"
                className="group flex min-w-[160px] max-w-[170px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-border bg-card shadow-xs active:scale-[0.98] transition-transform"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img src={image} alt={name} loading="lazy" className="size-full object-cover" />
                  <div className="absolute right-1.5 top-1.5 rounded-lg bg-background/85 p-1 shadow-xs backdrop-blur-md border border-border/60">
                    <NanoIcon name={nanoIcon} size="sm" />
                  </div>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                      {name}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">{desc}</p>
                  </div>
                  <span className="mt-2 text-[10px] font-bold text-primary flex items-center gap-0.5">
                    View &rarr;
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Desktop/Tablet Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-10">
            {PRODUCT_CATEGORIES.map(({ name, desc, image, nanoIcon }, index) => (
              <motion.a
                key={name}
                href="/products"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: (index % 5) * 0.05 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
              >
                <div className="relative overflow-hidden bg-muted">
                  <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    width={720}
                    height={620}
                    className="aspect-[1.3] w-full object-cover transition-transform duration-500 group-hover:scale-108"
                  />
                  <div className="absolute right-2 top-2 rounded-xl bg-background/85 p-1.5 shadow-md backdrop-blur-md border border-border/60">
                    <NanoIcon name={nanoIcon} size="sm" />
                  </div>
                </div>
                <div className="p-3.5">
                  <h3 className="text-xs font-bold leading-tight group-hover:text-primary transition-colors">
                    {name}
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1">{desc}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Safety Solutions */}
      <section id="services" className="scroll-mt-24 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Safety Engineering"
            title="Complete Fire & Industrial Safety Solutions"
            copy="Comprehensive safety engineering, statutory consultation, certified equipment supply, and round-the-clock maintenance adhering strictly to NBC 2016, NFPA, and BIS standards."
            action={
              <a href="/services" className="hidden sm:inline-block">
                <Button variant="outline">
                  Full Service Directory <ArrowRight className="size-4" />
                </Button>
              </a>
            }
          />
          <div className="mt-10">
            <ServiceShowcaseGrid
              onSelectService={(service) => {
                setInquiryService(service.title);
                document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>
        </div>
      </section>

      {/* Verified Client Testimonials */}
      <section className="bg-muted/40 py-16 md:py-20 border-y border-border">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Client Feedback
            </span>
            <h2 className="mt-2 font-display text-3xl font-black text-foreground sm:text-4xl">
              Trusted by Facility Directors & EHS Leaders
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Real testimonials from industrial clients who rely on our certified engineering and
              fast turnaround.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {CLIENT_TESTIMONIALS.map((t, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all hover:shadow-md"
              >
                <div>
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed italic">"{t.quote}"</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/80">
                  <strong className="block text-xs font-bold text-foreground">{t.author}</strong>
                  <span className="block text-[11px] text-muted-foreground">{t.role}</span>
                  <span className="block text-[11px] font-semibold text-primary">{t.company}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section id="industries" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Industries We Serve"
            title="Engineered for Diverse Industrial Corridors"
            copy="Customized protection systems designed for manufacturing plants, pharmaceutical zones, high-rises, and institutional facilities."
          />
          <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:grid-cols-8 mt-6 sm:mt-8">
            {industries.map(([name, image], index) => (
              <motion.article
                key={name}
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.45, delay: (index % 4) * 0.05 }}
                whileHover={{ scale: 1.05, y: -4, transition: { duration: 0.2 } }}
                className="group cursor-pointer rounded-xl transition-all"
              >
                <div className="overflow-hidden rounded-lg border border-border shadow-xs group-hover:border-primary/50 group-hover:shadow-md transition-all">
                  <img
                    src={image}
                    alt={name}
                    loading="lazy"
                    width={720}
                    height={520}
                    className="aspect-[1.1] w-full rounded-lg object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                  />
                </div>
                <h3 className="mt-1.5 text-center text-[11px] sm:text-xs font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                  {name}
                </h3>
              </motion.article>
            ))}
          </div>
          <div className="mt-6 sm:mt-8 text-center">
            <a href="/industries">
              <Button variant="outline" className="w-full sm:w-auto">
                Explore Industry Specific Solutions <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Projects Spotlight with 3D Curved Cylindrical Streaming Grid (LIGHT MODE) */}
      <section
        id="projects"
        className="scroll-mt-24 relative overflow-hidden bg-slate-50 border-y border-slate-200/90 text-foreground"
      >
        <TiltedGridHero
          images={PROJECT_CYLINDER_IMAGES}
          className="relative h-[600px] sm:h-[640px] w-full bg-slate-50 text-foreground"
          speed={3.6}
          tileHeight={32}
          aspectRatio={16 / 9}
          axis={62}
          curve={78}
          fade={14}
        >
          <div className="relative z-10 flex h-full flex-col justify-between py-10 sm:py-12 px-4 sm:px-6 max-w-7xl mx-auto pointer-events-none">
            {/* Top Section Header in Crisp Light Mode */}
            <div className="text-center max-w-3xl mx-auto pointer-events-auto">
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary shadow-xs">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                Our Projects
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 drop-shadow-xs">
                Real Safety Engineering
                <br />
                <span className="text-primary">for Critical Infrastructure</span>
              </h2>
              <p className="mt-3 text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Engineered installations across automotive vendor parks, cold chain complexes, and
                high-density industrial corridors in Andhra Pradesh.
              </p>
            </div>

            {/* Bottom Project Badges & Action in Light Mode */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/90 bg-white/70 backdrop-blur-md rounded-2xl px-5 py-3 shadow-sm pointer-events-auto">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5 text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600" /> Fire Pump Skids
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600" /> Hydrant Networks
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600" /> CCTV Surveillance
                </span>
                <span className="hidden md:flex items-center gap-1.5">
                  <CheckCircle2 className="size-4 text-emerald-600" /> Cable Containment
                </span>
              </div>

              <a href="/projects" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 font-bold shadow-md">
                  View Project Portfolio <ArrowRight className="size-4" />
                </Button>
              </a>
            </div>
          </div>
        </TiltedGridHero>
      </section>

      {/* Get in Touch & Request a Quote Section */}
      <section id="contact" className="scroll-mt-24 bg-soft py-14 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 sm:gap-10 px-4 sm:px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Get in Touch"
              title="Request a Quote or Site Survey"
              copy="Tell us about your facility requirements. Our licensed safety engineers will provide technical specs and formal quotation within 24 hours."
            />
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-1 mt-6">
              {[
                [Phone, "Primary Dispatch Hotline", "+91 8639858221", "tel:+918639858221"],
                [Phone, "Secondary Technical Desk", "+91 9030609171", "tel:+919030609171"],
                [
                  Mail,
                  "Official Email",
                  "sriudharchienterprises@gmail.com",
                  "mailto:sriudharchienterprises@gmail.com",
                ],
                [
                  MapPin,
                  "Office & Logistics Depot",
                  "H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241",
                  "https://www.google.com/maps/search/?api=1&query=Kubera+Hills+Palasamudram+Andhra+Pradesh+515241",
                ],
              ].map(([Icon, label, value, href]) => {
                const I = Icon as typeof Phone;
                return (
                  <a
                    key={String(label)}
                    href={String(href)}
                    target={String(href).startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="grid grid-cols-[auto_1fr] gap-3 sm:gap-4 p-3 rounded-xl border border-border/60 bg-card hover:border-primary/40 active:bg-muted/40 transition-colors shadow-xs"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                      <I className="size-4 sm:size-5" />
                    </span>
                    <div className="truncate">
                      <strong className="block text-[11px] text-muted-foreground">
                        {String(label)}
                      </strong>
                      <span className="text-xs sm:text-sm font-bold text-foreground truncate block">
                        {String(value)}
                      </span>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
          <div>
            <ContactForm
              initialService={inquiryService}
              key={inquiryService || "default-contact"}
            />
          </div>
        </div>
      </section>

      {/* Floating Emergency WhatsApp Hotline Button for Tablet/Desktop */}
      <div className="fixed bottom-6 left-6 z-40 hidden sm:flex items-center gap-2">
        <a
          href="https://wa.me/918639858221?text=Hello%20Sri%20Udharchi%20Enterprises,%20I%20need%20urgent%20fire%20safety%20assistance."
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xl hover:bg-emerald-700 hover:scale-105 transition-all"
        >
          <MessageCircle className="size-4" />
          <span>WhatsApp Hotline</span>
        </a>
      </div>

      {/* Refined Mobile Sticky Bottom Action Bar */}
      <nav
        aria-label="Mobile quick actions"
        className="fixed bottom-0 inset-x-0 z-40 sm:hidden bg-background/95 backdrop-blur-xl border-t border-border shadow-[0_-4px_24px_rgba(0,0,0,0.12)] px-3 py-2 flex items-center justify-around gap-2"
        style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
      >
        {/* Direct Call Hotline */}
        <a
          href="tel:+918639858221"
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-card border border-border py-1.5 text-foreground shadow-xs active:scale-95 transition-all"
          aria-label="Direct Phone Call"
        >
          <div className="flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <Phone className="size-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[10px] font-bold">Call Now</span>
        </a>

        {/* WhatsApp Chat */}
        <a
          href="https://wa.me/918639858221?text=Hello%20Sri%20Udharchi%20Enterprises,%20I%20need%20urgent%20fire%20safety%20assistance."
          target="_blank"
          rel="noreferrer"
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-emerald-600 text-white py-1.5 shadow-sm active:scale-95 transition-all"
          aria-label="WhatsApp Hotline"
        >
          <MessageCircle className="size-3.5" />
          <span className="text-[10px] font-bold">WhatsApp</span>
        </a>

        {/* Quick Cart Trigger */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-card border border-border py-1.5 text-foreground shadow-xs active:scale-95 transition-all"
          aria-label="Open Shopping Cart"
        >
          <div className="relative">
            <ShoppingCart className="size-3.5 text-primary" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 flex size-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">
            Cart {totalItems > 0 ? `(${totalItems})` : ""}
          </span>
        </button>

        {/* Get Instant Quote */}
        <a
          href="#contact"
          className="flex flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-primary text-primary-foreground py-1.5 shadow-sm active:scale-95 transition-all"
          aria-label="Get Instant Quote"
        >
          <FileText className="size-3.5" />
          <span className="text-[10px] font-bold">Get Quote</span>
        </a>
      </nav>

      <SiteFooter />
    </main>
  );
}
