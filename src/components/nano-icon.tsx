import React from "react";
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

const sizeMap = {
  sm: "size-6",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
};

export function NanoIcon({ name, size = "md", className = "", animate = true }: NanoIconProps) {
  const sizeClass = sizeMap[size];

  const renderSvg = () => {
    switch (name) {
      case "fire":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.45)]">
            <defs>
              <linearGradient id="fire-outer" x1="32" y1="60" x2="32" y2="4" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="50%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="fire-inner" x1="32" y1="56" x2="32" y2="18" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="60%" stopColor="#FBBF24" />
                <stop offset="100%" stopColor="#FEF08A" />
              </linearGradient>
              <linearGradient id="fire-core" x1="32" y1="54" x2="32" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="100%" stopColor="#FFFFFF" />
              </linearGradient>
              <filter id="fire-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="glow" />
                <feComposite in="SourceGraphic" in2="glow" operator="over" />
              </filter>
            </defs>
            {/* Outer flame */}
            <path
              d="M32 4C32 4 44 18 44 32C44 41 38.6 48 32 50C25.4 48 20 41 20 32C20 18 32 4 32 4Z"
              fill="url(#fire-outer)"
              filter="url(#fire-glow)"
            />
            {/* Secondary tongue */}
            <path
              d="M33 12C33 12 48 24 47 40C46 48 40 54 32 57C24 54 18 48 17 40C16 26 31 16 33 12Z"
              fill="url(#fire-outer)"
              opacity="0.85"
            />
            {/* Inner radiant flame */}
            <path
              d="M32 18C32 18 40 28 40 38C40 45 36 50 32 52C28 50 24 45 24 38C24 28 32 18 32 18Z"
              fill="url(#fire-inner)"
            />
            {/* White-hot spark core */}
            <path
              d="M32 28C32 28 36 35 36 42C36 47 34 50 32 51C30 50 28 47 28 42C28 35 32 28 32 28Z"
              fill="url(#fire-core)"
            />
            {/* Floating embers */}
            <circle cx="21" cy="22" r="1.5" fill="#FDE047" opacity="0.9" />
            <circle cx="43" cy="18" r="2" fill="#F59E0B" opacity="0.8" />
            <circle cx="38" cy="10" r="1" fill="#FEF08A" opacity="0.9" />
          </svg>
        );

      case "hydrant":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(220,38,38,0.45)]">
            <defs>
              <linearGradient id="hydrant-body" x1="16" y1="20" x2="48" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#DC2626" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
              <linearGradient id="hydrant-brass" x1="18" y1="8" x2="46" y2="24" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="40%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#CA8A04" />
              </linearGradient>
              <linearGradient id="hydrant-cap" x1="8" y1="32" x2="20" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
            </defs>
            {/* Base Flange */}
            <ellipse cx="32" cy="56" rx="18" ry="5" fill="#7F1D1D" />
            <path d="M16 54C16 54 18 51 22 50H42C46 51 48 54 48 54V57H16V54Z" fill="url(#hydrant-body)" />
            {/* Vertical Column */}
            <rect x="22" y="24" width="20" height="28" rx="4" fill="url(#hydrant-body)" />
            <rect x="24" y="26" width="3" height="24" rx="1.5" fill="#F87171" opacity="0.6" />
            {/* Side Port Left */}
            <path d="M22 34H12C10.5 34 9 35.5 9 37V41C9 42.5 10.5 44 12 44H22V34Z" fill="url(#hydrant-body)" />
            <circle cx="10" cy="39" r="4.5" fill="url(#hydrant-cap)" />
            {/* Side Port Right */}
            <path d="M42 34H52C53.5 34 55 35.5 55 37V41C55 42.5 53.5 44 52 44H42V34Z" fill="url(#hydrant-body)" />
            <circle cx="54" cy="39" r="4.5" fill="url(#hydrant-cap)" />
            {/* Bonnet / Top dome */}
            <path d="M20 24C20 18 25 15 32 15C39 15 44 18 44 24H20Z" fill="url(#hydrant-body)" />
            <rect x="29" y="10" width="6" height="6" rx="1" fill="url(#hydrant-brass)" />
            {/* Handwheel Top Nut */}
            <ellipse cx="32" cy="10" rx="10" ry="3.5" fill="url(#hydrant-brass)" />
            <ellipse cx="32" cy="9.5" rx="4" ry="1.5" fill="#FEF08A" />
            {/* Water drop accent */}
            <path d="M46 16C46 16 50 19 50 21C50 23.2 48.2 25 46 25C43.8 25 42 23.2 42 21C42 19 46 16 46 16Z" fill="#38BDF8" opacity="0.85" />
          </svg>
        );

      case "pump":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.45)]">
            <defs>
              <linearGradient id="pump-red" x1="10" y1="20" x2="54" y2="50" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="50%" stopColor="#B91C1C" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
              <linearGradient id="pump-metal" x1="20" y1="12" x2="52" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="50%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#0369A1" />
              </linearGradient>
              <linearGradient id="pump-skid" x1="8" y1="52" x2="56" y2="60" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1E293B" />
              </linearGradient>
            </defs>
            {/* Steel Skid Bed */}
            <rect x="8" y="52" width="48" height="6" rx="2" fill="url(#pump-skid)" />
            <rect x="12" y="50" width="8" height="3" fill="#64748B" />
            <rect x="44" y="50" width="8" height="3" fill="#64748B" />
            {/* Electric Motor body */}
            <rect x="10" y="24" width="22" height="24" rx="4" fill="url(#pump-red)" />
            {/* Cooling fins */}
            <line x1="14" y1="28" x2="14" y2="44" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="18" y1="28" x2="18" y2="44" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            <line x1="22" y1="28" x2="22" y2="44" stroke="#FCA5A5" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
            {/* Terminal box */}
            <rect x="14" y="18" width="12" height="6" rx="1.5" fill="#1E293B" />
            {/* Shaft coupling */}
            <rect x="32" y="32" width="6" height="8" rx="1" fill="#94A3B8" />
            {/* Volute Casing (Pump head) */}
            <circle cx="44" cy="36" r="12" fill="url(#pump-red)" />
            <circle cx="44" cy="36" r="8" fill="url(#pump-metal)" opacity="0.9" />
            {/* Swirling impeller blades */}
            <path d="M44 32C46 34 46 38 44 40M40 36C42 38 46 38 48 36" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" />
            {/* Discharge Flange */}
            <rect x="41" y="14" width="6" height="10" fill="url(#pump-red)" />
            <ellipse cx="44" cy="14" rx="6" ry="2" fill="#FCA5A5" />
          </svg>
        );

      case "helmet":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(234,179,8,0.45)]">
            <defs>
              <linearGradient id="helmet-gold" x1="14" y1="12" x2="52" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="30%" stopColor="#FACC15" />
                <stop offset="80%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>
              <linearGradient id="helmet-visor" x1="16" y1="34" x2="48" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#0369A1" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Main Crown Dome */}
            <path
              d="M14 36C14 20 22 14 32 14C42 14 50 20 50 36C50 38 48 40 46 40H18C16 40 14 38 14 36Z"
              fill="url(#helmet-gold)"
            />
            {/* Reinforced Center Ridge */}
            <path d="M28 14C28 14 30 24 30 36H34C34 24 36 14 36 14C34.5 13.5 33.5 13.5 32 13.5C30.5 13.5 29.5 13.5 28 14Z" fill="#FEF08A" />
            {/* Glossy Curved Highlight */}
            <path d="M20 22C24 18 36 17 44 22" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.75" />
            {/* Wide Brim */}
            <path
              d="M8 40C8 38 12 37 18 37H46C52 37 56 38 56 40C56 43 50 44 46 44H18C14 44 8 43 8 40Z"
              fill="#CA8A04"
            />
            <path d="M12 40C12 39 16 38 22 38H42C48 38 52 39 52 40H12Z" fill="#FDE047" />
            {/* Reflective band */}
            <path d="M16 32H48C48 34 46 35 44 35H20C18 35 16 34 16 32Z" fill="#FFFFFF" opacity="0.9" />
            {/* Chin Strap */}
            <path d="M20 42L28 54C30 56 34 56 36 54L44 42" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <rect x="29" y="52" width="6" height="3" rx="1" fill="#1E293B" />
          </svg>
        );

      case "zap":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(250,204,21,0.5)]">
            <defs>
              <linearGradient id="zap-grad" x1="18" y1="6" x2="46" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="30%" stopColor="#FEF08A" />
                <stop offset="70%" stopColor="#FACC15" />
                <stop offset="100%" stopColor="#EA580C" />
              </linearGradient>
              <linearGradient id="zap-shield-bg" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            {/* Shield backing */}
            <path
              d="M32 6L48 12V28C48 40 40 50 32 56C24 50 16 40 16 28V12L32 6Z"
              fill="url(#zap-shield-bg)"
              stroke="#38BDF8"
              strokeWidth="2"
              opacity="0.8"
            />
            {/* 3D Bolt */}
            <path
              d="M35 12L21 32H33L29 52L45 28H32L35 12Z"
              fill="url(#zap-grad)"
            />
            {/* Specular inner flash */}
            <path
              d="M34 16L24 32H33L31 46L41 29H31L34 16Z"
              fill="#FFFFFF"
              opacity="0.6"
            />
            {/* Electrical Sparks */}
            <circle cx="16" cy="22" r="1.5" fill="#38BDF8" />
            <circle cx="48" cy="36" r="1.5" fill="#FDE047" />
          </svg>
        );

      case "road":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.45)]">
            <defs>
              <linearGradient id="cone-orange" x1="20" y1="8" x2="44" y2="54" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="40%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>
              <linearGradient id="cone-base" x1="10" y1="50" x2="54" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#7C2D12" />
              </linearGradient>
            </defs>
            {/* Heavy Base Plate */}
            <path d="M12 50L18 48H46L52 50L54 56H10L12 50Z" fill="url(#cone-base)" />
            <ellipse cx="32" cy="56" rx="22" ry="4" fill="#431407" />
            {/* Cone Body Bottom Tier */}
            <path d="M22 48L24 38H40L42 48H22Z" fill="url(#cone-orange)" />
            {/* White Reflective Band 1 */}
            <path d="M24 38L26 30H38L40 38H24Z" fill="#F1F5F9" />
            <path d="M26 36L27 31H37L38 36H26Z" fill="#FFFFFF" />
            {/* Orange Mid Tier */}
            <path d="M26 30L27 24H37L38 30H26Z" fill="url(#cone-orange)" />
            {/* White Reflective Band 2 */}
            <path d="M27 24L29 18H35L37 24H27Z" fill="#F8FAFC" />
            {/* Top Orange Peak */}
            <path d="M29 18L32 9C32 9 32.5 8 33 9L35 18H29Z" fill="url(#cone-orange)" />
            {/* Top rounded tip */}
            <circle cx="32" cy="9" r="2" fill="#FED7AA" />
            {/* Highlight line down left side */}
            <path d="M25 46L30 14" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        );

      case "medical":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.4)]">
            <defs>
              <linearGradient id="med-case" x1="12" y1="16" x2="52" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
              <linearGradient id="med-cross" x1="26" y1="24" x2="38" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>
            </defs>
            {/* Chrome Handle */}
            <path d="M24 18V12C24 10.5 25.5 9 27 9H37C38.5 9 40 10.5 40 12V18" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
            <path d="M26 18V13H38V18" stroke="#E2E8F0" strokeWidth="2" strokeLinecap="round" />
            {/* Case Body */}
            <rect x="10" y="18" width="44" height="36" rx="8" fill="url(#med-case)" />
            {/* Drop shadow crease */}
            <line x1="10" y1="36" x2="54" y2="36" stroke="#94A3B8" strokeWidth="1.5" opacity="0.5" />
            {/* Corner Bumpers */}
            <path d="M10 26C10 21.5 13.5 18 18 18" stroke="#CBD5E1" strokeWidth="3" />
            <path d="M54 26C54 21.5 50.5 18 46 18" stroke="#CBD5E1" strokeWidth="3" />
            {/* Red Cross Symbol */}
            <path
              d="M28 26H36V32H42V38H36V44H28V38H22V32H28V26Z"
              fill="url(#med-cross)"
            />
            {/* Gloss shine */}
            <path d="M14 22H50C51 22 52 23 52 24V28L12 28V24C12 23 13 22 14 22Z" fill="#FFFFFF" opacity="0.6" />
          </svg>
        );

      case "marine":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.45)]">
            <defs>
              <linearGradient id="buoy-orange" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="50%" stopColor="#EA580C" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>
            </defs>
            {/* Water Wave Base */}
            <path d="M8 52C14 50 18 54 24 52C30 50 34 54 40 52C46 50 50 54 56 52" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
            {/* Lifebuoy Ring Outer */}
            <circle cx="32" cy="30" r="20" fill="url(#buoy-orange)" />
            {/* Lifebuoy Center Hole */}
            <circle cx="32" cy="30" r="10" fill="#0F172A" />
            {/* White Quarters */}
            <path d="M32 10C37.5 10 42 12 45 15L39 21C37.5 19.5 35 18 32 18V10Z" fill="#F8FAFC" />
            <path d="M32 50C26.5 50 22 48 19 45L25 39C26.5 40.5 29 42 32 42V50Z" fill="#F8FAFC" />
            <path d="M12 30C12 24.5 14 20 17 17L23 23C21.5 24.5 20 27 20 30H12Z" fill="#F8FAFC" />
            <path d="M52 30C52 35.5 50 40 47 43L41 37C42.5 35.5 44 33 44 30H52Z" fill="#F8FAFC" />
            {/* Grab Rope Bands */}
            <circle cx="32" cy="30" r="23" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="6 8" />
          </svg>
        );

      case "cctv":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(56,189,248,0.45)]">
            <defs>
              <linearGradient id="cctv-base" x1="12" y1="12" x2="52" y2="30" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="60%" stopColor="#E2E8F0" />
                <stop offset="100%" stopColor="#94A3B8" />
              </linearGradient>
              <linearGradient id="cctv-lens" x1="20" y1="28" x2="44" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="60%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#0284C7" />
              </linearGradient>
            </defs>
            {/* Ceiling Mounting Plate */}
            <rect x="12" y="10" width="40" height="8" rx="3" fill="url(#cctv-base)" />
            <ellipse cx="32" cy="18" rx="20" ry="3" fill="#64748B" />
            {/* Dome Housing Upper */}
            <path d="M16 18C16 18 14 26 18 30H46C50 26 48 18 48 18H16Z" fill="url(#cctv-base)" />
            {/* Optical Glass Dome */}
            <path
              d="M16 30C16 42 23 52 32 52C41 52 48 42 48 30H16Z"
              fill="url(#cctv-lens)"
            />
            {/* Camera Lens Core */}
            <circle cx="32" cy="38" r="8" fill="#0284C7" />
            <circle cx="32" cy="38" r="5" fill="#38BDF8" opacity="0.9" />
            <circle cx="32" cy="38" r="2.5" fill="#FFFFFF" />
            {/* Infrared Night Vision Array */}
            <circle cx="24" cy="33" r="1.5" fill="#EF4444" />
            <circle cx="40" cy="33" r="1.5" fill="#EF4444" />
            {/* Dome Glass Specular Arc */}
            <path d="M20 34C22 42 27 47 32 47" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" opacity="0.65" />
          </svg>
        );

      case "cable":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(99,102,241,0.45)]">
            <defs>
              <linearGradient id="cable-ladder" x1="10" y1="16" x2="54" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E2E8F0" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
            </defs>
            {/* Left Main Rail */}
            <rect x="12" y="12" width="6" height="40" rx="2" fill="url(#cable-ladder)" />
            {/* Right Main Rail */}
            <rect x="46" y="12" width="6" height="40" rx="2" fill="url(#cable-ladder)" />
            {/* Cross Rungs */}
            <rect x="18" y="18" width="28" height="4" rx="1" fill="#64748B" />
            <rect x="18" y="28" width="28" height="4" rx="1" fill="#64748B" />
            <rect x="18" y="38" width="28" height="4" rx="1" fill="#64748B" />
            {/* Perforations */}
            <circle cx="24" cy="20" r="1" fill="#0F172A" />
            <circle cx="32" cy="20" r="1" fill="#0F172A" />
            <circle cx="40" cy="20" r="1" fill="#0F172A" />
            <circle cx="24" cy="30" r="1" fill="#0F172A" />
            <circle cx="32" cy="30" r="1" fill="#0F172A" />
            <circle cx="40" cy="30" r="1" fill="#0F172A" />
            {/* Colorful High-Voltage & Data Cables Running Through */}
            <path d="M22 8V56" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M28 8V56" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M34 8V56" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M40 8V56" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case "shield":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.45)]">
            <defs>
              <linearGradient id="shield-armor" x1="12" y1="8" x2="52" y2="56" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#059669" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="shield-rim" x1="10" y1="6" x2="54" y2="58" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE047" />
                <stop offset="60%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#B45309" />
              </linearGradient>
            </defs>
            {/* Golden Beveled Outer Shield */}
            <path
              d="M32 6L52 14V28C52 42 42 53 32 58C22 53 12 42 12 28V14L32 6Z"
              fill="url(#shield-rim)"
            />
            {/* Emerald Inner Shield */}
            <path
              d="M32 10L48 17V28C48 39 40 49 32 53C24 49 16 39 16 28V17L32 10Z"
              fill="url(#shield-armor)"
            />
            {/* Pristine White Diamond Checkmark */}
            <path
              d="M24 29L30 35L42 22"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Specular Highlight */}
            <path d="M20 18L32 13V50C25 46 18 37 18 28V18" fill="#FFFFFF" opacity="0.2" />
          </svg>
        );

      case "wrench":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.4)]">
            <defs>
              <linearGradient id="wrench-chrome" x1="14" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F8FAFC" />
                <stop offset="40%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#475569" />
              </linearGradient>
              <linearGradient id="grip-orange" x1="20" y1="20" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="100%" stopColor="#C2410C" />
              </linearGradient>
            </defs>
            {/* Industrial Tool - Heavy Torque Wrench */}
            <path
              d="M48 12C45 12 42 13 40 15L35 20L44 29L49 24C51 22 52 19 52 16C52 14 50 12 48 12Z"
              fill="url(#wrench-chrome)"
            />
            {/* Open Jaw */}
            <path d="M46 12C44 14 44 18 46 20C48 22 52 22 54 20" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
            {/* Shaft */}
            <path d="M37 22L17 42C15 44 15 47 17 49C19 51 22 51 24 49L44 29L37 22Z" fill="url(#wrench-chrome)" />
            {/* Ergonomic grip */}
            <rect x="20" y="36" width="16" height="6" rx="2" transform="rotate(-45 20 36)" fill="url(#grip-orange)" />
            {/* Steel Specular Highlight */}
            <line x1="26" y1="36" x2="38" y2="24" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
          </svg>
        );

      case "boxes":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(139,92,246,0.45)]">
            <defs>
              <linearGradient id="cube-top" x1="16" y1="12" x2="48" y2="28" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient id="cube-left" x1="12" y1="26" x2="32" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#5B21B6" />
              </linearGradient>
              <linearGradient id="cube-right" x1="32" y1="26" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#6D28D9" />
                <stop offset="100%" stopColor="#4C1D95" />
              </linearGradient>
            </defs>
            {/* Top diamond facet */}
            <path d="M32 10L50 20L32 30L14 20L32 10Z" fill="url(#cube-top)" />
            {/* Left facet */}
            <path d="M14 20L32 30V52L14 42V20Z" fill="url(#cube-left)" />
            {/* Right facet */}
            <path d="M32 30L50 20V42L32 52V30Z" fill="url(#cube-right)" />
            {/* Glowing safety emblem inside */}
            <circle cx="32" cy="20" r="3.5" fill="#FDE047" />
            <path d="M32 30L32 52" stroke="#A78BFA" strokeWidth="1.5" opacity="0.7" />
          </svg>
        );

      case "map":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(239,68,68,0.45)]">
            <defs>
              <linearGradient id="pin-red" x1="18" y1="8" x2="46" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#F87171" />
                <stop offset="40%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
            </defs>
            {/* Ground Radar Pulse */}
            <ellipse cx="32" cy="54" rx="14" ry="4" fill="#EF4444" opacity="0.2" />
            <ellipse cx="32" cy="54" rx="8" ry="2.5" fill="#EF4444" opacity="0.5" />
            {/* Location Pin Head */}
            <path
              d="M32 8C22 8 14 16 14 26C14 38 32 52 32 52C32 52 50 38 50 26C50 16 42 8 32 8Z"
              fill="url(#pin-red)"
            />
            {/* Inner Lens */}
            <circle cx="32" cy="25" r="7" fill="#FFFFFF" />
            <circle cx="32" cy="25" r="4.5" fill="#1E293B" />
            {/* Specular Highlight */}
            <path d="M20 20C22 14 28 11 34 11" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        );

      case "award":
        return (
          <svg viewBox="0 0 64 64" fill="none" className="size-full filter drop-shadow-[0_4px_12px_rgba(234,179,8,0.45)]">
            <defs>
              <linearGradient id="gold-medal" x1="16" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="40%" stopColor="#FACC15" />
                <stop offset="80%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#A16207" />
              </linearGradient>
            </defs>
            {/* Ribbons */}
            <path d="M26 38L20 54L30 48L36 54L32 38" fill="#DC2626" />
            <path d="M38 38L32 54L42 48L48 54L44 38" fill="#B91C1C" />
            {/* Medallion */}
            <circle cx="32" cy="26" r="16" fill="url(#gold-medal)" stroke="#FEF08A" strokeWidth="2" />
            <circle cx="32" cy="26" r="12" fill="#EAB308" />
            {/* Star Emblem */}
            <polygon
              points="32,18 34.5,23.5 40.5,24 36,28 37.5,34 32,30.5 26.5,34 28,28 23.5,24 29.5,23.5"
              fill="#FFFFFF"
            />
          </svg>
        );

      default:
        return null;
    }
  };

  if (!animate) {
    return <div className={`inline-block ${sizeClass} ${className}`}>{renderSvg()}</div>;
  }

  return (
    <motion.div
      whileHover={{ scale: 1.12, rotate: [0, -3, 3, 0], transition: { duration: 0.3 } }}
      whileTap={{ scale: 0.94 }}
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeClass} ${className}`}
    >
      {renderSvg()}
    </motion.div>
  );
}
