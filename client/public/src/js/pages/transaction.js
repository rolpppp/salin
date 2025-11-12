import { getTransactions, getCategories, getAccounts } from "../api.js";

let allTransactions = []; //store full list for filtering
let categories = [];
let accounts = [];

export async function renderTransactionsPage(app) {
    app.innerHTML = '<div class="loading-spinner"></div>';

    try{
        [allTransactions, categories, accounts] = await Promise.all([
            getTransactions(),
            getCategories(),
            getAccounts()
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
                        ${categories.data.map(c=> `<option value="${c.id}">${c.name}</option>`).join("")}
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
                <a href="#/dashboard" style="opacity: 0.5">Back to Dashboard</a>
            </div>
            ${filterControlsHTML}
            <div class="card">
                <table class="transactions-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Title</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody id="transactions-list-container">
                    
                    </tbody>
                </table>
            </div>
        `;

        renderTransactionsList(allTransactions);
        attachFilterListeners();
    } catch (error) {
        console.error("Failed to render transactions page: ", error);
        app.innerHTML = `<p class="error-message">Could not load transactions.</p>`;
    }
}

function attachFilterListeners() {
    const searchInput = document.getElementById("filter-search");
    const categorySelect = document.getElementById("filter-category");
    const startDateInput = document.getElementById('filter-start-date');
    const endDateInput = document.getElementById('filter-end-date');

    const applyFilters = () => {
        const filters = {
            search: searchInput.value.toLowerCase(),
            category: categorySelect.value,
            startDate: startDateInput.value,
            endDate: endDateInput.value
        };

        const filtered = allTransactions.filter(t => {
            if (filters.search && !t.title.toLowerCase().includes(filters.search)) return false;
            if (filters.category && t.category_id !== filters.category) return false;
            if (filters.startDate && t.date < filters.startDate) return false;
            if (filters.endDate && t.date > filters.endDate) return false;
            return true;
        });
        
        renderTransactionsList(filtered);
    };

    [searchInput, categorySelect, startDateInput, endDateInput].forEach(el => {
        el.addEventListener('change', applyFilters);
        if (el.type === 'text') el.addEventListener('keyup', applyFilters);
    });
}

function renderTransactionsList(list) {
    const container = document.getElementById("transactions-list-container");
    container.innerHTML = "";

    list.forEach(t => {
        // Determine the class based on transaction type
        const typeClass = t.type === "income" ? "income" : "expense";

        // Format amount neatly
        const formattedAmount = parseFloat(t.amount).toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
        });

        container.innerHTML += `
            <tr>
                <td>${t.date}</td>
                <td>${t.title}</td>
                <td class="amount ${typeClass}"> ${t.type === "income" ? "+" : "-"}₱${formattedAmount}
                </td>
            </tr>
        `;
    });
}
