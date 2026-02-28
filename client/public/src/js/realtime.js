/**
 * realtime.js
 * Supabase Realtime subscriptions for live data sync.
 *
 * Dispatches custom window events so pages can react without polling:
 *   - "salin:accounts-changed"  → re-fetch accounts / update balance display
 *   - "salin:transactions-changed" → re-fetch transactions / dashboard recent list
 *   - "salin:budgets-changed"   → re-fetch budget progress
 */

import { getRealtimeToken, getUserId } from "./utils/storage.js";

// Supabase JS client loaded from CDN (no bundler required)
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

let supabaseClient = null;
let channel = null;

/**
 * Initialise realtime subscriptions.
 * Safe to call multiple times — will clean up existing subscription first.
 */
export async function initRealtime() {
  // Fetch public config from our backend
  let supabaseUrl, supabaseAnonKey;
  try {
    const res = await fetch("/api/config");
    if (!res.ok) throw new Error("config fetch failed");
    ({ supabaseUrl, supabaseAnonKey } = await res.json());
  } catch {
    console.warn("[realtime] Could not fetch Supabase config — realtime disabled.");
    return;
  }

  const realtimeToken = getRealtimeToken();
  const userId = getUserId();

  if (!realtimeToken || !userId) {
    console.warn("[realtime] No auth token — realtime disabled.");
    return;
  }

  // Clean up previous subscription if it exists
  destroyRealtime();

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${realtimeToken}` } },
    realtime: { params: { eventsPerSecond: 5 } },
  });

  // Set the session so RLS policies apply
  supabaseClient.realtime.setAuth(realtimeToken);

  channel = supabaseClient
    .channel("salin-live")
    // --- Accounts changes ---
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "accounts",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        window.dispatchEvent(
          new CustomEvent("salin:accounts-changed", { detail: payload })
        );
      }
    )
    // --- Transactions changes ---
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transactions",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        window.dispatchEvent(
          new CustomEvent("salin:transactions-changed", { detail: payload })
        );
      }
    )
    // --- Budgets changes ---
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "budgets",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        window.dispatchEvent(
          new CustomEvent("salin:budgets-changed", { detail: payload })
        );
      }
    )
    .subscribe((status) => {
      console.log(`[realtime] channel status: ${status}`);
    });
}

/**
 * Tear down the active realtime subscription.
 * Call this on logout or page unload.
 */
export function destroyRealtime() {
  if (channel && supabaseClient) {
    supabaseClient.removeChannel(channel);
    channel = null;
  }
  supabaseClient = null;
}
