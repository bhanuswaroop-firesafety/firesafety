import { useEffect, useState } from "react";
import {
  ChevronDown,
  Lock,
  Menu,
  Phone,
  X,
  User,
  UserPlus,
  LogOut,
  ShieldCheck,
  ShoppingCart,
  ArrowRight,
  Flame,
  Wrench,
  Boxes,
  Truck,
  MessageCircle,
  Smartphone,
  Instagram,
  Search,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import {
  subscribeSocialSettings,
  DEFAULT_SOCIAL_SETTINGS,
  subscribeContactSettings,
  DEFAULT_CONTACT_SETTINGS,
} from "@/lib/db-service";
import type { SocialSettings, ContactSettings } from "@/lib/types";
import { BrandLogo } from "./brand-logo";
import { Button } from "./button";
import { PhoneOtpModal } from "./phone-otp-modal";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products", badge: "Shop" },
  {
    name: "Services",
    href: "/services",
    subLinks: [
      { name: "All Services Overview", href: "/services" },
      { name: "Fire Safety Consultation", href: "/services/consultation" },
      { name: "Hydrant & Piping Installation", href: "/services/installation" },
      { name: "Statutory Inspection & Testing", href: "/services/inspection" },
      { name: "AMC Annual Maintenance", href: "/services/maintenance" },
      { name: "Industrial Equipment Supply", href: "/services/equipment-supply" },
    ],
  },
  { name: "Industries", href: "/industries" },
  { name: "Projects", href: "/projects" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const QUICK_CATEGORIES = [
  { name: "Apartments", href: "/products?category=Apartments" },
  { name: "Offices", href: "/products?category=Offices" },
  { name: "Factories", href: "/products?category=Factories" },
  { name: "Hospitals", href: "/products?category=Hospitals" },
  { name: "Electrical / Server Room", href: "/products?category=Electrical+%2F+Server+Room" },
  { name: "Fire Accessories", href: "/products?category=Fire+Accessories" },
];

export function SiteHeader() {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { totalItems, totalAmount, setIsCartOpen } = useCart();
  const [open, setOpen] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);
  const [isPhoneOtpModalOpen, setIsPhoneOtpModalOpen] = useState(false);
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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* Top Utility & Emergency Ticker Bar */}
      <div className="border-b border-border/80 bg-ink text-white/90 text-xs py-1.5 px-3 sm:px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden text-[11px] sm:text-xs w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1.5 font-bold text-brand-warm shrink-0">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">24/7 Safety Dispatch:</span>
              <span className="sm:hidden">24/7 Hotline:</span>
            </div>
            <a
              href={`tel:${contact.supportPhone.replace(/\s+/g, "")}`}
              className="font-mono font-bold text-white hover:text-brand-warm transition-colors flex items-center gap-1 shrink-0"
            >
              <Phone className="size-3 text-emerald-400 sm:hidden" />
              {contact.supportPhone}
            </a>
            {contact.secondaryPhone && (
              <>
                <span className="text-white/40 hidden sm:inline">•</span>
                <a
                  href={`tel:${contact.secondaryPhone.replace(/\s+/g, "")}`}
                  className="font-mono hover:text-brand-warm transition-colors hidden md:inline"
                >
                  {contact.secondaryPhone}
                </a>
              </>
            )}
            <span className="text-white/40 hidden md:inline">•</span>
            <span className="text-white/70 truncate hidden sm:inline">
              NBC 2016 & IS Certified Industrial Contractor • Pan-India Logistics
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold sm:hidden shrink-0">
              NBC 2016 Certified
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[11px] text-white/80 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Truck className="size-3" /> Free Cargo &gt; ₹5,000
            </span>
            <span className="text-white/30">|</span>
            <a href="/cart" className="hover:text-white transition-colors flex items-center gap-1">
              <span>Cart &amp; Quotation</span>
              {totalItems > 0 && (
                <span className="rounded-full bg-primary px-1.5 py-0.2 text-[9px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </a>
            <span className="text-white/30">|</span>
            <a href="/contact" className="hover:text-brand-warm transition-colors font-semibold">
              Emergency NOC Inquiry
            </a>
            {hasInstagram && (
              <>
                <span className="text-white/30">|</span>
                <a
                  href={instagramHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-400 transition-colors flex items-center gap-1 text-[11px]"
                  title="Official Instagram Profile"
                >
                  <Instagram className="size-3 text-pink-400" />
                  <span>Instagram</span>
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 sm:h-[72px] lg:h-[76px] max-w-7xl items-center justify-between gap-2 sm:gap-3 px-3.5 sm:px-5 lg:px-8">
          <BrandLogo />

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 lg:flex" aria-label="Main navigation">
            {navLinks.map((link) => {
              if (link.subLinks) {
                return (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setServicesDropdown(true)}
                    onMouseLeave={() => setServicesDropdown(false)}
                  >
                    <a
                      href={link.href}
                      className="flex items-center gap-1 py-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      <span>{link.name}</span>
                      <ChevronDown className="size-4 opacity-70" />
                    </a>

                    <AnimatePresence>
                      {servicesDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 top-full w-64 rounded-xl border border-border bg-popover p-2.5 shadow-xl"
                        >
                          {link.subLinks.map((sub) => (
                            <a
                              key={sub.name}
                              href={sub.href}
                              className="block rounded-lg px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
                            >
                              {sub.name}
                            </a>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }

              return (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                      {link.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          {/* Action CTAs & Cart */}
          <div className="flex items-center gap-2">
            {/* Desktop Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative hidden sm:flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs font-bold text-foreground hover:border-primary/50 hover:text-primary transition-all shadow-xs"
              aria-label={`Open cart with ${totalItems} items`}
            >
              <ShoppingCart className="size-4 text-primary" />
              <span>Cart</span>
              {totalItems > 0 ? (
                <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground">
                  {totalItems}
                </span>
              ) : (
                <span className="text-[11px] text-muted-foreground font-normal">0</span>
              )}
            </button>

            {/* User Profile / Admin / Call Buttons */}
            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 py-1 pl-3 pr-1.5 text-xs shadow-sm backdrop-blur">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`size-2 rounded-full ${
                        isAdmin ? "bg-emerald-500 animate-pulse" : "bg-primary"
                      }`}
                    />
                    <span className="font-semibold text-foreground max-w-[130px] truncate">
                      {userProfile?.displayName || user.displayName || user.email?.split("@")[0]}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isAdmin
                          ? "bg-primary/15 text-primary border border-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isAdmin ? "Admin" : userProfile?.role || "Client"}
                    </span>
                  </div>

                  {isAdmin && (
                    <a href="/admin">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs font-bold text-primary hover:bg-primary/10"
                      >
                        <ShieldCheck className="size-3.5" /> Portal
                      </Button>
                    </a>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={logout}
                    title="Sign Out"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPhoneOtpModalOpen(true)}
                    className="text-xs font-semibold text-foreground hover:text-primary gap-1 px-2"
                  >
                    <Smartphone className="size-3.5 text-primary" /> Phone OTP
                  </Button>
                  <a href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs font-semibold text-foreground hover:text-primary gap-1 px-2.5"
                    >
                      <User className="size-3.5" /> Sign In
                    </Button>
                  </a>
                  <a href="/signup">
                    <Button
                      size="sm"
                      className="text-xs font-bold gap-1 h-8 px-3 shadow-xs"
                    >
                      <UserPlus className="size-3.5" /> Sign Up
                    </Button>
                  </a>
                </div>
              )}

              <a href="tel:+918639858221">
                <Button size="sm">
                  <Phone className="size-3.5" /> 8639858221
                </Button>
              </a>
            </div>

            {/* Quick Mobile Call Button */}
            <a
              href="tel:+918639858221"
              className="flex size-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 lg:hidden shadow-xs active:scale-95 transition-transform"
              aria-label="Call Emergency Hotline"
              title="Call Hotline"
            >
              <Phone className="size-4 text-emerald-600 dark:text-emerald-400" />
            </a>

            {/* Mobile Cart Trigger Icon */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex size-10 items-center justify-center rounded-xl border border-border bg-card text-foreground lg:hidden shadow-xs active:scale-95 transition-transform"
              aria-label="Cart"
            >
              <ShoppingCart className="size-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Hamburger */}
            <Button
              variant="ghost"
              className="size-10 px-0 rounded-xl lg:hidden active:scale-95 transition-transform"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer (Sidebar) */}
        <AnimatePresence>
          {open && (
            <>
              <motion.button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-50 bg-ink/75 backdrop-blur-xs lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />

              <motion.aside
                className="fixed right-0 top-0 z-50 flex h-dvh w-[min(90vw,400px)] flex-col overflow-y-auto bg-background p-5 shadow-2xl lg:hidden border-l border-border"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 360, damping: 34 }}
              >
                {/* 1. Drawer Header */}
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <BrandLogo />
                  <Button
                    variant="ghost"
                    className="size-10 px-0 rounded-lg hover:bg-muted"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                  >
                    <X className="size-5" />
                  </Button>
                </div>

                {/* Mobile Search Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const input = (e.currentTarget.elements.namedItem("mobile-search") as HTMLInputElement)?.value;
                    if (input?.trim()) {
                      setOpen(false);
                      window.location.href = `/products?q=${encodeURIComponent(input.trim())}`;
                    }
                  }}
                  className="pt-3 pb-1"
                >
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                    <input
                      name="mobile-search"
                      type="text"
                      placeholder="Search products by name, SKU, specs..."
                      aria-label="Search fire safety products"
                      className="w-full rounded-xl border border-input bg-card pl-8 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                    />
                  </div>
                </form>

                {/* 2. Main Pages Navigation (FIRST as requested) */}
                <div className="py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 block mb-1">
                    Main Pages
                  </span>
                  <nav className="grid gap-0.5" aria-label="Main Pages Mobile navigation">
                    {navLinks.map((link, index) => {
                      if (link.subLinks) {
                        return (
                          <div key={link.name} className="border-b border-border/50 py-1.5">
                            <div className="flex items-center justify-between px-2 py-1 text-sm font-bold text-foreground">
                              <a
                                href={link.href}
                                onClick={() => setOpen(false)}
                                className="hover:text-primary transition-colors"
                              >
                                {link.name}
                              </a>
                              <button
                                type="button"
                                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                                className="p-1 text-muted-foreground"
                              >
                                <ChevronDown
                                  className={`size-4 transition-transform ${
                                    mobileServicesOpen ? "rotate-180" : ""
                                  }`}
                                />
                              </button>
                            </div>
                            {mobileServicesOpen && (
                              <div className="mt-1 space-y-1 pl-3 border-l-2 border-primary/30 ml-2">
                                {link.subLinks.map((sub) => (
                                  <a
                                    key={sub.name}
                                    href={sub.href}
                                    onClick={() => setOpen(false)}
                                    className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-primary transition-colors"
                                  >
                                    {sub.name}
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <motion.a
                          key={link.name}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center justify-between border-b border-border/50 px-2 py-2 text-sm font-bold text-foreground transition-colors hover:text-primary"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.03 + index * 0.02 }}
                        >
                          <span>{link.name}</span>
                          {link.badge && (
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {link.badge}
                            </span>
                          )}
                        </motion.a>
                      );
                    })}
                  </nav>
                </div>

                {/* 3. Popular Product Categories Shortcuts */}
                <div className="py-2.5 border-b border-border/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2 block mb-1.5">
                    Popular Equipment
                  </span>
                  <div className="flex flex-wrap gap-1.5 px-2">
                    {QUICK_CATEGORIES.map((cat) => (
                      <a
                        key={cat.name}
                        href={cat.href}
                        onClick={() => setOpen(false)}
                        className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        {cat.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* 4. Active Cart Quick Card */}
                <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <ShoppingCart className="size-3.5" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-foreground">
                          Safety Equipment Cart
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {totalItems === 0
                            ? "0 items in cart"
                            : `${totalItems} items • ₹${totalAmount.toLocaleString("en-IN")}`}
                        </span>
                      </div>
                    </div>

                    <a
                      href="/cart"
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
                    >
                      {totalItems > 0 ? "View Cart" : "Shop"} <ArrowRight className="size-3" />
                    </a>
                  </div>

                  {totalItems > 0 && (
                    <div className="mt-2 pt-2 border-t border-primary/10 flex justify-between items-center text-[11px]">
                      <span className="text-muted-foreground">Ready to order?</span>
                      <a
                        href="/checkout"
                        onClick={() => setOpen(false)}
                        className="font-bold text-primary hover:underline"
                      >
                        Proceed to Checkout &rarr;
                      </a>
                    </div>
                  )}
                </div>

                {/* 5. User Account & Auth Section (Sign In & Sign Up) */}
                <div className="mt-3 space-y-2.5 pt-2">
                  {user ? (
                    <div className="rounded-xl border border-border bg-card p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {(userProfile?.displayName || user.displayName || user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="truncate">
                            <p className="text-xs font-bold text-foreground truncate">
                              {userProfile?.displayName || user.displayName || user.email}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                              {isAdmin ? "Administrator" : userProfile?.role || "Customer"}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            logout();
                            setOpen(false);
                          }}
                          className="size-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <LogOut className="size-3.5" />
                        </Button>
                      </div>

                      {isAdmin && (
                        <a href="/admin" onClick={() => setOpen(false)} className="block">
                          <Button className="w-full justify-center text-xs">
                            <Lock className="size-3.5" /> Open Admin Portal
                          </Button>
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 rounded-xl border border-border/80 bg-card p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Account Access
                      </span>
                      {/* Side by side Sign In and Sign Up buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <a href="/login" onClick={() => setOpen(false)} className="block">
                          <Button variant="outline" className="w-full justify-center text-xs font-bold gap-1.5 h-8">
                            <User className="size-3.5" /> Sign In
                          </Button>
                        </a>
                        <a href="/signup" onClick={() => setOpen(false)} className="block">
                          <Button className="w-full justify-center text-xs font-bold gap-1.5 h-8 shadow-xs">
                            <UserPlus className="size-3.5" /> Sign Up
                          </Button>
                        </a>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setOpen(false);
                          setIsPhoneOtpModalOpen(true);
                        }}
                        className="w-full justify-center text-xs gap-1.5 border-primary/40 text-primary font-bold h-8 hover:bg-primary/5"
                      >
                        <Smartphone className="size-3.5 text-primary" /> Login with Phone OTP
                      </Button>
                    </div>
                  )}

                  {/* 6. Emergency Hotlines */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a href={`tel:${contact.supportPhone.replace(/\s+/g, "")}`}>
                      <Button className="w-full text-xs truncate">
                        <Phone className="size-3.5 shrink-0" /> {contact.supportPhone}
                      </Button>
                    </a>
                    <a
                      href={`https://wa.me/${contact.supportPhone.replace(/\D+/g, "")}?text=Hello%20Sri%20Udharchi%20Enterprises,%20I%20have%20an%20urgent%20fire%20safety%20inquiry.`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="outline"
                        className="w-full text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      >
                        <MessageCircle className="size-3.5 text-emerald-600" /> WhatsApp
                      </Button>
                    </a>
                  </div>

                  {/* 7. Official Instagram Profile */}
                  {hasInstagram && (
                    <a
                      href={instagramHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className="w-full text-xs border-pink-500/30 text-pink-600 hover:bg-pink-500/10 gap-2 font-semibold"
                      >
                        <Instagram className="size-3.5 text-pink-600" />
                        <span>Follow on Instagram</span>
                      </Button>
                    </a>
                  )}

                  {/* 8. Quick Legal Policy Links */}
                  <div className="border-t border-border/50 pt-2.5 pb-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-medium">
                    <a href="/privacy" onClick={() => setOpen(false)} className="hover:text-primary">
                      Privacy Policy
                    </a>
                    <span>•</span>
                    <a href="/terms" onClick={() => setOpen(false)} className="hover:text-primary">
                      Terms
                    </a>
                    <span>•</span>
                    <a href="/refund-policy" onClick={() => setOpen(false)} className="hover:text-primary">
                      Refunds
                    </a>
                    <span>•</span>
                    <a href="/shipping-policy" onClick={() => setOpen(false)} className="hover:text-primary">
                      Shipping
                    </a>
                  </div>

                  {/* 9. Trust Footer */}
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-muted-foreground pt-1 pb-2">
                    <ShieldCheck className="size-3 text-primary" />
                    <span>IS 15683 & NBC 2016 Certified Engineering Partner</span>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Global Phone OTP Login Modal */}
        <PhoneOtpModal
          isOpen={isPhoneOtpModalOpen}
          onClose={() => setIsPhoneOtpModalOpen(false)}
        />
      </header>
    </>
  );
}
