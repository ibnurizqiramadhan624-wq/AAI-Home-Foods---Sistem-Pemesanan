// ===== CHECKOUT PAGE FUNCTIONALITY =====
class CheckoutPage {
    constructor() {
        this.cart = [];
        this.formData = {};
        this.init();
    }

    init() {
        this.loadCart();
        this.renderOrderSummary();
        this.addEventListeners();
        this.updateCartCounter();
        this.setDefaultFormValues();
    }

    // Load cart from localStorage
    loadCart() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Redirect to cart if empty
        if (this.cart.length === 0) {
            alert('Keranjang Anda kosong. Silakan tambahkan item terlebih dahulu.');
            window.location.href = 'cart.html';
            return;
        }
    }

    // Set default form values
    setDefaultFormValues() {
        // Set minimum date for scheduled delivery (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const minDate = tomorrow.toISOString().split('T')[0];
        
        const dateInput = document.getElementById('delivery-date');
        if (dateInput) {
            dateInput.min = minDate;
        }

        // Set default time (current time + 1 hour)
        const now = new Date();
        now.setHours(now.getHours() + 1);
        const defaultTime = now.toTimeString().slice(0, 5);
        
        const timeInput = document.getElementById('delivery-time');
        if (timeInput) {
            timeInput.value = defaultTime;
        }
    }

    // Render order summary
    renderOrderSummary() {
        const orderItems = document.getElementById('order-items');
        const subtotalElement = document.getElementById('summary-subtotal');
        const totalElement = document.getElementById('summary-total');

        if (this.cart.length === 0) return;

        let subtotal = 0;
        orderItems.innerHTML = '';

        this.cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <div class="item-info">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x Rp ${item.price.toLocaleString()}</p>
                </div>
                <div class="item-total">Rp ${itemTotal.toLocaleString()}</div>
            `;
            orderItems.appendChild(orderItem);
        });

        const deliveryCost = 10000;
        const serviceCost = 2000;
        const total = subtotal + deliveryCost + serviceCost;

        subtotalElement.textContent = `Rp ${subtotal.toLocaleString()}`;
        totalElement.textContent = `Rp ${total.toLocaleString()}`;
    }

    // Add event listeners
    addEventListeners() {
        this.addFormEventListeners();
        this.addDeliveryTimeEventListeners();
        this.addFormValidation();
    }

    // Add form event listeners
    addFormEventListeners() {
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmit(e);
            });
        }
    }

    // Add delivery time event listeners
    addDeliveryTimeEventListeners() {
        const deliveryTimeRadios = document.querySelectorAll('input[name="deliveryTime"]');
        const scheduledTimeSection = document.getElementById('scheduled-time');
        const deliveryEstimate = document.getElementById('delivery-estimate');

        deliveryTimeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'schedule') {
                    scheduledTimeSection.style.display = 'block';
                    deliveryEstimate.textContent = 'Sesuai jadwal yang dipilih';
                } else {
                    scheduledTimeSection.style.display = 'none';
                    deliveryEstimate.textContent = '30-45 menit';
                }
            });
        });
    }

    // Add form validation
    addFormValidation() {
        const formInputs = document.querySelectorAll('#checkout-form input, #checkout-form select, #checkout-form textarea');
        
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
        const isRequired = field.hasAttribute('required');
        
        this.clearFieldError(field);
        
        let isValid = true;
        let errorMessage = '';
        
        if (isRequired && !value) {
            isValid = false;
            errorMessage = 'Field ini wajib diisi';
        } else if (value) {
            switch (fieldName) {
                case 'customerName':
                    if (value.length < 2) {
                        isValid = false;
                        errorMessage = 'Nama harus minimal 2 karakter';
                    }
                    break;
                    
                case 'customerEmail':
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Format email tidak valid';
                    }
                    break;
                    
                case 'customerPhone':
                    const phoneRegex = /^[\+]?[0-9]{10,13}$/;
                    if (!phoneRegex.test(value.replace(/[-\s]/g, ''))) {
                        isValid = false;
                        errorMessage = 'Format nomor telepon tidak valid';
                    }
                    break;
                    
                case 'deliveryAddress':
                    if (value.length < 10) {
                        isValid = false;
                        errorMessage = 'Alamat harus lebih detail';
                    }
                    break;
                    
                case 'city':
                    if (value.length < 3) {
                        isValid = false;
                        errorMessage = 'Nama kota tidak valid';
                    }
                    break;
                    
                case 'postalCode':
                    const postalRegex = /^[0-9]{5}$/;
                    if (value && !postalRegex.test(value)) {
                        isValid = false;
                        errorMessage = 'Kode pos harus 5 digit';
                    }
                    break;
            }
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

    // Validate entire form
    validateForm() {
        const form = document.getElementById('checkout-form');
        const fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        let isFormValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isFormValid = false;
            }
        });
        
        return isFormValid;
    }

    // Handle form submission
    async handleFormSubmit(e) {
        const form = e.target;
        const formData = new FormData(form);
        this.formData = Object.fromEntries(formData.entries());
        
        // Validate form
        if (!this.validateForm()) {
            this.showNotification('Harap perbaiki kesalahan pada form sebelum melanjutkan.', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = form.querySelector('.submit-order-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Memproses...';
        submitBtn.disabled = true;
        
        try {
            // Process order
            await this.processOrder();
            
        } catch (error) {
            this.showNotification('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.', 'error');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    // Process order - INI TEMPATNYA!
    async processOrder() {
        // Create order object
        const order = {
            id: this.generateOrderId(),
            order_id: this.generateOrderId(), // Tambahkan juga order_id untuk konsistensi
            customer: {
                name: this.formData.customerName,
                email: this.formData.customerEmail,
                phone: this.formData.customerPhone
            },
            delivery: {
                address: this.formData.deliveryAddress,
                city: this.formData.city,
                postalCode: this.formData.postalCode,
                notes: this.formData.deliveryNotes || '',
                time: this.formData.deliveryTime === 'schedule' ? 
                    `${this.formData.deliveryDate} ${this.formData.deliveryTime}` : 'asap'
            },
            payment: {
                method: this.formData.paymentMethod,
                status: 'pending'
            },
            items: this.cart,
            subtotal: this.calculateSubtotal(),
            deliveryCost: 10000,
            serviceCost: 2000,
            total: this.calculateTotal(),
            status: 'pending', // ← UBAH INI dari 'confirmed' ke 'pending'
            order_date: new Date().toISOString(), // ← Tambahkan field ini
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        console.log('Order created:', order); // Debug log
        
        // Save order to localStorage (simulate API call)
        await this.saveOrder(order);
        
        // Show success message
        this.showNotification('Pesanan berhasil dibuat! Mengarahkan ke halaman konfirmasi...', 'success');
        
        // Clear cart and redirect
        setTimeout(() => {
            localStorage.removeItem('cart');
            window.location.href = `order-confirmation.html?orderId=${order.id}`;
        }, 2000);
    }

    // Generate order ID
    generateOrderId() {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `AAI-${timestamp}${random}`;
    }

    // Calculate subtotal
    calculateSubtotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    // Calculate total
    calculateTotal() {
        const subtotal = this.calculateSubtotal();
        return subtotal + 10000 + 2000; // delivery + service
    }

    // Save order (simulate API call)
    async saveOrder(order) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    // Get existing orders or initialize empty array
                    const orders = JSON.parse(localStorage.getItem('orders')) || [];
                    
                    // Add new order
                    orders.push(order);
                    
                    // Save back to localStorage
                    localStorage.setItem('orders', JSON.stringify(orders));
                    
                    console.log('Order saved to localStorage. Total orders:', orders.length); // Debug log
                    
                    resolve(order);
                } catch (error) {
                    console.error('Error saving order:', error);
                    reject(error);
                }
            }, 1500);
        });
    }

    // Update cart counter in header
    updateCartCounter() {
        const cartIcon = document.getElementById('cart-icon');
        if (!cartIcon) return;

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
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

// Initialize checkout page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const checkoutPage = new CheckoutPage();
    window.checkoutPage = checkoutPage;
});