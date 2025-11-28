import { renderErrorPage } from "../app.js";
import {
  getCategories,
  getCategoriesByType,
  createCategory,
  updateCategory,
  deleteCategory,
  getUserID,
} from "../api.js";
import { showModal, hideModal } from "../components/Modal.js";
import { showToast } from "../components/Toast.js";

// renders the categories management page
export async function renderCategoriesPage(app) {
  app.innerHTML = '<div class="loading-spinner"></div>';
  await renderList();
}

// renders separate lists for expense and income categories, enabling smart categorization management
async function renderList() {
  const app = document.getElementById("app");
  try {
    // fetches both expense and income categories concurrently
    const [expenses, incomes] = await Promise.all([
      getCategoriesByType("expense"),
      getCategoriesByType("income"),
    ]);

    app.innerHTML = `
            <div class="page-header">
                <h1>Manage Categories</h1>
                <a href="#/dashboard">Back to Dashboard</a>
            </div>
            
            <h2>Expense Categories</h2>
            <ul id="expense-categories-list" class="management-list">
                ${expenses.data.map((cat) => renderCategoryItem(cat)).join("")}
            </ul>

            <h2 style="margin-top: var(--space-xl);">Income Categories</h2>
            <ul id="income-categories-list" class="management-list">
                ${incomes.data.map((cat) => renderCategoryItem(cat)).join("")}
            </ul>
            <button id="add-category-btn" class="fab-add-button">+</button>
        `;
    attachListeners();
  } catch (error) {
    renderErrorPage(app, error.message);
  }
}

// renders a single category item for display
function renderCategoryItem(category) {
  return `
        <li class="management-list-item" data-id="${category.id}">
            <div class="item-details">
                <span class="name">${category.name}</span>
            </div>
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
        </li>
    `;
}

// opens a form for adding or editing a category, including category type
function openCategoryForm(category = null) {
  const isEdit = category !== null;
  const title = isEdit ? "Edit Category" : "Add New Category";

  const formContent = `
        <form id="category-form">
            <div class="form-group">
                <label for="name">Category Name</label>
                <input type="text" id="name" class="form-control" value="${isEdit ? category.name : ""}" required>
            </div>
            <div class="form-group">
                <label for="type">Category Type</label>
                <select id="type" class="form-control" ${isEdit ? "disabled" : ""} required>
                    <option value="expense" ${isEdit && category.type === "expense" ? "selected" : ""}>Expense</option>
                    <option value="income" ${isEdit && category.type === "income" ? "selected" : ""}>Income</option>
                </select>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;">${isEdit ? "Save Changes" : "Create Category"}</button>
        </form>
    `;

  showModal(title, formContent);

  // handles form submission for creating or updating a category
  document
    .getElementById("category-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = {
        name: document.getElementById("name").value,
        type: document.getElementById("type").value,
      };
      try {
        if (isEdit) {
          // updates existing category
          await updateCategory(category.id, {
            name: formData.name,
            type: formData.type,
          });
          showToast("Category updated successfully");
        } else {
          // creates a new category
          await createCategory(formData);
          showToast("Category created successfully");
        }
        hideModal();
        renderList();
      } catch (error) {
        showToast(error.message, "error");
      }
    });
}

// attaches event listeners for category actions (add, edit, delete)
function attachListeners() {
  document
    .getElementById("add-category-btn")
    .addEventListener("click", () => openCategoryForm());

  // attach listeners to both expense and income lists for category management
  document.querySelectorAll(".management-list").forEach((list) => {
    list.addEventListener("click", async (e) => {
      const target = e.target;
      const listItem = target.closest(".management-list-item");
      if (!listItem) return;

      const categoryId = listItem.dataset.id;

      // handles category deletion or archiving
      if (target.closest(".delete-btn")) {
        const deleteContent = `
          <p style="margin-bottom: var(--space-lg); text-align: center;">
            Are you sure you want to delete this category?
          </p>
          <p style="margin-bottom: var(--space-lg); text-align: center; color: var(--text-light-color); font-size: var(--font-size-sm);">
            Note: Categories with transaction history will be archived instead of deleted.
          </p>
          <div style="display: flex; gap: var(--space-md); justify-content: center;">
            <button id="confirm-delete-btn" class="btn btn-danger">Delete</button>
            <button id="cancel-delete-btn" class="btn btn-secondary">Cancel</button>
          </div>
        `;

        showModal("Delete Category", deleteContent);

        document
          .getElementById("confirm-delete-btn")
          .addEventListener("click", async () => {
            try {
              const response = await deleteCategory(categoryId);

              // Show appropriate message based on action
              if (response.action === "archived") {
                showToast(`Category archived: ${response.reason}`, "info");
              } else {
                showToast("Category deleted successfully", "success");
              }

              hideModal();
              renderList();
            } catch (error) {
              showToast(error.message, "error");
              hideModal();
            }
          });

        document
          .getElementById("cancel-delete-btn")
          .addEventListener("click", () => {
            hideModal();
          });
      }

      // handles category editing
      if (target.closest(".edit-btn")) {
        const categories = await getCategories();
        const categoryToEdit = categories.data.find((c) => c.id == categoryId);
        openCategoryForm(categoryToEdit);
      }
    });
  });
}
