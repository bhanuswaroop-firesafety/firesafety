import {
  db,
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  handleFirestoreError,
  OperationType,
} from "./firebase";
import type { ProductItem, UserItem, InquiryItem, CategoryItem } from "./types";
import extinguisherImg from "@/assets/fire-extinguisher.jpg";
import hydrantImg from "@/assets/fire-hydrant-system.jpg";
import valveImg from "@/assets/hydrant-valve.jpg";
import pumpImg from "@/assets/fire-pump.jpg";
import helmetImg from "@/assets/safety-helmet.jpg";
import glovesImg from "@/assets/safety-gloves.jpg";
import safetyProductsImg from "@/assets/safety-products.jpg";
import cctvImg from "@/assets/cctv-camera.jpg";
import cableImg from "@/assets/cable-management.jpg";

export const DEFAULT_PRODUCTS: ProductItem[] = [
  {
    id: "extinguishers",
    name: "Certified Fire Extinguishers",
    category: "Fire Safety",
    image: extinguisherImg,
    description:
      "Complete range of ABC Dry Chemical Powder, CO2, Mechanical Foam, Clean Agent, and Water Mist fire extinguishers. Built to IS 15683 standards.",
    specs: [
      "IS 15683 / BIS Certified",
      "Capacities: 1kg to 50kg trolley",
      "Class A, B, C, & Electrical Fires",
    ],
    price: "1,850",
    unit: "per cylinder",
    sku: "SUE-FE-ABC4",
    inStock: true,
    featured: true,
  },
  {
    id: "hydrant-systems",
    name: "Fire Hydrant Systems & Accessories",
    category: "Fire Hydrant",
    image: hydrantImg,
    description:
      "Heavy-duty outdoor and indoor hydrant systems, single and double landing valves, reinforced RRL hoses, branch pipes, and hose reel drums.",
    specs: [
      "IS 5290 Single/Double Head",
      "Stainless Steel / Gunmetal",
      "High Working Pressure (16+ Bar)",
    ],
    price: "8,900",
    unit: "per assembly",
    sku: "SUE-HYD-5290",
    inStock: true,
    featured: true,
  },
  {
    id: "hydrant-valves",
    name: "Hydrant Valves & Couplings",
    category: "Fire Hydrant",
    image: valveImg,
    description:
      "Precision engineered landing valves, Siamese inlet connections, breeching pieces, and instantaneous couplings for commercial and industrial riser systems.",
    specs: [
      "Gunmetal & Stainless Steel",
      "Instantaneous 63mm Connection",
      "Hydrostatic Tested to 21 Bar",
    ],
    price: "3,250",
    unit: "per piece",
    sku: "SUE-VLV-GM63",
    inStock: true,
    featured: false,
  },
  {
    id: "fire-pumps",
    name: "Industrial Fire Pump Skids",
    category: "Fire Pumps",
    image: pumpImg,
    description:
      "Complete UL/FM/NBC fire pump assemblies including main electrical motor driven pumps, diesel engine standby pumps, and automated jockey pressure maintenance pumps.",
    specs: [
      "Flow: 500 to 3000 GPM",
      "Head: up to 140 meters",
      "Automatic Controller Panel Included",
    ],
    price: "1,85,000",
    unit: "per skid setup",
    sku: "SUE-PMP-1000GPM",
    inStock: true,
    featured: true,
  },
  {
    id: "ppe-helmets",
    name: "Industrial Safety Helmets",
    category: "PPE",
    image: helmetImg,
    description:
      "High-impact resistant HDPE safety helmets with adjustable ratchet suspensions, chin straps, and sweatbands for construction, manufacturing, and refineries.",
    specs: [
      "IS 2925 Certified",
      "Electrical Resistance up to 2000V",
      "Vented & Non-Vented Variants",
    ],
    price: "380",
    unit: "per helmet",
    sku: "SUE-PPE-HLM01",
    inStock: true,
    featured: false,
  },
  {
    id: "ppe-gloves",
    name: "Heavy-Duty Safety Gloves",
    category: "PPE",
    image: glovesImg,
    description:
      "Specialized protective gloves including heat-resistant Kevlar gloves, chemical-resistant nitrile, cut-resistant leather, and electrical lineman gloves.",
    specs: ["EN 388 / IS Certified", "Heat Resistant up to 500°C", "Anti-Slip Textured Grip"],
    price: "240",
    unit: "per pair",
    sku: "SUE-PPE-GLV02",
    inStock: true,
    featured: false,
  },
  {
    id: "general-safety",
    name: "Workplace Safety Gear & Signage",
    category: "PPE",
    image: safetyProductsImg,
    description:
      "Comprehensive workplace hazard protection including photoluminescent fire exit signs, safety harnesses, protective goggles, and breathing apparatus sets.",
    specs: [
      "Glow-in-the-Dark Photoluminescent",
      "Full Body Fall Arrest Harnesses",
      "Emergency Eyewash Units",
    ],
    price: "1,200",
    unit: "per kit",
    sku: "SUE-SGN-KIT01",
    inStock: true,
    featured: true,
  },
  {
    id: "cctv-surveillance",
    name: "Explosion-Proof & Industrial CCTV",
    category: "CCTV",
    image: cctvImg,
    description:
      "Specialized CCTV camera networks designed for hazardous industrial environments, thermal flame detection, 24/7 NVR recording, and remote monitoring.",
    specs: [
      "IP67 / ATEX Explosion-Proof",
      "Thermal Flame & Heat Detection",
      "4K Ultra-HD Night Vision",
    ],
    price: "14,500",
    unit: "per camera unit",
    sku: "SUE-CAM-EXP4K",
    inStock: true,
    featured: true,
  },
  {
    id: "cable-management",
    name: "Fire-Rated Cable Trays & Seals",
    category: "Cable Management",
    image: cableImg,
    description:
      "Heavy gauge perforated and ladder type cable trays, firestop sealants, and thermal barrier wraps ensuring electrical circuit integrity during emergencies.",
    specs: [
      "2-Hour Fire Rating (BS 476)",
      "Galvanized Steel / SS 304",
      "Intumescent Firestop Barrier",
    ],
    price: "950",
    unit: "per meter",
    sku: "SUE-CBL-TRY300",
    inStock: true,
    featured: false,
  },
];

