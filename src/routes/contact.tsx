import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import { ContactForm } from "@/components/contact-form";
import { Clock, Mail, MapPin, Phone, PhoneCall, ShieldCheck, Instagram } from "lucide-react";
import {
  subscribeSocialSettings,
  DEFAULT_SOCIAL_SETTINGS,
  subscribeContactSettings,
  DEFAULT_CONTACT_SETTINGS,
} from "@/lib/db-service";
import type { SocialSettings, ContactSettings } from "@/lib/types";

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
      title: "Contact Us & 24/7 Safety Dispatch | Sri Udharchi Enterprises",
      description:
        "Contact Sri Udharchi Enterprises (Proprietor: Dabbara Bhanu Swaroop) for 24/7 emergency fire safety dispatch, equipment quotations, registered in Dharmapuram, Ananthapuramu, and central depot in Palasamudram, AP.",
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
  const [social, setSocial] = useState<SocialSettings>(DEFAULT_SOCIAL_SETTINGS);
  const [contact, setContact] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);

  useEffect(() => {
    const unsubSocial = subscribeSocialSettings((settings) => setSocial(settings));
    const unsubContact = subscribeContactSettings((settings) => setContact(settings));
    return () => {
      unsubSocial();
      unsubContact();
    };
  }, []);

  const hasInstagram = Boolean(
    social.instagramUrl &&
      social.instagramUrl.trim() &&
      !social.instagramUrl.includes("[PASTE")
  );
  const instagramHref = hasInstagram ? social.instagramUrl.trim() : "";
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
            Whether you need a complete fire system quote, emergency cylinder refilling, or an
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
                  <a href={`tel:${contact.supportPhone.replace(/\s+/g, "")}`} className="w-full sm:w-auto">
                    <Button size="lg" className="w-full">
                      <Phone className="size-4" /> Call {contact.supportPhone}
                    </Button>
                  </a>
                  {contact.secondaryPhone && (
                    <a href={`tel:${contact.secondaryPhone.replace(/\s+/g, "")}`} className="w-full sm:w-auto">
                      <Button size="lg" variant="outline" className="w-full">
                        <Phone className="size-4" /> Call {contact.secondaryPhone}
                      </Button>
                    </a>
                  )}
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
                    href={`mailto:${contact.supportEmail}`}
                    className="mt-2 block text-xs font-medium text-muted-foreground hover:text-primary"
                  >
                    {contact.supportEmail}
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

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Business Identity & Addresses
                    </h3>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      Sri Udharchi Enterprises
                      <span className="block text-muted-foreground font-normal">
                        Proprietor: <strong>Dabbara Bhanu Swaroop</strong>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1 text-xs">
                  <strong className="block text-foreground text-[11px] font-bold uppercase tracking-wider">
                    Registered Office Address
                  </strong>
                  <p className="text-muted-foreground leading-relaxed">
                    {contact.registeredAddress || "4-169-B, Dharmapuram, Peddapappur, Dharmapuram, Ananthapuramu, Andhra Pradesh, 515445, India"}
                  </p>
                </div>

                <div className="rounded-lg border border-border/80 bg-muted/20 p-3 space-y-1 text-xs">
                  <strong className="block text-foreground text-[11px] font-bold uppercase tracking-wider">
                    Office &amp; Logistics Depot
                  </strong>
                  <p className="text-muted-foreground leading-relaxed">
                    {contact.officeDepotAddress || "H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241"}
                  </p>
                  <div className="mt-2 pt-1 border-t border-border/60">
                    <a
                      href="https://www.google.com/maps/search/?api=1&query=Kubera+Hills+Palasamudram+Andhra+Pradesh+515241"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-[11px] font-semibold text-primary hover:underline"
                    >
                      View Depot on Google Maps →
                    </a>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Serving clients across Andhra Pradesh, Telangana, Odisha, and Pan-India.
                </p>
              </div>

              {/* Instagram Channel Card */}
              {hasInstagram && (
                <div className="rounded-xl border border-pink-500/20 bg-gradient-to-br from-pink-500/5 via-card to-card p-6 shadow-sm">
                  <div className="mb-3 inline-flex size-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-600">
                    <Instagram className="size-5" />
                  </div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Official Instagram Profile
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Follow us for real on-site safety installations, equipment demonstrations, and emergency compliance advisories.
                  </p>
                  <div className="mt-3">
                    <a
                      href={instagramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-pink-600 hover:text-pink-700 hover:underline gap-1.5"
                    >
                      <span>Follow @sriudharchienterprises</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              )}
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
