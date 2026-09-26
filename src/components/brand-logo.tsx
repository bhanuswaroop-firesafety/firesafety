export function BrandLogo({ light = false }: { light?: boolean }) {
  return (
    <a href="#home" className="flex shrink-0 items-center gap-2" aria-label="Udharchi Enterprises home">
      <span className="grid size-10 place-items-center border-2 border-brand-gold bg-brand-deep font-display text-lg font-black text-brand-gold">UR</span>
      <span className="leading-[0.92]">
        <strong className={`block font-display text-[15px] font-black uppercase ${light ? "text-primary-foreground" : "text-primary"}`}>Udharchi</strong>
        <strong className={`block font-display text-[13px] font-black uppercase ${light ? "text-primary-foreground" : "text-primary"}`}>Enterprises</strong>
      </span>
    </a>
  );
}