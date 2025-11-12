import { renderLoginPage, renderRegisterPage } from "./pages/auth/login.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderTransactionsPage } from "./pages/transaction.js";

const app = document.getElementById("app");

// Simple hash-based router
function router() {
  const path = window.location.hash || "#/login";
  app.innerHTML = '<div class="loading-spinner"></div>'; // Show loading spinner on page change

  // Check if user is authenticated
  const token = localStorage.getItem("token");

  if (!token && path !== "#/register") {
    // If not logged in and not on register page, force to login
    console.log("Showing login page");
    renderLoginPage(app);
    return;
  }

  // Route to the correct page
  switch (path) {
    case "#/dashboard":
      renderDashboardPage(app);
      break;
    case "#/login":
      renderLoginPage(app);
      break;
    case "#/register":
      renderRegisterPage(app);
      break;
    case "#/transactions":
      renderTransactionsPage(app);
      break;
    default:
      // If logged in and route is unknown, go to dashboard
      if (token) {
        window.location.hash = "#/dashboard";
      } else {
        renderLoginPage(app);
      }
  }
}

// Listen for hash changes to navigate
window.addEventListener("hashchange", router);

// Initial page load
window.addEventListener("DOMContentLoaded", router);
