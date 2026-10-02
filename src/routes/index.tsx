import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Boxes,
  Building2,
  Check,
  ChevronRight,
  ClipboardCheck,
  Flame,
  HardHat,
  HeartPulse,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  Play,
  ShieldCheck,
  ShipWheel,
  Stethoscope,
  Wrench,
  Zap,
  Camera,
  Construction,
  Factory,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/button";
import { BrandLogo } from "@/components/brand-logo";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { submitInquiry } from "@/lib/db-service";
import hero from "@/assets/udharchi-hero.jpg";
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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sri Udharchi Enterprises | Fire & Industrial Safety Solutions" },
      {
        name: "description",
        content:
          "Professional fire safety, industrial safety, PPE, hydrant systems, CCTV, installation and maintenance solutions in Andhra Pradesh.",
      },
      { property: "og:title", content: "Sri Udharchi Enterprises | Safety Solutions" },
      {
        property: "og:description",
        content:
          "Complete fire and industrial safety solutions for workplaces, commercial properties and institutions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const products = [
  {
    name: "Fire Safety & Fire Fighting",
    desc: "Extinguishers and fire fighting essentials",
    image: extinguisher,
    icon: Flame,
  },
  {
    name: "Fire Hydrant Products",
    desc: "Valves, hose reels and hydrant accessories",
    image: valve,
    icon: ShieldCheck,
  },
  {
    name: "Fire Pumps",
    desc: "Reliable pumps for fire protection systems",
    image: pump,
    icon: Wrench,
  },
  {
    name: "Personal Protective Equipment",
    desc: "Head, hand, foot and body protection",
    image: helmet,
    icon: HardHat,
  },
  {
    name: "Electrical Safety",
    desc: "Workplace electrical protection equipment",
    image: gloves,
    icon: Zap,
  },
  {
    name: "Road Safety",
    desc: "Cones, barriers and reflective protection",
    image: roadSafety,
    icon: Construction,
  },
  {
    name: "Medical & Surgical Safety",
    desc: "Essential workplace medical protection",
    image: medicalSafety,
    icon: Stethoscope,
  },
  {
    name: "Rain & Marine Safety",
    desc: "Weather-ready and marine protection",
    image: marineSafety,
    icon: ShipWheel,
  },
  {
    name: "CCTV & Security Systems",
    desc: "Professional surveillance solutions",
    image: cctv,
    icon: Camera,
  },
  {
    name: "Cable Management Systems",
    desc: "Industrial cable trays and routing",
    image: cableManagement,
    icon: Boxes,
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

const featured = [
  ["CO2 Fire Extinguisher", "Fire Safety", extinguisher],
  ["Fire Hose & Hydrant Valve", "Fire Hydrant", valve],
  ["Safety Helmet", "Head Protection", helmet],
  ["Safety Gloves", "Hand Protection", gloves],
  ["Fire Pump", "Fire Protection", pump],
  ["CCTV Camera", "Security Systems", cctv],
] as const;

function Index() {
  const [sent, setSent] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await submitInquiry({
        name: String(formData.get("name") || ""),
        phone: String(formData.get("phone") || ""),
        email: String(formData.get("email") || ""),
        service: String(formData.get("requirement") || "Homepage Inquiry"),
        facility: String(formData.get("company") || "Standard"),
        message: String(formData.get("message") || ""),
      });
    } catch (err) {
      console.warn("Firestore inquiry error:", err);
    }
    setSent(true);
  }
  return (
    <main id="home" className="overflow-hidden bg-background">
      <SiteHeader />
      <section className="relative isolate min-h-[620px] overflow-hidden bg-ink text-primary-foreground lg:min-h-[650px]">
        <img
          src={hero}
          alt="Safety engineer inspecting an industrial fire pump installation"
          width={1920}
          height={1080}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-[68%_center]"
        />
        <div className="absolute inset-0 -z-10 bg-hero-overlay" />
        <div className="mx-auto flex min-h-[620px] max-w-7xl items-center px-5 py-20 lg:min-h-[650px] lg:px-8">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-5 text-xs font-black uppercase text-brand-warm md:text-sm">
              Fire Safety Solutions
            </p>
            <h1 className="font-display text-5xl font-black leading-[0.98] md:text-7xl">
              Protecting
              <br />
              People, Property
              <br />
              <span className="text-brand-bright">& Every Workplace</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-primary-foreground/80 md:text-lg">
              Complete fire safety, industrial safety and workplace protection solutions for
              commercial, industrial and institutional environments.
            </p>
            <p className="mt-3 text-sm text-primary-foreground/70">
              Fire Protection | Industrial Safety | PPE | Fire Hydrant Systems | CCTV | Installation
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact">
                <Button className="h-12 px-7">
                  Request a Quote <ArrowRight className="size-4" />
                </Button>
              </a>
              <a href="tel:+918639858221">
                <Button
                  variant="outline"
                  className="h-12 border-primary-foreground/45 bg-transparent px-7 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  <Phone className="size-4" /> Call 8639858221
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-6 right-5 hidden items-center gap-3 rounded-lg border border-primary-foreground/30 bg-ink/70 px-5 py-3 text-xs font-bold backdrop-blur md:flex lg:right-10">
          <span className="grid size-9 place-items-center rounded-full bg-primary">
            <Play className="size-4 fill-current" />
          </span>{" "}
          Our Safety Solutions
          <br />
          in Action
        </div>
      </section>

      <section className="border-b border-border bg-soft" aria-label="Our strengths">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-3 lg:grid-cols-4 lg:px-8">
          {[
            [ShieldCheck, "Quality Safety Products", "Professional product selection"],
            [Wrench, "Professional Installation", "Installation & maintenance"],
            [Boxes, "Complete Safety Solutions", "Solutions under one roof"],
            [MapPin, "Serving Multiple Industries", "Across commercial sectors"],
          ].map(([Icon, title, copy]) => {
            const I = Icon as typeof ShieldCheck;
            return (
              <div
                key={String(title)}
                className="flex min-w-0 items-center gap-3 px-3 py-5 md:px-6"
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <I className="size-5" />
                </span>
                <span>
                  <strong className="block text-sm leading-tight">{String(title)}</strong>
                  <span className="text-xs text-muted-foreground">{String(copy)}</span>
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section id="about" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="About Sri Udharchi Enterprises"
              title={
                <>
                  Complete Fire & Industrial
                  <br />
                  Safety Solutions Provider
                </>
              }
            />
            <p className="text-base leading-relaxed text-muted-foreground">
              Sri Udharchi Enterprises provides professional fire safety, industrial safety and
              workplace protection solutions including fire protection systems, PPE, fire hydrant
              products, fire pumps, safety signage, CCTV and installation services.
            </p>
            <a href="/about" className="mt-7 inline-block">
              <Button>
                Know More About Us <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
          <div className="relative">
            <img
              src={hydrant}
              alt="Industrial fire hydrant valves and pressure gauges"
              loading="lazy"
              width={1400}
              height={900}
              className="aspect-[16/10] w-full rounded-lg object-cover"
            />
            <div className="absolute -bottom-5 right-3 w-[230px] rounded-lg bg-background p-5 shadow-xl md:bottom-6 md:right-[-12px]">
              <strong className="mb-3 block">Our Commitment</strong>
              {[
                "Quality & Safety",
                "Reliable Products",
                "Expert Installation",
                "Professional Support",
              ].map((x) => (
                <span key={x} className="mb-2 flex items-center gap-2 text-xs">
                  <Check className="size-4 rounded-full bg-primary p-0.5 text-primary-foreground" />
                  {x}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="scroll-mt-24 bg-soft py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Our Products"
            title="Wide Range of Safety Products"
            copy="Comprehensive safety products and protection systems for workplaces, commercial properties and industrial environments."
            action={
              <a href="#featured" className="hidden sm:block">
                <Button>
                  View Products <ArrowRight className="size-4" />
                </Button>
              </a>
            }
          />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            {products.map(({ name, desc, image }, index) => (
              <motion.article
                key={name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: (index % 5) * 0.055 }}
                className="group overflow-hidden rounded-lg border border-border bg-card transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={image}
                  alt={name}
                  loading="lazy"
                  width={720}
                  height={620}
                  className="aspect-[1.35] w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="grid min-h-28 grid-cols-[minmax(0,1fr)_auto] items-end gap-2 p-4">
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold leading-tight">{name}</h3>
                    <p className="mt-1 hidden text-xs text-muted-foreground sm:block">{desc}</p>
                  </div>
                  <ChevronRight className="size-7 shrink-0 rounded-full border border-border p-1.5 text-primary" />
                </div>
              </motion.article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a href="/products">
              <Button size="lg">
                View All Products & Specifications <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 border-y border-border py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Our Services"
              title={
                <>
                  Professional Services
                  <br />
                  Beyond Supply
                </>
              }
              copy="We provide end-to-end fire safety and industrial safety solutions covering consultancy, installation, inspection, maintenance and equipment supply."
            />
            <a href="/services">
              <Button>
                Explore All Services <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ClipboardCheck, "Consultation", "Expert advice for site safety requirements."],
              [Wrench, "Installation", "Professional installation by experienced technicians."],
              [
                ShieldCheck,
                "Inspection & Maintenance",
                "Regular inspection and maintenance for reliable performance.",
              ],
              [
                PackageCheck,
                "Safety Equipment Supply",
                "A wide range of workplace safety products.",
              ],
            ].map(([Icon, title, copy]) => {
              const I = Icon as typeof ShieldCheck;
              return (
                <article
                  key={String(title)}
                  className="grid grid-cols-[auto_1fr] gap-4 rounded-lg border border-border bg-card p-5 transition hover:border-primary/30"
                >
                  <span className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
                    <I className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-bold">{String(title)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {String(copy)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="industries" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Industries We Serve"
            title="Serving Multiple Industries"
            copy="Safety solutions designed for diverse commercial, industrial and institutional environments."
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {industries.map(([name, image], index) => (
              <motion.article
                key={name}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: (index % 4) * 0.05 }}
              >
                <img
                  src={image}
                  alt={name}
                  loading="lazy"
                  width={720}
                  height={520}
                  className="aspect-[1.1] w-full rounded-lg object-cover"
                />
                <h3 className="mt-2 text-center text-xs font-bold leading-tight">{name}</h3>
              </motion.article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <a href="/industries">
              <Button variant="outline">
                Explore Industry Specific Solutions <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-ink py-16 text-primary-foreground md:py-20">
        <img
          src={trust}
          alt="Industrial safety engineer inspecting fire protection systems"
          loading="lazy"
          width={1920}
          height={1080}
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-trust-overlay" />
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <div>
            <span className="rounded-full border border-primary-foreground/25 px-3 py-1 text-xs">
              Why Choose Sri Udharchi
            </span>
            <h2 className="mt-5 font-display text-4xl font-black leading-tight md:text-5xl">
              Your Trusted Partner
              <br />
              in Safety Solutions
            </h2>
            <p className="mt-4 max-w-xl text-primary-foreground/75">
              Committed to delivering reliable fire and industrial safety products with professional
              support.
            </p>
            <div className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
              {[
                "Wide Range of Safety Products",
                "Professional Consultation",
                "Expert Installation & Support",
                "Reliable Product Supply",
                "Industrial Safety Solutions",
                "Long-Term Customer Support",
              ].map((x) => (
                <span key={x} className="flex items-center gap-2">
                  <Check className="size-5 rounded-full bg-primary p-1" />
                  {x}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3">
            {[
              [Boxes, "Complete Product Categories", "Fire & industrial safety"],
              [Wrench, "End-to-End Solutions", "Supply • installation • support"],
              [ShieldCheck, "Professional Expertise", "Consultation • inspection • maintenance"],
            ].map(([Icon, title, copy]) => {
              const I = Icon as typeof Boxes;
              return (
                <div
                  key={String(title)}
                  className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-lg bg-background p-5 text-foreground"
                >
                  <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <I />
                  </span>
                  <span>
                    <strong className="block text-xl">{String(title)}</strong>
                    <small className="text-muted-foreground">{String(copy)}</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="featured" className="scroll-mt-24 py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading eyebrow="Featured Products" title="Our Safety Products" />
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {featured.map(([name, cat, image], index) => (
              <motion.article
                key={name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.42, delay: index * 0.05 }}
                className="rounded-lg border border-border bg-card p-3"
              >
                <img
                  src={image}
                  alt={name}
                  loading="lazy"
                  width={720}
                  height={620}
                  className="aspect-square w-full object-cover"
                />
                <h3 className="mt-3 text-sm font-bold">{name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{cat}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section id="projects" className="scroll-mt-24 bg-brand-deep py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <span className="text-xs font-bold uppercase text-brand-warm">Our Projects</span>
            <h2 className="mt-2 font-display text-3xl font-black md:text-4xl">
              Real Safety Solutions
              <br />
              for Real Industries
            </h2>
            <p className="mt-3 text-sm text-primary-foreground/75">
              Professional fire protection and workplace safety applications across demanding
              environments.
            </p>
            <a href="/projects" className="mt-6 inline-block">
              <Button className="bg-background text-primary hover:bg-background/90">
                View Our Projects <ArrowRight className="size-4" />
              </Button>
            </a>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              [projectPump, "Fire pump installation"],
              [projectCctv, "CCTV systems"],
              [projectCable, "Cable management"],
              [projectHydrant, "Hydrant installation"],
            ].map(([image, label], index) => (
              <motion.figure
                key={label}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.48, delay: index * 0.07 }}
                className="relative overflow-hidden rounded-md border-2 border-primary-foreground/70"
              >
                <img
                  src={image}
                  alt={label}
                  loading="lazy"
                  width={720}
                  height={520}
                  className="aspect-[0.85] w-full object-cover"
                />
                <figcaption className="absolute inset-x-0 bottom-0 bg-ink/80 p-2 text-[10px] font-bold">
                  {label}
                </figcaption>
              </motion.figure>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 bg-soft py-16 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Get in Touch"
              title="Request a Quote"
              copy="Tell us about your requirement and our team will get back to you with the right solution."
            />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              {[
                [Phone, "Call Us", "8639858221", "tel:+918639858221"],
                [
                  Mail,
                  "Email Us",
                  "udharchienterprises@gmail.com",
                  "mailto:udharchienterprises@gmail.com",
                ],
                [
                  MapPin,
                  "Our Office",
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
                    className="grid grid-cols-[auto_1fr] gap-4"
                  >
                    <span className="grid size-11 place-items-center rounded-md bg-primary text-primary-foreground">
                      <I className="size-5" />
                    </span>
                    <span>
                      <strong className="block text-sm">{String(label)}</strong>
                      <span className="text-sm text-muted-foreground">{String(value)}</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
            <label>
              Full Name *<input required name="name" />
            </label>
            <label>
              Company Name
              <input name="company" />
            </label>
            <label>
              Phone Number *<input required type="tel" name="phone" pattern="[0-9+ -]{8,15}" />
            </label>
            <label>
              Email Address
              <input type="email" name="email" />
            </label>
            <label>
              Location
              <input name="location" />
            </label>
            <label>
              Requirement Type
              <select name="requirement" defaultValue="">
                <option value="" disabled>
                  Select requirement
                </option>
                {[
                  "Fire Safety",
                  "Fire Hydrant",
                  "Fire Pumps",
                  "PPE",
                  "CCTV",
                  "Cable Management",
                  "Safety Signage",
                  "Installation",
                  "Maintenance",
                  "Consultancy",
                  "Other",
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2">
              Your Message / Requirement *<textarea required name="message" rows={4} />
            </label>
            <Button type="submit" className="sm:col-span-2">
              Submit Enquiry <ArrowRight className="size-4" />
            </Button>
            {sent && (
              <p
                role="status"
                className="sm:col-span-2 rounded-md bg-success/10 p-3 text-center text-sm font-semibold text-success"
              >
                Thank you. Your enquiry is ready for the Sri Udharchi team.
              </p>
            )}
          </form>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
