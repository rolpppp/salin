// client/public/src/js/components/Toast.js

// creates a container for toast notifications and appends it to the body
const toastContainer = document.createElement("div");
toastContainer.id = "toast-container";
document.body.appendChild(toastContainer);

// displays a toast notification with a message and type (success, error, etc.)
export function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  // show the toast after a short delay
  setTimeout(() => {
    toast.classList.add("visible");
  }, 10);

  // hide and remove the toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
