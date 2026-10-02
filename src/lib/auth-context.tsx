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
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary project administrator email
const SUPER_ADMIN_EMAILS = ["sriudharchienterprises@gmail.com"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
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
            // First time user login: create user record in Firestore 'users' collection
            const initialProfile: UserItem = {
              id: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
              role: isSuperAdmin ? "admin" : "customer",
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);
          } else if (isSuperAdmin && snap.data()?.role !== "admin") {
            // Guarantee super admin email always holds 'admin' role in Firestore
            await setDoc(userDocRef, { role: "admin" }, { merge: true });
          }
        } catch (e) {
          console.error("Error setting up user record in Firestore:", e);
        }

        // Live real-time listener for user's role field in the Firestore 'users' collection
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
            console.warn("Firestore user profile subscription error:", err);
            setLoading(false);
          },
        );
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const loginWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
    const newProfile: UserItem = {
      id: cred.user.uid,
      email,
      displayName: name || email.split("@")[0],
      role: isSuperAdmin ? "admin" : "customer",
      createdAt: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, "users", cred.user.uid), newProfile);
    } catch (e) {
      console.error("Error creating user profile in Firestore:", e);
    }
    setUserProfile(newProfile);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  // Strictly check if the user record in Firestore has role === "admin"
  const isAdmin = userProfile?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        isAdmin,
        loading,
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
