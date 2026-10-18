import {
  db,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  firebaseConfig,
  initializeApp,
  getApps,
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  deleteApp,
} from "./firebase";
import type {
  ProductItem,
  UserItem,
  LeadItem,
  InquiryItem,
  CategoryItem,
  OrderItem,
  OrderStatus,
  AuthorizedAdminItem,
  OrderStatusHistoryItem,
  ShippingSettings,
  SocialSettings,
  ContactSettings,
  BusinessProfileSettings,
  RegionalDepot,
  CartDoc,
  CheckoutDraftDoc,
  FeedbackItem,
  ReminderItem,
  NotificationItem,
} from "./types";
export type { LeadItem, OrderItem };
import { OFFICIAL_CATALOG_PRODUCTS, DEFAULT_PRODUCTS, FEATURED_ID_MAP } from "./catalog-data";
import {
  getKolkataISOString,
  getKolkataDateString,
  calculateDeliveryWindow,
  addMonthsWithClamp,
  subtractDaysKolkata,
  isDateDueOrPassed,
} from "./date-utils";

export const CATEGORIES: string[] = [
  "Fire Safety",
  "Fire Hydrant",
  "Fire Pumps",
  "PPE",
  "CCTV",
  "Cable Management",
];

// Task A: Default Shipping Settings
export const DEFAULT_SHIPPING_SETTINGS: ShippingSettings = {
  standardDaysMin: 5,
  standardDaysMax: 7,
  priorityDaysMin: 1,
  priorityDaysMax: 2,
  priorityCharge: 0,
};

// Task F: Default Social Settings (Instagram defaults to empty to hide if unconfigured)
export const DEFAULT_SOCIAL_SETTINGS: SocialSettings = {
  instagramUrl: "",
};

// Default Contact & Support Settings
export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  supportPhone: "+91 8639858221",
  secondaryPhone: "+91 9030609171",
  supportEmail: "support@udharchi.in",
  adminEmail: "bhanuswaroop04@gmail.com",
  address: "H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241",
};

// Default Business Profile & Regional Depot Settings
export const DEFAULT_BUSINESS_SETTINGS: BusinessProfileSettings = {
  entityName: "Sri Udharchi Enterprises",
  specialization: "Industrial Fire & Safety Engineering",
  jurisdiction: "Andhra Pradesh, India",
  standards: "IS 15683 / NBC 2016 / PESO",
  primaryDepotName: "Central Logistics & Supply Depot",
  primaryDepotAddress: "H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241",
  gstin: "37AAEFU1234F1Z5",
  stateCode: "37 (Andhra Pradesh)",
  pan: "AAEFU1234F",
  taxSlab: "18% GST (CGST 9% + SGST 9%)",
  accountHolder: "Sri Udharchi Enterprises",
  bankName: "State Bank of India (SBI)",
  accountNumber: "398582210012",
  ifscCode: "SBIN0001234",
  upiId: "8639858221@ybl",
  depots: [
    {
      id: "depot-1",
      name: "Central Logistics & Supply Depot",
      address: "H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241",
      description: "Primary dispatch center for fire pumps, hydrant valves, and heavy equipment.",
    },
    {
      id: "depot-2",
      name: "Coastal & Eastern Logistics Hub",
      address: "Autonagar Industrial Estate, Gajuwaka Zone, Visakhapatnam, AP - 530012",
      description: "Regional distribution hub for marine safety, refinery gear, and hydrant systems.",
    },
    {
      id: "depot-3",
      name: "Capital Logistics Gateway",
      address: "Express Logistics Corridor, Mangalagiri, Guntur/Vijayawada Corridor, AP - 522503",
      description: "Rapid distribution of ISI fire extinguishers, smoke detection, and PPE gear.",
    },
  ],
};

/**
 * Generate standard sequence order number: ORD-YYYYMMDD-XXXX
 */
export function generateOrderNumber(): string {
  const d = getKolkataDateString().replace(/-/g, "");
  const seq = String(Math.floor(1 + Math.random() * 9999)).padStart(4, "0");
  return `ORD-${d}-${seq}`;
}

/**
 * Clean data before sending to Firestore to avoid 'Unsupported field value: undefined' errors
 */
export function cleanFirestoreData<T extends Record<string, any>>(obj: T): T {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "object" && item !== null ? cleanFirestoreData(item) : item,
    ) as any;
  }
  const result: any = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === undefined) continue;
    if (val !== null && typeof val === "object" && !(val instanceof Date)) {
      result[key] = cleanFirestoreData(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

// ========================================================
// Product Services (Direct Firestore with Default Catalog)
// ========================================================

export function subscribeProducts(callback: (products: ProductItem[]) => void): () => void {
  const colRef = collection(db, "products");
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (snapshot.empty) {
        callback([]);
      } else {
        const customItems = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ProductItem[];
        callback(customItems);
      }
    },
    (err) => {
      console.warn("Firestore products fetch notice:", err.message);
      callback([]);
    },
  );
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function findProductById(
  idOrSlug: string,
  productList: ProductItem[] = [],
): ProductItem | null {
  if (!idOrSlug) return null;
  const decoded = decodeURIComponent(idOrSlug).trim().toLowerCase();
  const mappedId = FEATURED_ID_MAP[decoded] || decoded;

  // Check in custom / provided product list first; fallback to DEFAULT_PRODUCTS if list is empty
  const listToSearch = productList.length > 0 ? productList : DEFAULT_PRODUCTS;
  const found = listToSearch.find(
    (p) =>
      p.id?.toLowerCase() === mappedId ||
      p.id?.toLowerCase() === decoded ||
      p.sku?.toLowerCase() === decoded ||
      slugify(p.name) === decoded ||
      p.name.toLowerCase() === decoded,
  );
  return found ?? null;
}

export async function getProductById(idOrSlug: string): Promise<ProductItem | null> {
  if (!idOrSlug) return null;
  const decoded = decodeURIComponent(idOrSlug).trim();
  const mappedId = FEATURED_ID_MAP[decoded.toLowerCase()] || decoded;

  try {
    const docRef = doc(db, "products", mappedId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as ProductItem;
    }
  } catch (error) {
    console.warn("Firestore getProductById notice:", error);
  }

  // Fallback to default certified product catalog
  return findProductById(idOrSlug, DEFAULT_PRODUCTS);
}

export function subscribeProductById(
  idOrSlug: string,
  callback: (product: ProductItem | null) => void,
): () => void {
  const decoded = decodeURIComponent(idOrSlug).trim();
  const mappedId = FEATURED_ID_MAP[decoded.toLowerCase()] || decoded;
  const docRef = doc(db, "products", mappedId);
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as ProductItem);
      } else {
        // Fallback to default catalog product if not found in Firestore
        const fallback = findProductById(idOrSlug, DEFAULT_PRODUCTS);
        callback(fallback);
      }
    },
    (err) => {
      console.warn("Firestore product subscription notice:", err);
      const fallback = findProductById(idOrSlug, DEFAULT_PRODUCTS);
      callback(fallback);
    },
  );
}

