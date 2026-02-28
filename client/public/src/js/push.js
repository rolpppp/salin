/**
 * push.js
 * Handles Web Push notification subscription for budget alerts.
 *
 * Call initPushNotifications() once after the user reaches the dashboard.
 * It will request permission once, subscribe, and POST to /api/push/subscribe.
 */

import { getAuthToken } from "./utils/storage.js";

const PERMISSION_ASKED_KEY = "salin_push_asked";

export async function initPushNotifications() {
  // Only run once per device
  if (localStorage.getItem(PERMISSION_ASKED_KEY)) return;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;

  // Don't spam — ask only if not already granted/denied
  if (Notification.permission === "denied") return;

  localStorage.setItem(PERMISSION_ASKED_KEY, "1");

  // Small delay so the page settles first
  await new Promise((r) => setTimeout(r, 2000));

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  try {
    const reg = await navigator.serviceWorker.ready;

    // Fetch VAPID public key from backend config
    const configRes = await fetch("/api/config");
    if (!configRes.ok) return;
    const { vapidPublicKey } = await configRes.json();
    if (!vapidPublicKey) return;

    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    });

    const token = getAuthToken();
    if (!token) return;

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey("p256dh")),
          auth: arrayBufferToBase64(subscription.getKey("auth")),
        },
      }),
    });
  } catch (err) {
    console.warn("[push] subscription failed:", err);
  }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

function arrayBufferToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
