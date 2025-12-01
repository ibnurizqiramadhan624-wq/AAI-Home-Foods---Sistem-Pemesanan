// ===== MENU PAGE FUNCTIONALITY =====
class MenuPage {
    constructor() {
        this.allMenus = [];
        this.filteredMenus = [];
        this.currentView = 'grid';
        this.currentCategory = 'all';
        this.currentSort = 'name';
        this.searchTerm = '';
        this.init();
    }

    async init() {
        await this.loadAllMenus();
        this.renderAllMenus();
        this.addEventListeners();
        this.updateMenuStats();
        this.updateCartCounter();
    }

    // Load all menu data
    async loadAllMenus() {
        try {
            this.allMenus = [
                {
                    id: 1,
                    name: "Salmon Wellington",
                    description: "Salmon segar dibalut pastry renyah dengan isian jamur dan herba",
                    price: 75000,
                    image: "../assets/images/menu/salmon-wellington.jpg",
                    category: "main-course",
                    popular: true
                },
                {
                    id: 2,
                    name: "Ayam Ulam Bali",
                    description: "Ayam dengan bumbu Bali tradisional dan campuran ulam segar",
                    price: 25000,
                    image: "../assets/images/menu/ayam-ulam-bali.jpg",
                    category: "main-course",
                    popular: true
                },
                {
                    id: 3,
                    name: "Salmon Mashed Potato",
                    description: "Fillet salmon panggang dengan mashed potato lembut dan saus spesial",
                    price: 75000,
                    image: "../assets/images/menu/salmon-mashed-potato.jpg",
                    category: "main-course",
                    popular: false
                },
                {
                    id: 4,
                    name: "Beef Teppanyaki",
                    description: "Daging sapi premium dimasak di atas piring panas dengan saus teppanyaki spesial dan sayuran segar",
                    price: 65000,
                    image: "../assets/images/menu/beef-teppanyaki.jpg",
                    category: "main-course",
                    popular: true
                },
                {
                    id: 5,
                    name: "Chicken Wonton",
                    description: "Pangsit ayam isi daging ayam cincang dengan bumbu rempah, disajikan dengan kuah kaldu ayam",
                    price: 35000,
                    image: "../assets/images/menu/chicken-wonton.jpg",
                    category: "appetizer",
                    popular: false
                },
                {
                    id: 6,
                    name: "Zuppa Soup",
                    description: "Sup krim jamur dengan potongan jamur segar, bawang, dan rempah-rempah Italia",
                    price: 28000,
                    image: "../assets/images/menu/zuppa-soup.jpg",
                    category: "soup",
                    popular: true
                },
                {
                    id: 7,
                    name: "Grilled Chicken Salad",
                    description: "Salad segar dengan ayam panggang, sayuran mix, dan dressing spesial",
                    price: 45000,
                    image: "../assets/images/menu/grilled-chicken-salad.jpg",
                    category: "appetizer",
                    popular: false
                },
                {
                    id: 8,
                    name: "Seafood Pasta",
                    description: "Pasta dengan campuran seafood segar dalam saus tomato cream",
                    price: 68000,
                    image: "../assets/images/menu/seafood-pasta.jpg",
                    category: "main-course",
                    popular: true
                }
            ];
            this.filteredMenus = [...this.allMenus];
            this.applySorting();
        } catch (error) {
            console.error('Error loading menus:', error);
            this.allMenus = [];
            this.filteredMenus = [];
        }
    }

    // Render all menus to the grid
    renderAllMenus() {
        const menuGrid = document.getElementById('all-menu-grid');
        if (!menuGrid) return;

        if (this.filteredMenus.length === 0) {
            menuGrid.innerHTML = `
                <div class="no-results">
                    <h3>Menu tidak ditemukan</h3>
                    <p>Coba gunakan kata kunci lain atau lihat semua kategori</p>
                </div>
            `;
            return;
        }

        menuGrid.innerHTML = this.filteredMenus.map(menu => this.createMenuItemHTML(menu)).join('');
        this.addCartEventListeners();
    }