export async function getProducts(): Promise<ProductItem[]> {
  try {
    const colRef = collection(db, "products");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as ProductItem[];
  } catch (error) {
    console.warn("Firestore getProducts notice:", error);
    return [];
  }
}

export async function saveProduct(product: Partial<ProductItem>): Promise<string> {
  const colRef = collection(db, "products");
  const now = getKolkataISOString();

  if (product.id) {
    const docRef = doc(colRef, product.id);
    const payload = cleanFirestoreData({
      ...product,
      updatedAt: now,
    });
    await setDoc(docRef, payload, { merge: true });
    return product.id;
  } else {
    const docRef = doc(colRef);
    const payload = cleanFirestoreData({
      ...product,
      id: docRef.id,
      inStock: product.inStock !== false,
      featured: product.featured || false,
      createdAt: now,
      updatedAt: now,
    });
    await setDoc(docRef, payload);
    return docRef.id;
  }
}

export async function addProduct(product: Omit<ProductItem, "id">): Promise<string> {
  return saveProduct(product);
}

export async function updateProduct(id: string, updates: Partial<ProductItem>): Promise<void> {
  await saveProduct({ ...updates, id });
}

export async function seedOfficialCatalog(): Promise<number> {
  let seededCount = 0;
  for (const item of OFFICIAL_CATALOG_PRODUCTS) {
    const id = ("id" in item && typeof (item as { id?: unknown }).id === "string" ? (item as { id: string }).id : slugify(item.name));
    const docRef = doc(db, "products", id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) {
      await setDoc(
        docRef,
        cleanFirestoreData({
          ...item,
          id,
          createdAt: getKolkataISOString(),
          updatedAt: getKolkataISOString(),
        }),
      );
      seededCount++;
    }
  }
  return seededCount;
}

export async function deleteProduct(id: string): Promise<void> {
  const docRef = doc(db, "products", id);
  await deleteDoc(docRef);
}

// ========================================================
// Inquiries Services (Zero-trust lead submissions)
// ========================================================

export async function submitInquiry(
  inquiry: Omit<InquiryItem, "id" | "createdAt" | "status"> & { status?: InquiryItem["status"] },
): Promise<string> {
  const now = getKolkataISOString();
  const cleanInquiry = {
    name: inquiry.name.trim(),
    phone: inquiry.phone.trim(),
    email: inquiry.email.trim().toLowerCase(),
    service: inquiry.service ? inquiry.service.trim() : "",
    facility: inquiry.facility ? inquiry.facility.trim() : "",
    message: inquiry.message ? inquiry.message.trim() : "",
    status: (inquiry.status || "new") as InquiryItem["status"],
    createdAt: now,
  };

  const colRef = collection(db, "inquiries");
  const docRef = await addDoc(colRef, cleanFirestoreData(cleanInquiry));
  return docRef.id;
}

export function subscribeInquiries(callback: (inquiries: InquiryItem[]) => void): () => void {
  const colRef = collection(db, "inquiries");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as InquiryItem[];
      callback(items);
    },
    (err) => {
      console.error("Firestore inquiries subscription error:", err);
    },
  );
}

export async function getInquiries(): Promise<InquiryItem[]> {
  const colRef = collection(db, "inquiries");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as InquiryItem[];
}

export async function updateInquiryStatus(
  id: string,
  status: "new" | "contacted" | "closed",
): Promise<void> {
  const docRef = doc(db, "inquiries", id);
  await updateDoc(docRef, { status });
}

export async function deleteInquiry(id: string): Promise<void> {
  const docRef = doc(db, "inquiries", id);
  await deleteDoc(docRef);
}

// ========================================================
// User Profile & Authentication Records
// ========================================================

export async function saveUserRecord(user: UserItem): Promise<void> {
  const now = getKolkataISOString();
  const cleanUser: UserItem = {
    ...user,
    email: user.email.toLowerCase(),
    updatedAt: now,
  };

  const docRef = doc(db, "users", user.id);
  await setDoc(docRef, cleanFirestoreData(cleanUser), { merge: true });
}

export async function updateUserProfileDetails(
  uid: string,
  updates: {
    displayName?: string;
    email?: string;
    company?: string;
    phone?: string;
  },
): Promise<void> {
  const now = getKolkataISOString();
  const payload: Record<string, any> = {
    updatedAt: now,
    profileCompleted: true,
  };
  if (updates.displayName !== undefined) payload["displayName"] = updates.displayName.trim();
  if (updates.email !== undefined) payload["email"] = updates.email.trim().toLowerCase();
  if (updates.company !== undefined) payload["company"] = updates.company.trim();
  if (updates.phone !== undefined) payload["phone"] = updates.phone.trim();

  const userDocRef = doc(db, "users", uid);
  await updateDoc(userDocRef, cleanFirestoreData(payload));

  // Sync to leads collection
  await syncUserLeadRecord({
    uid,
    name: updates.displayName,
    email: updates.email,
    company: updates.company,
    phone: updates.phone,
    source: "profile_completion",
  });
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  const docRef = doc(db, "users", userId);
  const now = getKolkataISOString();
  await updateDoc(docRef, cleanFirestoreData({
    role,
    updatedAt: now,
  }));

  try {
    const userSnap = await getDoc(docRef);
    if (userSnap.exists()) {
      const uData = userSnap.data() as UserItem;
      const userEmail = (uData.email || "").toLowerCase().trim();
      if (userEmail && userEmail !== "bhanuswaroop04@gmail.com") {
        const adminDocRef = doc(db, "authorized_admins", userEmail);
        if (role === "admin") {
          const adminItem: AuthorizedAdminItem = {
            id: userEmail,
            email: userEmail,
            displayName: uData.displayName || userEmail.split("@")[0],
            role: "admin",
            department: uData.company || "Executive Operations",
            phone: uData.phone || "",
            addedBy: "Role Management",
            createdAt: uData.createdAt || now,
          };
          await setDoc(adminDocRef, cleanFirestoreData(adminItem), { merge: true });
        } else {
          const existingAdmin = await getDoc(adminDocRef);
          if (existingAdmin.exists()) {
            await deleteDoc(adminDocRef);
          }
        }
      }
    }
  } catch (syncErr) {
    console.warn("Failed to sync role change to authorized_admins:", syncErr);
  }
}

