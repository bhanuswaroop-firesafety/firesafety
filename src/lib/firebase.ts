import { initializeApp, getApps, getApp, deleteApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  PhoneAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type ConfirmationResult,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: import.meta.env["VITE_FIREBASE_API_KEY"] || "",
  authDomain: import.meta.env["VITE_FIREBASE_AUTH_DOMAIN"] || "",
  projectId: import.meta.env["VITE_FIREBASE_PROJECT_ID"] || "",
  storageBucket: import.meta.env["VITE_FIREBASE_STORAGE_BUCKET"] || "",
  messagingSenderId: import.meta.env["VITE_FIREBASE_MESSAGING_SENDER_ID"] || "",
  appId: import.meta.env["VITE_FIREBASE_APP_ID"] || "",
  measurementId: import.meta.env["VITE_FIREBASE_MEASUREMENT_ID"] || "",
};

if (!firebaseConfig.apiKey && typeof window !== "undefined") {
  console.error(
    "Firebase configuration error: VITE_FIREBASE_API_KEY is missing. Please define all VITE_FIREBASE_* variables in your .env file.",
  );
}

// Initialize Firebase singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics =
  typeof window !== "undefined"
    ? (() => {
        try {
          return getAnalytics(app);
        } catch {
          return null;
        }
      })()
    : null;

// Structured error handling for Firestore
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
    },
    operationType,
    path,
  };
  console.error("Firestore Error:", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export {
  PhoneAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  initializeApp,
  getApps,
  getAuth,
  deleteApp,
};
export type { FirebaseUser, ConfirmationResult };
