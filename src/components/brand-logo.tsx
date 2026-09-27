export function BrandLogo({ light = false }: { light?: boolean }) {
  return (
    <a href="#home" className="shrink-0" aria-label="Sri Udharchi Enterprises home">
      <span
        className={`font-display text-lg font-black uppercase ${light ? "text-primary-foreground" : "text-primary"}`}
      >
        SRI UDHARCHI ENTERPRISES
      </span>
    </a>
  );
}
