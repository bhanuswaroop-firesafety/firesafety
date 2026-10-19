import React from "react";
import {
  Flame,
  Droplets,
  Gauge,
  HardHat,
  Zap,
  TrafficCone,
  BriefcaseMedical,
  LifeBuoy,
  Cctv,
  Cable,
  ShieldCheck,
  Wrench,
  Boxes,
  MapPin,
  Award,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

export type NanoIconName =
  | "fire"
  | "hydrant"
  | "pump"
  | "helmet"
  | "zap"
  | "road"
  | "medical"
  | "marine"
  | "cctv"
  | "cable"
  | "shield"
  | "wrench"
  | "boxes"
  | "map"
  | "award";

interface NanoIconProps {
  name: NanoIconName;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animate?: boolean;
}

const iconComponentMap: Record<NanoIconName, { icon: LucideIcon; defaultColor: string }> = {
  fire: { icon: Flame, defaultColor: "text-amber-500" },
  hydrant: { icon: Droplets, defaultColor: "text-blue-500" },
  pump: { icon: Gauge, defaultColor: "text-red-500" },
  helmet: { icon: HardHat, defaultColor: "text-amber-600" },
  zap: { icon: Zap, defaultColor: "text-yellow-500" },
  road: { icon: TrafficCone, defaultColor: "text-orange-500" },
  medical: { icon: BriefcaseMedical, defaultColor: "text-emerald-500" },
  marine: { icon: LifeBuoy, defaultColor: "text-cyan-500" },
  cctv: { icon: Cctv, defaultColor: "text-indigo-500" },
  cable: { icon: Cable, defaultColor: "text-sky-500" },
  shield: { icon: ShieldCheck, defaultColor: "text-emerald-600" },
  wrench: { icon: Wrench, defaultColor: "text-slate-600 dark:text-slate-300" },
  boxes: { icon: Boxes, defaultColor: "text-purple-500" },
  map: { icon: MapPin, defaultColor: "text-rose-500" },
  award: { icon: Award, defaultColor: "text-amber-500" },
};

const sizeMap = {
  sm: "size-4 sm:size-4.5",
  md: "size-5 sm:size-6",
  lg: "size-7 sm:size-8",
  xl: "size-9 sm:size-10",
};

export function NanoIcon({ name, size = "md", className = "", animate = true }: NanoIconProps) {
  const config = iconComponentMap[name] || iconComponentMap.shield;
  const IconComponent = config.icon;
  const sizeClass = sizeMap[size] || sizeMap.md;

  const content = (
    <IconComponent
      className={`${sizeClass} ${config.defaultColor} ${className}`}
      strokeWidth={2.2}
      aria-hidden="true"
    />
  );

  if (!animate) {
    return <span className="inline-flex items-center justify-center shrink-0">{content}</span>;
  }

  return (
    <motion.span
      whileHover={{ scale: 1.12, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center justify-center shrink-0"
    >
      {content}
    </motion.span>
  );
}
