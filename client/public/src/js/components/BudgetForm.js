import { showModal, hideModal } from "./Modal.js";
import { setBudget, updateBudget } from "../api.js";
import { getCurrentBudget } from "../api.js";
import { showToast } from "./Toast.js";
import { formatCurrency } from "../utils.js";

// open budget form to allow user to input current budget
export function openBudgetForm(currentBudget = {}) {
  const now = new Date();
  const monthName = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const title = `Set Budget for ${monthName} ${year}`;

  const formContent = `
        <form id="budget-form">
            <div class="form-group">
                <label for="amount">Budget Amount</label>
                <input type="number" id="amount" class="form-control" step="1.00" value="${
                  currentBudget.amount > 0
                    ? parseFloat(currentBudget.amount).toFixed(2)
                    : ""
                }" placeholder="e.g., 500" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Save Budget</button>
        </form>
    `;

  showModal(title, formContent);

  const form = document.getElementById("budget-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');

    // Show loading state
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    const budgetData = {
      month: month,
      year: year,
      amount: parseFloat(document.getElementById("amount").value),
    };

    try {
      if (currentBudget.id) {
        // Budget exists, update it
        await updateBudget(currentBudget.id, { amount: budgetData.amount });
        showToast(`Budget updated to ₱${formatCurrency(budgetData.amount)}`);
      } else {
        // No budget exists, create new one
        await setBudget(budgetData);
        showToast(`Budget set to ₱${formatCurrency(budgetData.amount)}`);
      }

      hideModal();
      window.dispatchEvent(new CustomEvent("transactionsUpdated"));
    } catch (error) {
      showToast(error.message, "error");

      // Reset button state on error
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  });
}
