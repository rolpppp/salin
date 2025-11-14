import { showModal, hideModal } from "./Modal.js";
import { parseText, createTransaction, getAccounts, getCategories } from '../api.js';

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
    showModal('Parsing Your Note...', modalContent);
    
    try {
        // Fetch everything we need in parallel
        const [parsedData, userAccounts, userCategories] = await Promise.all([
            parseText(text),
            getAccounts(),
            getCategories('expense') // Assuming paste is for expenses
        ]);

        parsedTransactions = parsedData;
        accounts = userAccounts;
        categories = userCategories;
        
        renderResults();
        attachSaveListener();

    } catch (error) {
        document.getElementById('parse-loading').innerHTML = `<p class="error-message">${error.message}</p>`;
    }
}


function renderResults() {
    document.getElementById('parse-loading').style.display = 'none';
    document.getElementById('parse-results').style.display = 'block';

    const listContainer = document.getElementById('parsed-list');
    
    if (!parsedTransactions || parsedTransactions.length === 0) {
        listContainer.innerHTML = '<li>No transactions found in the text.</li>';
        document.getElementById('save-parsed-btn').disabled = true;
        return;
    }

    listContainer.innerHTML = parsedTransactions.map((t, index) => `
        <li class="management-list-item" data-index="${index}">
            <div class="item-details" style="width: 100%;">
                <input type="text" class="form-control" value="${t.title || ''}" data-field="title">
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <input type="number" class="form-control" value="${t.amount || 0}" data-field="amount" style="width: 30%;">
                    <select class="form-control" data-field="category_id">
                        ${categories.map(c => `<option value="${c.id}" ${t.category && c.name.toLowerCase() === t.category.toLowerCase() ? 'selected' : ''}>${c.name}</option>`).join('')}
                    </select>
                </div>
            </div>
        </li>
    `).join('');
}

function attachSaveListener() {
    const saveBtn = document.getElementById('save-parsed-btn');
    saveBtn.addEventListener('click', async () => {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const promises = parsedTransactions.map(async (t, index) => {
                const itemEl = document.querySelector(`li[data-index='${index}']`);
                const transactionData = {
                    title: itemEl.querySelector('[data-field="title"]').value,
                    amount: parseFloat(itemEl.querySelector('[data-field="amount"]').value),
                    category_id: itemEl.querySelector('[data-field="category_id"]').value,
                    type: 'expense', // Hardcoded for now
                    date: t.date || new Date().toISOString().split('T')[0],
                    // For simplicity, we assign the first account. A better UI would let the user choose.
                    account_id: accounts[0]?.id 
                };
                if (!transactionData.account_id) throw new Error("No financial account available to assign transactions to.");
                return createTransaction(transactionData);
            });

            await Promise.all(promises);
            hideModal();
            window.dispatchEvent(new CustomEvent('transactionsUpdated'));

        } catch (error) {
            alert(error.message);
            saveBtn.textContent = 'Save All';
            saveBtn.disabled = false;
        }
    });
}