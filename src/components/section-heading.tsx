import type { ReactNode } from "react";

export function SectionHeading({ eyebrow, title, copy, action }: { eyebrow: string; title: ReactNode; copy?: string; action?: ReactNode }) {
  return (
    <div className="mb-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase text-primary">{eyebrow}</span>
        <h2 className="max-w-3xl font-display text-3xl font-black leading-[1.05] text-foreground md:text-4xl">{title}</h2>
        {copy && <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">{copy}</p>}
      </div>
      {action}
    </div>
  );
}