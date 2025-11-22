import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { supabaseConfig } from '../../../config/supabase.config.js';

const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey);

let isRecoverySession = false;

export function renderResetPasswordPage(app) {
    app.innerHTML = `
        <div class="auth-container">
            <div class="card auth-card">
                <h1>Reset Your Password</h1>
                <div id="message-area"></div>
                <form id="reset-password-form">
                    <div class="form-group">
                        <label for="new-password">New Password</label>
                        <input type="password" id="new-password" class="form-control" minlength="6" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Set New Password</button>
                </form>
            </div>
        </div>
    `;
    
    handlePasswordRecovery();
    attachResetFormListener();
}

async function handlePasswordRecovery() {
    const messageArea = document.getElementById('message-area');
    const hash = window.location.hash;

    // Listen for Supabase auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth event:', event, 'Session:', session);
        
        if (event === 'PASSWORD_RECOVERY') {
            isRecoverySession = true;
            messageArea.innerHTML = `<p style="color: var(--secondary-color);">Ready to reset your password. Enter a new password below.</p>`;
        } else if (event === 'SIGNED_IN' && session) {
            // Also handle if recovery session is established
            isRecoverySession = true;
            messageArea.innerHTML = `<p style="color: var(--secondary-color);">Ready to reset your password. Enter a new password below.</p>`;
        }
    });

    // If URL has recovery token, Supabase should auto-process it
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
        console.log('Recovery token detected in URL');
        messageArea.innerHTML = `<p style="color: var(--secondary-color);">Processing recovery link...</p>`;
        
        // Give Supabase time to process the hash parameters
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check session after Supabase processes the token
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Session after delay:', session);
        
        if (session) {
            isRecoverySession = true;
            messageArea.innerHTML = `<p style="color: var(--secondary-color);">Ready to reset your password. Enter a new password below.</p>`;
        } else {
            messageArea.innerHTML = `<p class="error-message" style="display: block;">Unable to process recovery link. Please request a new one.</p>`;
        }
    } else {
        // Check if there's already a session
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Existing session:', session);
        
        if (session) {
            isRecoverySession = true;
            messageArea.innerHTML = `<p style="color: var(--secondary-color);">Ready to reset your password. Enter a new password below.</p>`;
        } else {
            messageArea.innerHTML = `<p class="error-message" style="display: block;">Invalid or expired reset link. Please request a new one.</p>`;
        }
    }
}

function attachResetFormListener() {
    const form = document.getElementById('reset-password-form');
    const messageArea = document.getElementById('message-area');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;

        if (!isRecoverySession) {
            messageArea.innerHTML = `<p class="error-message" style="display: block;">No active recovery session. Please request a new reset link.</p>`;
            return;
        }

        try {
            // Use Supabase's built-in updateUser method
            const { data, error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                throw error;
            }

            messageArea.innerHTML = `<p style="color: var(--secondary-color);">Password has been reset successfully! Redirecting to login...</p>`;
            form.style.display = 'none';
            
            // Sign out to clear the recovery session
            await supabase.auth.signOut();
            
            setTimeout(() => window.location.hash = '#/login', 3000);
        } catch (error) {
            console.error('Password reset error:', error);
            messageArea.innerHTML = `<p class="error-message" style="display: block;">${error.message || 'Unable to reset password. Please try again.'}</p>`;
        }
    });
}