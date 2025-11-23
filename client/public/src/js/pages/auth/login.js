import { loginUser, registerUser, googleSignIn } from "../../api.js";
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
          
          <div class="divider">
            <span>or</span>
          </div>
          
          <button type="button" id="google-signin-btn" class="btn btn-google">
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </button>
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
    ".password-toggle-icon"
  );
  const googleSignInBtn = document.getElementById("google-signin-btn");

  // handles google sign-in button
  googleSignInBtn.addEventListener("click", async () => {
    try {
      googleSignInBtn.classList.add("btn-loading");
      googleSignInBtn.disabled = true;

      const response = await googleSignIn();

      if (response.url) {
        // redirect to google oauth page
        window.location.href = response.url;
      }
    } catch (error) {
      errorMessageDiv.textContent = error.message;
      errorMessageDiv.style.display = "block";
      googleSignInBtn.classList.remove("btn-loading");
      googleSignInBtn.disabled = false;
    }
  });

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
          "success"
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
