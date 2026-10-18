import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/button";
import {
  Award,
  CheckCircle2,
  Clock,
  FileCheck2,
  HardHat,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Users2,
} from "lucide-react";
import trustImg from "@/assets/trusted-safety-partner.jpg";
import hydrantImg from "@/assets/fire-hydrant-system.jpg";
import manufacturingImg from "@/assets/manufacturing.jpg";

import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/about")({
  head: () =>
    seoHead({
      title: "About Us & Safety Engineering Leadership | Sri Udharchi Enterprises",
      description:
        "Learn about Sri Udharchi Enterprises, our mission, certified fire protection engineering team, NBC compliance records, and central depot in Palasamudram, AP.",
      path: "/about",
      jsonLd: schemas.breadcrumbs([
        { name: "Home", path: "/" },
        { name: "About Us", path: "/about" },
      ]),
    }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
                <ShieldCheck className="size-3.5" />
                Trusted Safety Engineering
              </span>
              <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Dedicated to Protecting <span className="text-primary">Lives & Assets</span>
              </h1>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">
                Sri Udharchi Enterprises is a premier fire protection engineering, industrial safety
                consulting, and workplace hazard mitigation firm headquartered at H-7, Kubera Hills,
                Palasamudram, Sri Sathya Sai District, AP - 515241, serving industrial and
                commercial clients nationwide.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a href="/contact">
                  <Button size="lg">Get in Touch</Button>
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

            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
                <img
                  src={trustImg}
                  alt="Sri Udharchi certified fire safety team"
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card p-4 shadow-xl sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Award className="size-6" />
                  </div>
                  <div>
                    <div className="font-display text-2xl font-black text-foreground">100%</div>
                    <div className="text-xs text-muted-foreground">NBC & BIS Compliant</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values & Mission */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeading
            eyebrow="Our Mission & Philosophy"
            title="Safety Is Not Just Compliance — It Is Our Calling"
            description="We bridge the gap between complex regulatory mandates and practical, reliable industrial fire security systems."
          />

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: ShieldAlert,
                title: "Zero-Failure Engineering",
                desc: "Fire safety equipment must work flawlessly the single second it is called upon. We only supply certified, tested, and reliable systems.",
              },
              {
                icon: FileCheck2,
                title: "Regulatory Excellence",
                desc: "Thorough grounding in the National Building Code (NBC 2016), NFPA standards, Factory Act requirements, and local fire department bylaws.",
              },
              {
                icon: Clock,
                title: "24/7 Rapid Response",
                desc: "Emergency on-call technical engineers ready to address system faults, alarms, or urgent refills at any hour of the day or night.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="group relative rounded-xl border border-border bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
              >
                <div className="mb-5 inline-flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <v.icon className="size-6" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{v.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience & Standards */}
      <section className="border-y border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="overflow-hidden rounded-xl border border-border shadow-md">
                <img
                  src={hydrantImg}
                  alt="Industrial fire hydrant piping"
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="overflow-hidden rounded-xl border border-border shadow-md">
                <img
                  src={manufacturingImg}
                  alt="Heavy manufacturing plant safety audit"
                  referrerPolicy="no-referrer"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Why Industry Leaders Choose Us
              </span>
              <h2 className="mt-3 font-display text-3xl font-black text-foreground sm:text-4xl">
                Certified Quality You Can Rely On Every Single Day
              </h2>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                From high-hazard chemical manufacturing and shipping ports to IT parks and hospital
                campuses, Sri Udharchi Enterprises delivers complete integrated safety infrastructure.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Bureau of Indian Standards (BIS / ISI) certified hardware",
                  "National Fire Protection Association (NFPA) standard designs",
                  "End-to-end supply, execution, testing, and annual maintenance",
                  "Periodic refilling, hydrostatic testing & AMC guarantees",
                  "Trained, certified safety engineers & technicians",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{item}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <a href="/services">
                  <Button>Explore Our Full Services Suite</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Contact CTA */}
      <section className="py-20 text-center">
        <div className="mx-auto max-w-3xl px-5">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Users2 className="size-7" />
          </div>
          <h2 className="font-display text-3xl font-black text-foreground sm:text-4xl">
            Partner with Sri Udharchi Enterprises
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Have an upcoming facility expansion, safety audit, or equipment requirement? Speak
            directly with our certified fire protection consultants today.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a href="/contact">
              <Button size="lg">Request a Comprehensive Safety Audit</Button>
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
      </section>

      <SiteFooter />
    </main>
  );
}
