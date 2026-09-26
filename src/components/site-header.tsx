import { useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { BrandLogo } from "./brand-logo";
import { Button } from "./button";

const links = ["Home", "About", "Products", "Services", "Industries", "Projects", "Contact"];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto grid h-[72px] max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 lg:flex lg:justify-between lg:px-8">
        <BrandLogo />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
          {links.map((link) => (
            <a key={link} href={`#${link.toLowerCase()}`} className="text-sm font-semibold text-foreground transition-colors hover:text-primary">{link}</a>
          ))}
        </nav>
        <a href="tel:+918639858221" className="hidden lg:block"><Button><Phone className="size-4" /> 8639858221</Button></a>
        <Button variant="ghost" className="size-11 px-0 lg:hidden" aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </Button>
      </div>
      {open && (
        <nav className="border-t border-border bg-background px-5 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link) => <a key={link} href={`#${link.toLowerCase()}`} onClick={() => setOpen(false)} className="rounded-md px-3 py-3 text-sm font-bold hover:bg-accent">{link}</a>)}
            <a href="tel:+918639858221" className="mt-2"><Button className="w-full"><Phone className="size-4" /> Call 8639858221</Button></a>
          </div>
        </nav>
      )}
    </header>
  );
}