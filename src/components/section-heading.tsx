import type { ReactNode } from "react";
import { motion } from "motion/react";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  description,
  action,
}: {
  eyebrow: string;
  title: ReactNode;
  copy?: string;
  description?: string;
  action?: ReactNode;
}) {
  const text = copy || description;

  return (
    <motion.div
      className="mb-7 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="min-w-0">
        <span className="mb-2 inline-block rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-[11px] font-bold uppercase text-primary">
          {eyebrow}
        </span>
        <h2 className="max-w-3xl font-display text-3xl font-black leading-[1.05] text-foreground md:text-4xl">
          {title}
        </h2>
        {text && (
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {text}
          </p>
        )}
      </div>
      {action}
    </motion.div>
  );
}
