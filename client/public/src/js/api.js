const API_BASE_URL =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000/api" // PC browser
    : "https://unaidedly-vehicular-spring.ngrok-free.dev/api"; // backend server

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
export function loginUser(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerUser(email, password) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

// --- Dashboard Endpoints ---
export function getDashboardData() {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No auth token found.");

  return request("/dashboard", {
    headers: { Authorization: `Bearer ${token}` },
  });
}
