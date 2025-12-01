// ===== CART PAGE FUNCTIONALITY =====
class CartPage {
    constructor() {
        this.cart = [];
        this.recommendedItems = [];
        this.init();
    }

    async init() {
        await this.loadCart();
        this.loadRecommendedItems();
        this.renderCart();
        this.addEventListeners();
        this.updateCartCounter();
    }

    // Load cart from localStorage
    loadCart() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Load recommended items
    loadRecommendedItems() {
        this.recommendedItems = [
            {
                id: 7,
                name: "Grilled Chicken Salad",
                description: "Salad segar dengan ayam panggang dan dressing spesial",
                price: 45000,
                image: "../assets/images/menu/grilled-chicken-salad.jpg",
                category: "appetizer"
            },
            {
                id: 8,
                name: "Seafood Pasta",
                description: "Pasta dengan campuran seafood segar dalam saus tomato cream",
                price: 68000,
                image: "../assets/images/menu/seafood-pasta.jpg",
                category: "main-course"
            },
            {
                id: 9,
                name: "Beef Burger Special",
                description: "Burger dengan daging sapi premium dan sayuran segar",
                price: 55000,
                image: "../assets/images/menu/beef-burger.jpg",
                category: "main-course"
            },
            {
                id: 10,
                name: "Fruit Smoothie Bowl",
                description: "Smoothie bowl dengan buah-buahan segar dan granola",
                price: 35000,
                image: "../assets/images/menu/smoothie-bowl.jpg",
                category: "dessert"
            }
        ];
    }