export const CATEGORIES: string[] = [
  "Fire Safety",
  "Fire Hydrant",
  "Fire Pumps",
  "PPE",
  "CCTV",
  "Cable Management",
];

// Product Services
export function subscribeProducts(callback: (products: ProductItem[]) => void) {
  const colRef = collection(db, "products");
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Return default products if collection has no items yet
        callback(DEFAULT_PRODUCTS);
      } else {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ProductItem[];
        callback(items);
      }
    },
    (err) => {
      console.warn("Firestore products fetch fallback:", err.message);
      callback(DEFAULT_PRODUCTS);
    },
  );
}

export async function addProduct(product: Omit<ProductItem, "id">): Promise<string> {
  try {
    const colRef = collection(db, "products");
    const docRef = await addDoc(colRef, {
      ...product,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "products");
  }
}

export async function updateProduct(id: string, product: Partial<ProductItem>): Promise<void> {
  try {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, {
      ...product,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `products/${id}`);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
  }
}

export async function seedDefaultProducts(): Promise<number> {
  let count = 0;
  for (const item of DEFAULT_PRODUCTS) {
    const docRef = doc(db, "products", item.id || `prod_${Date.now()}`);
    await setDoc(docRef, {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    count++;
  }
  return count;
}

// Inquiries / Leads Services
export async function submitInquiry(
  inquiry: Omit<InquiryItem, "id" | "status" | "createdAt">,
): Promise<string> {
  try {
    const colRef = collection(db, "inquiries");
    const docRef = await addDoc(colRef, {
      ...inquiry,
      status: "new",
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "inquiries");
  }
}

export function subscribeInquiries(callback: (inquiries: InquiryItem[]) => void) {
  const colRef = collection(db, "inquiries");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as InquiryItem[];
      // Sort in-memory to avoid missing compound index
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, "inquiries");
    },
  );
}

export async function updateInquiryStatus(
  id: string,
  status: "new" | "contacted" | "closed",
): Promise<void> {
  try {
    const docRef = doc(db, "inquiries", id);
    await updateDoc(docRef, { status });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `inquiries/${id}`);
  }
}

export async function deleteInquiry(id: string): Promise<void> {
  try {
    const docRef = doc(db, "inquiries", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `inquiries/${id}`);
  }
}

// Users Services
export function subscribeUsers(callback: (users: UserItem[]) => void) {
  const colRef = collection(db, "users");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserItem[];
      callback(items);
    },
    (err) => {
      console.warn("Users subscription warning:", err.message);
      callback([]);
    },
  );
}

export async function updateUserRole(
  uid: string,
  role: "admin" | "staff" | "customer",
): Promise<void> {
  try {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { role });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${uid}`);
  }
}

// Categories Services
export function subscribeCategories(callback: (categories: CategoryItem[]) => void) {
  const colRef = collection(db, "categories");
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback(
          CATEGORIES.map((cat, i) => ({
            id: `cat_${i}`,
            name: cat,
            description: `Industrial ${cat} supplies and systems`,
          })),
        );
      } else {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CategoryItem[];
        callback(items);
      }
    },
    (err) => {
      console.warn("Categories subscription fallback:", err.message);
      callback(
        CATEGORIES.map((cat, i) => ({
          id: `cat_${i}`,
          name: cat,
          description: `Industrial ${cat} supplies and systems`,
        })),
      );
    },
  );
}

export async function addCategory(category: {
  name: string;
  description?: string | undefined;
}): Promise<string> {
  try {
    const colRef = collection(db, "categories");
    const docRef = await addDoc(colRef, {
      ...category,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "categories");
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const docRef = doc(db, "categories", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
  }
}
