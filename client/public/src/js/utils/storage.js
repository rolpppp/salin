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
 */
export function setAuthData(token, user, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem("token", token);
  storage.setItem("user", JSON.stringify(user));
  if (user.id) {
    storage.setItem("user_id", user.id);
  }
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

  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("user_id");
}

/**
 * Check if user has a valid session
 * @returns {boolean} - True if token exists
 */
export function isAuthenticated() {
  return !!getAuthToken();
}
