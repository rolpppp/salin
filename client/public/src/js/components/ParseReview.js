import { showModal, hideModal } from "./Modal.js";
import { showToast } from "./Toast.js";
import {
  parseText,
  createTransaction,
  getAccounts,
  getCategories,
} from "../api.js";
import { formatCurrency } from "../utils.js";

let parsedTransactions = [];
let accounts = [];
let categories = [];

export async function openParseReviewModal(text) {
  const modalContent = `
        <div id="parse-loading" class="loading-spinner"></div>
        <div id="parse-results" style="display: none;">
            <p style="margin-bottom: var(--space-md);">Review the transactions found by the AI and click save.</p>
            <ul id="parsed-list" class="management-list"></ul>
            <button id="save-parsed-btn" class="btn btn-primary" style="width: 100%; margin-top: var(--space-md);">Save All</button>
        </div>
    `;
  showModal("Parsing Your Note...", modalContent);

  try {
    // fetch everything needed in parallel
    const [parsedData, userAccounts, userCategories] = await Promise.all([
      parseText(text),
      getAccounts(),
      getCategories(),
    ]);

    console.log("Parsed data:", parsedData);
    console.log("Accounts:", userAccounts);
    console.log("Categories:", userCategories);

    // Handle different response formats
    parsedTransactions = Array.isArray(parsedData)
      ? parsedData
      : parsedData?.transactions || parsedData?.data || [];

    accounts = Array.isArray(userAccounts)
      ? userAccounts
      : userAccounts?.data || [];

    categories = Array.isArray(userCategories)
      ? userCategories
      : userCategories?.data || [];

    console.log("Final parsedTransactions:", parsedTransactions);
    console.log("Final accounts:", accounts);
    console.log("Final categories:", categories);

    // Validate we have accounts and categories
    if (!accounts || accounts.length === 0) {
      hideModal();
      showToast(
        "You need to create at least one account before adding transactions. Please go to Accounts page.",
        "error"
      );
      return;
    }

    if (!categories || categories.length === 0) {
      hideModal();
      showToast(
        "You need to create at least one category before adding transactions. Please go to Categories page.",
        "error"
      );
      return;
    }

    renderResults();
    attachSaveListener();
  } catch (error) {
    console.error("Parse error:", error);
    hideModal();
    showToast(
      error.message ||
        "Failed to parse your note. Please check your internet connection and try again.",
      "error"
    );
  }
}

