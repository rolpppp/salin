// storage utility functions for session management
// handles both localStorage (remember me) and sessionStorage (temporary session)

/**
 * Get the appropriate storage based on what's currently in use
 * @returns {Storage} - localStorage or sessionStorage
 */
function getActiveStorage() {
  if (localStorage.getItem("token")) {
    return localStorage;
  }
  if (sessionStorage.getItem("token")) {
    return sessionStorage;
  }
  // default to sessionStorage if nothing found
  return sessionStorage;
}

/**
 * Set authentication data in the appropriate storage
 * @param {string} token - JWT token
 * @param {object} user - User object
 * @param {boolean} rememberMe - Whether to persist session
 * @param {string|null} supabaseToken - Supabase access token for realtime
 */
export function setAuthData(token, user, rememberMe = false, supabaseToken = null) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
  if (user.id) {
    storage.setItem("user_id", user.id);
  }
  if (supabaseToken) {
    storage.setItem("supabase_token", supabaseToken);
  }
}

/**
 * Get the Supabase access token for realtime subscriptions
 * @returns {string|null}
 */
export function getRealtimeToken() {
  return localStorage.getItem("supabase_token") || sessionStorage.getItem("supabase_token");
}

/**
 * Set the Supabase access token for realtime subscriptions
 * @param {string} token
 */
export function setRealtimeToken(token) {
  const storage = localStorage.getItem("token") ? localStorage : sessionStorage;
  storage.setItem("supabase_token", token);
}

/**
 * Get authentication token from storage
 * @returns {string|null} - JWT token or null
 */
export function getAuthToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

/**
 * Get user data from storage
 * @returns {object|null} - User object or null
 */
export function getUser() {
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Get user ID from storage
 * @returns {string|null} - User ID or null
 */
export function getUserId() {
  return localStorage.getItem("user_id") || sessionStorage.getItem("user_id");
}

/**
 * Clear all authentication data from both storages
 */
export function clearAuthData() {
  // clear from both storages to ensure clean logout
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("user_id");
  localStorage.removeItem("supabase_token");

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("user_id");
  sessionStorage.removeItem("supabase_token");
}

/**
 * Check if user has a valid session
 * @returns {boolean} - True if token exists
 */
export function isAuthenticated() {
  return !!getAuthToken();
}
