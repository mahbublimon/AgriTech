document.addEventListener('DOMContentLoaded', function() {
    // Get order ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    
    if (!orderId) {
        window.location.href = 'marketplace.html';
        return;
    }
    
    // Load order from localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => o.orderId === orderId);
    
    if (!order) {
        window.location.href = 'marketplace.html';
        return;
    }
    
    // Display order details
    document.getElementById('orderNumber').textContent = order.orderId;
    document.getElementById('orderDate').textContent = new Date(order.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('orderTotal').textContent = `৳${order.total.toFixed(2)}`;
    
    // Format payment method
    let paymentMethod = '';
    switch (order.payment.method) {
        case 'cod':
            paymentMethod = 'Cash on Delivery';
            break;
        case 'bkash':
            paymentMethod = 'bKash';
            break;
        case 'bank':
            paymentMethod = 'Bank Transfer';
            break;
        default:
            paymentMethod = order.payment.method;
    }
    document.getElementById('paymentMethod').textContent = paymentMethod;
    
    // Update cart badge
    const cartBadge = document.getElementById('cartBadge');
    if (cartBadge) {
        cartBadge.classList.add('d-none');
    }
});