// ===== MAIN APPLICATION =====
class AAIFoodsApp {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.loadFeaturedMenu();
        this.initializeCart();
        this.addEventListeners();
        this.updateCartCounter();
    }

    // ===== MENU MANAGEMENT =====
    loadFeaturedMenu() {
        const menuGrid = document.getElementById('featured-menu');
        if (!menuGrid) return;

        const featuredMenus = [
            {
                id: 1,
                name: "Salmon Wellington",
                description: "Salmon segar dibalut pastry renyah dengan isian jamur dan herba",
                price: 75000,
                image: "assets/images/menu/salmon-wellington.jpg",
                category: "main-course",
                popular: true
            },
            {
                id: 2,
                name: "Ayam Ulam Bali",
                description: "Ayam dengan bumbu Bali tradisional dan campuran ulam segar",
                price: 25000,
                image: "assets/images/menu/ayam-ulam-bali.jpg",
                category: "main-course",
                popular: true
            },
            {
                id: 3,
                name: "Salmon Mashed Potato",
                description: "Fillet salmon panggang dengan mashed potato lembut dan saus spesial",
                price: 75000,
                image: "assets/images/menu/salmon-mashed-potato.jpg",
                category: "main-course",
                popular: false
            },
            {
                id: 4,
                name: "Beef Teppanyaki",
                description: "Daging sapi premium dimasak teppanyaki dengan saus spesial",
                price: 65000,
                image: "assets/images/menu/beef-teppanyaki.jpg",
                category: "main-course",
                popular: true
            }
        ];

        menuGrid.innerHTML = featuredMenus.map(menu => this.createMenuItem(menu)).join('');
        this.addCartEventListeners();
    }

    createMenuItem(menu) {
        return `
            <div class="menu-item">
                <div class="menu-image">
                    <img src="${menu.image}" alt="${menu.name}" onerror="this.src='assets/images/placeholder-food.jpg'">
                    ${menu.popular ? '<span class="popular-badge">🔥 Populer</span>' : ''}
                </div>
                <div class="menu-info">
                    <h3>${menu.name}</h3>
                    <p>${menu.description}</p>
                    <div class="menu-meta">
                        <div class="price">Rp ${menu.price.toLocaleString()}</div>
                        <button class="add-to-cart" 
                                data-id="${menu.id}"
                                data-name="${menu.name}"
                                data-price="${menu.price}">
                            + Keranjang
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== CART FUNCTIONALITY =====
    initializeCart() {
        if (!localStorage.getItem('cart')) {
            localStorage.setItem('cart', JSON.stringify([]));
        }
    }

    addCartEventListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.target.getAttribute('data-id');
                const name = e.target.getAttribute('data-name');
                const price = parseInt(e.target.getAttribute('data-price'));
                
                this.addToCart(id, name, price);
            });
        });
    }

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
        
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCart();
        this.showCartPreview();
        this.showNotification(`${name} berhasil ditambahkan ke keranjang!`);
    }

    updateCart() {
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (!cartItems || !cartTotal) return;

        let total = 0;
        cartItems.innerHTML = '';
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p>Keranjang kosong</p>';
        } else {
            this.cart.forEach(item => {
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
        this.updateCartCounter();
    }

    updateCartCounter() {
        const cartIcon = document.getElementById('cart-icon');
        if (!cartIcon) return;

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartIcon.innerHTML = totalItems > 0 ? `🛒 Keranjang (${totalItems})` : '🛒 Keranjang';
    }

    // ===== CART PREVIEW =====
    addEventListeners() {
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

        // Smooth scrolling
        this.addSmoothScrolling();
    }

    addSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        
        links.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    showCartPreview() {
        const cartPreview = document.getElementById('cart-preview');
        if (cartPreview) {
            this.updateCart();
            cartPreview.classList.add('active');
        }
    }

    hideCartPreview() {
        const cartPreview = document.getElementById('cart-preview');
        if (cartPreview) {
            cartPreview.classList.remove('active');
        }
    }

    // ===== CHECKOUT =====
    handleCheckout() {
        if (this.cart.length === 0) {
            alert('Keranjang Anda kosong. Silakan tambahkan item terlebih dahulu.');
            return;
        }
        
        const totalAmount = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderSummary = this.cart.map(item => 
            `${item.name} (${item.quantity}x) - Rp ${(item.price * item.quantity).toLocaleString()}`
        ).join('\n');
        
        const confirmation = confirm(`ORDER SUMMARY:\n\n${orderSummary}\n\nTotal: Rp ${totalAmount.toLocaleString()}\n\nLanjutkan ke checkout?`);
        
        if (confirmation) {
            window.location.href = 'pages/checkout.html';
        }
    }

    // ===== NOTIFICATION SYSTEM =====
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // ===== UTILITY METHODS =====
    formatRupiah(amount) {
        return 'Rp ' + amount.toLocaleString('id-ID');
    }

    clearCart() {
        this.cart = [];
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCart();
        this.updateCartCounter();
    }
}

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', function() {
    const app = new AAIFoodsApp();
    window.aaiFoodsApp = app;
});

// ===== DEBOUNCE HELPER =====
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}