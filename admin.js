// ===== ADMIN DASHBOARD FUNCTIONALITY =====
class AdminDashboard {
    constructor() {
        this.orders = [];
        this.menuItems = [];
        this.users = [];
        this.init();
    }

    async init() {
        await this.loadData();
        this.renderDashboard();
        this.initializeCharts();
        this.addEventListeners();
        this.checkAdminAuth();
    }

    // Check admin authentication
    checkAdminAuth() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || currentUser.role !== 'admin') {
            window.location.href = 'admin-login.html';
            return;
        }
    }

    // Load data from localStorage
    async loadData() {
        // Load orders
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        
        // Load menu items
        try {
            const menuData = JSON.parse(localStorage.getItem('menuData')) || 
                           await this.fetchMenuData();
            this.menuItems = menuData.menuItems || [];
        } catch (error) {
            console.error('Error loading menu data:', error);
            this.menuItems = [];
        }
        
        // Load users
        this.users = JSON.parse(localStorage.getItem('users')) || [];
    }

    // Fetch menu data from JSON file
    async fetchMenuData() {
        try {
            const response = await fetch('../data/menu-data.json');
            return await response.json();
        } catch (error) {
            console.error('Error fetching menu data:', error);
            return { menuItems: [] };
        }
    }

    // Render dashboard statistics
    renderDashboard() {
        this.renderStats();
        this.renderRecentOrders();
        this.renderPopularItems();
    }

    // Render statistics
    renderStats() {
        // Calculate total revenue
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('total-revenue').textContent = `Rp ${totalRevenue.toLocaleString()}`;
        
        // Total orders
        document.getElementById('total-orders').textContent = this.orders.length;
        
        // Total customers (unique emails)
        const uniqueCustomers = new Set(this.orders.map(order => order.customer.email)).size;
        document.getElementById('total-customers').textContent = uniqueCustomers;
        
        // Total menu items
        document.getElementById('total-menu-items').textContent = this.menuItems.length;
    }

    // Render recent orders
    renderRecentOrders() {
        const recentOrdersContainer = document.getElementById('recent-orders');
        const recentOrders = this.orders.slice(-5).reverse(); // Get last 5 orders
        
        if (recentOrders.length === 0) {
            recentOrdersContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📦</div>
                    <p>Belum ada pesanan</p>
                </div>
            `;
            return;
        }

        recentOrdersContainer.innerHTML = recentOrders.map(order => `
            <div class="activity-item">
                <div class="activity-icon order">📦</div>
                <div class="activity-details">
                    <h4>Order #${order.id}</h4>
                    <p>${order.customer.name} • ${order.items.length} items</p>
                </div>
                <div class="activity-time">
                    <strong>Rp ${order.total.toLocaleString()}</strong>
                    <div>${this.formatTimeAgo(order.createdAt)}</div>
                </div>
            </div>
        `).join('');
    }

    // Render popular menu items
    renderPopularItems() {
        const popularItemsContainer = document.getElementById('popular-items');
        
        // Calculate item popularity (simulated)
        const itemPopularity = this.calculateItemPopularity();
        const popularItems = itemPopularity.slice(0, 5);
        
        if (popularItems.length === 0) {
            popularItemsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🍽️</div>
                    <p>Belum ada data popularitas menu</p>
                </div>
            `;
            return;
        }

        popularItemsContainer.innerHTML = popularItems.map(item => `
            <div class="popular-item">
                <img src="${item.image}" alt="${item.name}" class="popular-item-image" onerror="this.src='../assets/images/placeholder-food.jpg'">
                <div class="popular-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.category}</p>
                </div>
                <div class="popular-item-stats">
                    <span class="popular-item-orders">${item.orderCount} orders</span>
                    <span class="popular-item-rating">⭐ ${item.rating || '4.5'}</span>
                </div>
            </div>
        `).join('');
    }

    // Calculate item popularity (simulated)
    calculateItemPopularity() {
        // In a real app, this would be based on actual order data
        return this.menuItems.map(item => ({
            ...item,
            orderCount: Math.floor(Math.random() * 50) + 10, // Simulated order count
            rating: (Math.random() * 1 + 4).toFixed(1) // Simulated rating 4.0-5.0
        })).sort((a, b) => b.orderCount - a.orderCount);
    }

    // Initialize charts
    initializeCharts() {
        this.initializeRevenueChart();
        this.initializeOrdersChart();
    }

    // Initialize revenue chart
    initializeRevenueChart() {
        const ctx = document.getElementById('revenue-chart').getContext('2d');
        
        // Generate sample revenue data for last 30 days
        const revenueData = this.generateSampleRevenueData(30);
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: revenueData.labels,
                datasets: [{
                    label: 'Revenue',
                    data: revenueData.values,
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return 'Rp ' + value.toLocaleString();
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    // Initialize orders chart
    initializeOrdersChart() {
        const ctx = document.getElementById('orders-chart').getContext('2d');
        
        // Generate sample orders data for last 30 days
        const ordersData = this.generateSampleOrdersData(30);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ordersData.labels,
                datasets: [{
                    label: 'Orders',
                    data: ordersData.values,
                    backgroundColor: 'rgba(52, 152, 219, 0.8)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    }
                }
            }
        });
    }

    // Generate sample revenue data
    generateSampleRevenueData(days) {
        const labels = [];
        const values = [];
        let currentRevenue = 500000;
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(this.formatDate(date));
            
            // Simulate daily revenue with some randomness
            const dailyChange = (Math.random() - 0.3) * 0.2; // -30% to +20%
            currentRevenue = Math.max(100000, currentRevenue * (1 + dailyChange));
            values.push(Math.round(currentRevenue));
        }
        
        return { labels, values };
    }

    // Generate sample orders data
    generateSampleOrdersData(days) {
        const labels = [];
        const values = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(this.formatDate(date));
            
            // Simulate daily orders (5-20 orders per day)
            values.push(Math.floor(Math.random() * 15) + 5);
        }
        
        return { labels, values };
    }

    // Add event listeners
    addEventListeners() {
        this.addLogoutListener();
        this.addPeriodChangeListeners();
    }

    // Add logout listener
    addLogoutListener() {
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    // Add period change listeners
    addPeriodChangeListeners() {
        const revenuePeriod = document.getElementById('revenue-period');
        const ordersPeriod = document.getElementById('orders-period');
        
        if (revenuePeriod) {
            revenuePeriod.addEventListener('change', () => {
                this.updateRevenueChart();
            });
        }
        
        if (ordersPeriod) {
            ordersPeriod.addEventListener('change', () => {
                this.updateOrdersChart();
            });
        }
    }

    // Update revenue chart based on selected period
    updateRevenueChart() {
        // In a real app, this would fetch new data based on the period
        console.log('Revenue period changed');
    }

    // Update orders chart based on selected period
    updateOrdersChart() {
        // In a real app, this would fetch new data based on the period
        console.log('Orders period changed');
    }

    // Handle logout
    handleLogout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'admin-login.html';
    }

    // Utility functions
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} mins ago`;
        } else if (diffHours < 24) {
            return `${diffHours} hours ago`;
        } else {
            return `${diffDays} days ago`;
        }
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const adminDashboard = new AdminDashboard();
    window.adminDashboard = adminDashboard;
});