import { app, db, FCM_VAPID_KEY } from "./firebase";
import { doc, setDoc, arrayUnion } from "firebase/firestore";

let messagingInstance: any = null;

/**
 * Check if Web Push Notifications and FCM are supported in current browser/environment
 */
export async function isPushNotificationSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!("serviceWorker" in navigator) || !("Notification" in window)) return false;

  try {
    const { isSupported } = await import("firebase/messaging");
    return await isSupported();
  } catch {
    return false;
  }
}

/**
 * Get current Notification Permission status
 */
export function getPushPermissionStatus(): NotificationPermission | "unsupported" {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "unsupported";
  }
  return Notification.permission;
}

/**
 * Register the FCM service worker and return registration
 */
async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;

  try {
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
      scope: "/",
    });
    await navigator.serviceWorker.ready;
    return registration;
  } catch (err) {
    console.warn("[FCM Service Worker] Registration failed:", err);
    return null;
  }
}

/**
 * Request notification permission from user, acquire FCM token, and link with user profile in Firestore
 */
export async function requestPushPermissionAndGetToken(
  userId?: string,
): Promise<{ success: boolean; token?: string; error?: string }> {
  const supported = await isPushNotificationSupported();
  if (!supported) {
    return {
      success: false,
      error: "Push notifications are not supported by this browser.",
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: "Notification permission was not granted by user.",
      };
    }

    const swReg = await registerMessagingServiceWorker();
    const { getMessaging, getToken } = await import("firebase/messaging");

    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }

    const token = await getToken(messagingInstance, {
      vapidKey: FCM_VAPID_KEY,
      serviceWorkerRegistration: swReg || undefined,
    });

    if (!token) {
      return {
        success: false,
        error: "Could not retrieve FCM device registration token.",
      };
    }

    // Cache locally in browser
    try {
      localStorage.setItem("sue_fcm_token", token);
    } catch {}

    // Link device token with user profile in Cloud Firestore
    if (userId) {
      try {
        const userRef = doc(db, "users", userId);
        await setDoc(
          userRef,
          {
            fcmToken: token,
            fcmTokens: arrayUnion(token),
            fcmTokenUpdatedAt: new Date().toISOString(),
          },
          { merge: true },
        );
        console.log(`[FCM] Device token registered for user: ${userId}`);
      } catch (dbErr) {
        console.warn("[FCM] Notice saving token to user profile:", dbErr);
      }
    }

    return { success: true, token };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[FCM] Error requesting token:", msg);
    return { success: false, error: msg };
  }
}

/**
 * Listen to foreground push notifications while website is currently open in active tab
 */
export async function listenToForegroundMessages(
  callback: (payload: any) => void,
): Promise<(() => void) | null> {
  const supported = await isPushNotificationSupported();
  if (!supported) return null;

  try {
    const { getMessaging, onMessage } = await import("firebase/messaging");
    if (!messagingInstance) {
      messagingInstance = getMessaging(app);
    }

    return onMessage(messagingInstance, (payload) => {
      console.log("[FCM Foreground] Received push message:", payload);
      callback(payload);

      // If browser permission is granted and tab is active, trigger native desktop notification as well
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        const title = payload.notification?.title || payload.data?.title || "Sri Udharchi Enterprises";
        const body = payload.notification?.body || payload.data?.body || "Order update received.";
        try {
          new Notification(title, {
            body,
            icon: payload.notification?.icon || "/sri-udharchi-enterprises-logo.png",
          });
        } catch {}
      }
    });
  } catch (err) {
    console.warn("[FCM] Foreground listener setup notice:", err);
    return null;
  }
}
