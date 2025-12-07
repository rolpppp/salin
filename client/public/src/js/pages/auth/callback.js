import { handleOAuthCallback } from "../../api.js";
import { showToast } from "../../components/Toast.js";
import { setAuthData } from "../../utils/storage.js";

// renders the oauth callback page (shown while processing oauth response)
export function renderOAuthCallbackPage(app) {
  app.innerHTML = `
    <div class="auth-container">
      <div class="card auth-card">
        <h1>Signing you in...</h1>
        <div class="loading-spinner"></div>
        <p style="text-align: center; color: var(--text-secondary-color); margin-top: var(--space-lg);">
          Please wait while we complete your sign-in.
        </p>
      </div>
    </div>
  `;

  // process the oauth callback
  processOAuthCallback();
}

async function processOAuthCallback() {
  try {
    // Debug: log the full URL
    console.log("Full URL:", window.location.href);
    console.log("Hash:", window.location.hash);

    // Supabase returns tokens in the hash fragment after #
    // The hash might look like: #access_token=xxx&refresh_token=yyy
    // or it might be nested like: #/auth/callback#access_token=xxx

    let hashString = window.location.hash;

    // Remove the leading # if present
    if (hashString.startsWith("#")) {
      hashString = hashString.substring(1);
    }

    // If there's a nested hash (like #/auth/callback#access_token=xxx)
    // we need to get the part after the second #
    if (hashString.includes("#")) {
      const parts = hashString.split("#");
      hashString = parts[parts.length - 1]; // Get the last part
    }

    // Also remove any leading /auth/callback or similar route
    if (hashString.startsWith("/auth/callback")) {
      hashString = hashString.substring("/auth/callback".length);
      if (hashString.startsWith("#")) {
        hashString = hashString.substring(1);
      }
    }

    console.log("Parsed hash string:", hashString);

    const hashParams = new URLSearchParams(hashString);

    // extract tokens from hash
    const access_token = hashParams.get("access_token");
    const refresh_token = hashParams.get("refresh_token");

    console.log("Access token found:", !!access_token);
    console.log("Refresh token found:", !!refresh_token);

    if (!access_token) {
      // Log all available parameters for debugging
      console.log("Available parameters:", Array.from(hashParams.keys()));
      throw new Error("No access token received from Google");
    }

    // send tokens to backend for validation and session creation
    const response = await handleOAuthCallback(access_token, refresh_token);

    // store user data and token (default to localStorage for OAuth logins)
    setAuthData(response.token, response.user, true);

    // check if user needs onboarding (check if they have set up their username and have accounts)
    if (!response.user.username) {
      showToast("Welcome! Please complete your profile.", "success");
      window.location.hash = "#/onboarding";
    } else {
      const displayName =
        response.user.full_name || response.user.username || "there";
      showToast(`Welcome back, ${displayName}!`, "success");
      window.location.hash = "#/dashboard";
    }
  } catch (error) {
    console.error("OAuth callback error:", error);
    showToast(error.message || "Failed to sign in with Google", "error");

    // redirect back to login after a short delay
    setTimeout(() => {
      window.location.hash = "#/login";
    }, 2000);
  }
}
