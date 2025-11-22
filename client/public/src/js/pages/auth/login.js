import { loginUser, registerUser } from "../../api.js";
import { showToast } from "../../components/Toast.js";

// renders the authentication form based on whether it's for login or registration
function renderAuthForm(isLogin) {
  const pageTitle = isLogin ? "Login" : "Create Account";
  const buttonText = isLogin ? "Login" : "Sign Up";
  const switchText = isLogin
    ? "Don't have an account?"
    : "Already have an account?";
  const switchLink = isLogin ? "#/register" : "#/login";
  const switchAction = isLogin ? "Sign Up" : "Login";

  return `
    <div class="auth-container">
      <div class="card auth-card">
        <h1>${pageTitle}</h1>
        <div id="error-message" class="error-message"></div>
        <form id="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" class="form-control" required>
          </div>
          <div class="form-group password-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-control" minlength="6" required>
            <span class="password-toggle-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path class="eye-open" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle class="eye-open" cx="12" cy="12" r="3"></circle>
                <path class="eye-closed" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" style="display:none;"></path>
                <line class="eye-closed" x1="1" y1="1" x2="23" y2="23" style="display:none;"></line>
              </svg>
            </span>
          </div>
          ${
            !isLogin
              ? `
          <div class="form-group password-group">
            <label for="confirm-password">Confirm Password</label>
            <input type="password" id="confirm-password" class="form-control" minlength="6" required>
            <span class="password-toggle-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path class="eye-open" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle class="eye-open" cx="12" cy="12" r="3"></circle>
                <path class="eye-closed" d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" style="display:none;"></path>
                <line class="eye-closed" x1="1" y1="1" x2="23" y2="23" style="display:none;"></line>
              </svg>
            </span>
          </div>
          `
              : ""
          }
          <div class="auth-switch" style="margin-top: 1rem; text-align: right;">
              <a href="#/forgot-password">Forgot Password?</a>
          </div>
          <div class="auth-switch">
            ${switchText} <a href="${switchLink}">${switchAction}</a>
          </div>
          <button type="submit" class="btn">${buttonText}</button>
          </div>
        </form>
    </div>
    `;
}

// attaches event listeners to the authentication form
function attachFormListeners(app, isLogin) {
  const form = document.getElementById("auth-form");
  const errorMessageDiv = document.getElementById("error-message");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password"); // get confirm password field
  const togglePasswordIcons = document.querySelectorAll(
    ".password-toggle-icon",
  );

  // toggles password visibility for all password fields
  togglePasswordIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const targetInput = icon.previousElementSibling; // the input field before the icon
      const eyeOpen = icon.querySelectorAll(".eye-open");
      const eyeClosed = icon.querySelectorAll(".eye-closed");

      if (targetInput.type === "password") {
        targetInput.type = "text";
        eyeOpen.forEach((el) => (el.style.display = "none"));
        eyeClosed.forEach((el) => (el.style.display = "block"));
      } else {
        targetInput.type = "password";
        eyeOpen.forEach((el) => (el.style.display = "block"));
        eyeClosed.forEach((el) => (el.style.display = "none"));
      }
    });
  });

  // handles form submission for login and registration
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessageDiv.style.display = "none"; // hide previous errors

    const submitBtn = form.querySelector('button[type="submit"]');

    // show loading state
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // performs password confirmation for registration
    if (!isLogin) {
      const confirmPassword = document.getElementById("confirm-password").value;
      if (password !== confirmPassword) {
        errorMessageDiv.textContent = "passwords do not match.";
        errorMessageDiv.style.display = "block";
        submitBtn.classList.remove("btn-loading");
        submitBtn.disabled = false;
        return;
      }
    }

    try {
      let data;
      if (isLogin) {
        data = await loginUser(email, password);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.hash = "#/dashboard";
      } else {
        data = await registerUser(email, password);
        showToast(
          "registration successful! please complete your profile.",
          "success",
        );
        // after successful registration, redirect to onboarding page
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.hash = "#/onboarding";
      }
    } catch (error) {
      errorMessageDiv.textContent = error.message;
      errorMessageDiv.style.display = "block";

      // reset button state on error
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  });
}

// renders the login page
export function renderLoginPage(app) {
  app.innerHTML = renderAuthForm(true);
  attachFormListeners(app, true);
}

// renders the registration page
export function renderRegisterPage(app) {
  app.innerHTML = renderAuthForm(false);
  attachFormListeners(app, false);
}
