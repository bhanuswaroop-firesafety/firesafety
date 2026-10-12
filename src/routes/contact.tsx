import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import { ContactForm } from "@/components/contact-form";
import { Clock, Mail, MapPin, Phone, PhoneCall, ShieldCheck } from "lucide-react";

import { seoHead, schemas } from "@/lib/seo";

interface ContactSearchParams {
  service?: string | undefined;
  product?: string | undefined;
}

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearchParams => {
    const service = search["service"];
    const product = search["product"];
    return {
      service: typeof service === "string" ? service : undefined,
      product: typeof product === "string" ? product : undefined,
    };
  },
  head: () =>
    seoHead({
      title: "Contact Us & Request Quote | Sri Udharchi Enterprises",
      description:
        "Get in touch with Sri Udharchi Enterprises for fire safety audits, equipment quotes, turnkey installation estimates, and 24/7 emergency support.",
      path: "/contact",
      jsonLd: schemas.breadcrumbs([
        { name: "Home", path: "/" },
        { name: "Contact Us", path: "/contact" },
      ]),
    }),
  component: ContactPage,
});

function ContactPage() {
  const { service, product } = Route.useSearch();
  const initialService =
    service || (product ? "Certified PPE & Safety Equipment Supply" : undefined);
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Fast Response Guaranteed
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl lg:text-6xl">
            Get in Touch with Our <span className="text-primary">Safety Engineers</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Whether you need a full turnkey fire system quote, emergency cylinder refilling, or an
            expert safety audit, our team is ready to assist.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            {/* Left Contact Cards */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:p-8">
                <div className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  <PhoneCall className="size-3.5 animate-pulse" />
                  <span>24/7 Emergency Hotline</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-bold text-foreground">
                  Need Immediate Fire Safety Assistance?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Direct line to our on-call technical team for system alarms, unexpected leaks, or
                  urgent inspection requirements.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <a href="tel:+918639858221" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full">
                      <Phone className="size-4" /> Call +91 8639858221
                    </Button>
                  </a>
                  <a href="tel:+919030609171" className="w-full sm:w-auto">
                    <Button size="lg" variant="outline" className="w-full">
                      <Phone className="size-4" /> Call +91 9030609171
                    </Button>
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Mail className="size-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Email Inquiries
                  </h3>
                  <a
                    href="mailto:sriudharchienterprises@gmail.com"
                    className="mt-2 block text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    sriudharchienterprises@gmail.com
                  </a>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Responses within 2 business hours
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Clock className="size-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Working Hours
                  </h3>
                  <p className="mt-2 text-xs font-medium text-muted-foreground">
                    Mon - Sat: 9:00 AM - 7:00 PM
                  </p>
                  <p className="mt-1 text-[11px] text-primary font-semibold">
                    24/7 Emergency Response
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Our Office & Supply Hub
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sri Udharchi Enterprises
                  <br />
                  H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241
                </p>
                <div className="mt-3">
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Kubera+Hills+Palasamudram+Andhra+Pradesh+515241"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-primary hover:underline"
                  >
                    View on Google Maps →
                  </a>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Serving clients across Andhra Pradesh, Telangana, Odisha, and Pan-India.
                </p>
              </div>
            </div>

            {/* Right Quote Request Form */}
            <div>
              <ContactForm
                variant="card"
                initialService={initialService}
                initialProduct={product}
                key={`${initialService || "contact"}-${product || ""}`}
              />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
