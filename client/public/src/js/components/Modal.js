export function showModal(title, contentHTML) {
    // remove any existing modal
    const existingModal = document.getElementById("app-modal");
    if (existingModal) existingModal.remove();

    const modalHTML = `
        <div id="app-modal" class="modal visible">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close" id="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body">
                    ${contentHTML}
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById("app-modal");
    const closeBtn = document.getElementById("modal-close-btn");

    closeBtn.addEventListener("click", hideModal);

    modal.addEventListener("click", (e) => {
        if (e.targer === modal) {
            hideModal();
        }
    });
}

export function hideModal() {
    const modal = document.getElementById("app-modal");
    if (modal) {
        modal.remove();
    }
}