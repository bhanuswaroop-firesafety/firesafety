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
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  onSnapshot,
  type FirebaseUser,
  type ConfirmationResult,
} from "./firebase";
import type { UserItem } from "./types";
import {
  isEmailAuthorizedAdmin,
  saveUserRecord,
  syncUserLeadRecord,
  savePhoneIndex,
  getUserEmailByPhone,
} from "./db-service";
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
  loginWithIdentifier: (identifier: string, pass: string) => Promise<void>;
  registerWithEmail: (
    email: string,
    pass: string,
    name?: string,
    metadata?: UserRegistrationMeta,
  ) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
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

          if (profile.phone) {
            const cleanPhone = profile.phone.replace(/\D/g, "").slice(-10);
            if (cleanPhone.length === 10) {
              savePhoneIndex(cleanPhone, {
                uid: cred.user.uid,
                email: cleanEmail,
                name: profile.displayName,
              }).catch(() => {});
            }
          }
        }
      } catch (e) {
        console.warn("Firestore update error on login:", e);
      }
    }
  };

  /**
   * Universal Login: Supports logging in using a 10-digit mobile number or an email address + password.
   */
  const loginWithIdentifier = async (identifier: string, pass: string) => {
    const trimmed = identifier.trim();
    if (!trimmed) {
      throw new Error("Please enter your mobile number or email address.");
    }

    if (trimmed.includes("@")) {
      await loginWithEmail(trimmed, pass);
      return;
    }

    const cleanPhone = trimmed.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length < 10) {
      throw new Error("Please enter a valid 10-digit mobile number or email address.");
    }

    const resolvedEmail = await getUserEmailByPhone(cleanPhone);
    if (!resolvedEmail) {
      throw new Error(
        `No account found registered with mobile number +91 ${cleanPhone}. Please verify your number or create an account.`,
      );
    }

    await loginWithEmail(resolvedEmail, pass);
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name?: string,
    metadata?: UserRegistrationMeta,
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    let cred;
    try {
      cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      const msg = err instanceof Error ? err.message : String(err);
      if (code === "auth/email-already-in-use" || msg.includes("email-already-in-use")) {
        throw new Error("This account is already registered. Please log in.");
      }
      if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
        throw new Error("Please enter a valid work email address.");
      }
      if (code === "auth/weak-password" || msg.includes("weak-password")) {
        throw new Error("Password must be at least 6 characters long.");
      }
      const cleaned = msg.replace("Firebase: ", "").replace(/\(auth\/[^)]+\)/, "").trim();
      throw new Error(cleaned || "Failed to create account. Please try again.");
    }
    const now = new Date().toISOString();

    const isSuper = SUPER_ADMIN_EMAILS.includes(cleanEmail);
    const isAuthAdmin = isSuper || (await isEmailAuthorizedAdmin(cleanEmail));

    const cleanPhone = metadata?.phone ? metadata.phone.replace(/\D/g, "").slice(-10) : "";

    const newProfile: UserItem = {
      id: cred.user.uid,
      email: cleanEmail,
      displayName: name?.trim() || cleanEmail.split("@")[0] || "User",
      role: isAuthAdmin ? "admin" : "customer",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
      phone: cleanPhone || metadata?.phone?.trim() || "",
      company: metadata?.company?.trim() || "",
      ordersCount: 0,
      totalSpent: 0,
    };

    await saveUserRecord(newProfile);
    setUserProfile(newProfile);
    setUser(cred.user);

    if (cleanPhone && cleanPhone.length === 10) {
      await savePhoneIndex(cleanPhone, {
        uid: cred.user.uid,
        email: cleanEmail,
        name: newProfile.displayName,
      });
    }

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
   * Dispatches a password reset email via Firebase Auth to the specified email address.
   */
  const sendPasswordReset = async (rawEmail: string) => {
    const cleanEmail = rawEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code || "";
      const msg = err instanceof Error ? err.message : String(err);

      if (code === "auth/user-not-found" || msg.includes("user-not-found")) {
        throw new Error(
          "No account found registered with this email address. Please check your spelling or register.",
        );
      }
      if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
        throw new Error("Invalid email format. Please enter a valid email address.");
      }
      if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
        throw new Error(
          "Too many password reset requests. Please wait a few moments before trying again, or check your spam/junk folder.",
        );
      }
      const cleaned = msg.replace("Firebase: ", "").replace(/\(auth\/[^)]+\)/, "").trim();
      throw new Error(cleaned || "Failed to send password reset email. Please try again.");
    }
  };

  /**
   * Dispatches a real 6-digit SMS verification code to an E.164 phone number via Firebase Phone Auth (Blaze Plan).
   * Runs an invisible background verification without intrusive user challenges.
   */
  const sendPhoneOtp = async (
    rawPhoneNumber: string,
    recaptchaContainerId?: string,
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

    // Ensure app verification is active for real SMS delivery on Firebase Blaze plan
    try {
      auth.settings.appVerificationDisabledForTesting = false;
    } catch {
      // ignore
    }

    const targetContainerId = recaptchaContainerId || "firebase-phone-auth-container";
    let containerElem = document.getElementById(targetContainerId);
    if (!containerElem) {
      containerElem = document.createElement("div");
      containerElem.id = targetContainerId;
      document.body.appendChild(containerElem);
    }

    // Clean previous widget to avoid "reCAPTCHA has already been rendered"
    clearGlobalRecaptchaVerifier();
    containerElem.innerHTML = "";

    let verifier: RecaptchaVerifier;
    try {
      verifier = new RecaptchaVerifier(auth, targetContainerId, {
        size: "invisible",
        callback: () => {
          console.log("[Phone Auth] Invisible verification successful.");
        },
        "expired-callback": () => {
          console.warn("[Phone Auth] Verification token expired.");
          clearGlobalRecaptchaVerifier();
        },
        "error-callback": (error: any) => {
          console.error("[Phone Auth] reCAPTCHA verification error:", error);
          clearGlobalRecaptchaVerifier();
        },
      });
      (window as any).recaptchaVerifier = verifier;
      await verifier.render();
    } catch (verifierErr: unknown) {
      clearGlobalRecaptchaVerifier();
      const msg = verifierErr instanceof Error ? verifierErr.message : String(verifierErr);
      console.error("[Phone Auth] Verifier initialization failed:", verifierErr);
      throw new Error(`Failed to initialize verification security: ${msg}`);
    }

    try {
      console.log(`[Phone Auth] Requesting SMS OTP for ${normalized.e164}...`);
      const confirmation = await signInWithPhoneNumber(auth, normalized.e164, verifier);
      console.log(`[Phone Auth] SMS OTP dispatched successfully to ${normalized.e164}.`);
      return confirmation;
    } catch (err: unknown) {
      clearGlobalRecaptchaVerifier();
      console.error("[Phone Auth] signInWithPhoneNumber error:", err);

      const code = (err as { code?: string }).code || "";
      const msg = err instanceof Error ? err.message : String(err);

      if (code === "auth/invalid-phone-number" || msg.includes("invalid-phone-number")) {
        throw new Error(
          "Invalid mobile number format. Please ensure your 10-digit number is correct (e.g. 8466006486).",
        );
      }
      if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
        throw new Error(
          "Too many SMS requests sent to this number. Please wait a few minutes before trying again.",
        );
      }
      if (code === "auth/quota-exceeded" || msg.includes("quota-exceeded")) {
        throw new Error(
          "Daily SMS limit reached. (Google Cloud Blaze quotas may take 10-15 minutes to sync, or check Firebase Console > Authentication > Phone > SMS region policy for India +91).",
        );
      }
      if (
        code === "auth/billing-not-enabled" ||
        msg.toLowerCase().includes("billing") ||
        msg.includes("BILLING_NOT_ENABLED")
      ) {
        throw new Error(
          "Firebase Blaze billing is activating. Please allow 2-5 minutes for the newly linked billing account to propagate to SMS gateways.",
        );
      }
      if (code === "auth/operation-not-allowed" || msg.includes("operation-not-allowed")) {
        throw new Error(
          "Phone authentication is not enabled. Please ensure Phone provider is enabled in Firebase Console under Authentication > Sign-in method.",
        );
      }
      if (code === "auth/unauthorized-domain" || msg.includes("unauthorized-domain")) {
        const currentHost = typeof window !== "undefined" ? window.location.hostname : "current host";
        throw new Error(
          `Domain "${currentHost}" is not authorized in Firebase. Please add "${currentHost}" under Firebase Console > Authentication > Settings > Authorized domains.`,
        );
      }
      if (code === "auth/captcha-check-failed" || msg.includes("captcha-check-failed")) {
        throw new Error(
          "Security verification check failed. Please refresh the page and try again.",
        );
      }
      if (code === "auth/network-request-failed" || msg.includes("network-request-failed")) {
        throw new Error(
          "Network connection error. Please verify your internet connection and try again.",
        );
      }

      const cleaned = msg.replace("Firebase: ", "").trim();
      throw new Error(cleaned ? `${cleaned} (${code || "auth/error"})` : `Authentication error (${code})`);
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
      if (profile.phone) {
        const cleanPhoneDigits = profile.phone.replace(/\D/g, "").slice(-10);
        if (cleanPhoneDigits.length === 10) {
          await savePhoneIndex(cleanPhoneDigits, profile.email, authenticatedUser.uid).catch(() => {});
        }
      }
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

      const cleaned = msg.replace("Firebase: ", "").replace(/\(auth\/[^)]+\)/, "").trim();
      if (!cleaned || cleaned === "Error" || cleaned === "Error ." || cleaned === ".") {
        throw new Error(msg.replace("Firebase: ", "").trim() || `Authentication error: ${code}`);
      }
      throw new Error(cleaned);
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
        loginWithIdentifier,
        registerWithEmail,
        sendPasswordReset,
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
      loginWithIdentifier: async () => {},
      registerWithEmail: async () => {},
      sendPasswordReset: async () => {},
      sendPhoneOtp: async () => ({} as ConfirmationResult),
      verifyPhoneOtp: async () => ({} as FirebaseUser),
      clearRecaptchaVerifier: () => {},
      logout: async () => {},
    };
  }
  return context;
}
