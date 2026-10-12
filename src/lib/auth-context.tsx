import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type FirebaseUser,
} from "./firebase";
import type { UserItem } from "./types";

export interface UserRegistrationMeta {
  phone?: string | undefined;
  company?: string | undefined;
}

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserItem | null;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  loading: boolean;
  authConfigError: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    name?: string,
    metadata?: UserRegistrationMeta,
  ) => Promise<void>;
  loginAsDemo: (role: "admin" | "customer") => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary project administrator emails recognized by the system
export const SUPER_ADMIN_EMAILS = [
  "sriudharchienterprises@gmail.com",
  "venkateshchop14@gmail.com",
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [authConfigError, setAuthConfigError] = useState(false);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;
    let unsubscribeAuth: () => void = () => {};

    try {
      unsubscribeAuth = onAuthStateChanged(
        auth,
        async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            if (unsubscribeDoc) {
              unsubscribeDoc();
              unsubscribeDoc = null;
            }

            const userDocRef = doc(db, "users", currentUser.uid);
            const now = new Date().toISOString();

            try {
              const snap = await getDoc(userDocRef);
              const isSuperAdmin =
                !!currentUser.email &&
                SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

              if (!snap.exists()) {
                // First-time user sign in: create document in Firestore users collection
                const initialProfile: UserItem = {
                  id: currentUser.uid,
                  email: currentUser.email || "",
                  displayName:
                    currentUser.displayName ||
                    currentUser.email?.split("@")[0] ||
                    "User",
                  role: isSuperAdmin ? "admin" : "customer",
                  createdAt: now,
                  updatedAt: now,
                  lastLoginAt: now,
                };
                await setDoc(userDocRef, initialProfile);
                setUserProfile(initialProfile);
              } else {
                // Returning user: Record active login timestamp in Firestore database
                const updates: Partial<UserItem> = {
                  lastLoginAt: now,
                  updatedAt: now,
                };
                if (isSuperAdmin && snap.data()?.["role"] !== "admin") {
                  updates.role = "admin";
                }
                await setDoc(userDocRef, updates, { merge: true });
                setUserProfile({
                  ...(snap.data() as UserItem),
                  ...updates,
                });
              }
            } catch (e) {
              console.warn("Firestore user profile verification notice:", e);
            }

            // Real-time listener for user profile changes in Firestore
            unsubscribeDoc = onSnapshot(
              userDocRef,
              (docSnap) => {
                if (docSnap.exists()) {
                  setUserProfile(docSnap.data() as UserItem);
                } else {
                  setUserProfile(null);
                }
                setLoading(false);
              },
              (err) => {
                console.warn("Firestore user subscription notice:", err.message);
                setLoading(false);
              },
            );
          } else {
            // If no active Firebase user, check for saved interactive demo session
            let restored = false;
            if (typeof window !== "undefined") {
              try {
                const savedDemo = localStorage.getItem("sue_demo_session");
                if (savedDemo) {
                  const parsed = JSON.parse(savedDemo);
                  if (parsed?.role === "admin" || parsed?.role === "customer") {
                    loginAsDemo(parsed.role);
                    restored = true;
                  }
                }
              } catch {}
            }
            if (!restored) {
              setUser(null);
              setUserProfile(null);
              setLoading(false);
            }
          }
        },
        (error) => {
          console.warn("Firebase Auth state callback notice:", error.message);
          const errCode = (error as { code?: string }).code;
          if (
            errCode === "auth/configuration-not-found" ||
            error.message?.includes("configuration-not-found")
          ) {
            setAuthConfigError(true);
          }
          let restored = false;
          if (typeof window !== "undefined") {
            try {
              const savedDemo = localStorage.getItem("sue_demo_session");
              if (savedDemo) {
                const parsed = JSON.parse(savedDemo);
                if (parsed?.role === "admin" || parsed?.role === "customer") {
                  loginAsDemo(parsed.role);
                  restored = true;
                }
              }
            } catch {}
          }
          if (!restored) {
            setUser(null);
            setUserProfile(null);
            setLoading(false);
          }
        },
      );
    } catch (err: unknown) {
      console.warn("Firebase onAuthStateChanged setup error:", err);
      setAuthConfigError(true);
      let restored = false;
      if (typeof window !== "undefined") {
        try {
          const savedDemo = localStorage.getItem("sue_demo_session");
          if (savedDemo) {
            const parsed = JSON.parse(savedDemo);
            if (parsed?.role === "admin" || parsed?.role === "customer") {
              loginAsDemo(parsed.role);
              restored = true;
            }
          }
        } catch {}
      }
      if (!restored) {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    }

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (cred.user) {
        const userDocRef = doc(db, "users", cred.user.uid);
        const now = new Date().toISOString();
        const isSuperAdmin =
          !!cred.user.email &&
          SUPER_ADMIN_EMAILS.includes(cred.user.email.toLowerCase());

        try {
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            const initialProfile: UserItem = {
              id: cred.user.uid,
              email: cred.user.email || "",
              displayName:
                cred.user.displayName ||
                cred.user.email?.split("@")[0] ||
                "Google User",
              role: isSuperAdmin ? "admin" : "customer",
              createdAt: now,
              updatedAt: now,
              lastLoginAt: now,
            };
            await setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);
          } else {
            const updates: Partial<UserItem> = {
              lastLoginAt: now,
              updatedAt: now,
            };
            if (isSuperAdmin && snap.data()?.["role"] !== "admin") {
              updates.role = "admin";
            }
            await setDoc(userDocRef, updates, { merge: true });
            setUserProfile({
              ...(snap.data() as UserItem),
              ...updates,
            });
          }
        } catch (dbErr) {
          console.warn("Error recording Google login to Firestore:", dbErr);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (
        errorMsg.includes("auth/configuration-not-found") ||
        errorMsg.includes("configuration-not-found")
      ) {
        setAuthConfigError(true);
        throw new Error(
          "Firebase Authentication has not been activated for this project yet. Please enable Google Sign-In under Authentication > Sign-in method in the Firebase Console.",
        );
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        const userDocRef = doc(db, "users", cred.user.uid);
        const now = new Date().toISOString();
        try {
          await setDoc(
            userDocRef,
            {
              lastLoginAt: now,
              updatedAt: now,
            },
            { merge: true },
          );
        } catch (dbErr) {
          console.warn("Error recording login timestamp to Firestore:", dbErr);
        }
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (
        errorMsg.includes("auth/configuration-not-found") ||
        errorMsg.includes("configuration-not-found")
      ) {
        setAuthConfigError(true);
        throw new Error(
          "Firebase Authentication has not been activated for this project yet. Please enable Email/Password under Authentication > Sign-in method in the Firebase Console.",
        );
      }
      throw err;
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    metadata?: UserRegistrationMeta,
  ) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
      const now = new Date().toISOString();

      const newProfile: UserItem = {
        id: cred.user.uid,
        email,
        displayName: name || email.split("@")[0] || "User",
        role: isSuperAdmin ? "admin" : "customer",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };

      if (metadata?.phone?.trim()) {
        newProfile.phone = metadata.phone.trim();
      }
      if (metadata?.company?.trim()) {
        newProfile.company = metadata.company.trim();
      }

      try {
        await setDoc(doc(db, "users", cred.user.uid), newProfile);
      } catch (e) {
        console.warn("Error creating user document in Firestore:", e);
      }
      setUserProfile(newProfile);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (
        errorMsg.includes("auth/configuration-not-found") ||
        errorMsg.includes("configuration-not-found")
      ) {
        setAuthConfigError(true);
        throw new Error(
          "Firebase Authentication has not been activated for this project yet. Please enable Email/Password under Authentication > Sign-in method in the Firebase Console.",
        );
      }
      throw err;
    }
  };

  const loginAsDemo = (role: "admin" | "customer") => {
    const isSuperAdmin = role === "admin";
    const demoProfile: UserItem = {
      id: isSuperAdmin ? "demo-admin-id" : "demo-client-id",
      email: isSuperAdmin ? "sriudharchienterprises@gmail.com" : "purchasing@industrialclient.in",
      displayName: isSuperAdmin ? "Sri Udharchi Admin" : "Rajesh Kumar (Industrial Facility)",
      role: role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      company: isSuperAdmin ? "Sri Udharchi Enterprises" : "Apex Heavy Manufacturing Corp",
      phone: isSuperAdmin ? "+91 8639858221" : "+91 9876543210",
    };
    const mockUser = {
      uid: demoProfile.id,
      email: demoProfile.email,
      displayName: demoProfile.displayName,
      emailVerified: true,
      isAnonymous: false,
    } as unknown as FirebaseUser;

    setUser(mockUser);
    setUserProfile(demoProfile);
    setLoading(false);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("sue_demo_session", JSON.stringify({ role }));
      } catch {}
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("sue_demo_session");
      } catch {}
    }
    setUser(null);
    setUserProfile(null);
  };

  // Authoritative admin verification: strictly requires an active user and role === "admin"
  const isAdmin = Boolean(user && userProfile?.role === "admin");
  const isStaff = Boolean(
    user && (userProfile?.role === "staff" || userProfile?.role === "admin"),
  );
  const isCustomer = Boolean(user && userProfile?.role === "customer");

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        isStaff,
        isCustomer,
        loading,
        authConfigError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
