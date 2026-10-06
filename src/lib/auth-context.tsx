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

interface AuthContextType {
  user: FirebaseUser | null;
  userProfile: UserItem | null;
  isAdmin: boolean;
  loading: boolean;
  authConfigError: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary project administrator emails recognized by the system
const SUPER_ADMIN_EMAILS = ["sriudharchienterprises@gmail.com", "venkateshchop14@gmail.com"];

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
          setUser(currentUser);
          if (unsubscribeDoc) {
            unsubscribeDoc();
            unsubscribeDoc = null;
          }

          if (currentUser) {
            const userDocRef = doc(db, "users", currentUser.uid);

            try {
              const snap = await getDoc(userDocRef);
              const isSuperAdmin =
                !!currentUser.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

              if (!snap.exists()) {
                // First-time user sign in: create document in Firestore users collection
                const initialProfile: UserItem = {
                  id: currentUser.uid,
                  email: currentUser.email || "",
                  displayName:
                    currentUser.displayName || currentUser.email?.split("@")[0] || "User",
                  role: isSuperAdmin ? "admin" : "customer",
                  createdAt: new Date().toISOString(),
                };
                await setDoc(userDocRef, initialProfile);
                setUserProfile(initialProfile);
              } else if (isSuperAdmin && snap.data()?.["role"] !== "admin") {
                // Ensure super administrator email retains the admin role
                await setDoc(userDocRef, { role: "admin" }, { merge: true });
                setUserProfile({
                  ...(snap.data() as UserItem),
                  role: "admin",
                });
              } else {
                setUserProfile(snap.data() as UserItem);
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
            setUserProfile(null);
            setLoading(false);
          }
        },
        (error) => {
          // If Identity Platform / Firebase Auth provider is not yet activated in console
          console.warn("Firebase Auth state callback notice:", error.message);
          const errCode = (error as { code?: string }).code;
          if (
            errCode === "auth/configuration-not-found" ||
            error.message?.includes("configuration-not-found")
          ) {
            setAuthConfigError(true);
          }
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        },
      );
    } catch (err: unknown) {
      console.warn("Firebase onAuthStateChanged setup error:", err);
      setAuthConfigError(true);
      setLoading(false);
    }

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
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
      await signInWithEmailAndPassword(auth, email, pass);
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

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
      const newProfile: UserItem = {
        id: cred.user.uid,
        email,
        displayName: name || email.split("@")[0] || "User",
        role: isSuperAdmin ? "admin" : "customer",
        createdAt: new Date().toISOString(),
      };
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

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out error:", e);
    }
    setUser(null);
    setUserProfile(null);
  };

  // Authoritative admin verification: strictly requires an active user and role === "admin" in Firestore
  const isAdmin = Boolean(user && userProfile?.role === "admin");

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
        authConfigError,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
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
