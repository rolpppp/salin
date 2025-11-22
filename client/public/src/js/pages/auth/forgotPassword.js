import { forgotPassword } from '../../api.js';

export function renderForgotPasswordPage(app) {
    app.innerHTML = `
        <div class="auth-container">
            <div class="card auth-card">
                <h1>Forgot Password</h1>
                <p style="text-align: center; margin-bottom: 1rem;">Enter your email and we'll send you a link to reset your password.</p>
                <div id="message-area"></div>
                <form id="forgot-password-form">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" class="form-control" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Send Reset Link</button>
                </form>
                <div class="auth-switch">
                    <a href="#/login">Back to Login</a>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('forgot-password-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Show loading state
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
        
        const email = document.getElementById('email').value;
        const messageArea = document.getElementById('message-area');
        
        try {
            const data = await forgotPassword(email);
            messageArea.innerHTML = `<p style="color: var(--secondary-color);">${data.message}</p>`;
            form.style.display = 'none'; // Hide form on success
        } catch (error) {
            messageArea.innerHTML = `<p class="error-message" style="display: block;">${error.message}</p>`;
            
            // Reset button state on error
            submitBtn.classList.remove('btn-loading');
            submitBtn.disabled = false;
        }
    });
}