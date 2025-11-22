import { renderErrorPage } from "../app.js";
import { showToast } from "../components/Toast.js";
import {
  getTransactions,
  getCategories,
  getAccounts,
  deleteTransaction,
} from "../api.js";

let allTransactions = []; //store full list for filtering
let categories = [];
let accounts = [];

export async function renderTransactionsPage(app) {
  app.innerHTML = '<div class="loading-spinner"></div>';

  try {
    [allTransactions, categories, accounts] = await Promise.all([
      getTransactions(),
      getCategories(),
      getAccounts(),
    ]);

    const filterControlsHTML = `
            <div class="filter-controls card">
                <div class="form-group">
                    <label for="filter-search">Search</label>
                    <input type="text" id="filter-search" class="form-control" placeholder="e.g., Coffee">
                </div>
                <div class="form-group">   
                    <label for="filter-category">Category</label>
                    <select id="filter-category" class="form-control">
                        <option value="">ALL</option>
                        ${categories.data
                          .map(
                            (c) => `<option value="${c.id}">${c.name}</option>`,
                          )
                          .join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="filter-start-date">Start Date</label>
                        <input
                            type="text"
                            id="filter-start-date"
                            class="form-control"
                            placeholder="mm/dd/yyyy"
                            onfocus="(this.type='date')"
                            onblur="if(!this.value) this.type='text'"
                        >
                </div>
                <div class="form-group">
                    <label for="filter-end-date">End Date</label>
                    <input
                            type="text"
                            id="filter-end-date"
                            class="form-control"
                            placeholder="mm/dd/yyyy"
                            onfocus="(this.type='date')"
                            onblur="if(!this.value) this.type='text'"
                        >
                </div>
            </div>
        `;

    app.innerHTML = `
            <div class="page-header">
                <h1>All Transactions</h1>
                <a href="#/dashboard">Back to Dashboard</a>
            </div>
            ${filterControlsHTML}
            <div class="card">
                <div class="transactions-table-wrapper">
                    <table class="transactions-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-list-container">
                        
                        </tbody>
                    </table>
                </div>
            </div>
        `;

    renderTransactionsList(allTransactions);
    attachFilterListeners();
  } catch (error) {
    renderErrorPage(app, error.message);
  }
}

function attachFilterListeners() {
  const searchInput = document.getElementById("filter-search");
  const categorySelect = document.getElementById("filter-category");
  const startDateInput = document.getElementById("filter-start-date");
  const endDateInput = document.getElementById("filter-end-date");
  const tableBody = document.getElementById("transactions-list-container");

  tableBody.addEventListener("click", async (e) => {
    const target = e.target;
    const row = target.closest("tr");
    if (!row) return;

    const transactionId = row.dataset.id;

    // --- DELETE LOGIC ---
    if (target.classList.contains("delete-btn")) {
      if (
        confirm(
          "Are you sure you want to delete this transaction? This will also update your account balance.",
        )
      ) {
        try {
          await deleteTransaction(transactionId);
          showToast("Transaction deleted successfully");
          renderTransactionsPage(document.getElementById("app"));
        } catch (error) {
          showToast(error.message, "error");
        }
      }
    }

    // --- EDIT LOGIC ---
    if (target.classList.contains("edit-btn")) {
      const transactionToEdit = allTransactions.find(
        (t) => t.id === transactionId,
      );
      if (transactionToEdit) {
        const { openTransactionForm } = await import(
          "../components/TransactionForm.js"
        );
        openTransactionForm(transactionToEdit.type, transactionToEdit);
      }
    }
  });
  const applyFilters = () => {
    const filters = {
      search: searchInput.value.toLowerCase(),
      category: categorySelect.value,
      startDate: startDateInput.value,
      endDate: endDateInput.value,
    };

    const filtered = allTransactions.filter((t) => {
      if (filters.search && !t.title.toLowerCase().includes(filters.search))
        return false;
      if (filters.category && t.category_id !== filters.category) return false;
      if (filters.startDate && t.date < filters.startDate) return false;
      if (filters.endDate && t.date > filters.endDate) return false;
      return true;
    });

    renderTransactionsList(filtered);
  };

  [searchInput, categorySelect, startDateInput, endDateInput].forEach((el) => {
    el.addEventListener("change", applyFilters);
    if (el.type === "text") el.addEventListener("keyup", applyFilters);
  });
}

function renderTransactionsList(list) {
  const container = document.getElementById("transactions-list-container");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `
            <tr>
                <td colspan="4" style="border: none; padding: 0;">
                    <div class="empty-state">
                        <div class="empty-state-icon">💸</div>
                        <h3>No Transactions Found</h3>
                        <p>Try adjusting your filters or add your first transaction.</p>
                    </div>
                </td>
            </tr>
        `;
    return;
  }

  list.forEach((t) => {
    // determine the class based on transaction type
    const typeClass = t.type === "income" ? "income" : "expense";

    // format amount neatly
    const formattedAmount = parseFloat(t.amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    container.innerHTML += `
            <tr data-id="${t.id}">
                <td>${t.date}</td>
                <td>${t.title}</td>
                <td class="amount ${typeClass}"> ${
                  t.type === "income" ? "+" : "-"
                }₱${formattedAmount}
                </td>
                <td>
                <div class="item-actions">
                    <button class="edit-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                    </button>
                </div>
            </td>
            </tr>
        `;
  });
}
