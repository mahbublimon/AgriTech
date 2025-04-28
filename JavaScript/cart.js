document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const cartItemsContainer = document.getElementById('cartItemsContainer');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryElement = document.getElementById('delivery');
    const totalElement = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    // Load cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Render cart items
    function renderCart() {
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('d-none');
            cartItemsContainer.innerHTML = '';
            checkoutBtn.disabled = true;
            updateSummary(0);
            return;
        }
        
        emptyCartMessage.classList.add('d-none');
        cartItemsContainer.innerHTML = '';
        
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item row mb-3 pb-3 border-bottom';
            cartItem.innerHTML = `
                <div class="col-3 col-md-2">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                </div>
                <div class="col-5 col-md-6">
                    <h6 class="mb-1">${item.name}</h6>
                    <p class="small text-muted mb-1">Seller: ${item.seller}</p>
                    <p class="mb-0 text-success fw-bold">৳${item.price.toFixed(2)}</p>
                </div>
                <div class="col-4 col-md-4">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary decrease-quantity" data-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="form-control text-center quantity-input" 
                               value="${item.quantity}" min="1" max="${item.maxQuantity}" 
                               data-id="${item.id}">
                        <button class="btn btn-outline-secondary increase-quantity" data-id="${item.id}" ${item.quantity >= item.maxQuantity ? 'disabled' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn btn-link text-danger btn-sm mt-1 remove-item" data-id="${item.id}">
                        <i class="fas fa-trash-alt"></i> Remove
                    </button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        
        updateSummary(subtotal);
        checkoutBtn.disabled = false;
        
        // Add event listeners
        document.querySelectorAll('.decrease-quantity').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                updateQuantity(productId, -1);
            });
        });
        
        document.querySelectorAll('.increase-quantity').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                updateQuantity(productId, 1);
            });
        });
        
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                const newQuantity = parseInt(this.value) || 1;
                setQuantity(productId, newQuantity);
            });
        });
        
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                removeFromCart(productId);
            });
        });
    }
    
    // Update quantity
    function updateQuantity(productId, change) {
        const item = cart.find(item => item.id === productId);
        if (!item) return;
        
        const newQuantity = item.quantity + change;
        if (newQuantity < 1 || newQuantity > item.maxQuantity) return;
        
        item.quantity = newQuantity;
        saveCart();
        renderCart();
    }
    
    // Set quantity
    function setQuantity(productId, quantity) {
        const item = cart.find(item => item.id === productId);
        if (!item) return;
        
        if (quantity < 1) quantity = 1;
        if (quantity > item.maxQuantity) quantity = item.maxQuantity;
        
        item.quantity = quantity;
        saveCart();
        renderCart();
    }
    
    // Remove from cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        renderCart();
        
        // Update cart badge in navbar
        updateCartBadge();
    }
    
    // Update order summary
    function updateSummary(subtotal) {
        const delivery = 50.00; // Fixed delivery charge
        const total = subtotal + delivery;
        
        subtotalElement.textContent = `৳${subtotal.toFixed(2)}`;
        deliveryElement.textContent = `৳${delivery.toFixed(2)}`;
        totalElement.textContent = `৳${total.toFixed(2)}`;
    }
    
    // Save cart to localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // Update cart badge in navbar
    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartBadge = document.getElementById('cartBadge');
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            if (totalItems > 0) {
                cartBadge.classList.remove('d-none');
            } else {
                cartBadge.classList.add('d-none');
            }
        }
    }
    
    // Proceed to checkout
    checkoutBtn.addEventListener('click', function() {
        if (cart.length > 0) {
            window.location.href = 'checkout.html';
        }
    });
    
    // Initialize
    renderCart();
});