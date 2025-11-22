// client/public/src/js/pages/onboarding.js
import { showToast } from "../components/Toast.js";
import { getUserID, updateAccount, createAccount } from "../api.js";

// renders the onboarding page, which collects user details and initial account information
export function renderOnboardingPage(app) {
  app.innerHTML = `
        <div class="auth-container">
            <div class="card auth-card">
                <h1>Welcome to <span style="color: var(--primary-color);">salin</span>!</h1>
                <p style="text-align: center; margin-bottom: 1.5rem; color: var(--text-secondary-color);">
                    Let's set up your profile and first account to get started.
                </p>
                <div id="error-message" class="error-message"></div>
                <form id="onboarding-form">
                    <div class="form-group">
                        <label for="username">Your Name</label>
                        <input type="text" id="username" class="form-control" placeholder="e.g., Juan" maxlength="50" required>
                        <small style="color: var(--text-light-color); font-size: var(--font-size-sm); margin-top: var(--space-xs); display: block;">
                            Keep it short and simple
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="account-type">Account Type</label>
                        <select id="account-type" class="form-control" required>
                            <option value="">Select account type...</option>
                            <option value="cash">Cash</option>
                            <option value="bank">Bank Account</option>
                            <option value="e-wallet">E-Wallet (GCash, PayMaya, etc.)</option>
                            <option value="credit_card">Credit Card</option>
                        </select>
                        <small style="color: var(--text-light-color); font-size: var(--font-size-sm); margin-top: var(--space-xs); display: block;">
                            You can add more accounts later
                        </small>
                    </div>
                    
                    <div class="form-group">
                        <label for="initial-balance">Initial Balance</label>
                        <input type="number" id="initial-balance" class="form-control" step="0.01" placeholder="0.00" required>
                        <small style="color: var(--text-light-color); font-size: var(--font-size-sm); margin-top: var(--space-xs); display: block;">
                            Enter your current balance for this account
                        </small>
                    </div>
                    
                    <button type="submit" class="btn btn-primary">Get Started</button>
                </form>
            </div>
        </div>
    `;

  attachOnboardingListeners();
}

// attaches event listeners to the onboarding form
function attachOnboardingListeners() {
  const form = document.getElementById("onboarding-form");
  const errorMessageDiv = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessageDiv.style.display = "none";

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    const username = document.getElementById("username").value.trim();
    const accountType = document
      .getElementById("account-type")
      .value.toLowerCase();
    const initialBalance = parseFloat(
      document.getElementById("initial-balance").value
    );

    // validation
    if (!username) {
      errorMessageDiv.textContent = "please enter your name.";
      errorMessageDiv.style.display = "block";
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
      return;
    }

    if (!accountType) {
      errorMessageDiv.textContent = "please select an account type.";
      errorMessageDiv.style.display = "block";
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
      return;
    }

    if (isNaN(initialBalance)) {
      errorMessageDiv.textContent = "please enter a valid initial balance.";
      errorMessageDiv.style.display = "block";
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
      return;
    }

    try {
      // store username in localStorage for now (can be used in dashboard)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      user.name = username;
      localStorage.setItem("user", JSON.stringify(user));

      // create the initial account with user-selected type
      const accountName = getAccountName(accountType);
      await createAccount({
        name: accountName,
        type: accountType,
        balance: initialBalance,
      });

      showToast("account setup complete! welcome to salin.", "success");
      setTimeout(() => {
        window.location.hash = "#/dashboard";
      }, 500);
    } catch (error) {
      errorMessageDiv.textContent =
        error.message || "failed to complete onboarding.";
      errorMessageDiv.style.display = "block";
      showToast(error.message || "failed to complete setup.", "error");
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  });
}

// helper function to get default account name based on type
function getAccountName(type) {
  const accountNames = {
    cash: "Cash",
    bank: "Bank Account",
    "e-wallet": "E-Wallet",
    credit_card: "Credit Card",
  };
  return accountNames[type] || "My Account";
}
