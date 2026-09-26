import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
};

export function Button({ children, className, variant = "primary", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5",
        variant === "outline" && "border border-input bg-background text-foreground hover:bg-accent",
        variant === "ghost" && "bg-transparent text-foreground hover:bg-accent",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
