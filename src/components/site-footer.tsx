import { useState, useEffect } from "react";
import { BrandLogo } from "./brand-logo";
import { Mail, MapPin, Phone, ShieldCheck, Instagram } from "lucide-react";
import {
  subscribeSocialSettings,
  DEFAULT_SOCIAL_SETTINGS,
  subscribeContactSettings,
  DEFAULT_CONTACT_SETTINGS,
} from "@/lib/db-service";
import type { SocialSettings, ContactSettings } from "@/lib/types";

export function SiteFooter() {
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
    <footer className="border-t border-border bg-card/60 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_0.9fr_1fr] lg:px-8">
        <div>
          <BrandLogo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Sri Udharchi Enterprises provides end-to-end fire protection systems, industrial safety
            equipment, professional engineering consultation, testing, and annual maintenance
            services across Andhra Pradesh and Pan-India.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-primary">
            <ShieldCheck className="size-4" />
            <span>NBC 2016, NFPA & BIS Certified Solutions</span>
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
            Quick Links
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="/" className="transition-colors hover:text-primary">
                Home
              </a>
            </li>
            <li>
              <a href="/about" className="transition-colors hover:text-primary">
                About Us
              </a>
            </li>
            <li>
              <a href="/products" className="transition-colors hover:text-primary">
                Products Catalog
              </a>
            </li>
            <li>
              <a href="/services" className="transition-colors hover:text-primary">
                All Services
              </a>
            </li>
            <li>
              <a href="/industries" className="transition-colors hover:text-primary">
                Industries Served
              </a>
            </li>
            <li>
              <a href="/projects" className="transition-colors hover:text-primary">
                Featured Projects
              </a>
            </li>
            <li>
              <a href="/contact" className="transition-colors hover:text-primary">
                Contact & Quotes
              </a>
            </li>
            <li>
              <a href="/login" className="transition-colors hover:text-primary">
                Client Portal / Account
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
            Our Services
          </h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="/services/consultation" className="transition-colors hover:text-primary">
                Fire Safety Consultation
              </a>
            </li>
            <li>
              <a href="/services/installation" className="transition-colors hover:text-primary">
                System Installation
              </a>
            </li>
            <li>
              <a href="/services/inspection" className="transition-colors hover:text-primary">
                Testing & Inspection
              </a>
            </li>
            <li>
              <a href="/services/maintenance" className="transition-colors hover:text-primary">
                AMC & Maintenance
              </a>
            </li>
            <li>
              <a href="/services/equipment-supply" className="transition-colors hover:text-primary">
                Equipment Supply
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
            Contact & Support
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <div className="space-y-0.5">
                <a
                  href={`tel:${contact.supportPhone.replace(/\s+/g, "")}`}
                  className="block font-semibold hover:text-primary"
                >
                  {contact.supportPhone}
                </a>
                {contact.secondaryPhone && (
                  <a
                    href={`tel:${contact.secondaryPhone.replace(/\s+/g, "")}`}
                    className="block font-semibold hover:text-primary"
                  >
                    {contact.secondaryPhone}
                  </a>
                )}
                <span className="block text-xs text-muted-foreground">24/7 Emergency Support</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <a
                href={`mailto:${contact.supportEmail}`}
                className="break-all hover:text-primary"
              >
                {contact.supportEmail}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{contact.address}</span>
            </li>
            {hasInstagram && (
              <li className="flex items-center gap-3 pt-1">
                <Instagram className="size-4 shrink-0 text-pink-600" />
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-foreground hover:text-pink-600 transition-colors flex items-center gap-1.5"
                  title="Follow Sri Udharchi Enterprises on Instagram"
                >
                  <span>Instagram Profile</span>
                  <span className="text-[10px] rounded bg-pink-500/10 px-1.5 py-0.2 text-pink-600 font-bold">
                    Official
                  </span>
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-5 py-5 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-7xl flex-col lg:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <span>© 2026 Sri Udharchi Enterprises. All rights reserved.</span>
            <span className="hidden sm:inline text-border">|</span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs">
              <a href="/privacy" className="transition-colors hover:text-primary">
                Privacy Policy
              </a>
              <a href="/terms" className="transition-colors hover:text-primary">
                Terms of Service
              </a>
              <a href="/refund-policy" className="transition-colors hover:text-primary">
                Cancellation & Refund
              </a>
              <a href="/shipping-policy" className="transition-colors hover:text-primary">
                Shipping & Delivery
              </a>
            </div>
          </div>
          {hasInstagram && (
            <div className="flex items-center gap-4">
              <a
                href={instagramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-foreground hover:text-pink-600 transition-colors"
                title="Official Instagram"
              >
                <Instagram className="size-3.5 text-pink-600" />
                <span>Follow @sriudharchienterprises</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