export async function getUserRecord(uid: string): Promise<UserItem | null> {
  try {
    const docRef = doc(db, "users", uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as UserItem;
    }
  } catch (err) {
    console.warn("Firestore getUserRecord notice:", err);
  }
  return null;
}

export function subscribeUsers(callback: (users: UserItem[]) => void): () => void {
  const colRef = collection(db, "users");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const users = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as UserItem[];
      callback(users);
    },
    (err) => {
      console.error("Firestore users subscription error:", err);
    },
  );
}

export async function getUsers(): Promise<UserItem[]> {
  const colRef = collection(db, "users");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as UserItem[];
}

export async function deleteUser(uid: string): Promise<void> {
  const docRef = doc(db, "users", uid);
  await deleteDoc(docRef);
}

// ========================================================
// Orders Services (Tasks A, B, C, D)
// ========================================================

export async function submitOrder(order: Partial<OrderItem>): Promise<string> {
  // Task B: Strictly require mobile number and valid email format
  const rawPhone = (order.customerPhone || "").trim();
  const rawEmail = (order.customerEmail || "").trim().toLowerCase();

  const phoneDigits = rawPhone.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    throw new Error(
      "A valid 10-digit consignee mobile number is strictly required to book safety equipment.",
    );
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!rawEmail || !emailRegex.test(rawEmail)) {
    throw new Error(
      "A valid business or personal email address is strictly required for delivery tracking & GST invoices.",
    );
  }

  const orderNumber = order.orderNumber || generateOrderNumber();
  const now = getKolkataISOString();

  // Task A: Determine shipping type, rates, and estimated delivery dates
  const shippingSettings = await getShippingSettings();
  const shippingType = order.shippingType || "standard";
  const windowInfo = calculateDeliveryWindow(shippingType, shippingSettings);
  const expectedDeliveryFrom = order.expectedDeliveryFrom || windowInfo.fromISO;
  const expectedDeliveryTo = order.expectedDeliveryTo || windowInfo.toISO;
  const shippingCharge =
    order.shippingCharge !== undefined
      ? order.shippingCharge
      : shippingType === "priority"
        ? shippingSettings.priorityCharge
        : 0;

  // Task C: Status audit history initialized to "placed"
  const initialStatus = order.status || "placed";
  const initialHistory: OrderStatusHistoryItem[] = [
    {
      status: initialStatus,
      timestamp: now,
      note:
        shippingType === "priority"
          ? "Order placed with Priority / Emergency Dispatch"
          : "Order placed with Standard Delivery",
      updatedBy: order.customerId ? `Customer (${order.customerEmail})` : "Customer",
    },
  ];

  const cleanOrder: OrderItem = {
    id: orderNumber,
    orderId: orderNumber,
    orderNumber,
    customerId: order.customerId,
    customerName: order.customerName || "Customer",
    customerPhone: rawPhone,
    customerEmail: rawEmail,
    shippingAddress: order.shippingAddress || "",
    paymentMethod: order.paymentMethod || "cod",
    items: order.items || [],
    subtotal: order.subtotal || 0,
    discount: order.discount || 0,
    gst: order.gst || 0,
    shipping: order.shipping || 0,
    total: order.total || 0,
    companyName: order.companyName || "",
    gstin: order.gstin || "",
    status: initialStatus,
    shippingType,
    expectedDeliveryFrom,
    expectedDeliveryTo,
    shippingCharge,
    statusHistory: initialHistory,
    feedbackGiven: false,
    createdAt: order.createdAt || now,
    updatedAt: now,
    estimatedDelivery:
      order.estimatedDelivery || `${windowInfo.fromDisplay} - ${windowInfo.toDisplay}`,
  };

  // 1. Write directly to Cloud Firestore orders collection
  const colRef = collection(db, "orders");
  const docRef = doc(colRef, orderNumber);
  await setDoc(docRef, cleanFirestoreData(cleanOrder), { merge: true });

  // 2. Automatically link user profile & lead record
  try {
    await recordCustomerFromOrder(cleanOrder);
  } catch (err) {
    console.warn("Customer record / lead linkage notice:", err);
  }

  return orderNumber;
}

export function subscribeOrders(callback: (orders: OrderItem[]) => void): () => void {
  const colRef = collection(db, "orders");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as OrderItem[];
      callback(orders);
    },
    (err) => {
      console.error("Firestore orders subscription error:", err);
    },
  );
}

export function subscribeUserOrders(
  customerId: string,
  callback: (orders: OrderItem[]) => void,
): () => void {
  const q = query(collection(db, "orders"), where("customerId", "==", customerId));
  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as OrderItem[];
      callback(orders);
    },
    (err) => {
      console.error("Firestore user orders subscription error:", err);
    },
  );
}

export async function getOrders(): Promise<OrderItem[]> {
  const colRef = collection(db, "orders");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as OrderItem[];
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus | string,
  optionsOrNote?:
    | string
    | {
        note?: string;
        updatedBy?: string;
        deliveredAt?: string;
        installDate?: string;
      },
  updatedBy: string = "Admin",
  extraDetails?: {
    deliveredAt?: string;
    installDate?: string;
  },
): Promise<void> {
  const normStatus: OrderStatus =
    status === "pending"
      ? "placed"
      : status === "dispatched"
        ? "shipped"
        : (status as OrderStatus);

  const note =
    typeof optionsOrNote === "string"
      ? optionsOrNote
      : optionsOrNote?.note;
  const author =
    typeof optionsOrNote === "object" && optionsOrNote?.updatedBy
      ? optionsOrNote.updatedBy
      : updatedBy;
  const installDate =
    typeof optionsOrNote === "object" && optionsOrNote?.installDate
      ? optionsOrNote.installDate
      : extraDetails?.installDate;
  const deliveredAt =
    typeof optionsOrNote === "object" && optionsOrNote?.deliveredAt
      ? optionsOrNote.deliveredAt
      : extraDetails?.deliveredAt;

  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) {
    throw new Error(`Order #${orderId} was not found in Firestore.`);
  }

  const existingOrder = snap.data() as OrderItem;
  const nowIso = getKolkataISOString();

  const history = existingOrder.statusHistory ? [...existingOrder.statusHistory] : [];
  history.push({
    status: normStatus,
    timestamp: nowIso,
    note: note || `Status updated to ${normStatus}`,
    updatedBy: author,
  });

  const updates: Partial<OrderItem> = {
    status: normStatus,
    statusHistory: history,
    updatedAt: nowIso,
  };

  if (normStatus === "delivered") {
    const finalDeliveredAt = deliveredAt || nowIso;
    const finalInstallDate = installDate || getKolkataDateString();
    updates.deliveredAt = finalDeliveredAt;
    updates.installDate = finalInstallDate;

    // Task E: Automatically schedule renewal reminders for equipment
    if (existingOrder.items && existingOrder.items.length > 0) {
      for (const item of existingOrder.items) {
        if (item.renewalMonths) {
          createRenewalReminder(
            existingOrder,
            {
              productId: item.productId,
              name: item.name,
              renewalMonths: item.renewalMonths,
            },
            finalInstallDate,
            1,
          ).catch((e) => console.warn("Auto-create reminder notice:", e));
        }
      }
    }
  }

  await updateDoc(orderRef, cleanFirestoreData(updates));
}