function renderResults() {
  document.getElementById("parse-loading").style.display = "none";
  document.getElementById("parse-results").style.display = "block";

  const listContainer = document.getElementById("parsed-list");

  if (!parsedTransactions || parsedTransactions.length === 0) {
    listContainer.innerHTML = "<li>No transactions found in the text.</li>";
    document.getElementById("save-parsed-btn").disabled = true;
    return;
  }

  listContainer.innerHTML = parsedTransactions
    .map((t, index) => {
      const transactionType = t.type || "expense";
      const filteredCategories = categories.filter(
        (c) => c.type === transactionType
      );

      // find default account (Cash or Wallet for expenses, first account for income)
      let defaultAccountId = accounts[0]?.id;
      if (transactionType === "expense") {
        const cashAccount = accounts.find(
          (a) =>
            a.name.toLowerCase().includes("cash") ||
            a.name.toLowerCase().includes("wallet")
        );
        if (cashAccount) defaultAccountId = cashAccount.id;
      }

      return `
        <li class="management-list-item" data-index="${index}">
            <div class="item-details" style="width: 100%;">
                <input type="text" class="form-control" value="${t.title || ""}" data-field="title" placeholder="Transaction title">
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <input type="number" class="form-control" value="${t.amount || 0}" data-field="amount" style="width: 25%;" step="0.01">
                    <select class="form-control" data-field="type" style="width: 25%;" onchange="document.getElementById('parsed-list').dispatchEvent(new Event('change', {bubbles: true}))">
                        <option value="expense" ${transactionType === "expense" ? "selected" : ""}>Expense</option>
                        <option value="income" ${transactionType === "income" ? "selected" : ""}>Income</option>
                    </select>
                    <select class="form-control" data-field="category_id" style="flex: 1;">
                        <option value="">Select Category</option>
                        ${filteredCategories.length > 0 ? filteredCategories.map((c) => `<option value="${c.id}" ${t.category && c.name.toLowerCase() === t.category.toLowerCase() ? "selected" : ""}>${c.name}</option>`).join("") : '<option value="">No categories</option>'}
                    </select>
                    <select class="form-control" data-field="account_id" style="flex: 1;">
                        <option value="">Select Account</option>
                        ${accounts.length > 0 ? accounts.map((a) => `<option value="${a.id}" ${a.id === defaultAccountId ? "selected" : ""}>${a.name}</option>`).join("") : '<option value="">No accounts available</option>'}
                    </select>
                </div>
            </div>
        </li>
    `;
    })
    .join("");

  // re-attach listener for type changes to update categories
  listContainer.addEventListener("change", (e) => {
    if (e.target.dataset.field === "type") {
      const listItem = e.target.closest("li");
      const index = listItem.dataset.index;
      const selectedType = e.target.value;
      const categorySelect = listItem.querySelector(
        '[data-field="category_id"]'
      );

      const filteredCategories = categories.filter(
        (c) => c.type === selectedType
      );
      categorySelect.innerHTML = `
                <option value="">Select Category</option>
                ${filteredCategories.map((c) => `<option value="${c.id}">${c.name}</option>`).join("")}
            `;
    }
  });
}

