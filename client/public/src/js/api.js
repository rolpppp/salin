const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://salin-six.vercel.app'
  : 'http://localhost:3000';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log('🔍 Requesting:', url); 
  console.log('🔍 API_BASE_URL:', API_BASE_URL); 

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
  return request(`/categories/type/${type}`, {headers: getAuthHeaders() });
}

export function getCategories() {
  return request("/categories", {headers: getAuthHeaders()});
}

export function getCurrentBudget() {
  return request("/budget/current", {headers: getAuthHeaders()});
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

// --- Account Endpoints ---

export function createAccount(accountData) {
  return request("/accounts", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(accountData)
  });
}

export function updateAccount(id, accountData) {
  return request(`/accounts/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(accountData)
  });
}

export function deleteAccount(id) {
  return request(`/accounts/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  })
}

// --- Category Endpoints ---

export function createCategory(categoriesData) {
  return request("/categories", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoriesData)
  });
}

export function updateCategory(id, categoriesData) {
  return request(`/categories/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(categoriesData)
  });
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
}

// ---Budget Endpoints ---

export function setBudget(budgetData) {
  return request("/budget", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(budgetData)
  });
}

export function updateBudget(id, budgetData) {
  return request(`/budget/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(budgetData)
  });
}

// --- Parsing Endpoint ---

export function parseText(text) {
  return request("/parse", {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({text})
  });
}