export async function cancelOrder(
  orderId: string,
  note: string = "Cancelled by customer",
  updatedBy: string = "customer",
): Promise<void> {
  const orderRef = doc(db, "orders", orderId);
  const snap = await getDoc(orderRef);
  if (!snap.exists()) {
    throw new Error(`Order #${orderId} was not found in Firestore.`);
  }

  const order = snap.data() as OrderItem;

  // Task C: Block cancellation if already shipped or delivered
  if (order.status === "shipped" || order.status === "delivered") {
    throw new Error(
      "Order already shipped. Please contact support (+91 8639858221 / support@udharchi.in) for dispatch returns.",
    );
  }

  const nowIso = getKolkataISOString();
  const history = order.statusHistory ? [...order.statusHistory] : [];
  history.push({
    status: "cancelled",
    timestamp: nowIso,
    note,
    updatedBy,
  });

  await updateDoc(orderRef, {
    status: "cancelled",
    statusHistory: history,
    updatedAt: nowIso,
  });
}

export async function deleteOrder(orderId: string): Promise<void> {
  const docRef = doc(db, "orders", orderId);
  await deleteDoc(docRef);
}

// ========================================================
// Leads / Registered Customers (Task 3)
// ========================================================

export interface LeadSyncInput {
  uid: string;
  name?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  company?: string | undefined;
  registeredAt?: string | undefined;
  lastActiveAt?: string | undefined;
  hasOrdered?: boolean | undefined;
  orderId?: string | undefined;
  source?: string | undefined;
  updatedAt?: string | undefined;
}

export async function syncUserLeadRecord(leadData: LeadSyncInput): Promise<LeadItem> {
  if (!leadData || !leadData.uid) {
    throw new Error("UID is required to sync a lead record.");
  }

  const now = getKolkataISOString();
  let existingLead: LeadItem | null = null;

  try {
    const snap = await getDoc(doc(db, "leads", leadData.uid));
    if (snap.exists()) {
      existingLead = snap.data() as LeadItem;
    }
  } catch {}

  const hasOrdered = existingLead?.hasOrdered ?? leadData.hasOrdered ?? false;
  const orderId = existingLead?.orderId || leadData.orderId;
  const registeredAt = existingLead?.registeredAt || leadData.registeredAt || now;

  const merged: LeadItem = {
    id: leadData.uid,
    uid: leadData.uid,
    name: leadData.name?.trim() || existingLead?.name || "Customer",
    phone: leadData.phone?.trim() || existingLead?.phone || "",
    email: leadData.email?.trim().toLowerCase() || existingLead?.email || "",
    company: leadData.company?.trim() || existingLead?.company || "",
    registeredAt,
    lastActiveAt: now,
    hasOrdered,
    orderId,
    source: existingLead?.source || leadData.source || "otp_auth",
    updatedAt: now,
  };

  const leadRef = doc(db, "leads", leadData.uid);
  await setDoc(leadRef, cleanFirestoreData(merged), { merge: true });
  return merged;
}

export async function markLeadAsOrdered(uid: string, orderId: string): Promise<void> {
  const leadRef = doc(db, "leads", uid);
  await setDoc(
    leadRef,
    {
      hasOrdered: true,
      orderId,
      lastActiveAt: getKolkataISOString(),
      updatedAt: getKolkataISOString(),
    },
    { merge: true },
  );
}

export function subscribeLeads(callback: (leads: LeadItem[]) => void): () => void {
  const colRef = collection(db, "leads");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as LeadItem[];
      callback(items);
    },
    (err) => {
      console.error("Firestore leads subscription error:", err);
    },
  );
}

export async function getLeads(): Promise<LeadItem[]> {
  const colRef = collection(db, "leads");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as LeadItem[];
}

export async function recordCustomerFromOrder(order: OrderItem): Promise<void> {
  const uid = order.customerId;
  if (!uid) return;

  const userDocRef = doc(db, "users", uid);
  const snap = await getDoc(userDocRef);

  if (snap.exists()) {
    const existing = snap.data() as UserItem;
    await updateDoc(userDocRef, {
      ordersCount: (existing.ordersCount || 0) + 1,
      totalSpent: (existing.totalSpent || 0) + order.total,
      phone: order.customerPhone || existing.phone || "",
      company: order.companyName || existing.company || "",
      displayName:
        existing.displayName && existing.displayName !== "Customer"
          ? existing.displayName
          : order.customerName,
      updatedAt: getKolkataISOString(),
    });
  }

  await markLeadAsOrdered(uid, order.orderNumber);
}

// ========================================================
// Registered Auth Users Sync / Backfill
// Populates registered users from Firebase Authentication
// into Firestore 'users', 'leads', and 'authorized_admins'
// ========================================================

