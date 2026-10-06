import { useState, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Flame,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/button";
import { submitInquiry } from "@/lib/db-service";

export interface ContactFormProps {
  className?: string | undefined;
  initialService?: string | undefined;
  initialProduct?: string | undefined;
  title?: string | undefined;
  subtitle?: string | undefined;
  variant?: ("card" | "embedded" | "compact") | undefined;
  onSuccess?: (() => void) | undefined;
}

export const SAFETY_SERVICE_OPTIONS = [
  "Fire Hydrant & Riser Networks",
  "Automatic Sprinklers & Gas Flooding",
  "Fire Protection System Installation",
  "Fire Safety Audit & Fire NOC Advisory",
  "Testing, Hydro-Testing & Certification",
  "AMC & Preventive Maintenance",
  "Certified PPE & Safety Equipment Supply",
  "Explosion-Proof CCTV & Flame Detection",
  "Fire-Rated Cable Trays & Firestops",
  "General Fire Safety Consultation",
] as const;

export function normalizeService(rawService?: string | null): string {
  if (!rawService) return "Fire Hydrant & Riser Networks";
  const cleaned = rawService.trim();
  const lower = cleaned.toLowerCase();

  if (lower.includes("sprinkler") || lower.includes("gas") || lower.includes("suppress")) {
    return "Automatic Sprinklers & Gas Flooding";
  }
  if (lower.includes("hydrant") || lower.includes("riser")) {
    return "Fire Hydrant & Riser Networks";
  }
  if (lower.includes("install")) {
    return "Fire Protection System Installation";
  }
  if (lower.includes("audit") || lower.includes("noc") || lower.includes("consult")) {
    return "Fire Safety Audit & Fire NOC Advisory";
  }
  if (
    lower.includes("inspect") ||
    lower.includes("test") ||
    lower.includes("hydro") ||
    lower.includes("certif")
  ) {
    return "Testing, Hydro-Testing & Certification";
  }
  if (lower.includes("amc") || lower.includes("maintenance") || lower.includes("repair")) {
    return "AMC & Preventive Maintenance";
  }
  if (
    lower.includes("supply") ||
    lower.includes("ppe") ||
    lower.includes("gear") ||
    lower.includes("equipment")
  ) {
    return "Certified PPE & Safety Equipment Supply";
  }
  if (lower.includes("cctv") || lower.includes("camera") || lower.includes("surveillance")) {
    return "Explosion-Proof CCTV & Flame Detection";
  }
  if (lower.includes("cable") || lower.includes("firestop") || lower.includes("tray")) {
    return "Fire-Rated Cable Trays & Firestops";
  }

  return cleaned;
}

export const FACILITY_TYPE_OPTIONS = [
  "Manufacturing Plant / Factory",
  "Warehouse / Logistics Hub",
  "Commercial Complex / IT Park",
  "Hospital / Healthcare Center",
  "Hotel / Hospitality Resort",
  "School / University Campus",
  "Infrastructure / Construction Site",
  "Residential High-Rise / Apartment",
  "Other Industrial Facility",
] as const;

export function ContactForm({
  className = "",
  initialService,
  initialProduct,
  title = "Request a Technical Proposal",
  subtitle = "Provide your facility requirements and our certified fire protection engineers will prepare a detailed bill of quantities (BOQ) and proposal.",
  variant = "card",
  onSuccess,
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    location: "",
    service: normalizeService(
      initialService ||
        (initialProduct
          ? "Certified PPE & Safety Equipment Supply"
          : "Fire Hydrant & Riser Networks"),
    ),
    facility: "Manufacturing Plant / Factory",
    urgency: "Standard (1-2 business days)",
    message: initialProduct
      ? `Inquiry for Product: ${initialProduct}\nPlease share technical datasheet, pricing per unit, and supply lead time.`
      : "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [lastSubmitTime, setLastSubmitTime] = useState(0);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // Bot detection via honeypot
    if (honeypot.trim() !== "") {
      setSubmitted(true);
      return;
    }

    // Rapid submission throttling
    const now = Date.now();
    if (lastSubmitTime > 0 && now - lastSubmitTime < 5000) {
      setErrorMessage("Please wait a few seconds before submitting another request.");
      return;
    }

    setErrorMessage("");

    const trimmedName = formData.name.trim();
    const trimmedPhone = formData.phone.trim();
    const trimmedEmail = formData.email.trim();

    // Rigorous validation
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage("Please enter a valid full name (minimum 2 characters).");
      return;
    }

    const digitsOnly = trimmedPhone.replace(/[^\d]/g, "");
    if (!trimmedPhone || digitsOnly.length < 10) {
      setErrorMessage("Please enter a valid phone number with at least 10 digits.");
      return;
    }

    if (/^(\d)\1{9,}$/.test(digitsOnly)) {
      setErrorMessage("Please enter a genuine phone number.");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage(
        "Please enter a valid work or personal email address (e.g. name@domain.com).",
      );
      return;
    }

    setSubmitting(true);

    try {
      await submitInquiry({
        name: trimmedName.slice(0, 150),
        phone: trimmedPhone.slice(0, 50),
        email: trimmedEmail.slice(0, 200),
        service: formData.service,
        facility:
          `${formData.facility}${formData.company ? ` (${formData.company.trim().slice(0, 100)})` : ""}${formData.location ? ` - ${formData.location.trim().slice(0, 100)}` : ""}`.slice(
            0,
            200,
          ),
        message: `${(formData.message.trim() || "Standard quotation request").slice(0, 2000)}\n[Urgency: ${formData.urgency}]`,
      });

      setSubmitted(true);
      setLastSubmitTime(Date.now());
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      console.error("Inquiry submission error:", err);
      let userMsg =
        "Could not send inquiry due to a network connection issue. Please retry or call our dispatch directly at +91 86398 58221.";
      if (err instanceof Error) {
        if (
          err.message.includes("permission-denied") ||
          err.message.includes("Missing or insufficient permissions")
        ) {
          userMsg =
            "Inquiry submission failed: Firestore security rules restricted the request. Please call dispatch directly at +91 86398 58221.";
        } else if (err.message.includes("Failed to fetch") || err.message.includes("network")) {
          userMsg =
            "Network connectivity error. Please check your internet connection or call dispatch at +91 86398 58221.";
        }
      }
      setErrorMessage(userMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setErrorMessage("");
    setFormData({
      name: "",
      company: "",
      phone: "",
      email: "",
      location: "",
      service: normalizeService(
        initialService ||
          (initialProduct
            ? "Certified PPE & Safety Equipment Supply"
            : "Fire Hydrant & Riser Networks"),
      ),
      facility: "Manufacturing Plant / Factory",
      urgency: "Standard (1-2 business days)",
      message: initialProduct
        ? `Inquiry for Product: ${initialProduct}\nPlease share technical datasheet, pricing per unit, and supply lead time.`
        : "",
    });
  };

  const containerClasses =
    variant === "card"
      ? "rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-10"
      : variant === "embedded"
        ? "rounded-xl border border-border bg-card/60 p-5 sm:p-8"
        : "p-4";

  return (
    <div className={`${containerClasses} ${className}`}>
      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success-state"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="py-8 text-center"
          >
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-success/15 text-success shadow-inner">
              <CheckCircle2 className="size-9" />
            </div>

            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold text-success">
              <Sparkles className="size-3" /> Inquiry Received
            </span>

            <h3 className="mt-3 font-display text-2xl font-black text-foreground sm:text-3xl">
              Thank You, {formData.name || "Valued Client"}!
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
              Your inquiry for <strong className="text-foreground">{formData.service}</strong> has
              been logged into our priority response system. A technical safety specialist will
              contact you shortly.
            </p>

            <div className="mx-auto mt-6 max-w-md rounded-xl border border-border bg-muted/30 p-4 text-left text-xs space-y-2">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Primary Contact</span>
                <span className="font-semibold text-foreground">{formData.phone}</span>
              </div>
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Selected Service</span>
                <span className="font-semibold text-primary truncate max-w-[220px]">
                  {formData.service}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Expected Response</span>
                <span className="font-bold text-success flex items-center gap-1">
                  <Clock className="size-3" /> Within 2 Hours
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={handleReset} variant="outline" size="sm">
                Submit Another Request
              </Button>
              <a href="tel:+918639858221">
                <Button size="sm">
                  <Phone className="size-3.5" /> Call Dispatch Directly
                </Button>
              </a>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header info */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <ShieldCheck className="size-3.5" />
                <span>Certified Engineering Consultation</span>
              </div>

              <h2 className="mt-3 font-display text-2xl font-black text-foreground sm:text-3xl">
                {title}
              </h2>

              {subtitle && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Quick Service Category Selector Buttons */}
            <div className="mt-6">
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Select Primary Safety Requirement
              </label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Array.from(new Set([...SAFETY_SERVICE_OPTIONS.slice(0, 5), formData.service])).map(
                  (srv) => (
                    <button
                      key={srv}
                      type="button"
                      onClick={() => setFormData({ ...formData, service: srv })}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                        formData.service === srv
                          ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
                          : "border border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {srv}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Main Form Fields */}
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              {/* Anti-spam bot honeypot (hidden from human users) */}
              <div className="sr-only hidden" aria-hidden="true">
                <label htmlFor="website_hp">Leave blank</label>
                <input
                  id="website_hp"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              {/* Full Name */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-primary">*</span>
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Phone Number <span className="text-primary">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <Phone className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Company / Enterprise Name */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Company / Facility Name
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    placeholder="e.g. Apex Pharma Mfg Pvt Ltd"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <Building2 className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Email Address <span className="text-primary">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Facility Location */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Facility Location / City
                </label>
                <div className="relative mt-1">
                  <input
                    type="text"
                    placeholder="e.g. Palasamudram, Sri Sathya Sai District"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <MapPin className="absolute left-3 top-3 size-4 text-muted-foreground" />
                </div>
              </div>

              {/* Facility Type Dropdown */}
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Facility / Site Type
                </label>
                <div className="mt-1">
                  <select
                    value={formData.facility}
                    onChange={(e) => setFormData({ ...formData, facility: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {FACILITY_TYPE_OPTIONS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* All Service Options Dropdown */}
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-foreground">
                  Detailed Solution Category
                </label>
                <div className="mt-1">
                  <select
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  >
                    {!SAFETY_SERVICE_OPTIONS.includes(
                      formData.service as (typeof SAFETY_SERVICE_OPTIONS)[number],
                    ) && <option value={formData.service}>{formData.service}</option>}
                    {SAFETY_SERVICE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Message Details */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground">
                    Project Requirements / Area / Specific Needs
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Area, floors, or current setup
                  </span>
                </div>
                <div className="mt-1">
                  <textarea
                    rows={3}
                    placeholder="Please specify total built-up area (sq ft), number of floors, occupancy hazard type, or products needed..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="sm:col-span-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <div className="sm:col-span-2 pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  size="lg"
                  className="w-full justify-center shadow-md text-sm font-bold"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="size-4 animate-spin" />
                      <span>Submitting Inquiry...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="size-4" />
                      <span>Submit Safety Service Inquiry</span>
                      <ArrowRight className="size-4" />
                    </span>
                  )}
                </Button>

                <p className="mt-2.5 text-center text-[11px] text-muted-foreground">
                  🔒 Strictly confidential. Your details are forwarded directly to licensed fire
                  engineers.
                </p>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
