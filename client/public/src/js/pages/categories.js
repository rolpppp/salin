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

export async function renderCategoriesPage(app) {
  app.innerHTML = '<div class="loading-spinner"></div>';
  await renderList();
}

async function renderList() {
  const app = document.getElementById("app");
  try {
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
          await updateCategory(category.id, {
            name: formData.name,
            type: formData.type,
          });
          showToast("Category updated successfully");
        } else {
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

function attachListeners() {
  document
    .getElementById("add-category-btn")
    .addEventListener("click", () => openCategoryForm());

  // Attach listeners to both expense and income lists
  document.querySelectorAll(".management-list").forEach((list) => {
    list.addEventListener("click", async (e) => {
      const target = e.target;
      const listItem = target.closest(".management-list-item");
      if (!listItem) return;

      const categoryId = listItem.dataset.id;

      if (target.classList.contains("delete-btn")) {
        if (confirm("Are you sure you want to delete this category?")) {
          try {
            await deleteCategory(categoryId);
            showToast("Category deleted successfully");
            renderList();
          } catch (error) {
            showToast(error.message, "error");
          }
        }
      }

      if (target.classList.contains("edit-btn")) {
        const categories = await getCategories();
        const categoryToEdit = categories.data.find((c) => c.id == categoryId);
        openCategoryForm(categoryToEdit);
      }
    });
  });
}
