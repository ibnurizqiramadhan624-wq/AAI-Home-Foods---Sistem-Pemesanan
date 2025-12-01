// ===== ORDER CONFIRMATION FUNCTIONALITY =====
class OrderConfirmation {
    constructor() {
        this.order = null;
        this.init();
    }

    init() {
        this.loadOrder();
        this.renderOrderDetails();
        this.updateCartCounter();
        this.addEventListeners();
    }

    // Load order from URL parameters or localStorage
    loadOrder() {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (orderId) {
            this.loadOrderById(orderId);
        } else {
            this.loadLatestOrder();
        }
    }

    // Load order by ID
    loadOrderById(orderId) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.order = orders.find(order => order.id === orderId);
        
        if (!this.order) {
            this.showOrderNotFound();
            return;
        }
        
        this.renderOrderDetails();
    }

    // Load latest order
    loadLatestOrder() {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        if (orders.length === 0) {
            this.showOrderNotFound();
            return;
        }
        
        // Get the most recent order
        this.order = orders[orders.length - 1];
        this.renderOrderDetails();
    }

    // Show order not found message
    showOrderNotFound() {
        const confirmationCard = document.querySelector('.confirmation-card');
        confirmationCard.innerHTML = `
            <div class="order-not-found">
                <div class="not-found-icon">❌</div>
                <h2>Pesanan Tidak Ditemukan</h2>
                <p>Maaf, kami tidak dapat menemukan detail pesanan Anda.</p>
                <div class="action-buttons">
                    <a href="../index.html" class="cta-button">Kembali ke Beranda</a>
                    <a href="menu.html" class="cta-button-secondary">Pesan Sekarang</a>
                </div>
            </div>
        `;
    }

    // Render order details
    renderOrderDetails() {
        if (!this.order) return;

        // Update basic order info
        document.getElementById('order-id').textContent = this.order.id;
        document.getElementById('order-date').textContent = this.formatDate(this.order.createdAt);
        document.getElementById('order-status').textContent = this.getStatusText(this.order.status);
        document.getElementById('order-total').textContent = `Rp ${this.order.total.toLocaleString()}`;

        // Update customer info
        document.getElementById('customer-name').textContent = this.order.customer.name;
        document.getElementById('customer-email').textContent = this.order.customer.email;
        document.getElementById('customer-phone').textContent = this.order.customer.phone;

        // Update delivery info
        document.getElementById('delivery-address').textContent = this.order.delivery.address;
        document.getElementById('delivery-city').textContent = this.order.delivery.city;
        document.getElementById('delivery-time').textContent = this.order.delivery.time === 'asap' ? 'Segera' : this.formatDeliveryTime(this.order.delivery.time);
        document.getElementById('delivery-estimate').textContent = this.order.delivery.time === 'asap' ? '30-45 menit' : 'Sesuai jadwal';

        // Update payment info
        document.getElementById('payment-method').textContent = this.getPaymentMethodText(this.order.payment.method);
        document.getElementById('payment-status').textContent = this.getPaymentStatusText(this.order.payment.status);

        // Update status badges
        this.updateStatusBadges();

        // Render order items
        this.renderOrderItems();

        // Update order totals
        this.updateOrderTotals();
    }

    // Render order items
    renderOrderItems() {
        const orderItemsList = document.getElementById('order-items-list');
        
        if (!this.order.items || this.order.items.length === 0) {
            orderItemsList.innerHTML = '<p>Tidak ada item pesanan</p>';
            return;
        }

        orderItemsList.innerHTML = this.order.items.map(item => `
            <div class="order-item-detail">
                <div class="item-info-detail">
                    <h4>${item.name}</h4>
                    <p>${item.quantity} x Rp ${item.price.toLocaleString()}</p>
                </div>
                <div class="item-total-detail">
                    Rp ${(item.price * item.quantity).toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    // Update order totals
    updateOrderTotals() {
        document.getElementById('summary-subtotal').textContent = `Rp ${this.order.subtotal.toLocaleString()}`;
        document.getElementById('summary-delivery').textContent = `Rp ${this.order.deliveryCost.toLocaleString()}`;
        document.getElementById('summary-service').textContent = `Rp ${this.order.serviceCost.toLocaleString()}`;
        document.getElementById('summary-total').textContent = `Rp ${this.order.total.toLocaleString()}`;
    }

    // Update status badges
    updateStatusBadges() {
        const statusElement = document.getElementById('order-status');
        const paymentStatusElement = document.getElementById('payment-status');
        
        // Remove existing classes
        statusElement.className = 'status-badge';
        paymentStatusElement.className = 'status-badge';
        
        // Add appropriate classes based on status
        switch (this.order.status) {
            case 'confirmed':
                statusElement.classList.add('status-confirmed');
                break;
            case 'preparing':
                statusElement.classList.add('status-preparing');
                break;
            case 'delivering':
                statusElement.classList.add('status-delivering');
                break;
            case 'delivered':
                statusElement.classList.add('status-delivered');
                break;
        }
        
        switch (this.order.payment.status) {
            case 'pending':
                paymentStatusElement.classList.add('status-preparing');
                break;
            case 'paid':
                paymentStatusElement.classList.add('status-confirmed');
                break;
            case 'failed':
                paymentStatusElement.classList.add('status-cancelled');
                break;
        }
    }

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('id-ID', options);
    }

    // Format delivery time
    formatDeliveryTime(timeString) {
        if (timeString === 'asap') return 'Segera';
        
        const date = new Date(timeString);
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('id-ID', options);
    }

    // Get status text
    getStatusText(status) {
        const statusMap = {
            'confirmed': 'Dikonfirmasi',
            'preparing': 'Sedang Dimasak',
            'delivering': 'Dalam Pengiriman',
            'delivered': 'Terkirim'
        };
        return statusMap[status] || status;
    }

    // Get payment method text
    getPaymentMethodText(method) {
        const methodMap = {
            'cod': 'Cash on Delivery',
            'transfer': 'Transfer Bank',
            'ewallet': 'E-Wallet'
        };
        return methodMap[method] || method;
    }

    // Get payment status text
    getPaymentStatusText(status) {
        const statusMap = {
            'pending': 'Menunggu Pembayaran',
            'paid': 'Lunas',
            'failed': 'Gagal'
        };
        return statusMap[status] || status;
    }

    // Add event listeners
    addEventListeners() {
        this.addPrintEventListener();
        this.addSupportEventListeners();
    }

    // Add print event listener
    addPrintEventListener() {
        const printBtn = document.querySelector('.print-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }
    }

    // Add support event listeners
    addSupportEventListeners() {
        // WhatsApp support with pre-filled message
        const whatsappSupport = document.querySelector('.support-contact[href*="wa.me"]');
        if (whatsappSupport && this.order) {
            const message = `Halo AAI Home Foods, saya butuh bantuan untuk pesanan ${this.order.id}.`;
            const encodedMessage = encodeURIComponent(message);
            whatsappSupport.href = `https://wa.me/6287886371713?text=${encodedMessage}`;
        }
    }

    // Update cart counter in header
    updateCartCounter() {
        const cartIcon = document.getElementById('cart-icon');
        if (!cartIcon) return;

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartIcon.innerHTML = totalItems > 0 ? `🛒 Keranjang (${totalItems})` : '🛒 Keranjang';
    }
}

// Initialize order confirmation when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const orderConfirmation = new OrderConfirmation();
    window.orderConfirmation = orderConfirmation;
});

// Add CSS for order not found
const style = document.createElement('style');
style.textContent = `
    .order-not-found {
        text-align: center;
        padding: 60px 20px;
    }
    
    .not-found-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        opacity: 0.7;
    }
    
    .order-not-found h2 {
        font-size: 1.8rem;
        margin-bottom: 15px;
        color: var(--dark-color);
    }
    
    .order-not-found p {
        color: var(--text-light);
        margin-bottom: 30px;
        font-size: 1.1rem;
    }
    
    .status-cancelled {
        background: #f8d7da;
        color: #721c24;
    }
`;
document.head.appendChild(style);