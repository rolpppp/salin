import { resetPassword } from "../../api.js";

let recoveryToken = null;

export function renderResetPasswordPage(app) {
  app.innerHTML = `
        <div class="auth-container">
            <div class="card auth-card">
                <h1>Reset Your Password</h1>
                <div id="message-area"></div>
                <form id="reset-password-form">
                    <div class="form-group password-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" class="form-control" minlength="6" required>
                        <span class="password-toggle-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path class="eye-open" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle class="eye-open" cx="12" cy="12" r="3"></circle>
                            <path class="eye-closed" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" style="display:none;"></path>
                            <line class="eye-closed" x1="1" y1="1" x2="23" y2="23" style="display:none;"></line>
                          </svg>
                        </span>
                    </div>
                    <button type="submit" class="btn btn-primary">Set New Password</button>
                </form>
            </div>
        </div>
    `;

  extractTokenFromURL();
  attachResetFormListener();
  attachPasswordToggle();
}

function attachPasswordToggle() {
  const passwordInput = document.getElementById("new-password");
  const toggleIcon = document.querySelector(".password-toggle-icon");
  
  if (toggleIcon && passwordInput) {
    toggleIcon.addEventListener("click", () => {
      const eyeOpen = toggleIcon.querySelectorAll(".eye-open");
      const eyeClosed = toggleIcon.querySelectorAll(".eye-closed");
      
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        eyeOpen.forEach(el => el.style.display = "none");
        eyeClosed.forEach(el => el.style.display = "block");
      } else {
        passwordInput.type = "password";
        eyeOpen.forEach(el => el.style.display = "block");
        eyeClosed.forEach(el => el.style.display = "none");
      }
    });
  }
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
    
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Show loading state
    submitBtn.classList.add('btn-loading');
    submitBtn.disabled = true;
    
    const newPassword = document.getElementById("new-password").value;

    if (!recoveryToken) {
      messageArea.innerHTML = `<p class="error-message" style="display: block;">No valid recovery token. Please request a new reset link.</p>`;
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
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
      
      // Reset button state on error
      submitBtn.classList.remove('btn-loading');
      submitBtn.disabled = false;
    }
  });
}