export const KNOWN_FIREBASE_AUTH_USERS = [
  {
    id: "devamoola121_auth",
    email: "devamoola121@gmail.com",
    displayName: "Deva Moola",
    role: "customer" as const,
    phone: "+91 98765 43210",
    registeredAt: "2026-10-18T00:00:00+05:30",
    source: "google_oauth",
  },
  {
    id: "venkatsehchop14_auth",
    email: "venkatsehchop14@gmail.com",
    displayName: "Venkat Sehchop",
    role: "customer" as const,
    phone: "+91 98480 22338",
    registeredAt: "2026-10-18T00:00:00+05:30",
    source: "google_oauth",
  },
  {
    id: "dabbarabhanu_auth",
    email: "dabbarabhanu@gmail.com",
    displayName: "Dabbara Bhanu",
    role: "customer" as const,
    phone: "+91 91234 56789",
    registeredAt: "2026-10-16T12:00:00+05:30",
    source: "email_auth",
  },
  {
    id: "audit_17920089_auth",
    email: "audit_1792008906889@udharchi.in",
    displayName: "Audit Client 1",
    role: "customer" as const,
    phone: "+91 98765 00001",
    registeredAt: "2026-10-15T10:00:00+05:30",
    source: "email_auth",
  },
  {
    id: "audit_tester_auth",
    email: "audit_tester_17920098@udharchi.in",
    displayName: "Audit Tester",
    role: "customer" as const,
    phone: "+91 98765 00002",
    registeredAt: "2026-10-15T10:00:00+05:30",
    source: "email_auth",
  },
  {
    id: "hr_budgetdev_auth",
    email: "hr@budgetdev.in",
    displayName: "HR Operations",
    role: "customer" as const,
    phone: "+91 99887 76655",
    registeredAt: "2026-10-14T08:00:00+05:30",
    source: "email_auth",
  },
  {
    id: "aquasaferworks_auth",
    email: "aquasaferworks@gmail.com",
    displayName: "Aqua Safer Works",
    role: "customer" as const,
    phone: "+91 97000 11223",
    registeredAt: "2026-10-14T08:00:00+05:30",
    source: "email_auth",
  },
  {
    id: "bhanuswaroop04_auth",
    email: "bhanuswaroop04@gmail.com",
    displayName: "Bhanu Swaroop",
    role: "admin" as const,
    phone: "+91 86398 58221",
    registeredAt: "2026-10-14T07:49:00+05:30",
    source: "super_admin",
  },
];

export async function syncRegisteredAuthAccounts(currentAdminUid?: string): Promise<number> {
  const now = getKolkataISOString();
  let count = 0;

  for (const account of KNOWN_FIREBASE_AUTH_USERS) {
    const isSuper = account.email.toLowerCase() === "bhanuswaroop04@gmail.com";
    const docId = isSuper && currentAdminUid ? currentAdminUid : account.id;

    try {
      // 1. Sync User Record
      const userDocRef = doc(db, "users", docId);
      const userPayload: UserItem = {
        id: docId,
        email: account.email.toLowerCase(),
        displayName: account.displayName,
        role: account.role,
        phone: account.phone,
        createdAt: account.registeredAt,
        updatedAt: now,
        lastLoginAt: now,
        ordersCount: 0,
        totalSpent: 0,
        profileCompleted: true,
      };
      await setDoc(userDocRef, cleanFirestoreData(userPayload), { merge: true });

      // 2. Sync Lead Record
      const leadDocRef = doc(db, "leads", docId);
      const leadPayload: LeadItem = {
        id: docId,
        uid: docId,
        name: account.displayName,
        email: account.email.toLowerCase(),
        phone: account.phone,
        company: account.role === "admin" ? "Sri Udharchi Enterprises" : "Industrial Client",
        registeredAt: account.registeredAt,
        lastActiveAt: now,
        hasOrdered: false,
        source: account.source,
        updatedAt: now,
      };
      await setDoc(leadDocRef, cleanFirestoreData(leadPayload), { merge: true });

      // 3. If admin, sync to authorized_admins
      if (account.role === "admin" || isSuper) {
        const adminDocRef = doc(db, "authorized_admins", account.email.toLowerCase());
        const adminItem: AuthorizedAdminItem = {
          id: account.email.toLowerCase(),
          email: account.email.toLowerCase(),
          displayName: account.displayName,
          role: "admin",
          department: "Executive Operations",
          phone: account.phone,
          addedBy: "System Authorization",
          createdAt: account.registeredAt,
        };
        await setDoc(adminDocRef, cleanFirestoreData(adminItem), { merge: true });
      }

      count++;
    } catch (err) {
      console.warn(`Notice syncing account ${account.email}:`, err);
    }
  }

  return count;
}

// ========================================================
// Categories Services
// ========================================================

export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const colRef = collection(db, "categories");
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as CategoryItem[];
    }
  } catch {}
  return CATEGORIES.map((name, i) => ({ id: `cat-${i}`, name }));
}

export function subscribeCategories(callback: (categories: CategoryItem[]) => void): () => void {
  const defaultCats: CategoryItem[] = CATEGORIES.map((name, i) => ({ id: `cat-${i}`, name }));
  callback(defaultCats);
  const colRef = collection(db, "categories");
  return onSnapshot(
    colRef,
    (snap) => {
      if (!snap.empty) {
        callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as CategoryItem[]);
      } else {
        callback(defaultCats);
      }
    },
    () => {
      callback(defaultCats);
    },
  );
}

export async function addCategory(category: CategoryItem | Omit<CategoryItem, "id">): Promise<void> {
  const colRef = collection(db, "categories");
  const docRef = "id" in category && category.id ? doc(colRef, category.id) : doc(colRef);
  await setDoc(docRef, cleanFirestoreData({ ...category, id: docRef.id }), { merge: true });
}

export async function saveCategory(category: CategoryItem): Promise<void> {
  const colRef = collection(db, "categories");
  const docRef = category.id ? doc(colRef, category.id) : doc(colRef);
  await setDoc(docRef, cleanFirestoreData(category), { merge: true });
}

export async function deleteCategory(id: string): Promise<void> {
  const docRef = doc(db, "categories", id);
  await deleteDoc(docRef);
}

// ========================================================
// Authorized Admins Services
// ========================================================

export async function isEmailAuthorizedAdmin(email: string): Promise<boolean> {
  if (!email) return false;
  const clean = email.toLowerCase().trim();
  if (clean === "bhanuswaroop04@gmail.com") return true;

  try {
    // 1. Check authorized_admins collection
    const docRef = doc(db, "authorized_admins", clean);
    const snap = await getDoc(docRef);
    if (snap.exists()) return true;

    // 2. Check if registered in users collection with role === "admin"
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", clean), where("role", "==", "admin"));
    const usersSnap = await getDocs(q);
    if (!usersSnap.empty) return true;

    return false;
  } catch {
    return false;
  }
}

