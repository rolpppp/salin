// register the service worker for pwa functionality
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log(
          "serviceWorker registration successful with scope: ",
          registration.scope
        );
      })
      .catch((err) => {
        console.log("serviceWorker registration failed: ", err);
      });
  });
}

// imports for rendering different application pages
import { renderAccountsPage } from "./pages/account.js";
import { renderLoginPage, renderRegisterPage } from "./pages/auth/login.js";
import { renderCategoriesPage } from "./pages/categories.js";
import { renderDashboardPage } from "./pages/dashboard.js";
import { renderTransactionsPage } from "./pages/transaction.js";
import { renderForgotPasswordPage } from "./pages/auth/forgotPassword.js";
import { renderResetPasswordPage } from "./pages/auth/resetPassword.js";
import { renderOnboardingPage } from "./pages/onboarding.js";

const app = document.getElementById("app");

// simple hash-based router
function router() {
  const path = window.location.hash || "#/login";
  app.innerHTML = '<div class="loading-spinner"></div>'; // show loading spinner on page change

  // check if user is authenticated
  const token = localStorage.getItem("token");

  // handle reset password page first (before auth checks)
  // this includes both direct navigation and supabase recovery links with tokens
  if (
    path.startsWith("#/reset-password") ||
    (path.startsWith("#access_token") && path.includes("type=recovery"))
  ) {
    renderResetPasswordPage(app);
    return;
  }

  // allow access to public pages without authentication
  const publicPages = ["#/register", "#/forgot-password", "#/login"];

  if (!token && !publicPages.includes(path)) {
    // if not logged in and not on a public page, force to login
    renderLoginPage(app);
    return;
  }

  // if logged in and trying to access auth pages, redirect to dashboard
  if (
    token &&
    (path === "#/login" ||
      path === "#/register" ||
      path === "#/forgot-password")
  ) {
    window.location.hash = "#/dashboard";
    return;
  }

  // route to the correct page
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
    case "#/forgot-password":
      renderForgotPasswordPage(app);
      break;
    case "#/reset-password":
      renderResetPasswordPage(app);
      break;
    case "#/onboarding":
      renderOnboardingPage(app);
      break;
    default:
      // if logged in and route is unknown, go to dashboard
      if (token) {
        window.location.hash = "#/dashboard";
      } else {
        renderLoginPage(app);
      }
  }
}

// renders a generic error page with a retry button
export function renderErrorPage(
  app,
  message = "an unexpected error occurred."
) {
  app.innerHTML = `
        <div class="card error-page">
            <h2>oops! something went wrong.</h2>
            <p>${message}</p>
            <button id="retry-btn" class="btn btn-primary">retry</button>
        </div>
    `;
  document.getElementById("retry-btn").addEventListener("click", router);
}

// listen for hash changes to navigate
window.addEventListener("hashchange", router);

// initial page load
window.addEventListener("DOMContentLoaded", router);
