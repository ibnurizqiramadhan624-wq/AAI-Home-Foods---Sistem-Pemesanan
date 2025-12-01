// Registration System for AAI Home Foods
class RegistrationSystem {
    constructor() {
        this.apiBase = 'http://localhost:3000'; // Adjust to your backend
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateCartCounter();
        this.setupPasswordStrength();
    }

    attachEventListeners() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration(e);
            });
        }

        // Social auth buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const provider = e.target.closest('.social-btn').classList.contains('google-btn') ? 'google' : 'facebook';
                this.handleSocialAuth(provider);
            });
        });

        // Real-time validation
        const formInputs = registerForm?.querySelectorAll('input');
        formInputs?.forEach(input => {
            if (input.type !== 'checkbox') {
                input.addEventListener('blur', () => this.validateField(input));
            }
        });

        // Confirm password validation
        const confirmPassword = document.getElementById('confirmPassword');
        const password = document.getElementById('password');
        if (confirmPassword && password) {
            confirmPassword.addEventListener('input', () => {
                if (password.value && confirmPassword.value) {
                    this.validatePasswordMatch(password.value, confirmPassword.value);
                }
            });
        }
    }

    setupPasswordStrength() {
        const passwordInput = document.getElementById('password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.updatePasswordStrength(e.target.value);
            });
        }
    }

    async handleRegistration(e) {
        const form = e.target;
        const submitBtn = form.querySelector('.auth-btn');
        
        // Validate form first
        if (!this.validateForm(form)) {
            return;
        }

        // Show loading state
        const originalText = submitBtn.textContent;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mendaftarkan...';
        submitBtn.disabled = true;

        try {
            // Collect form data
            const formData = {
                name: document.getElementById('fullName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                password: document.getElementById('password').value,
                terms_accepted: document.querySelector('input[name="terms"]').checked,
                newsletter: document.querySelector('input[name="newsletter"]').checked
            };

            console.log('Registering user:', { ...formData, password: '***' });

            // Simulate API call - Replace with actual fetch
            await this.simulateRegistration(formData);

            // Show success message
            this.showMessage('🎉 Pendaftaran berhasil!', 'success');
            
            // Clear form
            form.reset();
            this.clearAllErrors();
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);

        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage(error.message || 'Terjadi kesalahan saat pendaftaran', 'error');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    async simulateRegistration(userData) {
        // Simulate API delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Basic validation simulation
                if (!userData.name || !userData.email || !userData.password) {
                    reject(new Error('Semua field harus diisi'));
                    return;
                }

                if (!this.isValidEmail(userData.email)) {
                    reject(new Error('Format email tidak valid'));
                    return;
                }

                if (!this.isValidPhone(userData.phone)) {
                    reject(new Error('Format nomor telepon tidak valid'));
                    return;
                }

                if (userData.password.length < 6) {
                    reject(new Error('Password minimal 6 karakter'));
                    return;
                }

                if (!userData.terms_accepted) {
                    reject(new Error('Anda harus menyetujui Syarat & Ketentuan'));
                    return;
                }

                // Check if user already exists in localStorage
                const existingUsers = JSON.parse(localStorage.getItem('users')) || [];
                if (existingUsers.find(u => u.email === userData.email)) {
                    reject(new Error('Email sudah terdaftar'));
                    return;
                }

                // Store user in localStorage (simulated database)
                const newUser = {
                    id: Date.now(),
                    ...userData,
                    password: btoa(userData.password), // Simple encoding - in real app, use bcrypt
                    created_at: new Date().toISOString(),
                    role: 'customer'
                };

                existingUsers.push(newUser);
                localStorage.setItem('users', JSON.stringify(existingUsers));

                // Store current user session
                localStorage.setItem('current_user', JSON.stringify({
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }));

                resolve({ success: true, user: newUser });
            }, 1500);
        });
    }

    validateForm(form) {
        this.clearAllErrors();
        let isValid = true;

        // Validate each required field
        const fields = [
            { id: 'fullName', name: 'Nama Lengkap', minLength: 2 },
            { id: 'email', name: 'Email', validate: this.isValidEmail },
            { id: 'phone', name: 'Nomor Telepon', validate: this.isValidPhone },
            { id: 'password', name: 'Password', minLength: 6 }
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input) return;

            const value = input.value.trim();
            
            if (!value) {
                this.showFieldError(field.id, `${field.name} harus diisi`);
                isValid = false;
            } else if (field.minLength && value.length < field.minLength) {
                this.showFieldError(field.id, `${field.name} minimal ${field.minLength} karakter`);
                isValid = false;
            } else if (field.validate && !field.validate(value)) {
                this.showFieldError(field.id, `Format ${field.name} tidak valid`);
                isValid = false;
            }
        });

        // Validate password match
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        if (password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'Password tidak cocok');
            isValid = false;
        }

        // Validate terms agreement
        const termsCheckbox = document.querySelector('input[name="terms"]');
        if (!termsCheckbox?.checked) {
            this.showTermsError('Anda harus menyetujui Syarat & Ketentuan');
            isValid = false;
        }

        return isValid;
    }

    validateField(input) {
        const fieldId = input.id;
        const value = input.value.trim();
        
        this.clearFieldError(fieldId);
        
        switch(fieldId) {
            case 'fullName':
                if (value && value.length < 2) {
                    this.showFieldError(fieldId, 'Nama minimal 2 karakter');
                }
                break;
                
            case 'email':
                if (value && !this.isValidEmail(value)) {
                    this.showFieldError(fieldId, 'Format email tidak valid');
                }
                break;
                
            case 'phone':
                if (value && !this.isValidPhone(value)) {
                    this.showFieldError(fieldId, 'Format nomor telepon tidak valid');
                }
                break;
                
            case 'password':
                if (value && value.length < 6) {
                    this.showFieldError(fieldId, 'Password minimal 6 karakter');
                }
                break;
        }
    }

    validatePasswordMatch(password, confirmPassword) {
        const confirmField = document.getElementById('confirmPassword');
        this.clearFieldError('confirmPassword');
        
        if (password && confirmPassword && password !== confirmPassword) {
            this.showFieldError('confirmPassword', 'Password tidak cocok');
            confirmField.classList.add('error');
        } else {
            confirmField.classList.remove('error');
        }
    }

    handleSocialAuth(provider) {
        this.showMessage(`Login dengan ${provider} sedang dalam pengembangan`, 'info');
        // In a real app, implement OAuth flow here
    }

    updatePasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;

        let strength = 0;
        let text = 'Kekuatan password';
        let color = '#e74c3c';

        // Criteria
        if (password.length >= 8) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength = Math.min(strength + 10, 100);

        // Determine strength level
        if (strength >= 80) {
            text = 'Sangat Kuat';
            color = '#27ae60';
        } else if (strength >= 60) {
            text = 'Kuat';
            color = '#2ecc71';
        } else if (strength >= 40) {
            text = 'Cukup';
            color = '#f39c12';
        } else if (strength >= 20) {
            text = 'Lemah';
            color = '#e67e22';
        } else {
            text = 'Sangat Lemah';
            color = '#e74c3c';
        }

        // Update UI
        strengthBar.style.width = `${strength}%`;
        strengthBar.style.backgroundColor = color;
        strengthBar.style.transition = 'all 0.3s ease';
        strengthText.textContent = text;
        strengthText.style.color = color;
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

    clearAllErrors() {
        document.querySelectorAll('.form-group input').forEach(input => {
            input.classList.remove('error');
        });
        
        document.querySelectorAll('.field-error').forEach(error => {
            error.style.display = 'none';
        });
    }

    showTermsError(message) {
        const termsContainer = document.querySelector('.terms-agreement');
        if (!termsContainer) return;

        let errorElement = termsContainer.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            termsContainer.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    showMessage(message, type = 'success') {
        // Remove existing messages
        document.querySelectorAll('.notification').forEach(el => el.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
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

    isValidPhone(phone) {
        // Indonesian phone number format
        const phoneRegex = /^(^\+62|62|^08)(\d{3,4}-?){2}\d{3,4}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const registrationSystem = new RegistrationSystem();
    
    // Add global styles
    if (!document.querySelector('#auth-styles')) {
        const style = document.createElement('style');
        style.id = 'auth-styles';
        style.textContent = `
            .field-error {
                color: #e74c3c;
                font-size: 0.85rem;
                margin-top: 5px;
                display: none;
                animation: fadeIn 0.3s ease;
            }
            
            .form-group input.error {
                border-color: #e74c3c !important;
                background-color: #fff8f8;
            }
            
            .password-strength {
                margin-top: 8px;
            }
            
            .strength-bar {
                height: 4px;
                background: #e0e0e0;
                border-radius: 2px;
                margin-bottom: 4px;
                width: 0;
                max-width: 100%;
            }
            
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                z-index: 9999;
                display: flex;
                align-items: center;
                gap: 10px;
                animation: slideIn 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                max-width: 400px;
            }
            
            .notification.success {
                background: #27ae60;
                border-left: 4px solid #2ecc71;
            }
            
            .notification.error {
                background: #e74c3c;
                border-left: 4px solid #c0392b;
            }
            
            .notification.info {
                background: #3498db;
                border-left: 4px solid #2980b9;
            }
            
            .notification.fade-out {
                animation: slideOut 0.3s ease forwards;
            }
            
            .cart-count {
                background: var(--primary-color);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.8rem;
                margin-left: 5px;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .auth-btn:disabled {
                opacity: 0.7;
                cursor: not-allowed;
            }
            
            .fa-spinner {
                animation: spin 1s linear infinite;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
});