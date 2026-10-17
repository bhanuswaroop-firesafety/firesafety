import type { ProductItem } from "./types";
import extinguisherImg from "@/assets/fire-extinguisher.jpg";
import hydrantValveImg from "@/assets/hydrant-valve.jpg";
import pumpImg from "@/assets/fire-pump.jpg";
import helmetImg from "@/assets/safety-helmet.jpg";
import glovesImg from "@/assets/safety-gloves.jpg";
import cctvImg from "@/assets/cctv-camera.jpg";
import cableImg from "@/assets/cable-management.jpg";
import roadSafetyImg from "@/assets/road-safety.jpg";
import medicalSafetyImg from "@/assets/medical-safety.jpg";

/**
 * Authentic certified product catalog of Sri Udharchi Enterprises
 * These are real industrial safety and fire protection systems adhering to BIS, NBC 2016, and EN standards.
 */
export const OFFICIAL_CATALOG_PRODUCTS: Omit<ProductItem, "id">[] = [
  {
    name: "Commercial ABC Dry Chemical Fire Extinguisher",
    category: "Fire Safety",
    description:
      "Multi-purpose ABC powder extinguisher certified for Class A, B, and C fire hazards with forged brass valve and pressure gauge.",
    image: extinguisherImg,
    specs: [
      "IS 15683 Certified",
      "4-A : 60-B:C Rating",
      "Squeeze Grip Operation",
      "Epoxy Coated Cylinder",
    ],
    price: "2,450",
    unit: "unit",
    sku: "SUE-FE-ABC04",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Industrial Landing Valve & Instantaneous Coupling",
    category: "Fire Hydrant",
    description:
      "Heavy-duty flanged PN16 single outlet oblique landing valve with blank cap, chain, and handwheel for wet riser downcomers.",
    image: hydrantValveImg,
    specs: [
      "IS 5290 / BS 5041 Type A",
      "65mm (2.5 Inch) Flanged Inlet",
      "High-Grade Leaded Gunmetal / Brass",
      "Hydrostatic Tested to 21 Bar",
    ],
    price: "3,800",
    unit: "piece",
    sku: "SUE-FH-LV65",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Industrial Centrifugal End-Suction Fire Pump Skid",
    category: "Fire Pumps",
    description:
      "Skid-mounted high-pressure electric motor driven centrifugal fire booster pump with automated pressure sensing control manifold.",
    image: pumpImg,
    specs: [
      "NBC 2016 Compliant",
      "Capacity: 1620 LPM (430 GPM)",
      "Pressure Head: 7 Bar to 12 Bar",
      "ABB Heavy Industrial Motor",
    ],
    price: "68,000",
    unit: "set",
    sku: "SUE-FP-SKID01",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "High-Visibility Industrial Safety Hard Hat",
    category: "PPE",
    description:
      "Impact-absorbing high-density polyethylene construction helmet with reflective micro-prismatic bands and 4-point chin strap.",
    image: helmetImg,
    specs: [
      "IS 2925 / EN 397 Certified",
      "UV-Resistant Polyethylene Shell",
      "Side Slots for Earmuffs / Visor",
      "Ratchet Size Adjustment (53-64cm)",
    ],
    price: "380",
    unit: "piece",
    sku: "SUE-PPE-HH01",
    minOrderQty: "5",
    inStock: true,
    featured: false,
  },
  {
    name: "Heavy-Duty Kevlar & Cowhide Work Gloves",
    category: "PPE",
    description:
      "Heat and cut-resistant protective work gloves with reinforced palm grip, Kevlar stitching, and fluorescent reflective safety cuffs.",
    image: glovesImg,
    specs: [
      "EN 388 Level 4 Cut Resistance",
      "Reinforced Kevlar Seams",
      "Split Cowhide Leather Palms",
      "Vibration & Puncture Resistant",
    ],
    price: "450",
    unit: "pair",
    sku: "SUE-PPE-GL02",
    minOrderQty: "10",
    inStock: true,
    featured: false,
  },
  {
    name: "Explosion-Proof Dome IP CCTV Security Camera",
    category: "CCTV",
    description:
      "Vandal-proof 4K ultra-HD optical dome camera with Smart Infrared night vision and IP67 weatherproof industrial housing.",
    image: cctvImg,
    specs: [
      "4K (8MP) Ultra HD Resolution",
      "Smart IR Range up to 40m",
      "H.265+ Compression Efficiency",
      "IK10 Vandal-Proof / IP67 Rated",
    ],
    price: "4,200",
    unit: "camera",
    sku: "SUE-SEC-CCTV04",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },
  {
    name: "Perforated Galvanized Industrial Cable Tray",
    category: "Cable Management",
    description:
      "Hot-dip galvanized (GI) perforated cable tray designed for neat electrical wire routing, high thermal dissipation, and corrosion prevention.",
    image: cableImg,
    specs: [
      "IS 2629 Hot-Dip Galvanized",
      "Width: 150mm - 600mm",
      "2-Hour Fire Integrity Rating",
      "Includes Coupler Plates & Fasteners",
    ],
    price: "850",
    unit: "meter",
    sku: "SUE-CM-CTGI",
    minOrderQty: "10",
    inStock: true,
    featured: false,
  },
  {
    name: "Heavy-Base Reflective Traffic Safety Cones",
    category: "Road Safety",
    description:
      "High-flexibility PVC road safety cones with weighted rubber base to resist wind turbulence, fitted with dual prismatic reflective collars.",
    image: roadSafetyImg,
    specs: [
      "Height: 750mm (30 Inch)",
      "High-Intensity Prismatic Sleeves",
      "UV Stabilized No-Fade Material",
      "Tough Recycled Rubber Base",
    ],
    price: "550",
    unit: "piece",
    sku: "SUE-RS-CONE75",
    minOrderQty: "4",
    inStock: true,
    featured: false,
  },
  {
    name: "Workplace Emergency First Aid & Burn Trauma Kit",
    category: "Medical Safety",
    description:
      "Comprehensive wall-mountable and portable medical emergency kit equipped with burn dressings, antiseptic sprays, eye wash, and trauma shears.",
    image: medicalSafetyImg,
    specs: [
      "Factories Act 1948 Compliant",
      "Waterproof & Dustproof Case",
      "Contains 60+ Essential Medical Items",
      "Quick-Release Wall Bracket",
    ],
    price: "1,850",
    unit: "kit",
    sku: "SUE-MS-FAK50",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
];

export const DEFAULT_PRODUCTS: ProductItem[] = OFFICIAL_CATALOG_PRODUCTS.map((p, idx) => ({
  id: `sue-cat-${idx + 1}`,
  ...p,
}));

export const FEATURED_ID_MAP: Record<string, string> = {
  "def-extinguisher": "sue-cat-1",
  "def-hydrant-valve": "sue-cat-2",
  "def-fire-pump": "sue-cat-3",
  "def-safety-helmet": "sue-cat-4",
  "def-safety-gloves": "sue-cat-5",
  "def-cctv-camera": "sue-cat-6",
};
