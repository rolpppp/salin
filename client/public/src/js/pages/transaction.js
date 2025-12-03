import { renderErrorPage } from "../app.js";
import { showToast } from "../components/Toast.js";
import { showModal, hideModal } from "../components/Modal.js";
import {
  getTransactions,
  getCategories,
  getAccounts,
  deleteTransaction,
} from "../api.js";

let allTransactions = []; //store full list for filtering
let categories = [];
let accounts = [];
let currentPage = 1;
let itemsPerPage = 25;
let sortColumn = "date";
let sortDirection = "desc";

export async function renderTransactionsPage(app) {
  app.innerHTML = '<div class="loading-spinner"></div>';

  try {
    const [transactionsResponse, categoriesResponse, accountsResponse] =
      await Promise.all([getTransactions(), getCategories(), getAccounts()]);

    // Handle different response formats (array vs {data: array})
    allTransactions = Array.isArray(transactionsResponse)
      ? transactionsResponse
      : transactionsResponse?.data || [];

    categories = Array.isArray(categoriesResponse)
      ? { data: categoriesResponse }
      : categoriesResponse;

    accounts = Array.isArray(accountsResponse)
      ? { data: accountsResponse }
      : accountsResponse;

    // Validate data
    if (!Array.isArray(allTransactions)) {
      throw new Error("Failed to load transactions");
    }

    if (!categories?.data || !Array.isArray(categories.data)) {
      throw new Error("Failed to load categories");
    }

    if (!accounts?.data || !Array.isArray(accounts.data)) {
      throw new Error("Failed to load accounts");
    }

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
                            (c) => `<option value="${c.id}">${c.name}</option>`
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
                                <th class="sortable" data-column="date">
                                    Date <span class="sort-indicator"></span>
                                </th>
                                <th class="sortable" data-column="title">
                                    Title <span class="sort-indicator"></span>
                                </th>
                                <th class="sortable" data-column="amount">
                                    Amount <span class="sort-indicator"></span>
                                </th>
                                <th class="sortable" data-column="account">
                                    Account <span class="sort-indicator"></span>
                                </th>
                                <th class="sortable" data-column="category">
                                    Category <span class="sort-indicator"></span>
                                </th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="transactions-list-container">
                        
                        </tbody>
                    </table>
                </div>
                <div id="pagination-container" class="pagination-container"></div>
            </div>
        `;

    currentPage = 1;
    sortColumn = "date";
    sortDirection = "desc";
    renderTransactionsList(allTransactions);
    attachFilterListeners();
    attachSortListeners();
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
    // Check if delete button or its child elements were clicked
    const deleteBtn = target.closest(".delete-btn");
    if (deleteBtn) {
      const transactionTitle = row.querySelector(".management-list-item")
        ? row.querySelector(".name")?.textContent
        : row.querySelector("td:nth-child(2)")?.textContent ||
          "this transaction";

      showModal(
        "Delete Transaction",
        `
        <p>Are you sure you want to delete <strong>${transactionTitle}</strong>?</p>
        <p>This will also update your account balance.</p>
        <div style="display: flex; gap: 1rem; justify-content: flex-end; margin-top: 1.5rem;">
          <button id="cancel-delete-btn" class="btn btn-secondary">Cancel</button>
          <button id="confirm-delete-btn" class="btn btn-danger">Delete</button>
        </div>
        `
      );

      // Cancel button
      document
        .getElementById("cancel-delete-btn")
        .addEventListener("click", () => {
          hideModal();
        });

      // Confirm delete button
      document
        .getElementById("confirm-delete-btn")
        .addEventListener("click", async () => {
          try {
            hideModal();
            showToast("Deleting transaction...", "info");
            await deleteTransaction(transactionId);
            showToast("Transaction deleted successfully", "success");
            renderTransactionsPage(document.getElementById("app"));
          } catch (error) {
            showToast(error.message, "error");
          }
        });
    }

    // --- EDIT LOGIC ---
    // Check if edit button or its child elements were clicked
    const editBtn = target.closest(".edit-btn");
    if (editBtn) {
      const transactionToEdit = allTransactions.find(
        (t) => t.id === transactionId
      );
      if (transactionToEdit) {
        const { openTransactionForm } = await import(
          "../components/TransactionForm.js"
        );
        openTransactionForm(transactionToEdit.type, transactionToEdit);
      }
    }
  });
  const applyFiltersAndRender = (resetPage = true) => {
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

    if (resetPage) {
      currentPage = 1; // Reset to first page when filtering, but not when paginating
    }
    renderTransactionsList(filtered);
  };

  // Store the function globally for sort listeners
  window.applyFiltersAndRender = applyFiltersAndRender;

  [searchInput, categorySelect, startDateInput, endDateInput].forEach((el) => {
    el.addEventListener("change", applyFiltersAndRender);
    if (el.type === "text") el.addEventListener("keyup", applyFiltersAndRender);
  });
}

function sortTransactions(list) {
  return [...list].sort((a, b) => {
    let aVal, bVal;

    switch (sortColumn) {
      case "date":
        aVal = new Date(a.date);
        bVal = new Date(b.date);
        break;
      case "title":
        aVal = a.title.toLowerCase();
        bVal = b.title.toLowerCase();
        break;
      case "amount":
        aVal = parseFloat(a.amount);
        bVal = parseFloat(b.amount);
        break;
      case "account":
        aVal = a.accounts?.name?.toLowerCase() || "";
        bVal = b.accounts?.name?.toLowerCase() || "";
        break;
      case "category":
        aVal = a.categories?.name?.toLowerCase() || "";
        bVal = b.categories?.name?.toLowerCase() || "";
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}

function renderTransactionsList(list) {
  const container = document.getElementById("transactions-list-container");
  const paginationContainer = document.getElementById("pagination-container");

  container.innerHTML = "";
  paginationContainer.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `
            <tr>
                <td colspan="7" style="border: none; padding: 0;">
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

  // Sort transactions
  const sortedList = sortTransactions(list);

  // Calculate pagination
  const totalPages = Math.ceil(sortedList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = sortedList.slice(startIndex, endIndex);

  // Update sort indicators
  document.querySelectorAll(".sort-indicator").forEach((indicator) => {
    indicator.textContent = "";
  });
  const activeHeader = document.querySelector(
    `th[data-column="${sortColumn}"]`
  );
  if (activeHeader) {
    const indicator = activeHeader.querySelector(".sort-indicator");
    indicator.textContent = sortDirection === "asc" ? " ↑" : " ↓";
  }

  // Render transactions
  paginatedList.forEach((t) => {
    // determine the class based on transaction type
    const typeClass = t.type === "income" ? "income" : "expense";

    // format amount neatly
    const formattedAmount = parseFloat(t.amount).toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    const accountName = t.accounts?.name || "N/A";
    const categoryName = t.categories?.name || "N/A";
    const description = t.description || "-";

    container.innerHTML += `
            <tr data-id="${t.id}">
                <td>${t.date}</td>
                <td>${t.title}</td>
                <td class="amount ${typeClass}">${
                  t.type === "income" ? "+" : "-"
                }₱${formattedAmount}</td>
                <td>${accountName}</td>
                <td>${categoryName}</td>
                <td>${description}</td>
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

  // Render pagination
  if (totalPages > 1) {
    renderPagination(totalPages, sortedList.length);
  }
}

function renderPagination(totalPages, totalItems) {
  const container = document.getElementById("pagination-container");
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  let paginationHTML = `
    <div class="pagination-info">
      Showing ${startItem}-${endItem} of ${totalItems} transactions
    </div>
    <div class="pagination-controls">
  `;

  // Previous button
  paginationHTML += `
    <button class="pagination-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">
      ← Previous
    </button>
  `;

  // Page numbers
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" data-page="1">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationHTML += `
      <button class="pagination-btn ${i === currentPage ? "active" : ""}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="pagination-ellipsis">...</span>`;
    }
    paginationHTML += `<button class="pagination-btn" data-page="${totalPages}">${totalPages}</button>`;
  }

  // Next button
  paginationHTML += `
    <button class="pagination-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">
      Next →
    </button>
  `;

  paginationHTML += `</div>`;
  container.innerHTML = paginationHTML;

  // Attach pagination listeners
  container.querySelectorAll(".pagination-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (btn.disabled) return;
      const page = parseInt(btn.dataset.page);
      if (page && page !== currentPage && !isNaN(page)) {
        currentPage = page;
        window.applyFiltersAndRender(false); // Don't reset page when paginating
      }
    });
  });
}

function attachSortListeners() {
  document.querySelectorAll("th.sortable").forEach((header) => {
    header.addEventListener("click", () => {
      const column = header.dataset.column;

      if (sortColumn === column) {
        // Toggle direction if same column
        sortDirection = sortDirection === "asc" ? "desc" : "asc";
      } else {
        // New column, default to descending
        sortColumn = column;
        sortDirection = "desc";
      }

      currentPage = 1; // Reset to first page when sorting
      applyFiltersAndRender();
    });
  });
}
