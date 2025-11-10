import { loginUser, registerUser } from "../../api.js";

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
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" class="form-control" minlength="6" required>
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

function attachFormListeners(app, isLogin) {
  const form = document.getElementById("auth-form");
  const errorMessageDiv = document.getElementById("error-message");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessageDiv.style.display = "none"; //hide previous errors

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      let data;
      console.log("Button clicked");
      console.log(isLogin);
      if (isLogin) {
        console.log("Log in");
        data = await loginUser(email, password);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.hash = "#/dashboard";
      } else {
        console.log("Register");
        data = await registerUser(email, password);
        alert("Registration successful! Please log in.");
        window.location.hash = "#/login";
      }
    } catch (error) {
      errorMessageDiv.textContent = error.message;
      errorMessageDiv.style.display = "block";
    }
  });
}

export function renderLoginPage(app) {
  app.innerHTML = renderAuthForm(true);
  attachFormListeners(app, true);
}

export function renderRegisterPage(app) {
  app.innerHTML = renderAuthForm(false);
  attachFormListeners(app, false);
}
