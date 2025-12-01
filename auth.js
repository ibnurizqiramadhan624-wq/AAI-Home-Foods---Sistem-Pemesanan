// Authentication System for AAI Home Foods
class AuthSystem {
    constructor() {
        this.apiBase = 'http://localhost:3000';
        this.init();
    }

    init() {
        this.setupLoginForm();
        this.setupSocialAuth();
        this.checkRememberedUser();
        this.updateCartCounter();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('login-form');
        if (!loginForm) return;

        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(e);
        });

        // Real-time validation
        const emailInput = loginForm.querySelector('#email');
        const passwordInput = loginForm.querySelector('#password');
        
        emailInput?.addEventListener('blur', () => this.validateEmail(emailInput.value));
        passwordInput?.addEventListener('blur', () => this.validatePassword(passwordInput.value));
    }

    setupSocialAuth() {
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.target.closest('.social-btn').classList.contains('google-btn') ? 'google' : 'facebook';
                this.handleSocialLogin(provider);
            });
        });
    }

    async handleLogin(e) {
        const form = e.target;
        const submitBtn = form.querySelector('.auth-btn');
        
        // Validate form
        if (!this.validateLoginForm(form)) {
            return;
        }

        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memproses...';
        submitBtn.disabled = true;

        try {
            const credentials = {
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value,
                remember: document.querySelector('input[name="remember"]')?.checked || false
            };

            console.log('Login attempt for:', credentials.email);

            // Simulate login - Replace with actual API call
            const user = await this.simulateLogin(credentials);

            // Save session
            this.saveUserSession(user, credentials.remember);

            // Show success message
            this.showMessage('🎉 Login berhasil! Mengalihkan...', 'success');

            // Redirect based on user role
            setTimeout(() => {
                if (user.role === 'admin' || user.role === 'super_admin') {
                    window.location.href = '../admin/dashboard.html';
                } else {
                    window.location.href = '../index.html';
                }
            }, 1500);

        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(error.message || 'Login gagal', 'error');
            
            // Clear password field on error
            document.getElementById('password').value = '';
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateLogin(credentials) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if user exists
                const users = JSON.parse(localStorage.getItem('users')) || [];
                const user = users.find(u => u.email === credentials.email);
                
                if (!user) {
                    reject(new Error('Email tidak terdaftar'));
                    return;
                }

                // Check password (decoded from base64)
                const decodedPassword = atob(user.password);
                if (decodedPassword !== credentials.password) {
                    reject(new Error('Password salah'));
                    return;
                }

                // Return user data without password
                const { password, ...userData } = user;
                resolve(userData);
            }, 1000);
        });
    }

    validateLoginForm(form) {
        this.clearErrors();
        let isValid = true;

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email) {
            this.showFieldError('email', 'Email harus diisi');
            isValid = false;
        } else if (!this.isValidEmail(email)) {
            this.showFieldError('email', 'Format email tidak valid');
            isValid = false;
        }

        if (!password) {
            this.showFieldError('password', 'Password harus diisi');
            isValid = false;
        }

        return isValid;
    }

    validateEmail(email) {
        this.clearFieldError('email');
        if (email && !this.isValidEmail(email)) {
            this.showFieldError('email', 'Format email tidak valid');
            return false;
        }
        return true;
    }

    validatePassword(password) {
        this.clearFieldError('password');
        if (password && password.length < 6) {
            this.showFieldError('password', 'Password minimal 6 karakter');
            return false;
        }
        return true;
    }

    handleSocialLogin(provider) {
        this.showMessage(`Login dengan ${provider} sedang dalam pengembangan`, 'info');
    }

    checkRememberedUser() {
        const rememberedEmail = localStorage.getItem('remembered_email');
        if (rememberedEmail) {
            document.getElementById('email').value = rememberedEmail;
            document.querySelector('input[name="remember"]').checked = true;
        }
    }

    saveUserSession(user, remember = false) {
        // Store current user
        localStorage.setItem('current_user', JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }));

        // Store auth token
        const token = btoa(`${user.email}:${Date.now()}`);
        localStorage.setItem('auth_token', token);

        // Remember email if requested
        if (remember) {
            localStorage.setItem('remembered_email', user.email);
        } else {
            localStorage.removeItem('remembered_email');
        }

        // Store login time
        localStorage.setItem('last_login', new Date().toISOString());
    }

    // UI Helper Methods
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.add('error');
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    clearFieldError(fieldId) {
        const field = document.getElementById(fieldId);
        if (!field) return;

        field.classList.remove('error');
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    clearErrors() {
        document.querySelectorAll('.form-group input').forEach(input => {
            input.classList.remove('error');
        });
        
        document.querySelectorAll('.field-error').forEach(error => {
            error.style.display = 'none';
        });
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        document.querySelectorAll('.notification').forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    updateCartCounter() {
        const cartIcon = document.getElementById('cart-icon');
        if (!cartIcon) return;

        try {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const totalItems = cart.reduce((total, item) => total + (item.quantity || 0), 0);
            
            if (totalItems > 0) {
                cartIcon.innerHTML = `🛒 Keranjang <span class="cart-count">${totalItems}</span>`;
            }
        } catch (error) {
            console.error('Error updating cart counter:', error);
        }
    }

    // Utility Methods
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static getCurrentUser() {
        try {
            const userStr = localStorage.getItem('current_user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    static isLoggedIn() {
        return !!localStorage.getItem('auth_token');
    }

    static logout() {
        localStorage.removeItem('current_user');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('last_login');
        window.location.href = 'login.html';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new AuthSystem();
    
    // Check if user is already logged in
    if (AuthSystem.isLoggedIn() && !window.location.pathname.includes('login.html')) {
        const user = AuthSystem.getCurrentUser();
        if (user) {
            // Update UI to show logged in state
            const loginBtn = document.querySelector('.btn-login');
            if (loginBtn) {
                loginBtn.innerHTML = `<i class="fas fa-user"></i> ${user.name}`;
                loginBtn.href = '#';
                loginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Add logout functionality or user dropdown
                });
            }
        }
    }
});