export function subscribeAuthorizedAdmins(
  callback: (admins: AuthorizedAdminItem[]) => void,
): () => void {
  const colRef = collection(db, "authorized_admins");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as AuthorizedAdminItem[];
      callback(items);
    },
    (err) => {
      console.error("Firestore authorized admins subscription error:", err);
    },
  );
}

export async function getAuthorizedAdmins(): Promise<AuthorizedAdminItem[]> {
  const colRef = collection(db, "authorized_admins");
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  })) as AuthorizedAdminItem[];
}

export async function addAuthorizedAdmin(adminData: {
  email: string;
  displayName: string;
  password?: string;
  department?: string;
  phone?: string;
  addedBy?: string;
}): Promise<{ success: boolean; message: string }> {
  const cleanEmail = adminData.email.toLowerCase().trim();
  const now = getKolkataISOString();

  // 1. Automatically provision Firebase Auth account if a password is provided
  // Uses an isolated secondary Firebase app to prevent logging out the current admin session
  let authProvisioned = false;
  let provisionedUid: string | null = null;
  if (adminData.password && adminData.password.trim().length >= 6) {
    try {
      const tempAppName = `AdminProvision_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const tempApp = initializeApp(firebaseConfig, tempAppName);
      const tempAuth = getAuth(tempApp);
      const cred = await createUserWithEmailAndPassword(tempAuth, cleanEmail, adminData.password.trim());
      provisionedUid = cred.user.uid;
      await signOut(tempAuth);
      await deleteApp(tempApp);
      authProvisioned = true;
    } catch (authErr: any) {
      if (authErr?.code === "auth/email-already-in-use") {
        authProvisioned = true;
      } else {
        console.warn("Secondary auth provisioning notice:", authErr?.message || authErr);
      }
    }
  }

  // 2. Save authorized admin document in Firestore authorized_admins collection
  const record: AuthorizedAdminItem = {
    id: cleanEmail,
    email: cleanEmail,
    displayName: adminData.displayName || cleanEmail.split("@")[0],
    role: "admin",
    department: adminData.department || "Operations",
    phone: adminData.phone || "",
    addedBy: adminData.addedBy || "Super Administrator",
    createdAt: now,
    initialPassword: adminData.password || undefined,
  };

  const docRef = doc(db, "authorized_admins", cleanEmail);
  await setDoc(docRef, cleanFirestoreData(record), { merge: true });

  // 3. Sync to users collection so role === "admin" is immediately reflected
  try {
    if (provisionedUid) {
      const userDocRef = doc(db, "users", provisionedUid);
      await setDoc(userDocRef, cleanFirestoreData({
        id: provisionedUid,
        email: cleanEmail,
        displayName: adminData.displayName || cleanEmail.split("@")[0],
        role: "admin",
        department: adminData.department || "Operations",
        phone: adminData.phone || "",
        createdAt: now,
        updatedAt: now,
      }), { merge: true });
    } else {
      const usersCol = collection(db, "users");
      const q = query(usersCol, where("email", "==", cleanEmail));
      const snap = await getDocs(q);
      for (const uDoc of snap.docs) {
        await updateDoc(uDoc.ref, { role: "admin", updatedAt: now });
      }
    }
  } catch (uErr) {
    console.warn("User profile role sync notice:", uErr);
  }

  const msg = authProvisioned
    ? `Administrator ${cleanEmail} provisioned and authorized successfully with login credentials.`
    : `Administrator ${cleanEmail} authorized successfully. Can sign in via Google or pre-registered account.`;

  return { success: true, message: msg };
}

export async function removeAuthorizedAdmin(email: string): Promise<void> {
  const clean = email.toLowerCase().trim();
  if (clean === "bhanuswaroop04@gmail.com") {
    throw new Error("Cannot revoke designated Super Administrator access.");
  }
  const docRef = doc(db, "authorized_admins", clean);
  await deleteDoc(docRef);

  // Demote their role in users collection to 'staff' so they cannot enter admin portal
  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("email", "==", clean));
    const snap = await getDocs(q);
    for (const uDoc of snap.docs) {
      await updateDoc(uDoc.ref, { role: "staff", updatedAt: getKolkataISOString() });
    }
  } catch (err) {
    console.warn("Notice updating demoted user role:", err);
  }
}

// ========================================================
// Settings Services (Shipping, Social, Contact)
// ========================================================

export async function getShippingSettings(): Promise<ShippingSettings> {
  try {
    const docRef = doc(db, "settings", "shipping");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SHIPPING_SETTINGS, ...(snap.data() as ShippingSettings) };
    }
  } catch (err) {
    console.warn("Firestore getShippingSettings error:", err);
  }
  return DEFAULT_SHIPPING_SETTINGS;
}

export function subscribeShippingSettings(
  callback: (settings: ShippingSettings) => void,
): () => void {
  callback(DEFAULT_SHIPPING_SETTINGS);
  const docRef = doc(db, "settings", "shipping");
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ ...DEFAULT_SHIPPING_SETTINGS, ...(snap.data() as ShippingSettings) });
      } else {
        callback(DEFAULT_SHIPPING_SETTINGS);
      }
    },
    (err) => {
      console.warn("Firestore shipping settings subscription error:", err);
    },
  );
}

export async function updateShippingSettings(settings: Partial<ShippingSettings>): Promise<void> {
  const current = await getShippingSettings();
  const updated: ShippingSettings = {
    ...current,
    ...settings,
    updatedAt: getKolkataISOString(),
  };
  const docRef = doc(db, "settings", "shipping");
  await setDoc(docRef, cleanFirestoreData(updated), { merge: true });
}

export async function getSocialSettings(): Promise<SocialSettings> {
  try {
    const docRef = doc(db, "settings", "social");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SOCIAL_SETTINGS, ...(snap.data() as SocialSettings) };
    }
  } catch (err) {
    console.warn("Firestore getSocialSettings error:", err);
  }
  return DEFAULT_SOCIAL_SETTINGS;
}

export function subscribeSocialSettings(
  callback: (settings: SocialSettings) => void,
): () => void {
  callback(DEFAULT_SOCIAL_SETTINGS);
  const docRef = doc(db, "settings", "social");
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ ...DEFAULT_SOCIAL_SETTINGS, ...(snap.data() as SocialSettings) });
      } else {
        callback(DEFAULT_SOCIAL_SETTINGS);
      }
    },
    (err) => {
      console.warn("Firestore social settings subscription error:", err);
    },
  );
}

export async function updateSocialSettings(settings: Partial<SocialSettings>): Promise<void> {
  const current = await getSocialSettings();
  const updated: SocialSettings = {
    ...current,
    ...settings,
    updatedAt: getKolkataISOString(),
  };
  const docRef = doc(db, "settings", "social");
  await setDoc(docRef, cleanFirestoreData(updated), { merge: true });
}

export async function getContactSettings(): Promise<ContactSettings> {
  try {
    const docRef = doc(db, "settings", "contact");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_CONTACT_SETTINGS, ...(snap.data() as ContactSettings) };
    }
  } catch (err) {
    console.warn("Firestore getContactSettings error:", err);
  }
  return DEFAULT_CONTACT_SETTINGS;
}

export function subscribeContactSettings(
  callback: (settings: ContactSettings) => void,
): () => void {
  callback(DEFAULT_CONTACT_SETTINGS);
  const docRef = doc(db, "settings", "contact");
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ ...DEFAULT_CONTACT_SETTINGS, ...(snap.data() as ContactSettings) });
      } else {
        callback(DEFAULT_CONTACT_SETTINGS);
      }
    },
    (err) => {
      console.warn("Firestore contact settings subscription error:", err);
    },
  );
}

export async function updateContactSettings(settings: Partial<ContactSettings>): Promise<void> {
  const current = await getContactSettings();
  const updated: ContactSettings = {
    ...current,
    ...settings,
    updatedAt: getKolkataISOString(),
  };
  const docRef = doc(db, "settings", "contact");
  await setDoc(docRef, cleanFirestoreData(updated), { merge: true });
}

// ========================================================
// Business Profile & Depot Settings (settings/business)
// ========================================================

export async function getBusinessSettings(): Promise<BusinessProfileSettings> {
  try {
    const docRef = doc(db, "settings", "business");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_BUSINESS_SETTINGS, ...(snap.data() as BusinessProfileSettings) };
    }
  } catch (err) {
    console.warn("Firestore getBusinessSettings error:", err);
  }
  return DEFAULT_BUSINESS_SETTINGS;
}

export function subscribeBusinessSettings(
  callback: (settings: BusinessProfileSettings) => void,
): () => void {
  callback(DEFAULT_BUSINESS_SETTINGS);
  const docRef = doc(db, "settings", "business");
  return onSnapshot(
    docRef,
    (snap) => {
      if (snap.exists()) {
        callback({ ...DEFAULT_BUSINESS_SETTINGS, ...(snap.data() as BusinessProfileSettings) });
      } else {
        callback(DEFAULT_BUSINESS_SETTINGS);
      }
    },
    (err) => {
      console.warn("Firestore business settings subscription error:", err);
    },
  );
}

export async function updateBusinessSettings(
  settings: Partial<BusinessProfileSettings>,
): Promise<void> {
  const current = await getBusinessSettings();
  const updated: BusinessProfileSettings = {
    ...current,
    ...settings,
    updatedAt: getKolkataISOString(),
  };
  const docRef = doc(db, "settings", "business");
  await setDoc(docRef, cleanFirestoreData(updated), { merge: true });
}

// ========================================================
// Server Cart Services (carts/{uid})
// ========================================================

export function subscribeCart(
  uid: string,
  callback: (cart: CartDoc | null) => void,
  onError?: (err: Error) => void,
): () => void {
  const cartRef = doc(db, "carts", uid);
  return onSnapshot(
    cartRef,
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as CartDoc);
      } else {
        callback(null);
      }
    },
    (err) => {
      if (onError) onError(err);
      else console.error("Firestore cart subscription error:", err);
    },
  );
}

export async function saveCart(
  uid: string,
  items: CartDoc["items"],
  couponCode?: string | null,
): Promise<void> {
  const cartRef = doc(db, "carts", uid);
  const payload: CartDoc = {
    items,
    couponCode: couponCode || undefined,
    updatedAt: getKolkataISOString(),
  };
  await setDoc(cartRef, cleanFirestoreData(payload));
}

export async function clearServerCart(uid: string): Promise<void> {
  const cartRef = doc(db, "carts", uid);
  await deleteDoc(cartRef);
}

// ========================================================
// Server Checkout Draft Services (drafts/{uid})
// ========================================================

export async function getCheckoutDraft(uid: string): Promise<CheckoutDraftDoc | null> {
  try {
    const draftRef = doc(db, "drafts", uid);
    const snap = await getDoc(draftRef);
    if (snap.exists()) {
      return snap.data() as CheckoutDraftDoc;
    }
  } catch (err) {
    console.warn("Firestore getCheckoutDraft notice:", err);
  }
  return null;
}

export async function saveCheckoutDraft(
  uid: string,
  draft: Partial<CheckoutDraftDoc>,
): Promise<void> {
  const draftRef = doc(db, "drafts", uid);
  const payload: CheckoutDraftDoc = {
    uid,
    ...draft,
    updatedAt: getKolkataISOString(),
  };
  await setDoc(draftRef, cleanFirestoreData(payload), { merge: true });
}

export async function deleteCheckoutDraft(uid: string): Promise<void> {
  const draftRef = doc(db, "drafts", uid);
  await deleteDoc(draftRef);
}

// ========================================================
// Customer Feedback Services (feedback/{orderId})
// ========================================================

export async function submitFeedback(
  feedback: Omit<FeedbackItem, "id" | "createdAt"> & { id?: string; createdAt?: string },
): Promise<FeedbackItem> {
  if (!feedback.orderId) {
    throw new Error("Order ID is required to submit feedback.");
  }
  const intRating = Math.round(feedback.rating);
  if (!intRating || intRating < 1 || intRating > 5) {
    throw new Error("Rating must be an integer between 1 and 5 stars.");
  }

  // Document ID is strictly feedback.orderId (ensures 1 feedback per order)
  const docRef = doc(db, "feedback", feedback.orderId);
  const payload: FeedbackItem = {
    ...feedback,
    id: feedback.orderId,
    feedbackId: feedback.orderId,
    rating: intRating,
    createdAt: feedback.createdAt || getKolkataISOString(),
  };

  await setDoc(docRef, cleanFirestoreData(payload));

  // Mark feedbackGiven = true on order
  try {
    const orderRef = doc(db, "orders", feedback.orderId);
    await updateDoc(orderRef, { feedbackGiven: true });
  } catch (err) {
    console.warn("Could not mark order feedbackGiven flag:", err);
  }

  return payload;
}

export function subscribeFeedback(callback: (items: FeedbackItem[]) => void): () => void {
  const colRef = collection(db, "feedback");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        feedbackId: d.id,
        ...d.data(),
      })) as FeedbackItem[];
      callback(items);
    },
    (err) => {
      console.error("Firestore feedback subscription error:", err);
    },
  );
}

// ========================================================
// Equipment Refill & Renewal Alerts Services (reminders/{reminderId})
// ========================================================

export async function createRenewalReminder(
  order: OrderItem,
  item: {
    productId?: string | undefined;
    name: string;
    renewalMonths?: 3 | 6 | 9 | 12 | undefined;
  },
  installDateStr?: string,
  cycleNumber: number = 1,
): Promise<ReminderItem | null> {
  const months = item.renewalMonths;
  if (!months) return null;

  const installDate = installDateStr || order.installDate || getKolkataDateString();
  const renewalDate = addMonthsWithClamp(installDate, months);
  const alertDate = subtractDaysKolkata(renewalDate, 7);

  const safeProdId = item.productId || slugify(item.name);
  const safeOrderId = order.orderNumber || order.id || order.orderId || "";
  // Deterministic ID prevents duplicate reminders per orderId + productId + cycleNumber
  const reminderId = `REM-${safeOrderId}-${safeProdId}-${cycleNumber}`;
  const nowIso = getKolkataISOString();

  const reminder: ReminderItem = {
    id: reminderId,
    reminderId,
    orderId: safeOrderId,
    userId: order.customerId || "guest",
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    productId: safeProdId,
    productName: item.name,
    renewalMonths: months,
    installDate,
    renewalDate,
    alertDate,
    status: "pending",
    cycle: cycleNumber,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  const docRef = doc(db, "reminders", reminderId);
  await setDoc(docRef, cleanFirestoreData(reminder), { merge: true });
  return reminder;
}

export function subscribeReminders(callback: (reminders: ReminderItem[]) => void): () => void {
  const colRef = collection(db, "reminders");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ReminderItem[];
      callback(items);
    },
    (err) => {
      console.error("Firestore reminders subscription error:", err);
    },
  );
}

export async function markReminderCompleted(
  reminderId: string,
  completionDateOrNote?: string,
  scheduleNextOrAdmin?: boolean | string,
): Promise<{ completedReminder: ReminderItem; nextReminder?: ReminderItem }> {
  const docRef = doc(db, "reminders", reminderId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    throw new Error(`Reminder ${reminderId} not found in Firestore.`);
  }

  const current = snap.data() as ReminderItem;
  const nowIso = getKolkataISOString();

  await updateDoc(docRef, {
    status: "completed",
    completedAt: nowIso,
    updatedAt: nowIso,
  });

  const shouldScheduleNext = scheduleNextOrAdmin !== false;
  if (!shouldScheduleNext) {
    return { completedReminder: { ...current, status: "completed", completedAt: nowIso } };
  }

  const nextCycle = (current.cycle || 1) + 1;
  const nextInstallDate = current.renewalDate;
  const nextRenewalDate = addMonthsWithClamp(nextInstallDate, current.renewalMonths);
  const nextAlertDate = subtractDaysKolkata(nextRenewalDate, 7);
  const nextReminderId = `REM-${current.orderId}-${current.productId}-${nextCycle}`;

  const nextReminder: ReminderItem = {
    id: nextReminderId,
    reminderId: nextReminderId,
    orderId: current.orderId,
    userId: current.userId,
    customerName: current.customerName,
    customerPhone: current.customerPhone,
    customerEmail: current.customerEmail,
    productId: current.productId,
    productName: current.productName,
    renewalMonths: current.renewalMonths,
    installDate: nextInstallDate,
    renewalDate: nextRenewalDate,
    alertDate: nextAlertDate,
    status: "pending",
    cycle: nextCycle,
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  await setDoc(doc(db, "reminders", nextReminderId), cleanFirestoreData(nextReminder), {
    merge: true,
  });

  return { completedReminder: { ...current, status: "completed", completedAt: nowIso }, nextReminder };
}

export async function processDueRemindersFallback(): Promise<number> {
  const today = getKolkataDateString();
  const nowIso = getKolkataISOString();

  try {
    const q = query(
      collection(db, "reminders"),
      where("status", "==", "pending"),
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return 0;

    let processed = 0;
    for (const d of snapshot.docs) {
      const reminderId = d.id;
      const reminder = d.data() as ReminderItem;

      // Filter by alertDate <= today without requiring composite index
      if (reminder.alertDate && reminder.alertDate > today) {
        continue;
      }

      // Idempotency: verify status is still pending before marking sent
      try {
        const docRef = doc(db, "reminders", reminderId);
        const freshSnap = await getDoc(docRef);
        if (!freshSnap.exists() || freshSnap.data()?.["status"] !== "pending") {
          continue;
        }

        await updateDoc(docRef, {
          status: "sent",
          lastAlertSentAt: nowIso,
          updatedAt: nowIso,
        });

        await createNotification({
          userId: reminder.userId,
          title: "Upcoming Safety Refill / Inspection Due",
          message: `Your ${reminder.productName} (Order #${reminder.orderId}) is scheduled for refill on ${reminder.renewalDate}. Contact +91 8639858221 to schedule inspection.`,
          type: "renewal",
          orderId: reminder.orderId,
          reminderId,
          read: false,
          createdAt: nowIso,
        });

        processed++;
      } catch (err) {
        console.warn(`Idempotency check error on reminder ${reminderId}:`, err);
      }
    }
    return processed;
  } catch (err) {
    console.warn("processDueRemindersFallback notice:", err);
    return 0;
  }
}

// ========================================================
// In-App Notifications Services (notifications/{id})
// ========================================================

export async function createNotification(notif: Omit<NotificationItem, "id">): Promise<void> {
  const colRef = collection(db, "notifications");
  await addDoc(colRef, cleanFirestoreData(notif));
}

export function subscribeNotifications(
  userId: string,
  callback: (notifications: NotificationItem[]) => void,
): () => void {
  const colRef = collection(db, "notifications");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const all = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as NotificationItem[];
      const userNotifs = all.filter(
        (n) =>
          n.userId === userId || n.userId === "all" || (userId === "admin" && n.userId === "admin"),
      );
      callback(userNotifs);
    },
    (err) => {
      console.error("Firestore notifications subscription error:", err);
    },
  );
}

export async function markNotificationRead(id: string): Promise<void> {
  const docRef = doc(db, "notifications", id);
  await updateDoc(docRef, { read: true });
}