    // Render cart items
    renderCart() {
        const cartItemsList = document.getElementById('cart-items-list');
        const emptyCart = document.getElementById('empty-cart');
        const itemCount = document.getElementById('item-count');
        const recommendedSection = document.getElementById('recommended-items');

        if (this.cart.length === 0) {
            cartItemsList.style.display = 'none';
            emptyCart.classList.add('show');
            itemCount.textContent = '0 items';
            recommendedSection.classList.remove('show');
        } else {
            cartItemsList.style.display = 'flex';
            emptyCart.classList.remove('show');
            
            const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
            itemCount.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''}`;
            
            cartItemsList.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
            recommendedSection.classList.add('show');
        }

        this.updateOrderSummary();
        this.renderRecommendedItems();
    }

    // Create cart item HTML
    createCartItemHTML(item) {
        const itemTotal = item.price * item.quantity;
        
        return `
            <div class="cart-item-card" data-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${this.getItemImage(item.id)}" alt="${item.name}" onerror="this.src='../assets/images/placeholder-food.jpg'">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-header">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <div class="cart-item-price">Rp ${itemTotal.toLocaleString()}</div>
                    </div>
                    <div class="cart-item-controls">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-id="${item.id}">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn plus" data-id="${item.id}">+</button>
                        </div>
                        <button class="remove-btn" data-id="${item.id}">Hapus</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Get item image based on ID
    getItemImage(itemId) {
        const imageMap = {
            1: "../assets/images/menu/salmon-wellington.jpg",
            2: "../assets/images/menu/ayam-ulam-bali.jpg",
            3: "../assets/images/menu/salmon-mashed-potato.jpg",
            4: "../assets/images/menu/beef-teppanyaki.jpg",
            5: "../assets/images/menu/chicken-wonton.jpg",
            6: "../assets/images/menu/zuppa-soup.jpg",
            7: "../assets/images/menu/grilled-chicken-salad.jpg",
            8: "../assets/images/menu/seafood-pasta.jpg",
            9: "../assets/images/menu/beef-burger.jpg",
            10: "../assets/images/menu/smoothie-bowl.jpg"
        };
        
        return imageMap[itemId] || "../assets/images/placeholder-food.jpg";
    }

    // Render recommended items
    renderRecommendedItems() {
        const recommendedGrid = document.querySelector('.recommended-grid');
        if (!recommendedGrid) return;

        recommendedGrid.innerHTML = this.recommendedItems.map(item => `
            <div class="recommended-item">
                <div class="recommended-image">
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='../assets/images/placeholder-food.jpg'">
                </div>
                <div class="recommended-info">
                    <h4>${item.name}</h4>
                    <p>${item.description}</p>
                    <div class="recommended-meta">
                        <div class="recommended-price">Rp ${item.price.toLocaleString()}</div>
                        <button class="add-recommended-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">
                            + Tambah
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        this.addRecommendedItemEventListeners();
    }

    // Update order summary
    updateOrderSummary() {
        const subtotalElement = document.getElementById('subtotal');
        const totalAmountElement = document.getElementById('total-amount');
        const checkoutBtn = document.getElementById('checkout-btn-large');

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCost = 10000;
        const serviceCost = 2000;
        const total = subtotal + deliveryCost + serviceCost;

        subtotalElement.textContent = `Rp ${subtotal.toLocaleString()}`;
        totalAmountElement.textContent = `Rp ${total.toLocaleString()}`;

        // Disable checkout button if cart is empty
        if (this.cart.length === 0) {
            checkoutBtn.disabled = true;
        } else {
            checkoutBtn.disabled = false;
        }
    }

    // Add event listeners
    addEventListeners() {
        this.addCartEventListeners();
        this.addCheckoutEventListener();
        this.addQuantityEventListeners();
        this.addRemoveEventListeners();
    }

    // Add cart event listeners
    addCartEventListeners() {
        // Quantity buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('quantity-btn')) {
                const itemId = e.target.getAttribute('data-id');
                const isPlus = e.target.classList.contains('plus');
                this.updateQuantity(itemId, isPlus);
            }
        });

        // Remove buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                const itemId = e.target.getAttribute('data-id');
                this.removeItem(itemId);
            }
        });
    }

    // Add recommended item event listeners
    addRecommendedItemEventListeners() {
        const addButtons = document.querySelectorAll('.add-recommended-btn');
        
        addButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                const price = parseInt(e.target.getAttribute('data-price'));
                
                this.addToCart(id, name, price);
            });
        });
    }

    // Add checkout event listener
    addCheckoutEventListener() {
        const checkoutBtn = document.getElementById('checkout-btn-large');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                this.handleCheckout();
            });
        }
    }

    // Add quantity event listeners
    addQuantityEventListeners() {
        // Handled by event delegation in addCartEventListeners
    }

    // Add remove event listeners
    addRemoveEventListeners() {
        // Handled by event delegation in addCartEventListeners
    }

    // Update item quantity
    updateQuantity(itemId, isPlus) {
        const item = this.cart.find(item => item.id === itemId);
        
        if (item) {
            if (isPlus) {
                item.quantity += 1;
            } else {
                if (item.quantity > 1) {
                    item.quantity -= 1;
                } else {
                    this.removeItem(itemId);
                    return;
                }
            }
            
            this.saveCart();
            this.renderCart();
            this.updateCartCounter();
            this.showNotification(`Jumlah ${item.name} diperbarui`);
        }
    }

    // Remove item from cart
    removeItem(itemId) {
        const item = this.cart.find(item => item.id === itemId);
        
        if (item) {
            this.cart = this.cart.filter(item => item.id !== itemId);
            this.saveCart();
            this.renderCart();
            this.updateCartCounter();
            this.showNotification(`${item.name} dihapus dari keranjang`);
        }
    }

    // Add item to cart
    addToCart(id, name, price) {
        const existingItem = this.cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: id,
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.renderCart();
        this.updateCartCounter();
        this.showNotification(`${name} ditambahkan ke keranjang`);
    }

    // Handle checkout
    handleCheckout() {
        if (this.cart.length === 0) {
            alert('Keranjang Anda kosong. Silakan tambahkan item terlebih dahulu.');
            return;
        }

        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCost = 10000;
        const serviceCost = 2000;
        const total = subtotal + deliveryCost + serviceCost;

        const orderSummary = this.cart.map(item => 
            `${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString()}`
        ).join('\n');

        const selectedPayment = document.querySelector('input[name="payment"]:checked').value;
        const paymentMethods = {
            'cod': 'Cash on Delivery',
            'transfer': 'Transfer Bank',
            'ewallet': 'E-Wallet'
        };

        const confirmation = confirm(
            `ORDER SUMMARY:\n\n${orderSummary}\n\n` +
            `Subtotal: Rp ${subtotal.toLocaleString()}\n` +
            `Biaya Pengiriman: Rp ${deliveryCost.toLocaleString()}\n` +
            `Biaya Layanan: Rp ${serviceCost.toLocaleString()}\n` +
            `Total: Rp ${total.toLocaleString()}\n\n` +
            `Metode Pembayaran: ${paymentMethods[selectedPayment]}\n\n` +
            `Lanjutkan ke checkout?`
        );

        if (confirmation) {
            // Simulate order processing
            this.processOrder();
        }
    }

    // Process order (simulated)
    async processOrder() {
        const checkoutBtn = document.getElementById('checkout-btn-large');
        const originalText = checkoutBtn.textContent;
        
        // Show loading state
        checkoutBtn.textContent = 'Memproses...';
        checkoutBtn.disabled = true;

        try {
            // Simulate API call
            await this.simulateOrderAPI();
            
            // Show success message
            this.showNotification('Pesanan berhasil diproses! Mengarahkan ke halaman konfirmasi...', 'success');
            
            // Clear cart and redirect
            setTimeout(() => {
                this.cart = [];
                this.saveCart();
                window.location.href = 'order-confirmation.html';
            }, 2000);
            
        } catch (error) {
            this.showNotification('Terjadi kesalahan saat memproses pesanan. Silakan coba lagi.', 'error');
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }
    }

    // Simulate order API call
    simulateOrderAPI() {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Payment failed'));
                }
            }, 2000);
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
        }, 3000);
    }
}

// Initialize cart page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const cartPage = new CartPage();
    window.cartPage = cartPage;
});