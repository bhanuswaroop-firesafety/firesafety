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
import hydrantSystemImg from "@/assets/fire-hydrant-system.jpg";
import safetyProductsImg from "@/assets/safety-products.jpg";
import commercialImg from "@/assets/commercial-buildings.jpg";
import constructionImg from "@/assets/construction.jpg";
import warehousesImg from "@/assets/warehouses.jpg";
import hospitalsImg from "@/assets/hospitals.jpg";
import schoolsImg from "@/assets/schools.jpg";
import hotelsImg from "@/assets/hotels.jpg";

/**
 * Authentic certified product catalog of Sri Udharchi Enterprises
 * These are real industrial safety and fire protection systems mapped to client application sectors:
 * Apartments, Buses & Cars, Electrical / Server Room, Educational Institutions, Factories,
 * Fire Accessories, Home, Hospitals, Offices, Restaurants, Renewals.
 */
export const OFFICIAL_CATALOG_PRODUCTS: Omit<ProductItem, "id">[] = [
  // 1. APARTMENTS
  {
    name: "Residential High-Rise ABC Fire Extinguisher Station (4kg / 6kg)",
    category: "Apartments",
    description:
      "ISI/BIS certified ABC powder extinguisher with wall mounting bracket for residential apartment corridors, lobbies, and basement parking.",
    image: extinguisherImg,
    specs: [
      "IS 15683 / NBC 2016 Certified",
      "Epoxy Polyester Powder Coating",
      "Controlled Discharge Forged Valve",
      "Wall Clamp & Mounting Bracket Included",
    ],
    price: "2,450",
    unit: "unit",
    sku: "SUE-APT-FE04",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Apartment Wet Riser Hydrant Landing Valve & Hose Reel Cabinet",
    category: "Apartments",
    description:
      "Multi-story residential wet riser landing valve with instantaneous coupling and 30m swing fire hose reel assembly.",
    image: hydrantValveImg,
    specs: [
      "IS 5290 Gunmetal Landing Valve",
      "30m High-Pressure Rubber Hose Reel",
      "Lockable Red Powder-Coated Cabinet",
      "Hydrostatically Tested to 21 Bar",
    ],
    price: "8,900",
    unit: "set",
    sku: "SUE-APT-HR30",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },
  {
    name: "Multi-Apartment Optical Smoke & Heat Detector System",
    category: "Apartments",
    description:
      "Addressable photoelectric smoke detector for residential building corridors, staircase shafts, and lift lobbies.",
    image: safetyProductsImg,
    specs: [
      "EN 54 / IS 11360 Compliant",
      "Built-in 85dB Audio Alarm Buzzer",
      "360° Visual Alarm Indicator LED",
      "Low Power Battery Backup Mode",
    ],
    price: "1,250",
    unit: "piece",
    sku: "SUE-APT-SMK01",
    minOrderQty: "2",
    inStock: true,
    featured: false,
  },

  // 2. BUSES & CARS
  {
    name: "Vehicle Compact Dry Powder Extinguisher with Metal Clamp (2kg)",
    category: "Buses & Cars",
    description:
      "Vibration-resistant compact dry chemical powder extinguisher engineered specifically for commercial buses, cars, vans, and fleet logistics.",
    image: extinguisherImg,
    specs: [
      "AIS 135 & IS 15683 Automotive Standard",
      "Heavy-Duty Anti-Vibration Metal Bracket",
      "Suitable for Class A, B, C & Electrical Fires",
      "Instant Trigger Release Grip",
    ],
    price: "1,450",
    unit: "unit",
    sku: "SUE-AUTO-EXT02",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Commercial Bus Engine Automatic Fire Detection & Suppression Tube",
    category: "Buses & Cars",
    description:
      "Pneumatic polymer sensor tubing that automatically bursts and floods extinguishing agent directly inside bus engine compartments upon thermal flare-up.",
    image: cableImg,
    specs: [
      "Direct Low Pressure (DLP) Firetrace System",
      "Thermal Activation at 120°C - 160°C",
      "Non-Corrosive Clean Agent Clean Discharge",
      "No Electrical Power Required",
    ],
    price: "14,500",
    unit: "kit",
    sku: "SUE-AUTO-DLP01",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },

  // 3. ELECTRICAL / SERVER ROOM
  {
    name: "CO2 Clean Agent Non-Conductive Extinguisher (4.5kg Aluminum / Steel)",
    category: "Electrical / Server Room",
    description:
      "Residue-free CO2 discharge extinguisher specifically formulated for data centers, server racks, switchgear rooms, and electrical distribution panels.",
    image: extinguisherImg,
    specs: [
      "IS 15683 / PESO Approved Gas Cylinder",
      "Zero Residue / Non-Damaging to Electronics",
      "Electrically Non-Conductive Discharge Horn",
      "Discharge Time: 12 - 15 Seconds",
    ],
    price: "4,650",
    unit: "unit",
    sku: "SUE-SRV-CO204",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "High-Voltage Electrical Insulating Safety Rubber Matting (Class B)",
    category: "Electrical / Server Room",
    description:
      "Heavy-duty dielectric insulating rubber mat for substation switchboard panels, transformer rooms, and HT/LT electrical panels.",
    image: glovesImg,
    specs: [
      "IS 15652 Certified Dielectric Matting",
      "Withstand Voltage: Up to 33,000V (33 kV)",
      "Flame Retardant & Acid/Oil Resistant",
      "Anti-Skid Chequered Grip Surface",
    ],
    price: "2,200",
    unit: "meter",
    sku: "SUE-EL-MAT33",
    minOrderQty: "2",
    inStock: true,
    featured: false,
  },
  {
    name: "Perforated Hot-Dip Galvanized Cable Tray for Server Wiring",
    category: "Electrical / Server Room",
    description:
      "Heavy gauge perforated cable tray for fire-safe electrical routing, high heat dissipation, and structured data center cable management.",
    image: cableImg,
    specs: [
      "IS 2629 Hot-Dip Galvanized Coating",
      "Width: 150mm - 600mm",
      "2-Hour Thermal Integrity Rating",
      "Includes Coupler Plates & Earth Bonding Clips",
    ],
    price: "850",
    unit: "meter",
    sku: "SUE-CM-CTGI",
    minOrderQty: "5",
    inStock: true,
    featured: false,
  },

  // 4. EDUCATIONAL INSTITUTIONS
  {
    name: "School & University Campus ABC Fire Station Stand (6kg)",
    category: "Educational Institutions",
    description:
      "Corridor safety package with protective extinguisher housing, multilingual instructional safety board, and tamper-evident pull seal for schools and colleges.",
    image: schoolsImg,
    specs: [
      "NBC 2016 Part 4 Institutional Class",
      "Dual Language (English + Telugu/Hindi) Graphics",
      "Child-Safe Tamper Evident Inspection Seal",
      "Wall Stanchion Heavy Steel Bracket",
    ],
    price: "3,100",
    unit: "set",
    sku: "SUE-EDU-STA06",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },
  {
    name: "Laboratory Chemical Spill Neutralizer & Acid Vapor Trauma Kit",
    category: "Educational Institutions",
    description:
      "Chemistry and research laboratory emergency spill absorption kit containing neutralizing granules, splash goggles, and chemical neoprene gloves.",
    image: medicalSafetyImg,
    specs: [
      "Absorbs up to 20 Liters of Acids / Solvents",
      "Universal Color-Changing Neutralizer",
      "High-Density Chemical Scoop & Disposal Bags",
      "Wall-Mountable Molded Weatherproof Box",
    ],
    price: "3,750",
    unit: "kit",
    sku: "SUE-EDU-SPL20",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },

  // 5. FACTORIES
  {
    name: "Industrial Centrifugal End-Suction Fire Pump Skid System",
    category: "Factories",
    description:
      "NBC 2016 compliant heavy-duty main electric motor driven centrifugal fire pump with automatic pressure sensing manifold and control panel for industrial plants.",
    image: pumpImg,
    specs: [
      "Flow Capacity: 1620 LPM (430 GPM)",
      "Pressure Head: 7 Bar to 12 Bar",
      "Heavy Industrial ABB 3-Phase Motor",
      "Auto Pressure Sustaining & Relief Valve",
    ],
    price: "68,000",
    unit: "set",
    sku: "SUE-FP-SKID01",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Heavy Mechanical Foam 50L Trolley-Mounted Fire Extinguisher",
    category: "Factories",
    description:
      "Large-capacity mobile AFFF foam extinguisher for manufacturing facilities, chemical plants, petroleum storage, and industrial workshops.",
    image: extinguisherImg,
    specs: [
      "IS 13386 Certified Heavy Steel Vessel",
      "50 Liter Capacity with 5m Braided Discharge Hose",
      "Solid Rubber All-Terrain Heavy Wheel Base",
      "Internal CO2 High-Pressure Gas Cartridge",
    ],
    price: "18,900",
    unit: "unit",
    sku: "SUE-FAC-MF50",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "High-Visibility Industrial Safety Helmet with Ratchet (IS 2925)",
    category: "Factories",
    description:
      "Impact-resistant high-density polyethylene protective hard hat with micro-prismatic reflective strips and 4-point chin harness for factory technicians.",
    image: helmetImg,
    specs: [
      "IS 2925 / EN 397 Heavy Industrial Spec",
      "UV-Resistant Polyethylene Outer Shell",
      "Lateral Attachment Slots for Face Shield / Ear Muffs",
      "Micro-Ratchet Circumference Adjustment (53-64cm)",
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
    category: "Factories",
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

  // 6. FIRE ACCESSORIES
  {
    name: "Gunmetal Landing Valve & Single Outlet Oblique Coupling",
    category: "Fire Accessories",
    description:
      "Heavy-duty flanged PN16 oblique fire landing valve with instantaneous quick-connect brass coupling, blank cap, chain, and bronze handwheel.",
    image: hydrantValveImg,
    specs: [
      "IS 5290 Type A Certified Gunmetal",
      "65mm (2.5 Inch) Flanged Inlet",
      "Hydrostatically Tested to 21 Bar",
      "High Corrosion & Weather Resistance",
    ],
    price: "3,800",
    unit: "piece",
    sku: "SUE-FH-LV65",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Reinforced Type B Canvas Fire Hose (30m / 63mm / IS 636)",
    category: "Fire Accessories",
    description:
      "Seamless woven polyester circular jacket fire fighting delivery hose with internal EPDM rubber lining and pre-bound instantaneous couplings.",
    image: hydrantSystemImg,
    specs: [
      "IS 636 Type B Certified",
      "Bursting Pressure: 38 Bar (550 PSI)",
      "Working Pressure: 15 Bar (217 PSI)",
      "Fitted with Male / Female Instantaneous Gunmetal Couplings",
    ],
    price: "3,400",
    unit: "coil",
    sku: "SUE-ACC-HOSE30",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },
  {
    name: "Short Gunmetal Branch Pipe & Jet Nozzle (63mm)",
    category: "Fire Accessories",
    description:
      "Instantaneous pattern firefighting water discharge branch pipe with machined gunmetal nozzle for straight jet streams.",
    image: hydrantValveImg,
    specs: [
      "IS 903 Certified High-Grade Gunmetal",
      "63mm Instantaneous Male Connection",
      "Hydrostatic Test Pressure: 21 Bar",
      "Nozzle Orifice: 16mm / 19mm / 25mm",
    ],
    price: "1,650",
    unit: "piece",
    sku: "SUE-ACC-BR63",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },

  // 7. HOME
  {
    name: "Home Kitchen Fire Safety Blanket (1.2m x 1.8m Fiberglass)",
    category: "Home",
    description:
      "Heavy-duty woven fiberglass flame-suppression blanket in quick-release wall pack designed to suffocate kitchen cooking oil fires and clothing fires instantly.",
    image: safetyProductsImg,
    specs: [
      "BS EN 1869 Certified High Silica Fiberglass",
      "Withstands Heat up to 550°C",
      "Quick-Release Pull Straps",
      "Zero Mess / Reusable Sealed Pouch",
    ],
    price: "850",
    unit: "piece",
    sku: "SUE-HOME-FB01",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },
  {
    name: "Compact Residential ABC Dry Chemical Fire Extinguisher (2kg)",
    category: "Home",
    description:
      "Lightweight, easy-to-operate domestic extinguisher for residential villas, modular kitchens, and private garages.",
    image: extinguisherImg,
    specs: [
      "IS 15683 Certified Domestic Spec",
      "Squeeze-Grip Quick Trigger Mechanism",
      "Color-Coded Pressure Gauge",
      "Wall Hook Mounting Bracket Included",
    ],
    price: "1,350",
    unit: "unit",
    sku: "SUE-HOME-FE02",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },

  // 8. HOSPITALS
  {
    name: "MRI-Safe Non-Magnetic Clean Agent Fire Extinguisher",
    category: "Hospitals",
    description:
      "Certified non-magnetic stainless steel / aluminum extinguisher filled with clean agent gas for MRI suites, diagnostic radiology centers, and ICU facilities.",
    image: hospitalsImg,
    specs: [
      "Tested for 3.0 Tesla MRI Environments",
      "Zero Ferrous Metals / No Deflection in Magnetic Field",
      "Leaves Zero Residue on Life Support Medical Devices",
      "IS 15683 Compliant Clean Gas",
    ],
    price: "9,800",
    unit: "unit",
    sku: "SUE-HOSP-MRI05",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Hospital ICU Patient Emergency Evacuation Rescue Sheet",
    category: "Hospitals",
    description:
      "Fire-retardant wipe-clean patient evacuation sheet with pulling straps to transport non-ambulatory ICU patients safely down stairs during emergencies.",
    image: medicalSafetyImg,
    specs: [
      "Safe Working Load: 180 kg",
      "Fire Retardant & Antibacterial Fabric",
      "Dual Chest and Leg Restraint Straps",
      "Smooth Low-Friction Undercoating for Stairways",
    ],
    price: "5,200",
    unit: "unit",
    sku: "SUE-HOSP-EVAC01",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },

  // 9. OFFICES
  {
    name: "Commercial Office Tower Water Mist Extinguisher (IS 15683)",
    category: "Offices",
    description:
      "Advanced supersonic de-ionized water mist extinguisher designed for high-density modern corporate office complexes with sensitive electronics and cubicles.",
    image: commercialImg,
    specs: [
      "IS 15683 Ultra-Fine Droplet Mist Nozzle",
      "Safe for Fires around Energized Office IT Equipment",
      "Eco-Friendly De-Ionized Purified Agent",
      "High Heat Absorption & Smoke Scrubbing",
    ],
    price: "4,100",
    unit: "unit",
    sku: "SUE-OFF-WM06",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Explosion-Proof Dome IP CCTV Security Camera (4K / 8MP)",
    category: "Offices",
    description:
      "Vandal-proof optical dome camera with Smart Infrared night vision, PoE connectivity, and IP67 weatherproof housing for corporate facilities.",
    image: cctvImg,
    specs: [
      "4K (8MP) Ultra HD Optical Resolution",
      "Smart Infrared Night Vision Range: 40m",
      "H.265+ High Efficiency Compression",
      "IK10 Vandal-Proof / IP67 Weatherproof Housing",
    ],
    price: "4,200",
    unit: "camera",
    sku: "SUE-SEC-CCTV04",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },
  {
    name: "Workplace Emergency First Aid & Burn Trauma Kit (50-Person)",
    category: "Offices",
    description:
      "Comprehensive wall-mountable and portable medical emergency kit equipped with burn dressings, antiseptic sprays, eye wash, and trauma shears.",
    image: medicalSafetyImg,
    specs: [
      "Factories Act 1948 & Red Cross Standard",
      "Waterproof & Dustproof Molded Case",
      "Contains 60+ Essential Medical Items",
      "Quick-Release Wall Stanchion Bracket",
    ],
    price: "1,850",
    unit: "kit",
    sku: "SUE-MS-FAK50",
    minOrderQty: "1",
    inStock: true,
    featured: false,
  },

  // 10. RESTAURANTS
  {
    name: "Commercial Kitchen Wet Chemical Class K/F Extinguisher (6L)",
    category: "Restaurants",
    description:
      "Potassium acetate specialized wet chemical extinguisher designed specifically to saponify and extinguish deep fat fryers, commercial ranges, and cooking oil fires.",
    image: hotelsImg,
    specs: [
      "Certified for Class K (Commercial Cooking Media) & Class A",
      "Low pH Formula to Prevent Kitchen Equipment Corrosion",
      "Soft Spray Mist Wand Nozzle to Prevent Hot Grease Splash",
      "Stainless Steel Polished Cylinder Finish",
    ],
    price: "4,850",
    unit: "unit",
    sku: "SUE-REST-CK06",
    minOrderQty: "1",
    inStock: true,
    featured: true,
  },
  {
    name: "Kitchen Exhaust Hood Fusible Link Automatic Suppression Nozzle",
    category: "Restaurants",
    description:
      "Overhead canopy hood directional discharge nozzle designed for automated liquid chemical flooding directly onto cooking appliances upon thermal release.",
    image: hydrantValveImg,
    specs: [
      "Heavy Chrome-Plated Solid Brass Body",
      "High Velocity Wide Dispersion Fan Pattern",
      "Thread: 3/8 Inch NPT / BSP",
      "Withstands Continuous Grease & High Heat Exposure",
    ],
    price: "1,200",
    unit: "piece",
    sku: "SUE-REST-NZ38",
    minOrderQty: "2",
    inStock: true,
    featured: false,
  },

  // 11. RENEWALS
  {
    name: "Annual Statutory Refill & Hydrostatic Pressure Testing Package",
    category: "Renewals",
    description:
      "Comprehensive periodic extinguisher refill, gas cartridge inspection, and certified hydrostatic pressure testing (hydraulic stretch test) with official compliance tag.",
    image: hydrantSystemImg,
    specs: [
      "Adheres to IS 2190 Statutory Maintenance Code",
      "Includes Pressure Discharge & Weight Verification",
      "PESO / ISI Certified Testing Records Provided",
      "On-Site Collection and Delivery Included",
    ],
    price: "450",
    unit: "per cylinder",
    sku: "SUE-REN-HT01",
    minOrderQty: "5",
    renewalMonths: 12,
    inStock: true,
    featured: true,
  },
  {
    name: "Fire Hydrant System Annual AMC & Gasket Overhaul Service",
    category: "Renewals",
    description:
      "Annual Maintenance Contract (AMC) for commercial fire hydrant lines, booster pumps, landing valves, and wet risers with periodic water flow testing and NOC renewal filing.",
    image: pumpImg,
    specs: [
      "Quarterly On-Site Physical System Inspection",
      "Hydraulic Flow & Pressure Testing of Booster Pumps",
      "Gasket, O-Ring & Packing Gland Maintenance",
      "Assistance with Andhra Pradesh / Telangana Fire NOC Renewal",
    ],
    price: "12,500",
    unit: "per year",
    sku: "SUE-REN-AMC01",
    minOrderQty: "1",
    renewalMonths: 12,
    inStock: true,
    featured: false,
  },
];

export const DEFAULT_PRODUCTS: ProductItem[] = OFFICIAL_CATALOG_PRODUCTS.map((p, idx) => ({
  id: `sue-cat-${idx + 1}`,
  ...p,
}));

export const FEATURED_ID_MAP: Record<string, string> = {
  "def-extinguisher": "sue-cat-1",
  "def-hydrant-valve": "sue-cat-12",
  "def-fire-pump": "sue-cat-8",
  "def-safety-helmet": "sue-cat-10",
  "def-safety-gloves": "sue-cat-11",
  "def-cctv-camera": "sue-cat-17",
};

/**
 * Resolves a context-aware fallback image based on product category and name.
 * Prevents non-extinguisher products (call points, detectors, CCTV, PPE, pumps)
 * from displaying an unrelated fire extinguisher cylinder.
 */
export function getProductFallbackImage(category?: string, name?: string): string {
  const cat = (category || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (cat.includes("cctv") || n.includes("camera") || n.includes("cctv")) return cctvImg;
  if (cat.includes("cable") || n.includes("wire") || n.includes("cable")) return cableImg;
  if (cat.includes("road") || n.includes("cone") || n.includes("barricade") || n.includes("road")) return roadSafetyImg;
  if (cat.includes("medical") || n.includes("first aid") || n.includes("stretcher")) return medicalSafetyImg;
  if (n.includes("helmet")) return helmetImg;
  if (n.includes("glove")) return glovesImg;
  if (cat.includes("ppe") || n.includes("vest") || n.includes("jacket") || n.includes("suit")) return helmetImg;
  if (cat.includes("pump") || n.includes("pump") || n.includes("engine")) return pumpImg;
  if (cat.includes("hydrant") || n.includes("hydrant") || n.includes("landing valve") || n.includes("hose reel")) return hydrantSystemImg;
  if (n.includes("valve") || n.includes("nozzle") || n.includes("coupling")) return hydrantValveImg;

  // Manual call points, smoke detectors, heat detectors, fire alarm panels, hooters
  if (
    n.includes("smoke") ||
    n.includes("detector") ||
    n.includes("call point") ||
    n.includes("manual call") ||
    n.includes("alarm") ||
    n.includes("panel") ||
    n.includes("hooter") ||
    n.includes("sensor")
  ) {
    return safetyProductsImg;
  }

  // Only use extinguisher if name or category explicitly refers to an extinguisher / cylinder / CO2 / ABC powder
  if (
    n.includes("extinguisher") ||
    n.includes("cylinder") ||
    n.includes("co2") ||
    n.includes("abc powder") ||
    n.includes("foam extinguisher") ||
    cat.includes("extinguisher")
  ) {
    return extinguisherImg;
  }

  // General industrial fire safety equipment fallback
  return safetyProductsImg;
}

/**
 * Checks whether an image source points to the generic fire extinguisher cylinder asset
 */
export function isCylinderAsset(img: unknown): boolean {
  if (typeof img !== "string" || !img) return false;
  return (
    img === extinguisherImg ||
    img.includes("fire-extinguisher") ||
    img.includes("assets/fire-extinguisher")
  );
}

/**
 * Resolves the display image for a product.
 * If a non-extinguisher product was previously saved with a generic extinguisher placeholder,
 * this automatically returns the appropriate category visual instead of showing a fake cylinder.
 */
export function resolveProductDisplayImage(product?: Partial<ProductItem> | null): string {
  if (!product) return safetyProductsImg;
  const name = (product.name || "").toLowerCase();
  const category = (product.category || "").toLowerCase();

  const isActuallyExtinguisher =
    name.includes("extinguisher") ||
    name.includes("cylinder") ||
    name.includes("co2") ||
    name.includes("abc powder") ||
    category.includes("extinguisher");

  // 1. Gather all candidate images in order of priority (primary image first, then gallery images)
  const candidates: string[] = [];
  if (product.image && typeof product.image === "string" && product.image.trim()) {
    candidates.push(product.image.trim());
  }
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (typeof img === "string" && img.trim() && !candidates.includes(img.trim())) {
        candidates.push(img.trim());
      }
    }
  }

  // 2. Prioritize genuine uploaded images (storage URL, data URL, or non-cylinder asset)
  const genuineUploadedImage = candidates.find((img) => !isCylinderAsset(img));
  if (genuineUploadedImage) {
    return genuineUploadedImage;
  }

  // 3. If product is an extinguisher and cylinder asset is available, use it
  if (isActuallyExtinguisher) {
    const cylinderCandidate = candidates.find((img) => isCylinderAsset(img));
    return cylinderCandidate || extinguisherImg;
  }

  // 4. Otherwise, for non-extinguisher equipment, NEVER show a cylinder. Return appropriate category visual.
  return getProductFallbackImage(product.category, product.name);
}
