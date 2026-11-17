import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "outline" | "ghost" | "secondary" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string | undefined;
  target?: string | undefined;
  rel?: string | undefined;
}

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  type,
  href,
  target,
  rel,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
    // Sizes
    size === "sm" && "h-8 px-3 text-xs",
    size === "md" && "h-10 px-4 text-sm",
    size === "lg" && "h-12 px-6 text-base",
    size === "icon" && "size-9 p-0",
    // Variants
    variant === "primary" &&
      "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 shadow-sm active:translate-y-0",
    variant === "outline" &&
      "border border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground",
    variant === "ghost" && "bg-transparent text-foreground hover:bg-accent",
    variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    variant === "destructive" &&
      "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    className,
  );

  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={classes}
        {...(props as unknown as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type={type || "button"}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
