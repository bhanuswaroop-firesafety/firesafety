import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { BrandLogo } from "./brand-logo";
import { Button } from "./button";

const links = ["Home", "About", "Products", "Services", "Industries", "Projects", "Contact"];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
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
      <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 lg:flex lg:justify-between lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
            >
              {link}
            </a>
          ))}
        </nav>
        <a href="tel:+918639858221" className="hidden lg:block">
          <Button>
            <Phone className="size-4" /> 8639858221
          </Button>
        </a>
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
              className="fixed inset-0 top-[72px] z-40 bg-ink/55 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-50 flex h-dvh w-[min(84vw,360px)] flex-col bg-background p-5 shadow-2xl lg:hidden"
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
              <nav className="grid gap-1 py-6" aria-label="Mobile navigation">
                {links.map((link, index) => (
                  <motion.a
                    key={link}
                    href={`#${link.toLowerCase()}`}
                    onClick={() => setOpen(false)}
                    className="border-b border-border px-2 py-3 text-base font-bold transition-colors hover:text-primary"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + index * 0.035 }}
                  >
                    {link}
                  </motion.a>
                ))}
              </nav>
              <a href="tel:+918639858221" className="mt-auto">
                <Button className="w-full">
                  <Phone className="size-4" /> Call 8639858221
                </Button>
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
