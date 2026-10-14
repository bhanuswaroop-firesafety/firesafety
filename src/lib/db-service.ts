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
  orderBy,
  handleFirestoreError,
  OperationType,
  firebaseConfig,
  initializeApp,
  getApps,
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "./firebase";
import type {
  ProductItem,
  UserItem,
  InquiryItem,
  CategoryItem,
  OrderItem,
  AuthorizedAdminItem,
} from "./types";
import { OFFICIAL_CATALOG_PRODUCTS } from "./catalog-data";

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
        callback([]);
      } else {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ProductItem[];
        callback(items);
      }
    },
    (err) => {
      console.warn("Firestore products fetch warning:", err.message);
      callback([]);
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
        callback([]);
      } else {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as CategoryItem[];
        callback(items);
      }
    },
    (err) => {
      console.warn("Categories subscription warning:", err.message);
      callback([]);
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

// Orders Services
export async function submitOrder(
  order: Omit<OrderItem, "id">,
): Promise<string> {
  try {
    const colRef = collection(db, "orders");
    const docRef = await addDoc(colRef, {
      ...order,
      createdAt: order.createdAt || new Date().toISOString(),
      status: order.status || "pending",
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "orders");
  }
}

export function subscribeOrders(callback: (orders: OrderItem[]) => void) {
  const colRef = collection(db, "orders");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as OrderItem[];
      // Sort in-memory newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (err) => {
      console.warn("Orders subscription warning:", err.message);
      callback([]);
    },
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderItem["status"],
): Promise<void> {
  try {
    const docRef = doc(db, "orders", id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `orders/${id}`);
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    const docRef = doc(db, "orders", id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `orders/${id}`);
  }
}

// Seed / Sync Verified Sri Udharchi Catalog to Firestore
export async function seedOfficialCatalog(): Promise<number> {
  try {
    // 1. Sync Categories first
    const catColRef = collection(db, "categories");
    const existingCatsSnap = await getDocs(catColRef);
    const existingCatNames = new Set(existingCatsSnap.docs.map((d) => d.data().name));

    for (const cat of CATEGORIES) {
      if (!existingCatNames.has(cat)) {
        await addDoc(catColRef, {
          name: cat,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // 2. Add Official Catalog Products
    const prodColRef = collection(db, "products");
    const existingProdsSnap = await getDocs(prodColRef);
    const existingProdNames = new Set(existingProdsSnap.docs.map((d) => d.data().name));

    let addedCount = 0;
    for (const item of OFFICIAL_CATALOG_PRODUCTS) {
      if (!existingProdNames.has(item.name)) {
        await addDoc(prodColRef, {
          ...item,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        addedCount++;
      }
    }

    return addedCount;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, "products/seed");
  }
}

// ========================================================
// Authorized Administrators Management
// ========================================================

/**
 * Subscribe to the real-time list of authorized administrators.
 */
export function subscribeAuthorizedAdmins(callback: (admins: AuthorizedAdminItem[]) => void) {
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
      console.warn("Authorized admins subscription warning:", err.message);
      callback([]);
    },
  );
}

/**
 * Creates Firebase Authentication account for a new admin using a secondary app
 * so the current logged-in administrator is NOT logged out!
 */
export async function createAdminAuthAccount(
  email: string,
  pass: string,
): Promise<{ success: boolean; uid?: string; error?: string }> {
  try {
    const secondaryAppName = "AdminProvisioning";
    const existingApps = getApps();
    let secondaryApp = existingApps.find((a) => a.name === secondaryAppName);
    if (!secondaryApp) {
      secondaryApp = initializeApp(firebaseConfig, secondaryAppName);
    }
    const secondaryAuth = getAuth(secondaryApp);
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email.trim(), pass);
    const uid = cred.user.uid;
    await signOut(secondaryAuth);
    return { success: true, uid };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

/**
 * Adds an authorized administrator by email, optional password, and profile metadata.
 */
export async function addAuthorizedAdmin(data: {
  email: string;
  displayName?: string | undefined;
  password?: string | undefined;
  department?: string | undefined;
  phone?: string | undefined;
  addedBy: string;
}): Promise<{ success: boolean; createdAuth: boolean; message: string }> {
  const cleanEmail = data.email.trim().toLowerCase();
  const now = new Date().toISOString();
  let createdAuth = false;

  // 1. If password provided, create real Firebase Auth account via secondary app
  let authUid: string | undefined;
  if (data.password && data.password.trim().length >= 6) {
    const authRes = await createAdminAuthAccount(cleanEmail, data.password.trim());
    if (authRes.success) {
      createdAuth = true;
      authUid = authRes.uid;
    } else {
      console.warn("Notice during admin auth provisioning:", authRes.error);
    }
  }

  // 2. Persist in authorized_admins collection
  const adminDocRef = doc(db, "authorized_admins", cleanEmail);
  const adminRecord: AuthorizedAdminItem = {
    id: cleanEmail,
    email: cleanEmail,
    displayName: data.displayName?.trim() || cleanEmail.split("@")[0],
    role: "admin",
    department: data.department?.trim() || "Operations",
    phone: data.phone?.trim() || "",
    addedBy: data.addedBy,
    createdAt: now,
    updatedAt: now,
  };
  if (data.password) {
    adminRecord.initialPassword = data.password;
  }
  await setDoc(adminDocRef, adminRecord, { merge: true });

  // 3. If a user document exists or UID was created, ensure their role is admin
  try {
    if (authUid) {
      const userRef = doc(db, "users", authUid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        const userProfile: UserItem = {
          id: authUid,
          email: cleanEmail,
          displayName: data.displayName?.trim() || cleanEmail.split("@")[0],
          role: "admin",
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
          company: "Sri Udharchi Enterprises (Admin)",
          phone: data.phone?.trim() || "",
        };
        await setDoc(userRef, userProfile);
      } else {
        await updateDoc(userRef, { role: "admin", updatedAt: now });
      }
    } else {
      // Find user by email in users collection
      const usersSnap = await getDocs(collection(db, "users"));
      const match = usersSnap.docs.find(
        (d) => d.data()?.email?.toLowerCase() === cleanEmail,
      );
      if (match) {
        await updateDoc(doc(db, "users", match.id), { role: "admin", updatedAt: now });
      }
    }
  } catch (err) {
    console.warn("Could not sync user role doc:", err);
  }

  return {
    success: true,
    createdAuth,
    message: `Administrator ${cleanEmail} has been authorized with executive privileges.`,
  };
}

/**
 * Removes admin authorization for an email (protecting super admin).
 */
export async function removeAuthorizedAdmin(
  email: string,
  superAdmin = "bhanuswaroop04@gmail.com",
): Promise<void> {
  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail === superAdmin.toLowerCase()) {
    throw new Error("Super Administrator bhanuswaroop04@gmail.com cannot be removed.");
  }
  const adminDocRef = doc(db, "authorized_admins", cleanEmail);
  await deleteDoc(adminDocRef);

  // Downgrade in users collection if present
  try {
    const usersSnap = await getDocs(collection(db, "users"));
    const match = usersSnap.docs.find(
      (d) => d.data()?.email?.toLowerCase() === cleanEmail,
    );
    if (match) {
      await updateDoc(doc(db, "users", match.id), {
        role: "customer",
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    console.warn("Error demoting user document:", err);
  }
}

/**
 * Helper to check if an email is an authorized administrator
 */
export async function isEmailAuthorizedAdmin(
  email: string,
  superAdminEmails = ["bhanuswaroop04@gmail.com"],
): Promise<boolean> {
  const cleanEmail = email.trim().toLowerCase();
  if (superAdminEmails.map((e) => e.toLowerCase()).includes(cleanEmail)) {
    return true;
  }
  try {
    const adminSnap = await getDoc(doc(db, "authorized_admins", cleanEmail));
    if (adminSnap.exists() && adminSnap.data()?.role === "admin") {
      return true;
    }
  } catch {}
  return false;
}

