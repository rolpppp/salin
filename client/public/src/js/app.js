import { renderAccountsPage } from "./pages/account.js";
import { renderLoginPage, renderRegisterPage } from "./pages/auth/login.js";
import { renderCategoriesPage } from "./pages/categories.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderTransactionsPage } from "./pages/transaction.js";
import { renderForgotPasswordPage } from "./pages/auth/forgotPassword.js";
import { renderResetPasswordPage } from "./pages/auth/resetPassword.js";

const app = document.getElementById("app");

// Simple hash-based router
function router() {
  const path = window.location.hash || "#/login";
  app.innerHTML = '<div class="loading-spinner"></div>'; // Show loading spinner on page change

  // Check if user is authenticated
  const token = localStorage.getItem("token");

  // Handle reset password page first (before auth checks)
  // This includes both direct navigation and Supabase recovery links with tokens
  if (path.startsWith("#/reset-password") || (path.startsWith("#access_token") && path.includes("type=recovery"))) {
    renderResetPasswordPage(app); 
    return;
  }

  // Allow access to public pages without authentication
  const publicPages = ["#/register", "#/forgot-password", "#/login"];
  
  if (!token && !publicPages.includes(path)) {
    // If not logged in and not on a public page, force to login
    console.log("Showing login page");
    renderLoginPage(app);
    return;
  }

  // If logged in and trying to access auth pages, redirect to dashboard
  if (token && (path === "#/login" || path === "#/register" || path === "#/forgot-password")) {
    window.location.hash = "#/dashboard";
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
    case "#/accounts":
      renderAccountsPage(app);
      break;
    case "#/categories":
      renderCategoriesPage(app);
      break;
    case '#/forgot-password':
      renderForgotPasswordPage(app);
      break;
    case '#/reset-password':
      renderResetPasswordPage(app);
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
