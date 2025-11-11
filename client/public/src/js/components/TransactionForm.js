import { showModal, hideModal } from "./Modal.js";
import { getAccounts, getUserID, getCategories, createTransaction } from "../api.js";

export async function openTransactionForm(type){
    const [accounts, categories] = await Promise.all([
        getAccounts(),
        getCategories(type)
    ]);

    const title = type === "expense" ? "Add New Expense" : "Add New Income";

    const formContentHTML = `
        <form id="transaction-form">
            <input type="hidden" id="transaction-type" value="${type}">
            <div id="form-error" class="form-error" style="display:none;"></div>
            <div class="form-group">
                <label for="title">Title</label>
                <input type="text" id="title" class="form-control" required>
            </div>

            <div class="form-group">
                <label for="amount">Amount</label>
                <input type="number" id="amount" class="form-control" step="1.00" required>
            </div>

            <div class="form-group">
                <label for="category">Category</label>
                <select id="category" class="form-control" required>
                    <option value="">Select a category...</option>
                    ${categories.data.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
            </div>

            <div class="form-group">
                <label for="account">Account / Payment Method</label>
                <select id="account" class="form-control" required>
                    <option value="">Select an account...</option>
                   ${accounts.data.map(a => `<option value="${a.id}">${a.name} (₱${parseFloat(a.balance).toFixed(2)})</option>`).join('')}
                </select>
            </div>
            
            <div class="form-group">
                <label for="date">Date</label>
                <input type="date" id="date" class="form-control" value="${new Date().toISOString().split("T")[0]}" required>
            </div>

            <div class="form-group">
                <label for="description">Description (Optional)</label>
                <textarea id="description" class="form-control" rows="2"></textarea>
            </div>

            <button id="save-transaction" type="submit" class="btn btn-primary" style="width: 100%;">Save Transaction</button>
        </form>
    `

    showModal(title, formContentHTML);
    attachFormSubmitListener();
}

function attachFormSubmitListener() {
    const form = document.getElementById("transaction-form")
    form.addEventListener("submit", async (e) =>{
        console.log("button clicked")
        e.preventDefault();

        const transactionData = {
            type: document.getElementById("transaction-type").value,
            user_id: getUserID,
            title: document.getElementById("title").value,
            amount: parseFloat(document.getElementById("amount").value),
            category_id: document.getElementById("category").value,
            account_id: document.getElementById("account").value,
            date: document.getElementById("date").value,
            description: document.getElementById("description").value,
        };

        try {
            await createTransaction(transactionData);
            console.log("button clicked");
            hideModal();

            window.dispatchEvent(new CustomEvent("transactionsUpdated"));
        }catch(error) {
            const errorDiv = document.getElementById("form-error");
            errorDiv.textContent = error.messsage;
            errorDiv.style.display = "block";
        }
    });
}