    // Create menu item HTML based on current view
    createMenuItemHTML(menu) {
        const isListView = this.currentView === 'list';
        
        if (isListView) {
            return `
                <div class="menu-item list-view">
                    <div class="menu-image">
                        <img src="${menu.image}" alt="${menu.name}" onerror="this.src='../assets/images/placeholder-food.jpg'">
                        ${menu.popular ? '<span class="popular-badge">🔥 Populer</span>' : ''}
                    </div>
                    <div class="menu-info">
                        <div class="menu-details">
                            <h3>${menu.name} <span class="category-badge">${this.getCategoryLabel(menu.category)}</span></h3>
                            <p>${menu.description}</p>
                        </div>
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
        } else {
            return `
                <div class="menu-item">
                    <div class="menu-image">
                        <img src="${menu.image}" alt="${menu.name}" onerror="this.src='../assets/images/placeholder-food.jpg'">
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
    }

    // Get category label
    getCategoryLabel(category) {
        const labels = {
            'main-course': 'Main Course',
            'appetizer': 'Appetizer',
            'soup': 'Soup'
        };
        return labels[category] || category;
    }

    // Add event listeners for menu page
    addEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        const searchButton = document.querySelector('.search-box button');
        
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                this.handleSearch();
            }, 300));
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.handleSearch();
            });
        }

        // Category filter
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.handleFilter();
            });
        }

        // Sort functionality
        const sortBy = document.getElementById('sort-by');
        if (sortBy) {
            sortBy.addEventListener('change', () => {
                this.handleSort();
            });
        }

        // View toggle
        const viewButtons = document.querySelectorAll('.view-btn');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleViewChange(e.target);
            });
        });

        // Cart functionality
        this.initializeCartEvents();
    }

    // Handle search functionality
    handleSearch() {
        const searchInput = document.getElementById('search-input');
        this.searchTerm = searchInput.value.toLowerCase().trim();
        this.applyFilters();
    }

    // Handle category filter
    handleFilter() {
        const categoryFilter = document.getElementById('category-filter');
        this.currentCategory = categoryFilter.value;
        this.applyFilters();
    }

    // Handle sorting
    handleSort() {
        const sortBy = document.getElementById('sort-by');
        this.currentSort = sortBy.value;
        this.applySorting();
        this.renderAllMenus();
    }

    // Apply all filters
    applyFilters() {
        this.filteredMenus = this.allMenus.filter(menu => {
            const matchesSearch = !this.searchTerm || 
                menu.name.toLowerCase().includes(this.searchTerm) ||
                menu.description.toLowerCase().includes(this.searchTerm);
            
            const matchesCategory = this.currentCategory === 'all' || 
                menu.category === this.currentCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        this.applySorting();
        this.renderAllMenus();
        this.updateMenuStats();
    }

    // Apply sorting
    applySorting() {
        switch (this.currentSort) {
            case 'name':
                this.filteredMenus.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-low':
                this.filteredMenus.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredMenus.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                this.filteredMenus.sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
                break;
        }
    }

    // Handle view change (grid/list)
    handleViewChange(clickedButton) {
        const viewButtons = document.querySelectorAll('.view-btn');
        const menuGrid = document.getElementById('all-menu-grid');
        
        // Update active button
        viewButtons.forEach(btn => btn.classList.remove('active'));
        clickedButton.classList.add('active');
        
        // Update view
        this.currentView = clickedButton.getAttribute('data-view');
        menuGrid.setAttribute('data-view', this.currentView);
        
        // Re-render with new view
        this.renderAllMenus();
    }

    // Add cart event listeners to menu items
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

    // Initialize cart events
    initializeCartEvents() {
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

    // Add item to cart
    addToCart(id, name, price) {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        const existingItem = cart.find(item => item.id === id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: id,
                name: name,
                price: price,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cart));
        this.updateCartCounter();
        this.showNotification(`${name} berhasil ditambahkan ke keranjang!`);
        this.showCartPreview();
    }

    // Update cart counter
    updateCartCounter() {
        const cartIcon = document.getElementById('cart-icon');
        if (!cartIcon) return;

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartIcon.innerHTML = totalItems > 0 ? `🛒 Keranjang (${totalItems})` : '🛒 Keranjang';
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

    // Show notification
    showNotification(message) {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Update menu statistics
    updateMenuStats() {
        const menuCount = document.getElementById('menu-count');
        if (menuCount) {
            const totalMenus = this.allMenus.length;
            const showingMenus = this.filteredMenus.length;
            
            if (showingMenus === totalMenus) {
                menuCount.textContent = `Menampilkan semua ${totalMenus} menu`;
            } else {
                menuCount.textContent = `Menampilkan ${showingMenus} dari ${totalMenus} menu`;
                
                if (this.searchTerm) {
                    menuCount.textContent += ` untuk "${this.searchTerm}"`;
                }
                
                if (this.currentCategory !== 'all') {
                    menuCount.textContent += ` dalam ${this.getCategoryLabel(this.currentCategory)}`;
                }
            }
        }
    }
}

// Initialize menu page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const menuPage = new MenuPage();
    window.menuPage = menuPage;
});