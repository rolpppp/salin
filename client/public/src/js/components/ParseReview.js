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
        // fetch everything needed in parallel
        const [parsedData, userAccounts, userCategories] = await Promise.all([
            parseText(text),
            getAccounts(),
            getCategories()
        ]);

        console.log('Parsed data:', parsedData);
        console.log('Accounts:', userAccounts);
        console.log('Categories:', userCategories);

        parsedTransactions = parsedData.transactions || parsedData || [];
        accounts = userAccounts.data || userAccounts || [];
        categories = userCategories.data || userCategories || [];
        
        console.log('Final parsedTransactions:', parsedTransactions);
        console.log('Final accounts:', accounts);
        console.log('Final categories:', categories);
        
        renderResults();
        attachSaveListener();

    } catch (error) {
        console.error('Parse error:', error);
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

    listContainer.innerHTML = parsedTransactions.map((t, index) => {
        const transactionType = t.type || 'expense';
        const filteredCategories = categories.filter(c => c.type === transactionType);
        
        // find default account (Cash or Wallet for expenses, first account for income)
        let defaultAccountId = accounts[0]?.id;
        if (transactionType === 'expense') {
            const cashAccount = accounts.find(a => 
                a.name.toLowerCase().includes('cash') || 
                a.name.toLowerCase().includes('wallet')
            );
            if (cashAccount) defaultAccountId = cashAccount.id;
        }
        
        return `
        <li class="management-list-item" data-index="${index}">
            <div class="item-details" style="width: 100%;">
                <input type="text" class="form-control" value="${t.title || ''}" data-field="title" placeholder="Transaction title">
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <input type="number" class="form-control" value="${t.amount || 0}" data-field="amount" style="width: 25%;" step="0.01">
                    <select class="form-control" data-field="type" style="width: 25%;" onchange="document.getElementById('parsed-list').dispatchEvent(new Event('change', {bubbles: true}))">
                        <option value="expense" ${transactionType === 'expense' ? 'selected' : ''}>Expense</option>
                        <option value="income" ${transactionType === 'income' ? 'selected' : ''}>Income</option>
                    </select>
                    <select class="form-control" data-field="category_id" style="flex: 1;">
                        <option value="">Select Category</option>
                        ${filteredCategories.length > 0 ? filteredCategories.map(c => `<option value="${c.id}" ${t.category && c.name.toLowerCase() === t.category.toLowerCase() ? 'selected' : ''}>${c.name}</option>`).join('') : '<option value="">No categories</option>'}
                    </select>
                    <select class="form-control" data-field="account_id" style="flex: 1;">
                        <option value="">Select Account</option>
                        ${accounts.length > 0 ? accounts.map(a => `<option value="${a.id}" ${a.id === defaultAccountId ? 'selected' : ''}>${a.name}</option>`).join('') : '<option value="">No accounts available</option>'}
                    </select>
                </div>
            </div>
        </li>
    `;
    }).join('');
    
    // re-attach listener for type changes to update categories
    listContainer.addEventListener('change', (e) => {
        if (e.target.dataset.field === 'type') {
            const listItem = e.target.closest('li');
            const index = listItem.dataset.index;
            const selectedType = e.target.value;
            const categorySelect = listItem.querySelector('[data-field="category_id"]');
            
            const filteredCategories = categories.filter(c => c.type === selectedType);
            categorySelect.innerHTML = `
                <option value="">Select Category</option>
                ${filteredCategories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            `;
        }
    });
}

function attachSaveListener() {
    const saveBtn = document.getElementById('save-parsed-btn');
    saveBtn.addEventListener('click', async () => {
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        try {
            const promises = parsedTransactions.map(async (t, index) => {
                const itemEl = document.querySelector(`li[data-index='${index}']`);
                const categoryValue = itemEl.querySelector('[data-field="category_id"]').value;
                const accountValue = itemEl.querySelector('[data-field="account_id"]').value;
                const typeValue = itemEl.querySelector('[data-field="type"]').value;
                
                const transactionData = {
                    title: itemEl.querySelector('[data-field="title"]').value.trim(),
                    amount: parseFloat(itemEl.querySelector('[data-field="amount"]').value),
                    category_id: categoryValue, // keep as string (UUID)
                    type: typeValue, // use selected type
                    date: t.date || new Date().toISOString().split('T')[0],
                    account_id: accountValue, // keep as string (UUID)
                    description: null
                };
                
                console.log(`Transaction ${index + 1}:`, transactionData);
                
                // Validation
                if (!transactionData.title) {
                    throw new Error(`Transaction ${index + 1}: Title is required.`);
                }
                if (isNaN(transactionData.amount) || transactionData.amount <= 0) {
                    throw new Error(`Transaction ${index + 1}: Valid amount is required.`);
                }
                if (!transactionData.account_id) {
                    throw new Error(`Transaction ${index + 1}: Please select an account.`);
                }
                if (!transactionData.category_id) {
                    throw new Error(`Transaction ${index + 1}: Please select a category.`);
                }
                
                return createTransaction(transactionData);
            });

            await Promise.all(promises);
            hideModal();
            alert('All transactions saved successfully!');
            window.dispatchEvent(new CustomEvent('transactionsUpdated'));

        } catch (error) {
            console.error('Save error:', error);
            alert(error.message);
            saveBtn.textContent = 'Save All';
            saveBtn.disabled = false;
        }
    });
}