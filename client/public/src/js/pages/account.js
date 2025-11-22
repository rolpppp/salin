// client/src/js/pages/accounts.js
import { getAccounts, createAccount, updateAccount, deleteAccount, getUserID } from '../api.js';
import { showModal, hideModal } from '../components/Modal.js';
import { showToast } from '../components/Toast.js';

export async function renderAccountsPage(app) {
    app.innerHTML = '<div class="loading-spinner"></div>';
    await renderList();
}

async function renderList() {
    const app = document.getElementById('app');
    try {
        const accounts = await getAccounts();
        app.innerHTML = `
            <div class="page-header">
                <h1>Financial Accounts</h1>
                <a href="#/dashboard">Back to Dashboard</a>
            </div>
            <ul id="accounts-list" class="management-list">
                ${accounts.data.map(account => `
                    <li class="management-list-item" data-id="${account.id}">
                        <div class="item-details">
                            <span class="name">${account.name}</span>
                            <span class="meta">${account.type} - Balance: ₱${parseFloat(account.balance).toFixed(2)}</span>
                        </div>
                        <div class="item-actions">
                            <button class="edit-btn">✏️</button>
                            <button class="delete-btn">🗑️</button>
                        </div>
                    </li>
                `).join('')}
            </ul>
            <button id="add-account-btn" class="fab-add-button">+</button>
        `;
        attachListeners();
    } catch (error) {
        app.innerHTML = `<p class="error-message">Could not load accounts.</p>`;
    }
}

function openAccountForm(account = null) {
    const isEdit = account !== null;
    const title = isEdit ? 'Edit Account' : 'Add New Account';
    
    const formContent = `
        <form id="account-form">
            <div class="form-group">
                <label for="name">Account Name</label>
                <input type="text" id="name" class="form-control" value="${isEdit ? account.name : ''}" required>
            </div>
            <div class="form-group">
                <label for="type">Account Type</label>
                <input type="text" id="type" class="form-control" value="${isEdit ? account.type : ''}" placeholder="e.g., Checking, Savings, E-Wallet" required>
            </div>
            <div class="form-group">
                <label for="balance">Initial Balance</label>
                <input type="number" id="balance" class="form-control" step="0.01" value="${isEdit ? parseFloat(account.balance).toFixed(2) : '0'}" ${isEdit ? 'disabled' : ''} required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">${isEdit ? 'Save Changes' : 'Create Account'}</button>
        </form>
    `;
    
    showModal(title, formContent);
    
    document.getElementById('account-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            user_id: getUserID,
            name: document.getElementById('name').value,
            type: document.getElementById('type').value,
            balance: parseFloat(document.getElementById('balance').value)
        };
        
        try {
            if (isEdit) {
                // update only name and type
                await updateAccount(account.id, { name: formData.name, type: formData.type });
                showToast('Account updated successfully');
            } else {
                await createAccount(formData);
                showToast('Account created successfully');
            }
            hideModal();
            renderList(); 
        } catch (error) {
            showToast(error.message, 'error');
        }
    });
}

function attachListeners() {
    document.getElementById('add-account-btn').addEventListener('click', () => openAccountForm());
    
    document.getElementById('accounts-list').addEventListener('click', async (e) => {
        const target = e.target;
        const listItem = target.closest('.management-list-item');
        if (!listItem) return;
        
        const accountId = listItem.dataset.id;
        
        if (target.classList.contains('delete-btn')) {
            if (confirm('Are you sure you want to delete this account? This cannot be undone.')) {
                try {
                    await deleteAccount(accountId);
                    showToast('Account deleted successfully');
                    renderList();
                } catch (error) {
                    showToast(error.message, 'error');
                }
            }
        }
        
        if (target.classList.contains('edit-btn')) {
            const accounts = await getAccounts();
            const accountToEdit = accounts.find(a => a.id === accountId);
            openAccountForm(accountToEdit);
        }
    });
}