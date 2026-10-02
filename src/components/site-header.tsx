import { useEffect, useState } from "react";
import { ChevronDown, Lock, Menu, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BrandLogo } from "./brand-logo";
import { Button } from "./button";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Products", href: "/products" },
  {
    name: "Services",
    href: "/services",
    subLinks: [
      { name: "All Services", href: "/services" },
      { name: "Consultation", href: "/services/consultation" },
      { name: "Installation", href: "/services/installation" },
      { name: "Inspection", href: "/services/inspection" },
      { name: "Maintenance", href: "/services/maintenance" },
      { name: "Equipment Supply", href: "/services/equipment-supply" },
    ],
  },
  { name: "Industries", href: "/industries" },
  { name: "Projects", href: "/projects" },
  { name: "Contact", href: "/contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [servicesDropdown, setServicesDropdown] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(true);

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
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-[76px] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 lg:flex lg:justify-between lg:px-8">
        <BrandLogo />

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
                        className="absolute left-0 top-full w-56 rounded-lg border border-border bg-popover p-2 shadow-xl"
                      >
                        {link.subLinks.map((sub) => (
                          <a
                            key={sub.name}
                            href={sub.href}
                            className="block rounded-md px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted hover:text-primary"
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
                className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                {link.name}
              </a>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href="/admin">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              <Lock className="size-3.5" /> Admin
            </Button>
          </a>
          <div className="flex items-center gap-1.5">
            <a href="tel:+918639858221">
              <Button size="sm">
                <Phone className="size-3.5" /> 8639858221
              </Button>
            </a>
            <a href="tel:+919030609171">
              <Button size="sm" variant="outline">
                <Phone className="size-3.5" /> 9030609171
              </Button>
            </a>
          </div>
        </div>

        <Button
          variant="ghost"
          className="size-11 px-0 lg:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu />
        </Button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 top-[76px] z-40 bg-ink/55 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-dvh w-[min(88vw,380px)] flex-col overflow-y-auto bg-background p-5 shadow-2xl lg:hidden"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 360, damping: 34 }}
            >
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border pb-5">
                <BrandLogo />
                <Button
                  variant="ghost"
                  className="size-11 px-0"
                  aria-label="Close menu"
                  onClick={() => setOpen(false)}
                >
                  <X />
                </Button>
              </div>

              <nav className="grid gap-1 py-4" aria-label="Mobile navigation">
                {navLinks.map((link, index) => {
                  if (link.subLinks) {
                    return (
                      <div key={link.name} className="border-b border-border py-2">
                        <div className="flex items-center justify-between px-2 py-1 text-base font-bold">
                          <a
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className="hover:text-primary"
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
                          <div className="mt-1 space-y-1 pl-4">
                            {link.subLinks.map((sub) => (
                              <a
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setOpen(false)}
                                className="block rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-primary"
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
                      className="border-b border-border px-2 py-3 text-base font-bold transition-colors hover:text-primary"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.03 }}
                    >
                      {link.name}
                    </motion.a>
                  );
                })}
              </nav>

              <div className="mt-auto space-y-2 pt-4">
                <a href="/admin" onClick={() => setOpen(false)} className="block">
                  <Button variant="outline" className="w-full justify-center text-xs">
                    <Lock className="size-3.5" /> Open Admin Portal
                  </Button>
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <a href="tel:+918639858221">
                    <Button className="w-full text-xs">
                      <Phone className="size-3.5" /> 8639858221
                    </Button>
                  </a>
                  <a href="tel:+919030609171">
                    <Button variant="outline" className="w-full text-xs">
                      <Phone className="size-3.5" /> 9030609171
                    </Button>
                  </a>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
