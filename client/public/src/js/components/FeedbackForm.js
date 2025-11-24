import { showModal, hideModal } from "./Modal.js";
import { showToast } from "./Toast.js";
import { submitFeedback } from "../api.js";

export function openFeedbackForm() {
  const formHTML = `
    <form id="feedback-form">
      <div class="form-group">
        <label for="feedback-type">Feedback Type</label>
        <select id="feedback-type" class="form-control" required>
          <option value="">Select type...</option>
          <option value="bug">🐛 Bug Report</option>
          <option value="feature">💡 Feature Request</option>
          <option value="improvement">✨ Improvement</option>
          <option value="other">💬 General Feedback</option>
        </select>
      </div>

      <div class="form-group">
        <label for="feedback-message">Your Feedback</label>
        <textarea 
          id="feedback-message" 
          class="form-control" 
          rows="5" 
          placeholder="Tell us what you think..."
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label for="feedback-email">Email (optional)</label>
        <input 
          type="email" 
          id="feedback-email" 
          class="form-control" 
          placeholder="your@email.com"
        >
        <small style="color: var(--text-light-color); font-size: var(--font-size-sm);">
          We'll only use this to follow up on your feedback
        </small>
      </div>

      <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
        <button type="button" id="cancel-feedback-btn" class="btn btn-secondary">Cancel</button>
        <button type="submit" id="submit-feedback-btn" class="btn btn-primary">Submit Feedback</button>
      </div>
    </form>
  `;

  showModal("Send Feedback", formHTML);

  // Cancel button
  document
    .getElementById("cancel-feedback-btn")
    .addEventListener("click", () => {
      hideModal();
    });

  // Form submission
  document
    .getElementById("feedback-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      const type = document.getElementById("feedback-type").value;
      const message = document.getElementById("feedback-message").value;
      const email = document.getElementById("feedback-email").value;

      if (!type || !message) {
        showToast("Please fill in all required fields", "error");
        return;
      }

      const submitBtn = document.getElementById("submit-feedback-btn");
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      try {
        // Send feedback to backend API
        const feedbackData = {
          type,
          message,
          email: email || undefined,
          userAgent: navigator.userAgent,
          url: window.location.href,
        };

        await submitFeedback(feedbackData);

        hideModal();
        showToast("Thank you for your feedback! 🎉", "success");
      } catch (error) {
        console.error("Feedback submission error:", error);
        showToast(
          error.message || "Failed to submit feedback. Please try again.",
          "error"
        );
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Feedback";
      }
    });
}
