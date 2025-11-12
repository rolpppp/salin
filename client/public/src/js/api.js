const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api" // PC browser
    : "http://192.168.1.62:3000/api"; // backend server

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
      throw new Error(data.error || "An unknown error occured.");
    }

    return data;
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    throw error;
  }
}

// --- Auth Endpoints ---
export async function loginUser(email, password) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (response.user){
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

// --- Getting User ID ---
export function getUserID(){
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
  return { "Authorization": `Bearer ${token}`};
}

// --- Data Fetching Endpoints ---
export function getAccounts() {
  return request("/accounts", { headers: getAuthHeaders()});
}

export function getCategoriesByType(type) {
  return request(`/categories/type/${type}`, {headers: getAuthHeaders()});
}

export function getCategories() {
  return request(`/categories`, {headers: getAuthHeaders()});
}

export function getTransactions(filters = {}) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found.");

  const query = new URLSearchParams(filters).toString();

  return request(`/transactions?${query}`, {
    headers: { "Authorization": `Bearer ${token}`}
  });
}

// --- Data Mutation Endpoints ---
export function createTransaction(transactionData) {
  return request("/transactions", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(transactionData)
  });
}