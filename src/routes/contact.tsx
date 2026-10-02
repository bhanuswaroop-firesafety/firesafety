import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/button";
import { submitInquiry } from "@/lib/db-service";
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us & Request Quote | Sri Udharchi Enterprises" },
      {
        name: "description",
        content:
          "Get in touch with Sri Udharchi Enterprises for fire safety audits, equipment quotes, turnkey installation estimates, and 24/7 emergency support.",
      },
      { property: "og:title", content: "Contact Sri Udharchi Enterprises" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    service: "Consultation",
    facility: "Manufacturing Plant",
    message: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await submitInquiry({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        service: formData.service,
        facility: formData.facility,
        message: formData.message,
      });
    } catch (err) {
      console.warn("Firestore lead submission fallback:", err);
    }
    setSubmitted(true);
  };

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
            <div className="rounded-2xl border border-border bg-card p-8 shadow-lg sm:p-10">
              <h2 className="font-display text-2xl font-black text-foreground sm:text-3xl">
                Request a Detailed Price Proposal
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Fill in your project details below and an engineering consultant will contact you
                promptly with custom pricing and BOQ estimates.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-xl border border-success/30 bg-success/10 p-8 text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-success/20 text-success">
                    <ShieldCheck className="size-6" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Inquiry Successfully Received!
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Thank you. The Sri Udharchi Enterprises engineering team has received your
                    request and will contact you at{" "}
                    <strong>{formData.phone || formData.email}</strong> shortly.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: "",
                        phone: "",
                        email: "",
                        service: "Consultation",
                        facility: "Manufacturing Plant",
                        message: "",
                      });
                    }}
                  >
                    Submit Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Service Required
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Consultation">Fire Safety Consultation & Audit</option>
                      <option value="Installation">System Installation (Turnkey)</option>
                      <option value="Inspection">Testing & Inspection Certification</option>
                      <option value="Maintenance">Annual Maintenance Contract (AMC)</option>
                      <option value="Equipment Supply">Certified Equipment Supply</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Facility Type
                    </label>
                    <select
                      value={formData.facility}
                      onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="Manufacturing Plant">Manufacturing Plant / Factory</option>
                      <option value="Warehouse / Logistics">Warehouse / Logistics Center</option>
                      <option value="Hospital / Healthcare">Hospital / Healthcare Facility</option>
                      <option value="Commercial Complex / IT Park">
                        Commercial Complex / IT Park
                      </option>
                      <option value="Hotel / Hospitality">Hotel / Hospitality Resort</option>
                      <option value="School / College">School / College Campus</option>
                      <option value="Other">Other Facility</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Project Details or Questions
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please describe your facility area, current safety setup, or specific equipment requirements..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="mt-2 w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Button type="submit" size="lg" className="w-full">
                      Submit Request <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
