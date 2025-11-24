const isLocal =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.") ||
  window.location.hostname.startsWith("172.");

// for local development, use the same host as the frontend (supports local network ips)
const API_BASE_URL = isLocal
  ? `http://${window.location.hostname}:3000/api`
  : "/api";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  options.headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || data.details || "An unknown error occured."
      );
    }

    return data;
  } catch (error) {
    throw error;
  }
}

// --- Auth Endpoints ---
export async function loginUser(email, password) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.user) {
    localStorage.setItem("user_id", response.user.id);
  }

  return response;
}

export function registerUser(email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function forgotPassword(email) {
  return request("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(newPassword, token) {
  return request("/auth/reset-password", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword }),
  });
}

export async function googleSignIn() {
  const response = await request("/auth/google", {
    method: "GET",
  });
  return response;
}

export async function handleOAuthCallback(access_token, refresh_token) {
  const response = await request("/auth/oauth/callback", {
    method: "POST",
    body: JSON.stringify({ access_token, refresh_token }),
  });

  if (response.user) {
    localStorage.setItem("user_id", response.user.id);
  }

  return response;
}

// --- User Endpoints ---
export function getUser() {
  return request("/user", {
    method: "GET",
    headers: getAuthHeaders(),
  });
}

export function updateUser(username) {
  return request("/user", {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ username }),
  });
}

// --- Getting User ID ---
export function getUserID() {
  return localStorage.getItem("user_id");
}
// --- Dashboard Endpoints ---
export function getDashboardData() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found.");

  return request("/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found.");
  return { Authorization: `Bearer ${token}` };
}

// --- Data Fetching Endpoints ---
export function getAccounts() {
  return request("/accounts", { headers: getAuthHeaders() });
}

export function getCategoriesByType(type) {
  return request(`/categories/type/${type}`, { headers: getAuthHeaders() });
}

export function getCategories() {
  return request("/categories", { headers: getAuthHeaders() });
}

export function getCurrentBudget() {
  return request("/budget/current", { headers: getAuthHeaders() });
}

export function getTransactions(filters = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found.");

  const query = new URLSearchParams(filters).toString();

  return request(`/transactions?${query}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// --- Data Mutation Endpoints ---
export function createTransaction(transactionData) {
  return request("/transactions", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(transactionData),
  });
}

// --- Account Endpoints ---

export function createAccount(accountData) {
  return request("/accounts", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(accountData),
  });
}

export function updateAccount(id, accountData) {
  return request(`/accounts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(accountData),
  });
}

export function deleteAccount(id) {
  return request(`/accounts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// --- Category Endpoints ---

export function createCategory(categoriesData) {
  return request("/categories", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoriesData),
  });
}

export function updateCategory(id, categoriesData) {
  return request(`/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoriesData),
  });
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// ---Budget Endpoints ---

export function setBudget(budgetData) {
  return request("/budget", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(budgetData),
  });
}

export function updateBudget(id, budgetData) {
  return request(`/budget/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(budgetData),
  });
}

// --- Parsing Endpoint ---

export function parseText(text) {
  return request("/parse", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ text }),
  });
}

// --- Transactions Endpoints ---
export function updateTransaction(id, transactionData) {
  return request(`/transactions/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(transactionData),
  });
}

export function deleteTransaction(id) {
  return request(`/transactions/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
}

// --- Feedback Endpoint ---
export function submitFeedback(feedbackData) {
  return request("/feedback", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(feedbackData),
  });
}
