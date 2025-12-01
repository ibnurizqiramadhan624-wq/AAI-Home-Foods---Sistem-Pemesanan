// admin-auth.js - Authentication for AAI Home Foods Admin
class AdminAuth {
    constructor() {
        this.adminUsers = {
            'adit@aaihomefoods.com': {
                id: 1,
                name: 'Adit',
                email: 'adit@aaihomefoods.com',
                password: 'adit123',
                role: 'super_admin',
                permissions: ['all'],
                avatar: 'adit.jpg'
            },
            'ibnu@aaihomefoods.com': {
                id: 2,
                name: 'Ibnu',
                email: 'ibnu@aaihomefoods.com',
                password: 'ibnu123',
                role: 'order_manager',
                permissions: ['view_orders', 'update_orders', 'view_reports'],
                avatar: 'ibnu.jpg'
            },
            'akmal@aaihomefoods.com': {
                id: 3,
                name: 'Akmal',
                email: 'akmal@aaihomefoods.com',
                password: 'akmal123',
                role: 'menu_manager',
                permissions: ['view_menu', 'manage_menu', 'view_analytics'],
                avatar: 'akmal.jpg'
            }
        };
        
        this.init();
    }
    
    init() {
        this.checkAuthState();
        this.setupEventListeners();
    }
    
    checkAuthState() {
        // Redirect to login if no token
        if (!localStorage.getItem('admin_token') && 
            !window.location.href.includes('admin-login.html')) {
            window.location.href = 'admin-login.html';
        }
        
        // Redirect to dashboard if already logged in and on login page
        if (localStorage.getItem('admin_token') && 
            window.location.href.includes('admin-login.html')) {
            window.location.href = 'dashboard.html';
        }
    }
    
    setupEventListeners() {
        // Login form submission
        const loginForm = document.getElementById('admin-login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Logout button
        const logoutBtn = document.getElementById('admin-logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }
    }
    
    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value.trim();
        const password = document.getElementById('admin-password').value;
        
        try {
            // Show loading state
            this.showLoading(true);
            
            // Validate credentials
            if (!this.adminUsers[email]) {
                throw new Error('Email tidak ditemukan!');
            }
            
            const user = this.adminUsers[email];
            
            if (user.password !== password) {
                throw new Error('Password salah!');
            }
            
            // Generate token
            const token = this.generateToken(user);
            
            // Store user data
            this.storeUserData(user, token);
            
            // Show success message
            this.showMessage('Login berhasil! Mengalihkan...', 'success');
            
            // Redirect after delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
            
        } catch (error) {
            this.showMessage(error.message, 'error');
            this.showLoading(false);
        }
    }
    
    handleLogout(e) {
        e.preventDefault();
        
        if (confirm('Apakah Anda yakin ingin logout?')) {
            this.clearUserData();
            window.location.href = 'admin-login.html';
        }
    }
    
    generateToken(user) {
        const timestamp = Date.now();
        const data = `${user.email}:${timestamp}:${user.role}`;
        return btoa(data);
    }
    
    storeUserData(user, token) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_id', user.id);
        localStorage.setItem('admin_name', user.name);
        localStorage.setItem('admin_email', user.email);
        localStorage.setItem('admin_role', user.role);
        localStorage.setItem('admin_permissions', JSON.stringify(user.permissions));
        localStorage.setItem('admin_avatar', user.avatar);
        localStorage.setItem('admin_login_time', new Date().toISOString());
    }
    
    clearUserData() {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_id');
        localStorage.removeItem('admin_name');
        localStorage.removeItem('admin_email');
        localStorage.removeItem('admin_role');
        localStorage.removeItem('admin_permissions');
        localStorage.removeItem('admin_avatar');
        localStorage.removeItem('admin_login_time');
    }
    
    showLoading(show) {
        const btn = document.getElementById('login-btn');
        const btnText = document.getElementById('btn-text');
        const btnLoading = document.getElementById('btn-loading');
        
        if (btn && btnText && btnLoading) {
            if (show) {
                btnText.style.display = 'none';
                btnLoading.style.display = 'inline-block';
                btn.disabled = true;
            } else {
                btnText.style.display = 'inline-block';
                btnLoading.style.display = 'none';
                btn.disabled = false;
            }
        }
    }
    
    showMessage(message, type = 'error') {
        // Remove existing messages
        const existingMsg = document.getElementById('auth-message');
        if (existingMsg) existingMsg.remove();
        
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.id = 'auth-message';
        messageDiv.className = `auth-message ${type}`;
        messageDiv.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        
        // Add styles if not exists
        if (!document.querySelector('#auth-message-styles')) {
            const style = document.createElement('style');
            style.id = 'auth-message-styles';
            style.textContent = `
                .auth-message {
                    padding: 12px 15px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    animation: slideIn 0.3s ease;
                }
                
                .auth-message.error {
                    background: #fee;
                    color: #c0392b;
                    border-left: 4px solid #e74c3c;
                }
                
                .auth-message.success {
                    background: #efffed;
                    color: #27ae60;
                    border-left: 4px solid #2ecc71;
                }
                
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        // Insert message
        const form = document.getElementById('admin-login-form');
        if (form) {
            form.parentNode.insertBefore(messageDiv, form);
            
            // Auto remove after 5 seconds
            if (type === 'error') {
                setTimeout(() => {
                    messageDiv.style.opacity = '0';
                    setTimeout(() => messageDiv.remove(), 300);
                }, 5000);
            }
        }
    }
    
    // Utility methods for other pages
    static getCurrentUser() {
        return {
            id: localStorage.getItem('admin_id'),
            name: localStorage.getItem('admin_name'),
            email: localStorage.getItem('admin_email'),
            role: localStorage.getItem('admin_role'),
            permissions: JSON.parse(localStorage.getItem('admin_permissions') || '[]'),
            avatar: localStorage.getItem('admin_avatar'),
            loginTime: localStorage.getItem('admin_login_time')
        };
    }
    
    static hasPermission(permission) {
        const user = this.getCurrentUser();
        if (user.role === 'super_admin') return true;
        return user.permissions.includes(permission) || user.permissions.includes('all');
    }
    
    static checkAccess(page) {
        const requiredPermissions = {
            'dashboard.html': ['view_dashboard'],
            'manage-orders.html': ['view_orders'],
            'manage-menu.html': ['view_menu', 'manage_menu']
        };
        
        if (requiredPermissions[page]) {
            const hasAccess = requiredPermissions[page].some(perm => 
                this.hasPermission(perm)
            );
            
            if (!hasAccess) {
                alert('Anda tidak memiliki akses ke halaman ini!');
                window.location.href = 'dashboard.html';
            }
        }
    }
}

// Initialize auth system
document.addEventListener('DOMContentLoaded', () => {
    new AdminAuth();
});