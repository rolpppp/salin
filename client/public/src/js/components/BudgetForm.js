import { showModal, hideModal } from "./Modal.js";
import { setBudget, updateBudget, deleteBudget } from "../api.js";
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
            <div style="display: flex; gap: var(--space-sm);">
                <button type="submit" class="btn btn-primary" style="flex: 1;">Save Budget</button>
                ${currentBudget.id ? '<button type="button" id="delete-budget-btn" class="btn btn-danger" style="flex: 1;">Delete Budget</button>' : ""}
            </div>
        </form>
    `;

  showModal(title, formContent);

  const form = document.getElementById("budget-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');

    // show loading state
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    const budgetData = {
      month: month,
      year: year,
      amount: parseFloat(document.getElementById("amount").value),
    };

    try {
      if (currentBudget.id) {
        // if budget exists, update it
        await updateBudget(currentBudget.id, { amount: budgetData.amount });
        showToast(`Budget updated to ₱${formatCurrency(budgetData.amount)}`);
      } else {
        // if no budget exists, create new one
        await setBudget(budgetData);
        showToast(`Budget set to ₱${formatCurrency(budgetData.amount)}`);
      }

      hideModal();
      window.dispatchEvent(new CustomEvent("transactionsUpdated"));
    } catch (error) {
      showToast(error.message, "error");

      // reset button state on error
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  });

  // handle delete budget
  if (currentBudget.id) {
    const deleteBtn = document.getElementById("delete-budget-btn");
    deleteBtn.addEventListener("click", async () => {
      // show confirmation dialog
      const confirmContent = `
        <div style="text-align: center; padding: var(--space-md);">
          <div style="font-size: 48px; margin-bottom: var(--space-md);">⚠️</div>
          <p style="margin-bottom: var(--space-lg); color: var(--text-color);">Are you sure you want to delete your budget for ${monthName} ${year}?</p>
          <p style="margin-bottom: var(--space-lg); font-size: var(--font-size-sm); color: var(--text-light-color);">Budget tracking will stop for this month. Your transactions will remain unaffected.</p>
          <div style="display: flex; gap: var(--space-sm); justify-content: center;">
            <button id="cancel-delete-btn" class="btn" style="flex: 1;">Cancel</button>
            <button id="confirm-delete-btn" class="btn btn-danger" style="flex: 1;">Delete Budget</button>
          </div>
        </div>
      `;

      // replace modal content with confirmation
      showModal("Delete Budget?", confirmContent);

      // handle cancel
      document
        .getElementById("cancel-delete-btn")
        .addEventListener("click", () => {
          // return to budget form
          openBudgetForm(currentBudget);
        });

      // handle confirm delete
      document
        .getElementById("confirm-delete-btn")
        .addEventListener("click", async () => {
          const confirmBtn = document.getElementById("confirm-delete-btn");
          confirmBtn.classList.add("btn-loading");
          confirmBtn.disabled = true;

          try {
            await deleteBudget(currentBudget.id);
            showToast("Budget deleted successfully");
            hideModal();
            window.dispatchEvent(new CustomEvent("transactionsUpdated"));
          } catch (error) {
            showToast(error.message, "error");
            confirmBtn.classList.remove("btn-loading");
            confirmBtn.disabled = false;
          }
        });
    });
  }
}
