import { renderErrorPage } from "../app.js";
import { getDashboardData } from "../api.js";
import { openTransactionForm } from "../components/TransactionForm.js";
import { openBudgetForm } from "../components/BudgetForm.js";
import { openParseReviewModal } from "../components/ParseReview.js";

let currentDashboardData = {};

export async function renderDashboardPage(app) {
  try {
    const data = await getDashboardData();
    currentDashboardData = data;
    const user = JSON.parse(localStorage.getItem("user"));
    const budgetPercent =
      data.budget.amount > 0
        ? (data.budget.spent / data.budget.amount) * 100
        : 0;
      
    app.innerHTML = `
      <header class="dashboard-header">
        <h1>Hi, ${user.email.split("@")[0]}</h1>
        <a href="#/accounts" style="
          margin-right: var(--space-md); 
          color: var(--text-light-color);
          font-weight: 500;
          cursor: pointer;">Accounts</a>
        <a href="#/categories" style="
          margin-right: var(--space-md); 
          color: var(--text-light-color);
          font-weight: 500;
          cursor: pointer;">Categories</a>
        <button id="logout-btn" class="logout-btn">Logout</button>
      </header>

      <div class="card balance-card">
        <h2>Total Balance</h2>
        <p class="balance">${data.totalBalance.toFixed(2)}</p>
      </div>

      <div id="budget-card" class="card budget-card" style="cursor: pointer;">
        <div class="budget-info">
          <span>Monthly Budget</span>
          <span>₱${data.budget.spent.toFixed(2)} / ₱${parseFloat(
      data.budget.amount
    ).toFixed(2)}</span>
        </div>
        <div class="budget-progress">
          <div class="budget-progress-bar" style="width: ${budgetPercent}%"></div>
        </div>
      </div>

      <div class="card">
        <h2>Quick Add via Paste</h2>
        <textarea id="paste-area" class="form-control" rows="3" placeholder="e.g., Lunch at narnia ₱55.00 and transpo 20 pesos yesterday"></textarea>
        <button id="parse-btn" class="btn" style="width: 100%; margin-top: var(--space-sm);">Parse Note</button>
      </div>

      <div class="quick-actions">
        <button id="add-expense-btn" class="btn btn-primary">Add Expense</button>
        <button id="add-income-btn" class="btn">Add Income</button>
      </div>

      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center">
          <h2>Recent Transactions</h2>
          <a href="#/transactions" style="font-size: var(--font-size-sm); font-weight: 500; opacity: 0.5">View All</a>
        </div>
        <ul id="recent-transactions-list" class="recent-transactions-list">
        </ul>
      </div>
    `;

    window.addEventListener("transactionsUpdated", () => {
      renderDashboardPage(app)
    });

    renderRecentTransactions(data.recentTransactions);
    attachDashboardListeners();
  } catch (error) {
    renderErrorPage(app, error.message);
  }
}

function renderRecentTransactions(transactions) {
  const list = document.getElementById("recent-transactions-list");
  if (transactions.length == 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📊</div>
        <h3>No Transactions Yet</h3>
        <p>Start tracking your finances by adding your first transaction.</p>
        <button id="empty-add-expense-btn" class="btn btn-primary">Add Transaction</button>
      </div>
    `;
    
    // Add click listener for empty state button
    setTimeout(() => {
      const emptyBtn = document.getElementById("empty-add-expense-btn");
      if (emptyBtn) {
        emptyBtn.addEventListener("click", () => openTransactionForm("expense"));
      }
    }, 0);
    return;
  }

  list.innerHTML = transactions
    .map(
      (t) => `
    <li>
      <div class="transaction-details">
        <div class="title">${t.title}</div>
        <div class="date">${new Date(t.date).toLocaleDateString()}</div>
      </div>
      <div class="transaction-amount ${t.type}">
        ${t.type === "income" ? "+" : "-"}₱${parseFloat(t.amount).toFixed(2)}
      </div>
    </li>
    `
    )
    .join("");
}

function attachDashboardListeners() {
  const logoutBtn = document.getElementById("logout-btn");
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.hash = "#/login";
  });

  const addExpenseBtn = document.getElementById("add-expense-btn");
  addExpenseBtn.addEventListener("click", () => {
    openTransactionForm("expense")
  });

  const addIncomeBtn = document.getElementById("add-income-btn");
  addIncomeBtn.addEventListener("click", () => {
    openTransactionForm("income")
  });

  const budgetCard = document.getElementById('budget-card');
    budgetCard.addEventListener("click", () => {
        openBudgetForm(currentDashboardData.budget);
    });

  const parseBtn = document.getElementById('parse-btn');
    parseBtn.addEventListener('click', () => {
        const text = document.getElementById('paste-area').value;
        if (text.trim()) {
            openParseReviewModal(text);
        }
    });
}
