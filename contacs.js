// ===== CONTACT PAGE FUNCTIONALITY =====
class ContactPage {
    constructor() {
        this.init();
    }

    init() {
        this.initializeCart();
        this.addEventListeners();
        this.updateCartCounter();
    }

    // Initialize cart
    initializeCart() {
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
    }

    // Add event listeners
    addEventListeners() {
        this.addCartEventListeners();
        this.addFormEventListeners();
        this.addQuickContactEventListeners();
    }

    // Add cart event listeners
    addCartEventListeners() {
        const cartIcon = document.getElementById('cart-icon');
        const cartPreview = document.getElementById('cart-preview');
        const closeCart = document.getElementById('close-cart');
        const checkoutBtn = document.getElementById('checkout-btn');

        if (cartIcon && cartPreview) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCartPreview();
            });
        }

        if (closeCart) {
            closeCart.addEventListener('click', () => {
                this.hideCartPreview();
            });
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.handleCheckout();
            });
        }

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            if (cartPreview && cartPreview.classList.contains('active') && 
                !cartPreview.contains(e.target) && 
                e.target !== cartIcon) {
                this.hideCartPreview();
            }
        });
    }

    // Add form event listeners
    addFormEventListeners() {
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }

        // Add real-time validation
        this.addFormValidation();
    }

    // Add form validation
    addFormValidation() {
        const formInputs = document.querySelectorAll('#contact-form input, #contact-form select, #contact-form textarea');
        
        formInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    // Validate individual field
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        
        this.clearFieldError(field);
        
        let isValid = true;
        let errorMessage = '';
        
        switch (fieldName) {
            case 'name':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Nama harus minimal 2 karakter';
                }
                break;
                
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Format email tidak valid';
                }
                break;
                
            case 'phone':
                const phoneRegex = /^[\+]?[0-9]{10,13}$/;
                if (!phoneRegex.test(value.replace(/[-\s]/g, ''))) {
                    isValid = false;
                    errorMessage = 'Format nomor telepon tidak valid';
                }
                break;
                
            case 'subject':
                if (!value) {
                    isValid = false;
                    errorMessage = 'Pilih subjek pesan';
                }
                break;
                
            case 'message':
                if (value.length < 10) {
                    isValid = false;
                    errorMessage = 'Pesan harus minimal 10 karakter';
                }
                break;
        }
        
        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }
        
        return isValid;
    }

    // Show field error
    showFieldError(field, message) {
        field.style.borderColor = '#e74c3c';
        
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    // Clear field error
    clearFieldError(field) {
        field.style.borderColor = '#e0e0e0';
        
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }

    // Handle form submission
    async handleFormSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        const formValues = Object.fromEntries(formData.entries());
        
        // Validate all fields
        let isFormValid = true;
        const fields = form.querySelectorAll('input, select, textarea');
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        if (!isFormValid) {
            this.showNotification('Harap perbaiki kesalahan pada form sebelum mengirim.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;
        
        try {
            // Simulate API call
            await this.sendFormData(formValues);
            
            // Show success message
            this.showFormSuccess();
            form.reset();
            
        } catch (error) {
            this.showNotification('Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.', 'error');
        } finally {
            // Reset button state
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Simulate sending form data
    async sendFormData(data) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate random success/failure
                if (Math.random() > 0.1) { // 90% success rate
                    console.log('Form data submitted:', data);
                    resolve();
                } else {
                    reject(new Error('Network error'));
                }
            }, 2000);
        });
    }

    // Show form success message
    showFormSuccess() {
        // Create success message element if it doesn't exist
        let successElement = document.querySelector('.form-success');
        if (!successElement) {
            successElement = document.createElement('div');
            successElement.className = 'form-success';
            const form = document.getElementById('contact-form');
            form.parentNode.insertBefore(successElement, form);
        }
        
        successElement.textContent = 'Pesan Anda berhasil dikirim! Kami akan membalas dalam 1x24 jam.';
        successElement.classList.add('show');
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successElement.classList.remove('show');
        }, 5000);
    }

    // Add quick contact event listeners
    addQuickContactEventListeners() {
        // WhatsApp button with pre-filled message
        const whatsappBtn = document.querySelector('.whatsapp-btn');
        if (whatsappBtn) {
            whatsappBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const message = 'Halo AAI Home Foods, saya ingin bertanya tentang menu dan pemesanan.';
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/6287886371713?text=${encodedMessage}`, '_blank');
            });
        }
    }

    // Show cart preview
    showCartPreview() {
        const cartPreview = document.getElementById('cart-preview');
        if (cartPreview) {
            this.updateCartPreview();
            cartPreview.classList.add('active');
        }
    }

    // Hide cart preview
    hideCartPreview() {
        const cartPreview = document.getElementById('cart-preview');
        if (cartPreview) {
            cartPreview.classList.remove('active');
        }
    }

    // Update cart preview content
    updateCartPreview() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItems || !cartTotal) return;

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let total = 0;
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: var(--text-light);">Keranjang kosong</p>';
        } else {
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>${item.quantity} x Rp ${item.price.toLocaleString()}</p>
                    </div>
                    <div class="cart-item-price">Rp ${itemTotal.toLocaleString()}</div>
                `;
                
                cartItems.appendChild(cartItem);
            });
        }
        
        cartTotal.textContent = `Rp ${total.toLocaleString()}`;
    }

    // Handle checkout
    handleCheckout() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            alert('Keranjang Anda kosong. Silakan tambahkan item terlebih dahulu.');
            return;
        }
        
        const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderSummary = cart.map(item => 
            `${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString()}`
        ).join('\n');
        
        const confirmation = confirm(`ORDER SUMMARY:\n\n${orderSummary}\n\nTotal: Rp ${totalAmount.toLocaleString()}\n\nLanjutkan ke checkout?`);
        
        if (confirmation) {
            window.location.href = 'checkout.html';
        }
    }

    // Update cart counter
    updateCartCounter() {
        const cartIcon = document.getElementById('cart-icon');
        if (!cartIcon) return;

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartIcon.innerHTML = totalItems > 0 ? `🛒 Keranjang (${totalItems})` : '🛒 Keranjang';
    }

    // Show notification
    showNotification(message, type = 'success') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        if (type === 'error') {
            notification.style.background = '#e74c3c';
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
}

// Initialize contact page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const contactPage = new ContactPage();
    window.contactPage = contactPage;
});

// Add CSS for field errors
const style = document.createElement('style');
style.textContent = `
    .field-error {
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 5px;
        display: none;
    }
    
    .notification.error {
        background: #e74c3c !important;
    }
`;
document.head.appendChild(style);