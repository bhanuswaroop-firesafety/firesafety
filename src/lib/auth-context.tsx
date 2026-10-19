import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  onSnapshot,
  type FirebaseUser,
  type ConfirmationResult,
} from "./firebase";
import type { UserItem } from "./types";
import { isEmailAuthorizedAdmin, saveUserRecord, syncUserLeadRecord } from "./db-service";
import { normalizePhoneNumber, formatIndianMobileDisplay } from "./phone-utils";

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
  sendPhoneOtp: (
    phoneNumber: string,
    recaptchaContainerId?: string,
  ) => Promise<ConfirmationResult>;
  verifyPhoneOtp: (
    confirmationResult: ConfirmationResult,
    otp: string,
    metadata?: { name?: string; company?: string; email?: string },
  ) => Promise<FirebaseUser>;
  clearRecaptchaVerifier: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Primary project administrator emails recognized by the system
export const SUPER_ADMIN_EMAILS = ["bhanuswaroop04@gmail.com"];

export function clearGlobalRecaptchaVerifier() {
  if (typeof window !== "undefined" && (window as any).recaptchaVerifier) {
    try {
      (window as any).recaptchaVerifier.clear();
    } catch (e) {
      console.warn("Failed to clear recaptcha verifier:", e);
    }
    (window as any).recaptchaVerifier = null;
  }
}

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
              const isSuper =
                !!currentUser.email && SUPER_ADMIN_EMAILS.includes(currentUser.email.toLowerCase());
              const isAuthAdmin =
                isSuper ||
                (currentUser.email ? await isEmailAuthorizedAdmin(currentUser.email) : false);

              if (!snap.exists()) {
                // New user: Default to "customer" role. Never assign admin on client without server authorization.
                const phoneDisplay = currentUser.phoneNumber
                  ? formatIndianMobileDisplay(currentUser.phoneNumber)
                  : "";
                const initialProfile: UserItem = {
                  id: currentUser.uid,
                  email:
                    currentUser.email ||
                    (currentUser.phoneNumber
                      ? `${currentUser.phoneNumber.replace("+", "")}@mobile.udharchi.in`
                      : ""),
                  displayName:
                    currentUser.displayName ||
                    phoneDisplay ||
                    currentUser.email?.split("@")[0] ||
                    "Client User",
                  role: isAuthAdmin ? "admin" : "customer",
                  phone: currentUser.phoneNumber || "",
                  createdAt: now,
                  updatedAt: now,
                  lastLoginAt: now,
                };
                await saveUserRecord(initialProfile);
                setUserProfile(initialProfile);
              } else {
                // Returning user: Load authoritative profile from Firestore
                const currentData = snap.data() as UserItem;
                const updates: Partial<UserItem> = {
                  lastLoginAt: now,
                  updatedAt: now,
                };
                if (currentUser.phoneNumber && !currentData.phone) {
                  updates.phone = currentUser.phoneNumber;
                }
                if (isAuthAdmin && currentData.role !== "admin") {
                  updates.role = "admin";
                }
                const mergedProfile: UserItem = {
                  ...currentData,
                  ...updates,
                };
                await saveUserRecord(mergedProfile);
                setUserProfile(mergedProfile);
              }

              // Maintain active lead record
              syncUserLeadRecord({
                uid: currentUser.uid,
                phone: currentUser.phoneNumber || undefined,
                email: currentUser.email || undefined,
                source: "session_restore",
              }).catch(() => {});
            } catch (e) {
              console.warn("Firestore user profile check notice:", e);
            }

            // Real-time listener for user profile updates
            unsubscribeDoc = onSnapshot(
              userDocRef,
              (docSnap) => {
                if (docSnap.exists()) {
                  const data = docSnap.data() as UserItem;
                  setUserProfile(data);
                }
                setLoading(false);
              },
              (err) => {
                console.warn("Firestore user subscription notice:", err.message);
                setLoading(false);
              },
            );
          } else {
            // User signed out
            setUser(null);
            setUserProfile(null);
            setLoading(false);
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
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        },
      );
    } catch (err: unknown) {
      console.warn("Firebase onAuthStateChanged setup notice:", err);
      setUser(null);
      setUserProfile(null);
      setLoading(false);
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
        const isSuper =
          !!cred.user.email && SUPER_ADMIN_EMAILS.includes(cred.user.email.toLowerCase());
        const isAuthAdmin =
          isSuper || (cred.user.email ? await isEmailAuthorizedAdmin(cred.user.email) : false);

        try {
          const snap = await getDoc(userDocRef);
          if (!snap.exists()) {
            const initialProfile: UserItem = {
              id: cred.user.uid,
              email: cred.user.email || "",
              displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "Client User",
              role: isAuthAdmin ? "admin" : "customer",
              createdAt: now,
              updatedAt: now,
              lastLoginAt: now,
            };
            await saveUserRecord(initialProfile);
            setUserProfile(initialProfile);
          } else {
            const currentData = snap.data() as UserItem;
            const updates: Partial<UserItem> = {
              lastLoginAt: now,
              updatedAt: now,
            };
            if (isAuthAdmin && currentData.role !== "admin") {
              updates.role = "admin";
            }
            const updatedProfile = {
              ...currentData,
              ...updates,
            };
            await saveUserRecord(updatedProfile);
            setUserProfile(updatedProfile);
          }
        } catch (dbErr) {
          console.warn("Error updating user profile in Firestore:", dbErr);
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
          "Google Sign-In has not been enabled in your Firebase Console. Please enable Google provider under Authentication > Sign-in method.",
        );
      }
      throw err;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user) {
      const now = new Date().toISOString();
      const userDocRef = doc(db, "users", cred.user.uid);
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          const profile = { ...(snap.data() as UserItem), lastLoginAt: now, updatedAt: now };
          await saveUserRecord(profile);
          setUserProfile(profile);
        }
      } catch (e) {
        console.warn("Firestore update error on login:", e);
      }
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    metadata?: UserRegistrationMeta,
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    const now = new Date().toISOString();

    const isSuper = SUPER_ADMIN_EMAILS.includes(cleanEmail);
    const isAuthAdmin = isSuper || (await isEmailAuthorizedAdmin(cleanEmail));

    const newProfile: UserItem = {
      id: cred.user.uid,
      email: cleanEmail,
      displayName: name?.trim() || cleanEmail.split("@")[0] || "User",
      role: isAuthAdmin ? "admin" : "customer",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      phone: metadata?.phone?.trim() || "",
      company: metadata?.company?.trim() || "",
      ordersCount: 0,
      totalSpent: 0,
    };

    await saveUserRecord(newProfile);
    setUserProfile(newProfile);
    setUser(cred.user);

    // Maintain lead record
    await syncUserLeadRecord({
      uid: cred.user.uid,
      name: newProfile.displayName,
      email: cleanEmail,
      phone: newProfile.phone,
      company: newProfile.company,
      source: "email_registration",
    });
  };

  /**
   * Dispatches a real 6-digit SMS verification code to an E.164 phone number via Firebase Phone Auth.
   * Initializes invisible reCAPTCHA on the specified DOM container, and clears on failure.
   */
  const sendPhoneOtp = async (
    rawPhoneNumber: string,
    recaptchaContainerId: string = "recaptcha-container",
  ): Promise<ConfirmationResult> => {
    const normalized = normalizePhoneNumber(rawPhoneNumber);
    if (!normalized.valid) {
      throw new Error(
        normalized.error || "Please enter a valid mobile number with country code.",
      );
    }

    if (typeof window === "undefined") {
      throw new Error("Phone authentication must be performed in the browser environment.");
    }

    const containerElem = document.getElementById(recaptchaContainerId);
    if (!containerElem) {
      throw new Error(
        `reCAPTCHA verification container (#${recaptchaContainerId}) was not found in the DOM.`,
      );
    }

    // Clean up previous instance before creating a new one to prevent 'reCAPTCHA has already been rendered'
    clearGlobalRecaptchaVerifier();

    let verifier: RecaptchaVerifier;
    try {
      verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: "invisible",
        callback: () => {
          // reCAPTCHA solved
        },
        "expired-callback": () => {
          console.warn("reCAPTCHA expired. User will re-verify upon submitting.");
          clearGlobalRecaptchaVerifier();
        },
      });

      (window as any).recaptchaVerifier = verifier;
    } catch (verifierErr: unknown) {
      clearGlobalRecaptchaVerifier();
      const msg = verifierErr instanceof Error ? verifierErr.message : String(verifierErr);
      throw new Error(`Failed to initialize verification security: ${msg}`);
    }

    try {
      const confirmation = await signInWithPhoneNumber(auth, normalized.e164, verifier);
      return confirmation;
    } catch (err: unknown) {
      // Clear verifier on error so subsequent attempts start fresh
      clearGlobalRecaptchaVerifier();

      const code = (err as { code?: string }).code || "";
      const msg = err instanceof Error ? err.message : String(err);

      if (code === "auth/invalid-phone-number" || msg.includes("invalid-phone-number")) {
        throw new Error(
          "Invalid phone number format. Please check the country code and mobile number.",
        );
      }
      if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
        throw new Error(
          "Too many requests have been made to this phone number. Please wait a few minutes, or use a Test Phone Number in Firebase Console.",
        );
      }
      if (code === "auth/quota-exceeded" || msg.includes("quota-exceeded")) {
        throw new Error(
          "Firebase daily SMS quota exceeded (10 SMS/day on free plan). To test immediately without quota limits, configure a Test Phone Number (e.g. your number + code 123456) in Firebase Console under Authentication > Sign-in method > Phone.",
        );
      }
      if (code === "auth/billing-not-enabled" || msg.includes("billing-not-enabled")) {
        throw new Error(
          "SMS dispatch requires enabling billing or configuring a Test Phone Number in Firebase Console under Authentication > Sign-in method > Phone.",
        );
      }
      if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
        throw new Error(
          "Phone authentication is not enabled. Please enable Phone provider in Firebase Console under Authentication > Sign-in method.",
        );
      }
      if (code === "auth/captcha-check-failed" || msg.includes("captcha-check-failed")) {
        throw new Error(
          "reCAPTCHA verification could not be completed. Please refresh the page and try again.",
        );
      }
      if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
        throw new Error(
          "Network connection error. Please verify your internet connection and try again.",
        );
      }

      throw new Error(msg.replace("Firebase: ", "").replace(/\(auth\/[^)]+\)/, "").trim());
    }
  };

  /**
   * Verifies the 6-digit SMS OTP code sent by Firebase Auth.
   * On confirmation, loads or initializes the user profile in Firestore.
   */
  const verifyPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otpCode: string,
    meta?: { name?: string; company?: string; email?: string },
  ): Promise<FirebaseUser> => {
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      throw new Error("Please enter the complete 6-digit verification code sent via SMS.");
    }

    try {
      const userCredential = await confirmationResult.confirm(cleanOtp);
      const authenticatedUser = userCredential.user;

      if (!authenticatedUser) {
        throw new Error("Authentication failed: No user returned by Firebase.");
      }

      const now = new Date().toISOString();
      const userDocRef = doc(db, "users", authenticatedUser.uid);

      let existingData: Partial<UserItem> = {};
      try {
        const snap = await getDoc(userDocRef);
        if (snap.exists()) {
          existingData = snap.data() as UserItem;
        }
      } catch (dbErr) {
        console.warn("Could not fetch user document:", dbErr);
      }

      const phoneDisplay = authenticatedUser.phoneNumber
        ? formatIndianMobileDisplay(authenticatedUser.phoneNumber)
        : "";

      const displayName =
        meta?.name?.trim() ||
        existingData.displayName ||
        authenticatedUser.displayName ||
        phoneDisplay ||
        "Client User";

      // Role is authoritative: never granted on client from phone number.
      // Existing Firestore role is respected. If new user, defaults strictly to "customer".
      const profileRole = existingData.role || "customer";

      const profile: UserItem = {
        id: authenticatedUser.uid,
        email:
          meta?.email?.trim().toLowerCase() ||
          authenticatedUser.email ||
          existingData.email ||
          (authenticatedUser.phoneNumber
            ? `${authenticatedUser.phoneNumber.replace("+", "")}@mobile.udharchi.in`
            : ""),
        displayName: meta?.company ? `${displayName} (${meta.company.trim()})` : displayName,
        role: profileRole,
        phone: authenticatedUser.phoneNumber || existingData.phone || "",
        company: meta?.company?.trim() || existingData.company || "",
        createdAt: existingData.createdAt || now,
        updatedAt: now,
        lastLoginAt: now,
        ordersCount: existingData.ordersCount || 0,
        totalSpent: existingData.totalSpent || 0,
      };

      await saveUserRecord(profile);
      setUser(authenticatedUser);
      setUserProfile(profile);

      // Task 3: Immediately create/maintain leads/{uid} for every registered user
      try {
        await syncUserLeadRecord({
          uid: authenticatedUser.uid,
          name: profile.displayName || "Customer",
          phone: profile.phone || authenticatedUser.phoneNumber || "",
          email: profile.email || "",
          company: profile.company || "",
          source: "otp_auth",
        });
      } catch (leadErr) {
        console.warn("Lead record creation notice:", leadErr);
      }

      return authenticatedUser;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      const msg = err instanceof Error ? err.message : String(err);

      if (code === "auth/invalid-verification-code" || msg.includes("invalid-verification-code")) {
        throw new Error(
          "Invalid OTP code. Please check the 6-digit code received on your phone and try again.",
        );
      }
      if (code === "auth/code-expired" || msg.includes("code-expired")) {
        throw new Error("The OTP code has expired. Please request a new verification code.");
      }
      if (code === "auth/session-expired" || msg.includes("session-expired")) {
        throw new Error("The verification session has expired. Please request a new OTP.");
      }

      throw new Error(msg.replace("Firebase: ", "").replace(/\(auth\/[^)]+\)/, "").trim());
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("Sign out notice:", e);
    }
    clearGlobalRecaptchaVerifier();
    setUser(null);
    setUserProfile(null);
  };

  const isAdmin = Boolean(
    user &&
      (userProfile?.role === "admin" ||
        (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase()))),
  );
  const isStaff = Boolean(user && (userProfile?.role === "staff" || userProfile?.role === "admin"));
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
        sendPhoneOtp,
        verifyPhoneOtp,
        clearRecaptchaVerifier: clearGlobalRecaptchaVerifier,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      userProfile: null,
      isAdmin: false,
      isStaff: false,
      isCustomer: false,
      loading: false,
      authConfigError: false,
      loginWithGoogle: async () => {},
      loginWithEmail: async () => {},
      registerWithEmail: async () => {},
      sendPhoneOtp: async () => ({} as ConfirmationResult),
      verifyPhoneOtp: async () => ({} as FirebaseUser),
      clearRecaptchaVerifier: () => {},
      logout: async () => {},
    };
  }
  return context;
}
