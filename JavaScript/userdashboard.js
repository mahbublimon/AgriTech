document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    const addressForm = document.getElementById('addressForm');
    const addAddressBtn = document.getElementById('addAddressBtn');
    const addressModal = new bootstrap.Modal(document.getElementById('addressModal'));
    const orderDetailsModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
    const logoutBtn = document.getElementById('logoutBtn');
    const cartBadge = document.getElementById('cartBadge');
    const profileImageInput = document.getElementById('profileImageInput');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const profileImage = document.getElementById('profileImage');
    
    // Current user data
    let currentUser = null;
    let userAddresses = [];
    let userOrders = [];
    let userWishlist = [];
    
    // Initialize dashboard
    async function initDashboard() {
        try {
            // Check if user is logged in
            const token = localStorage.getItem('userToken');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
            
            // Load user data
            await loadUserProfile();
            await loadUserAddresses();
            await loadUserOrders();
            await loadUserWishlist();
            updateCartBadge();
            
            // Set up event listeners
            setupEventListeners();
        } catch (error) {
            console.error('Dashboard initialization error:', error);
            alert('Failed to load dashboard. Please try again.');
        }
    }
    
    // Load user profile
    async function loadUserProfile() {
        try {
            const response = await fetch('/api/users/me', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load profile');
            
            currentUser = await response.json();
            
            // Update profile display
            document.getElementById('userName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
            document.getElementById('userEmail').textContent = currentUser.email;
            document.getElementById('userSince').textContent = `Member since ${new Date(currentUser.createdAt).getFullYear()}`;
            
            // Fill profile form
            document.getElementById('firstName').value = currentUser.firstName;
            document.getElementById('lastName').value = currentUser.lastName;
            document.getElementById('email').value = currentUser.email;
            document.getElementById('phone').value = currentUser.phone || '';
            document.getElementById('dob').value = currentUser.dob?.split('T')[0] || '';
            
            // Set profile image if available
            if (currentUser.profileImage) {
                profileImage.src = currentUser.profileImage;
            }
        } catch (error) {
            console.error('Error loading profile:', error);
            throw error;
        }
    }
    
    // Load user addresses
    async function loadUserAddresses() {
        try {
            const response = await fetch('/api/users/addresses', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load addresses');
            
            userAddresses = await response.json();
            renderAddresses();
        } catch (error) {
            console.error('Error loading addresses:', error);
            throw error;
        }
    }
    
    // Load user orders
    async function loadUserOrders() {
        try {
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load orders');
            
            userOrders = await response.json();
            renderOrders();
        } catch (error) {
            console.error('Error loading orders:', error);
            throw error;
        }
    }
    
    // Load user wishlist
    async function loadUserWishlist() {
        try {
            const response = await fetch('/api/wishlist', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load wishlist');
            
            userWishlist = await response.json();
            renderWishlist();
        } catch (error) {
            console.error('Error loading wishlist:', error);
            throw error;
        }
    }
    
    // Render addresses
    function renderAddresses() {
        const container = document.getElementById('addressesContainer');
        
        if (userAddresses.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-map-marker-alt fa-3x text-muted mb-3"></i>
                    <h4>No saved addresses</h4>
                    <p>Add your first address to get started</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        userAddresses.forEach(address => {
            const addressCol = document.createElement('div');
            addressCol.className = 'col-md-6 mb-3';
            addressCol.innerHTML = `
                <div class="card h-100 ${address.isDefault ? 'border-success' : ''}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">
                                ${address.type === 'home' ? '<i class="fas fa-home me-2"></i>' : 
                                  address.type === 'work' ? '<i class="fas fa-briefcase me-2"></i>' : 
                                  '<i class="fas fa-map-marker-alt me-2"></i>'}
                                ${address.type.charAt(0).toUpperCase() + address.type.slice(1)} Address
                                ${address.isDefault ? '<span class="badge bg-success ms-2">Default</span>' : ''}
                            </h5>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><button class="dropdown-item edit-address-btn" data-id="${address.id}">Edit</button></li>
                                    <li><button class="dropdown-item delete-address-btn" data-id="${address.id}">Delete</button></li>
                                    ${!address.isDefault ? 
                                        `<li><button class="dropdown-item set-default-btn" data-id="${address.id}">Set as Default</button></li>` : ''}
                                </ul>
                            </div>
                        </div>
                        <p class="card-text mb-1"><strong>${address.fullName}</strong></p>
                        <p class="card-text mb-1">${address.phoneNumber}</p>
                        <p class="card-text mb-1">${address.addressLine1}</p>
                        ${address.addressLine2 ? `<p class="card-text mb-1">${address.addressLine2}</p>` : ''}
                        <p class="card-text mb-1">${address.district.name}, ${address.postalCode}</p>
                    </div>
                </div>
            `;
            container.appendChild(addressCol);
        });
    }
    
    // Render orders
    function renderOrders(filter = 'all') {
        const container = document.getElementById('ordersTableBody');
        
        let filteredOrders = userOrders;
        if (filter !== 'all') {
            filteredOrders = userOrders.filter(order => order.status.toLowerCase() === filter);
        }
        
        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-5">
                        <i class="fas fa-box-open fa-3x text-muted mb-3"></i>
                        <h4>No orders found</h4>
                        <p>${filter === 'all' ? 'You haven\'t placed any orders yet' : `No ${filter} orders found`}</p>
                        <a href="marketplace.html" class="btn btn-success mt-2">Start Shopping</a>
                    </td>
                </tr>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        filteredOrders.forEach(order => {
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            const statusClass = getStatusClass(order.status);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>#${order.id}</td>
                <td>${orderDate}</td>
                <td>${order.items.length} item${order.items.length > 1 ? 's' : ''}</td>
                <td>৳${order.totalAmount.toFixed(2)}</td>
                <td><span class="badge ${statusClass}">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-success view-order-btn" data-id="${order.id}">
                        <i class="fas fa-eye"></i> View
                    </button>
                </td>
            `;
            container.appendChild(row);
        });
    }
    
    // Render wishlist
    function renderWishlist() {
        const container = document.getElementById('wishlistContainer');
        
        if (userWishlist.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-heart fa-3x text-muted mb-3"></i>
                    <h4>Your wishlist is empty</h4>
                    <p>Save your favorite products here</p>
                    <a href="marketplace.html" class="btn btn-success mt-2">Browse Products</a>
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        userWishlist.forEach(item => {
            const productCol = document.createElement('div');
            productCol.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';
            productCol.innerHTML = `
                <div class="card h-100">
                    <img src="${item.product.images[0]?.url || 'images/default-product.jpg'}" 
                         class="card-img-top" 
                         alt="${item.product.name}"
                         style="height: 180px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${item.product.name}</h5>
                        <p class="card-text text-success">৳${item.product.price.toFixed(2)}</p>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-sm btn-outline-danger remove-wishlist-btn" data-id="${item.id}">
                                <i class="fas fa-trash"></i> Remove
                            </button>
                            <button class="btn btn-sm btn-success add-to-cart-btn" data-id="${item.product.id}">
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(productCol);
        });
    }
    
    // Get status class for styling
    function getStatusClass(status) {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-warning text-dark';
            case 'completed': return 'bg-success';
            case 'cancelled': return 'bg-danger';
            case 'shipped': return 'bg-info';
            default: return 'bg-secondary';
        }
    }
    
    // Update cart badge
    function updateCartBadge() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartBadge.textContent = totalItems;
        if (totalItems > 0) {
            cartBadge.classList.remove('d-none');
        } else {
            cartBadge.classList.add('d-none');
        }
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Profile form submission
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = {
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value,
                    dob: document.getElementById('dob').value
                };
                
                const response = await fetch('/api/users/me', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    },
                    body: JSON.stringify(formData)
                });
                
                if (!response.ok) throw new Error('Failed to update profile');
                
                const updatedUser = await response.json();
                currentUser = updatedUser;
                
                // Update profile display
                document.getElementById('userName').textContent = `${updatedUser.firstName} ${updatedUser.lastName}`;
                document.getElementById('userEmail').textContent = updatedUser.email;
                
                showToast('Profile updated successfully!');
            } catch (error) {
                console.error('Error updating profile:', error);
                showToast('Failed to update profile. Please try again.', 'error');
            }
        });
        
        // Password form submission
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
            
            try {
                const response = await fetch('/api/users/change-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    },
                    body: JSON.stringify({ currentPassword, newPassword })
                });
                
                if (!response.ok) throw new Error('Failed to change password');
                
                showToast('Password changed successfully!');
                passwordForm.reset();
            } catch (error) {
                console.error('Error changing password:', error);
                showToast('Failed to change password. Please try again.', 'error');
            }
        });
        
        // Add address button
        addAddressBtn.addEventListener('click', function() {
            document.getElementById('addressModalTitle').textContent = 'Add New Address';
            document.getElementById('addressId').value = '';
            addressForm.reset();
            addressModal.show();
        });
        
        // Address form submission
        addressForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const addressData = {
                    type: document.getElementById('addressType').value,
                    fullName: document.getElementById('fullName').value,
                    phoneNumber: document.getElementById('phoneNumber').value,
                    districtId: document.getElementById('district').value,
                    addressLine1: document.getElementById('addressLine1').value,
                    addressLine2: document.getElementById('addressLine2').value,
                    postalCode: document.getElementById('postalCode').value,
                    isDefault: document.getElementById('defaultAddress').checked
                };
                
                const addressId = document.getElementById('addressId').value;
                const method = addressId ? 'PUT' : 'POST';
                const url = addressId ? `/api/users/addresses/${addressId}` : '/api/users/addresses';
                
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                    },
                    body: JSON.stringify(addressData)
                });
                
                if (!response.ok) throw new Error('Failed to save address');
                
                await loadUserAddresses();
                addressModal.hide();
                showToast('Address saved successfully!');
            } catch (error) {
                console.error('Error saving address:', error);
                showToast('Failed to save address. Please try again.', 'error');
            }
        });
        
        // Edit address buttons (delegated)
        document.getElementById('addressesContainer').addEventListener('click', function(e) {
            if (e.target.closest('.edit-address-btn')) {
                const addressId = e.target.closest('.edit-address-btn').getAttribute('data-id');
                editAddress(addressId);
            }
            
            if (e.target.closest('.delete-address-btn')) {
                const addressId = e.target.closest('.delete-address-btn').getAttribute('data-id');
                deleteAddress(addressId);
            }
            
            if (e.target.closest('.set-default-btn')) {
                const addressId = e.target.closest('.set-default-btn').getAttribute('data-id');
                setDefaultAddress(addressId);
            }
        });
        
        // View order buttons (delegated)
        document.getElementById('ordersTableBody').addEventListener('click', function(e) {
            if (e.target.closest('.view-order-btn')) {
                const orderId = e.target.closest('.view-order-btn').getAttribute('data-id');
                viewOrderDetails(orderId);
            }
        });
        
        // Order filter dropdown
        document.querySelectorAll('[data-filter]').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const filter = this.getAttribute('data-filter');
                document.getElementById('orderFilterDropdown').textContent = this.textContent;
                renderOrders(filter);
            });
        });
        
        // Wishlist buttons (delegated)
        document.getElementById('wishlistContainer').addEventListener('click', function(e) {
            if (e.target.closest('.remove-wishlist-btn')) {
                const itemId = e.target.closest('.remove-wishlist-btn').getAttribute('data-id');
                removeFromWishlist(itemId);
            }
            
            if (e.target.closest('.add-to-cart-btn')) {
                const productId = e.target.closest('.add-to-cart-btn').getAttribute('data-id');
                addToCartFromWishlist(productId);
            }
        });
        
        // Cancel order button
        document.getElementById('cancelOrderBtn').addEventListener('click', function() {
            const orderId = this.getAttribute('data-order-id');
            if (orderId) {
                cancelOrder(orderId);
            }
        });
        
        // Logout button
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('userToken');
            window.location.href = 'login.html';
        });
        
        // Change profile photo
        changePhotoBtn.addEventListener('click', function() {
            profileImageInput.click();
        });
        
        profileImageInput.addEventListener('change', async function() {
            if (this.files && this.files[0]) {
                try {
                    const formData = new FormData();
                    formData.append('profileImage', this.files[0]);
                    
                    const response = await fetch('/api/users/me/profile-image', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                        },
                        body: formData
                    });
                    
                    if (!response.ok) throw new Error('Failed to upload image');
                    
                    const result = await response.json();
                    profileImage.src = result.profileImageUrl;
                    showToast('Profile image updated successfully!');
                } catch (error) {
                    console.error('Error uploading profile image:', error);
                    showToast('Failed to update profile image', 'error');
                }
            }
        });
    }
    
    // Edit address
    async function editAddress(addressId) {
        try {
            const address = userAddresses.find(addr => addr.id == addressId);
            if (!address) throw new Error('Address not found');
            
            document.getElementById('addressModalTitle').textContent = 'Edit Address';
            document.getElementById('addressId').value = address.id;
            document.getElementById('addressType').value = address.type;
            document.getElementById('fullName').value = address.fullName;
            document.getElementById('phoneNumber').value = address.phoneNumber;
            document.getElementById('district').value = address.district.id;
            document.getElementById('addressLine1').value = address.addressLine1;
            document.getElementById('addressLine2').value = address.addressLine2 || '';
            document.getElementById('postalCode').value = address.postalCode;
            document.getElementById('defaultAddress').checked = address.isDefault;
            
            addressModal.show();
        } catch (error) {
            console.error('Error editing address:', error);
            showToast('Failed to edit address', 'error');
        }
    }
    
    // Delete address
    async function deleteAddress(addressId) {
        if (!confirm('Are you sure you want to delete this address?')) return;
        
        try {
            const response = await fetch(`/api/users/addresses/${addressId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to delete address');
            
            await loadUserAddresses();
            showToast('Address deleted successfully!');
        } catch (error) {
            console.error('Error deleting address:', error);
            showToast('Failed to delete address', 'error');
        }
    }
    
    // Set default address
    async function setDefaultAddress(addressId) {
        try {
            const response = await fetch(`/api/users/addresses/${addressId}/set-default`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to set default address');
            
            await loadUserAddresses();
            showToast('Default address updated!');
        } catch (error) {
            console.error('Error setting default address:', error);
            showToast('Failed to update default address', 'error');
        }
    }
    
    // View order details
    async function viewOrderDetails(orderId) {
        try {
            const response = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to load order details');
            
            const order = await response.json();
            renderOrderDetails(order);
            
            // Set order ID for cancel button
            document.getElementById('cancelOrderBtn').setAttribute('data-order-id', order.id);
            
            // Show/hide cancel button based on order status
            document.getElementById('cancelOrderBtn').style.display = 
                order.status.toLowerCase() === 'pending' ? 'block' : 'none';
            
            orderDetailsModal.show();
        } catch (error) {
            console.error('Error loading order details:', error);
            showToast('Failed to load order details', 'error');
        }
    }
    
    // Render order details
    function renderOrderDetails(order) {
        const container = document.getElementById('orderDetailsContent');
        const orderDate = new Date(order.createdAt).toLocaleString();
        const statusClass = getStatusClass(order.status);
        
        // Format items
        const itemsHtml = order.items.map(item => `
            <div class="row mb-3">
                <div class="col-2">
                    <img src="${item.product.images[0]?.url || 'images/default-product.jpg'}" 
                         class="img-thumbnail" 
                         style="width: 80px; height: 80px; object-fit: cover;">
                </div>
                <div class="col-6">
                    <h6>${item.product.name}</h6>
                    <p class="text-muted small mb-0">${item.quantity} × ৳${item.price.toFixed(2)}</p>
                </div>
                <div class="col-4 text-end">
                    ৳${(item.quantity * item.price).toFixed(2)}
                </div>
            </div>
        `).join('');
        
        // Format address
        const address = order.shippingAddress ? `
            <p><strong>${order.shippingAddress.fullName}</strong></p>
            <p>${order.shippingAddress.phoneNumber}</p>
            <p>${order.shippingAddress.addressLine1}</p>
            ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
            <p>${order.shippingAddress.district.name}, ${order.shippingAddress.postalCode}</p>
        ` : '<p>No shipping address provided</p>';
        
        container.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h5>Order #${order.id}</h5>
                    <p class="text-muted">Placed on ${orderDate}</p>
                    <p>Status: <span class="badge ${statusClass}">${order.status}</span></p>
                </div>
                <div class="col-md-6 text-md-end">
                    <h5>Shipping Address</h5>
                    ${address}
                </div>
            </div>
            
            <hr>
            
            <h5 class="mb-3">Order Items</h5>
            ${itemsHtml}
            
            <hr>
            
            <div class="row">
                <div class="col-md-6">
                    <h5>Payment Method</h5>
                    <p><i class="fas fa-${order.paymentMethod === 'cod' ? 'money-bill-wave' : 'credit-card'} me-2"></i>
                        ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </p>
                    <p>Payment Status: <span class="badge ${order.paymentStatus === 'paid' ? 'bg-success' : 'bg-warning text-dark'}">
                        ${order.paymentStatus}
                    </span></p>
                </div>
                <div class="col-md-6">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <tbody>
                                <tr>
                                    <th>Subtotal</th>
                                    <td class="text-end">৳${order.subtotal.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Shipping</th>
                                    <td class="text-end">৳${order.shippingFee.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <th>Discount</th>
                                    <td class="text-end">-৳${order.discount.toFixed(2)}</td>
                                </tr>
                                <tr class="fw-bold">
                                    <th>Total</th>
                                    <td class="text-end">৳${order.totalAmount.toFixed(2)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Cancel order
    async function cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;
        
        try {
            const response = await fetch(`/api/orders/${orderId}/cancel`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to cancel order');
            
            await loadUserOrders();
            orderDetailsModal.hide();
            showToast('Order cancelled successfully!');
        } catch (error) {
            console.error('Error cancelling order:', error);
            showToast('Failed to cancel order', 'error');
        }
    }
    
    // Remove from wishlist
    async function removeFromWishlist(itemId) {
        try {
            const response = await fetch(`/api/wishlist/${itemId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('userToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Failed to remove from wishlist');
            
            await loadUserWishlist();
            showToast('Removed from wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            showToast('Failed to remove from wishlist', 'error');
        }
    }
    
    // Add to cart from wishlist
    async function addToCartFromWishlist(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error('Product not found');
            
            const product = await response.json();
            
            // Add to cart
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const existingItem = cart.find(item => item.id == product.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0]?.url || 'images/default-product.jpg',
                    seller: product.farmer?.name || 'Local Farmer',
                    quantity: 1,
                    maxQuantity: product.stock
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartBadge();
            showToast('Added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast('Failed to add to cart', 'error');
        }
    }
    
    // Show toast message
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 p-3';
        toast.style.zIndex = '11';
        
        const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
        
        toast.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header ${bgClass} text-white">
                    <strong class="me-auto">${type === 'success' ? 'Success' : 'Error'}</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // Initialize dashboard
    initDashboard();
});