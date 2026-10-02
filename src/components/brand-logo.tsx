import type { FC } from "react";
import logoImg from "@/assets/sri-udharchi-enterprises-logo.png";

interface BrandLogoProps {
  light?: boolean;
  className?: string;
  showText?: boolean;
}

export const BrandLogo: FC<BrandLogoProps> = ({ light = false, className = "" }) => {
  return (
    <a
      href="/"
      className={`inline-flex shrink-0 items-center transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
      aria-label="Sri Udharchi Enterprises Home"
    >
      <img
        src={logoImg}
        alt="Sri Udharchi Enterprises"
        width={1774}
        height={887}
        className={`h-11 sm:h-12 w-auto object-contain select-none ${
          light ? "brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)]" : ""
        }`}
        loading="eager"
        decoding="async"
      />
    </a>
  );
};
