import { BrandLogo } from "./brand-logo";
import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";

export function SiteFooter() {
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
                <a href="tel:+918639858221" className="block font-semibold hover:text-primary">
                  +91 8639858221
                </a>
                <a href="tel:+919030609171" className="block font-semibold hover:text-primary">
                  +91 9030609171
                </a>
                <span className="block text-xs text-muted-foreground">24/7 Emergency Support</span>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-primary" />
              <a
                href="mailto:sriudharchienterprises@gmail.com"
                className="break-all hover:text-primary"
              >
                sriudharchienterprises@gmail.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border px-5 py-5 text-center text-xs text-muted-foreground">
        © 2026 Sri Udharchi Enterprises. All rights reserved.
      </div>
    </footer>
  );
}
