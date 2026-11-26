/**
 * Firebase Cloud Messaging Service Worker
 * Project: Sri Udharchi Enterprises (sri-udharchi-enterprises-c3be7)
 * Handles background push notifications when browser tabs are closed or minimized.
 */

/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

// Initialize Firebase inside Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyCD5cGRqDx98aWvC4Xh_I38gMXIzRsvp1M",
  authDomain: "sri-udharchi-enterprises-c3be7.firebaseapp.com",
  projectId: "sri-udharchi-enterprises-c3be7",
  storageBucket: "sri-udharchi-enterprises-c3be7.firebasestorage.app",
  messagingSenderId: "157581310200",
  appId: "1:157581310200:web:f42f5d7f9180583748630d",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background push notification:", payload);

  const notificationTitle =
    payload.notification?.title || payload.data?.title || "Sri Udharchi Enterprises";
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || "New order or delivery update.",
    icon: payload.notification?.icon || "/sri-udharchi-enterprises-logo.png",
    badge: "/sri-udharchi-enterprises-logo.png",
    tag: payload.data?.orderId || "order-update",
    renotify: true,
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || "/orders?tab=tracking",
      orderId: payload.data?.orderId || "",
    },
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Focus or open target window on notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/orders?tab=tracking";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});
