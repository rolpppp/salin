import { showModal, hideModal } from './Modal.js';
import { setBudget, updateBudget } from '../api.js';
import { getCurrentBudget } from '../api.js';

export function openBudgetForm(currentBudget = {}) {
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long' });
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const title = `Set Budget for ${monthName} ${year}`;
    
    const formContent = `
        <form id="budget-form">
            <div class="form-group">
                <label for="amount">Budget Amount</label>
                <input type="number" id="amount" class="form-control" step="1.00" value="${currentBudget.amount > 0 ? parseFloat(currentBudget.amount).toFixed(2) : ''}" placeholder="e.g., 500" required>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">Save Budget</button>
        </form>
    `;

    showModal(title, formContent);

    document.getElementById('budget-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const budgetData = {
            month: month,
            year: year,
            amount: parseFloat(document.getElementById('amount').value)
        };

        try {
            if (currentBudget.id) {
                // Budget exists, update it
                await updateBudget(currentBudget.id, { amount: budgetData.amount });
            } else {
                // No budget exists, create new one
                await setBudget(budgetData);
            }

            hideModal();
            alert(`Budget set to ₱${budgetData.amount.toFixed(2)}`);
            window.dispatchEvent(new CustomEvent('transactionsUpdated'));
        } catch (error) {
            alert(error.message);
        }
    });
}