function attachSaveListener() {
  const saveBtn = document.getElementById("save-parsed-btn");

  // Remove any existing listeners to prevent multiple clicks
  const newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

  newSaveBtn.addEventListener("click", async () => {
    // Prevent multiple clicks
    if (newSaveBtn.disabled) return;

    newSaveBtn.textContent = "Saving...";
    newSaveBtn.disabled = true;

    try {
      const promises = parsedTransactions.map(async (t, index) => {
        const itemEl = document.querySelector(`li[data-index='${index}']`);
        const categoryValue = itemEl.querySelector(
          '[data-field="category_id"]'
        ).value;
        const accountValue = itemEl.querySelector(
          '[data-field="account_id"]'
        ).value;
        const typeValue = itemEl.querySelector('[data-field="type"]').value;

        const transactionData = {
          title: itemEl.querySelector('[data-field="title"]').value.trim(),
          amount: parseFloat(
            itemEl.querySelector('[data-field="amount"]').value
          ),
          category_id: categoryValue, // keep as string (UUID)
          type: typeValue, // use selected type
          date: t.date || new Date().toISOString().split("T")[0],
          account_id: accountValue, // keep as string (UUID)
          description: null,
        };

        console.log(`Transaction ${index + 1}:`, transactionData);

        // Validation
        if (!transactionData.title) {
          throw new Error(`Transaction ${index + 1}: Title is required.`);
        }
        if (isNaN(transactionData.amount) || transactionData.amount <= 0) {
          throw new Error(
            `Transaction ${index + 1}: Valid amount is required.`
          );
        }
        if (!transactionData.account_id) {
          throw new Error(
            `Transaction ${index + 1}: Please select an account.`
          );
        }
        if (!transactionData.category_id) {
          throw new Error(
            `Transaction ${index + 1}: Please select a category.`
          );
        }

        // Check account balance for expenses
        if (transactionData.type === "expense") {
          const selectedAccount = accounts.find(
            (a) => a.id === transactionData.account_id
          );

          if (selectedAccount && !selectedAccount.allow_negative) {
            const currentBalance = parseFloat(selectedAccount.balance) || 0;
            const resultingBalance = currentBalance - transactionData.amount;

            if (resultingBalance < 0) {
              const shortfall = Math.abs(resultingBalance);
              throw new Error(
                `Transaction ${index + 1}: Insufficient balance in "${selectedAccount.name}". Need ₱${formatCurrency(shortfall)} more (Current: ₱${formatCurrency(currentBalance)}, Required: ₱${formatCurrency(transactionData.amount)})`
              );
            }
          }
        }

        return createTransaction(transactionData);
      });

      const results = await Promise.allSettled(promises);

      // Check for failures
      const failures = [];
      const successes = [];

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          failures.push({ index, reason: result.reason });
        } else {
          successes.push({ index, value: result.value });
        }
      });

      if (failures.length === 0) {
        // All succeeded - close modal and show success
        hideModal();
        showToast(
          `All ${successes.length} transaction${successes.length > 1 ? "s" : ""} saved successfully!`,
          "success"
        );
        window.dispatchEvent(new CustomEvent("transactionsUpdated"));
      } else if (successes.length > 0) {
        // Partial success - close modal and show warning with details
        hideModal();
        const failureDetails = failures
          .map((f) => {
            const errorMsg = f.reason?.message || "Unknown error";
            const errorMsgLower = errorMsg.toLowerCase();

            // Check if it's our detailed balance error (already has good message)
            if (
              errorMsg.includes("Insufficient balance in") ||
              errorMsg.includes("Need ₱")
            ) {
              return errorMsg; // Use the detailed message as-is
            } else if (
              errorMsgLower.includes("negative balance") ||
              errorMsgLower.includes("does not allow negative")
            ) {
              const transactionNum = f.index + 1;
              return `Transaction ${transactionNum}: Insufficient balance`;
            } else if (errorMsgLower.includes("required")) {
              const transactionNum = f.index + 1;
              return `Transaction ${transactionNum}: Missing required field`;
            } else if (errorMsgLower.includes("invalid")) {
              const transactionNum = f.index + 1;
              return `Transaction ${transactionNum}: Invalid data`;
            } else {
              return errorMsg;
            }
          })
          .join(". ");

        showToast(
          `${successes.length} transaction${successes.length > 1 ? "s" : ""} saved. ${failures.length} failed: ${failureDetails}`,
          "warning"
        );
        window.dispatchEvent(new CustomEvent("transactionsUpdated"));
      } else {
        // All failed - keep modal open and show error
        const errorTypes = failures.map((f) => {
          const errorMsg = f.reason?.message || "Unknown error";
          const errorMsgLower = errorMsg.toLowerCase();

          // Check if it's our detailed balance error (already has good message)
          if (
            errorMsg.includes("Insufficient balance in") ||
            errorMsg.includes("Need ₱")
          ) {
            return errorMsg; // Use the detailed message as-is
          } else if (
            errorMsgLower.includes("negative balance") ||
            errorMsgLower.includes("does not allow negative")
          ) {
            const transactionNum = f.index + 1;
            return `Transaction ${transactionNum}: Insufficient balance`;
          } else if (errorMsgLower.includes("required")) {
            const transactionNum = f.index + 1;
            return `Transaction ${transactionNum}: Missing required field`;
          } else if (errorMsgLower.includes("invalid")) {
            const transactionNum = f.index + 1;
            return `Transaction ${transactionNum}: Invalid data`;
          } else {
            return errorMsg;
          }
        });

        const errorSummary = errorTypes.slice(0, 2).join(". ");
        const moreErrors =
          failures.length > 2
            ? `. Plus ${failures.length - 2} more error(s)`
            : "";

        throw new Error(`${errorSummary}${moreErrors}`);
      }
    } catch (error) {
      console.error("Save error:", error);
      // Keep modal open, show error, and re-enable button
      showToast(
        error.message ||
          "Failed to save transactions. Please fix the errors and try again.",
        "error"
      );
      newSaveBtn.textContent = "Save All";
      newSaveBtn.disabled = false;
    }
  });
}
