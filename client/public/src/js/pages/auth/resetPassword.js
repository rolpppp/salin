import { resetPassword } from "../../api.js";

let recoveryToken = null;

export function renderResetPasswordPage(app) {
  app.innerHTML = `
        <div class="auth-container">
            <div class="card auth-card">
                <h1>Reset Your Password</h1>
                <div id="message-area"></div>
                <form id="reset-password-form">
                    <div class="form-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" class="form-control" minlength="6" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Set New Password</button>
                </form>
            </div>
        </div>
    `;

  extractTokenFromURL();
  attachResetFormListener();
}

function extractTokenFromURL() {
  const messageArea = document.getElementById("message-area");
  const hash = window.location.hash;

  // Extract access_token from URL hash
  // Format: #/reset-password#access_token=xxx&type=recovery
  const hashParts = hash.split("#");

  if (hashParts.length > 2) {
    const params = new URLSearchParams(hashParts[2]);
    const token = params.get("access_token");
    const type = params.get("type");

    if (token && type === "recovery") {
      recoveryToken = token;
      messageArea.innerHTML = `<p style="color: var(--secondary-color);">Ready to reset your password. Enter a new password below.</p>`;

    } else {
      messageArea.innerHTML = `<p class="error-message" style="display: block;">Invalid reset link. Please request a new one.</p>`;
    }
  } else {
    messageArea.innerHTML = `<p class="error-message" style="display: block;">Invalid or expired reset link. Please request a new one.</p>`;
  }
}

function attachResetFormListener() {
  const form = document.getElementById("reset-password-form");
  const messageArea = document.getElementById("message-area");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const newPassword = document.getElementById("new-password").value;

    if (!recoveryToken) {
      messageArea.innerHTML = `<p class="error-message" style="display: block;">No valid recovery token. Please request a new reset link.</p>`;
      return;
    }

    try {
      // Call backend API to reset password
      const response = await resetPassword(newPassword, recoveryToken);

      messageArea.innerHTML = `<p style="color: var(--secondary-color);">${response.message}</p>`;
      form.style.display = "none";

      setTimeout(() => (window.location.hash = "#/login"), 3000);
    } catch (error) {
      messageArea.innerHTML = `<p class="error-message" style="display: block;">${
        error.message || "Unable to reset password. Please try again."
      }</p>`;
    }
  });
}
