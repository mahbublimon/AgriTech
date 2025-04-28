document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const orderItemsContainer = document.getElementById('orderItems');
    const orderSubtotal = document.getElementById('orderSubtotal');
    const orderDelivery = document.getElementById('orderDelivery');
    const orderTotal = document.getElementById('orderTotal');
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    const deliveryForm = document.getElementById('deliveryForm');
    const paymentMethods = document.getElementsByName('paymentMethod');
    const bkashDetails = document.getElementById('bkashDetails');
    const bankDetails = document.getElementById('bankDetails');
    
    // Load cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Render order items
    function renderOrderItems() {
        if (cart.length === 0) {
            window.location.href = 'cart.html';
            return;
        }
        
        orderItemsContainer.innerHTML = '';
        let subtotal = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            
            const orderItem = document.createElement('div');
            orderItem.className = 'order-item';
            orderItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="order-item-img">
                <div class="order-item-details">
                    <div class="order-item-name">${item.name}</div>
                    <div class="order-item-price">৳${item.price.toFixed(2)}</div>
                    <div class="order-item-quantity">Quantity: ${item.quantity}</div>
                </div>
                <div class="order-item-total">৳${itemTotal.toFixed(2)}</div>
            `;
            orderItemsContainer.appendChild(orderItem);
        });
        
        const deliveryFee = 50.00;
        const total = subtotal + deliveryFee;
        
        orderSubtotal.textContent = `৳${subtotal.toFixed(2)}`;
        orderDelivery.textContent = `৳${deliveryFee.toFixed(2)}`;
        orderTotal.textContent = `৳${total.toFixed(2)}`;
    }
    
    // Handle payment method selection
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            bkashDetails.style.display = 'none';
            bankDetails.style.display = 'none';
            
            if (this.value === 'bkash') {
                bkashDetails.style.display = 'block';
            } else if (this.value === 'bank') {
                bankDetails.style.display = 'block';
            }
        });
    });
    
    // Place order
    placeOrderBtn.addEventListener('click', function() {
        if (!deliveryForm.checkValidity()) {
            deliveryForm.reportValidity();
            return;
        }
        
        if (!document.getElementById('termsAgreement').checked) {
            alert('Please agree to the Terms & Conditions');
            return;
        }
        
        // Get selected payment method
        let paymentMethod = '';
        let paymentDetails = {};
        
        paymentMethods.forEach(method => {
            if (method.checked) {
                paymentMethod = method.value;
            }
        });
        
        if (paymentMethod === 'bkash') {
            paymentDetails = {
                number: document.getElementById('bkashNumber').value,
                trxId: document.getElementById('bkashTrxId').value
            };
        } else if (paymentMethod === 'bank') {
            paymentDetails = {
                trxId: document.getElementById('bankTrxId').value
            };
        }
        
        // Create order object
        const order = {
            orderId: 'ORD-' + Date.now(),
            date: new Date().toISOString(),
            customer: {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                address: document.getElementById('address').value,
                district: document.getElementById('district').value,
                postalCode: document.getElementById('postalCode').value,
                phone: document.getElementById('phone').value,
                email: document.getElementById('email').value,
                notes: document.getElementById('deliveryNotes').value
            },
            items: cart,
            subtotal: parseFloat(orderSubtotal.textContent.replace('৳', '')),
            delivery: parseFloat(orderDelivery.textContent.replace('৳', '')),
            total: parseFloat(orderTotal.textContent.replace('৳', '')),
            payment: {
                method: paymentMethod,
                details: paymentDetails
            },
            status: 'pending'
        };
        
        // In a real app, you would send this to your backend
        // For now, we'll store it in localStorage
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Clear cart
        localStorage.removeItem('cart');
        
        // Redirect to confirmation page
        window.location.href = `order-confirmation.html?orderId=${order.orderId}`;
    });
    
    // Initialize
    renderOrderItems();
    
    // Update cart badge
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        if (totalItems > 0) {
            cartBadge.classList.remove('d-none');
        } else {
            cartBadge.classList.add('d-none');
        }
    }
});