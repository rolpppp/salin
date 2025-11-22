import { showModal, hideModal } from "./Modal.js";
import {
  getAccounts,
  getCategoriesByType,
  createTransaction,
  updateTransaction,
} from "../api.js";

export async function openTransactionForm(type, transactionToEdit = null) {
  const isEdit = transactionToEdit !== null;

  const [accounts, categories] = await Promise.all([
    getAccounts(),
    getCategoriesByType(type),
  ]);

  const title = isEdit
    ? "Edit Transaction"
    : type === "expense"
      ? "Add New Expense"
      : "Add New Income";

  const formContentHTML = `
        <form id="transaction-form">
            <input type="hidden" id="transaction-type" value="${type}">
            
            <div id="form-error" class="form-error" style="display:none;"></div>
            
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" class="form-control" value="${
                  isEdit ? transactionToEdit.title : ""
                }" required>
            </div>

            <div class="form-group">
                <label for="amount">Amount</label>
                <input type="number" id="amount" class="form-control" value="${
                  isEdit ? parseFloat(transactionToEdit.amount).toFixed(2) : ""
                }" step="0.01" required>
            </div>

            <div class="form-group">
                <label for="category">Category</label>
                <select id="category" class="form-control" required>
                    <option value="">Select a category...</option>
                    ${categories.data
                      .map(
                        (c) =>
                          `<option value="${c.id}" ${
                            isEdit && c.id === transactionToEdit.category_id
                              ? "selected"
                              : ""
                          }>${c.name}</option>`,
                      )
                      .join("")}
                </select>
            </div>
            
            <div class="form-group">
                <label for="account">Account / Payment Method</label>
                <select id="account" class="form-control" required>
                    <option value="">Select an account...</option>
                   ${accounts.data
                     .map(
                       (a) =>
                         `<option value="${a.id}" ${
                           isEdit && a.id === transactionToEdit.account_id
                             ? "selected"
                             : ""
                         }>${a.name} (₱${parseFloat(a.balance).toFixed(
                           2,
                         )})</option>`,
                     )
                     .join("")}
                </select>
            </div>
            
            <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" class="form-control" value="${
                  isEdit
                    ? transactionToEdit.date
                    : new Date().toISOString().split("T")[0]
                }" required>
            </div>

            <div class="form-group">
                <label for="description">Description (Optional)</label>
                <textarea id="description" class="form-control" rows="2">${
                  isEdit ? transactionToEdit.description || "" : ""
                }</textarea>
            </div>

            <button type="submit" class="btn btn-primary" style="width: 100%;">${
              isEdit ? "Save Changes" : "Save Transaction"
            }</button>
        </form>
    `;

  showModal(title, formContentHTML);
  attachFormSubmitListener(isEdit ? transactionToEdit.id : null);
}

function attachFormSubmitListener(transactionId = null) {
  const form = document.getElementById("transaction-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Show loading state
    submitBtn.classList.add("btn-loading");
    submitBtn.disabled = true;

    const transactionData = {
      type: document.getElementById("transaction-type").value,
      title: document.getElementById("title").value,
      amount: parseFloat(document.getElementById("amount").value),
      category_id: document.getElementById("category").value,
      account_id: document.getElementById("account").value,
      date: document.getElementById("date").value,
      description: document.getElementById("description").value || null,
    };

    try {
      if (transactionId) {
        // if we have an ID, we are updating
        await updateTransaction(transactionId, transactionData);
      } else {
        // otherwise, we are creating
        await createTransaction(transactionData);
      }

      hideModal();
      window.dispatchEvent(new CustomEvent("transactionsUpdated"));
    } catch (error) {
      console.error("Transaction form error:", error);
      const errorDiv = document.getElementById("form-error");
      errorDiv.textContent = error.message;
      errorDiv.style.display = "block";

      // Reset button state on error
      submitBtn.classList.remove("btn-loading");
      submitBtn.disabled = false;
    }
  });
}
