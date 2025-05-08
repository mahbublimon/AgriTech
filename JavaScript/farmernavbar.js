document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const notificationList = document.getElementById('notificationList');
    const notificationsBadge = document.getElementById('notificationsBadge');
    const ordersBadge = document.getElementById('ordersBadge');
    const profileName = document.getElementById('profileName');
    const profileNameDropdown = document.getElementById('profileNameDropdown');
    const profilePic = document.getElementById('profilePic');
    const profilePicSm = document.getElementById('profilePicSm');
    const logoutBtn = document.getElementById('logoutBtn');
    const markAllReadBtn = document.querySelector('.mark-all-read');

    // Load farmer data from session (simulated)
    function loadFarmerData() {
        // In a real app, this would come from your authentication system
        const farmer = {
            id: 'FARMER_001',
            name: 'Abdul Karim',
            email: 'farmer@example.com',
            phone: '+8801712345678',
            district: 'Rangpur',
            profileImage: '../Images/farmer-profile.jpg',
            unreadNotifications: 3,
            pendingOrders: 2
        };

        // Update profile info
        profileName.textContent = farmer.name;
        profileNameDropdown.textContent = farmer.name;
        profilePic.src = farmer.profileImage;
        profilePicSm.src = farmer.profileImage;

        // Update notification badges
        if (farmer.unreadNotifications > 0) {
            notificationsBadge.textContent = farmer.unreadNotifications;
            notificationsBadge.classList.remove('d-none');
        }

        if (farmer.pendingOrders > 0) {
            ordersBadge.textContent = farmer.pendingOrders;
            ordersBadge.classList.remove('d-none');
        }

        return farmer;
    }

    // Load notifications
    function loadNotifications() {
        // Simulated API call
        setTimeout(() => {
            const notifications = [
                {
                    id: 'NOTIF_001',
                    type: 'order',
                    message: 'New order for your Chinigura Rice (5kg)',
                    time: '2023-06-15T10:30:00Z',
                    read: false,
                    link: 'farmer-order-details.html?orderId=ORD_123'
                },
                {
                    id: 'NOTIF_002',
                    type: 'payment',
                    message: 'Payment of ৳1,250 received for Order #ORD_122',
                    time: '2023-06-14T16:45:00Z',
                    read: false,
                    link: 'farmer-payments.html'
                },
                {
                    id: 'NOTIF_003',
                    type: 'loan',
                    message: 'Your loan application is under review',
                    time: '2023-06-13T09:15:00Z',
                    read: true,
                    link: 'farmer-loan-status.html'
                },
                {
                    id: 'NOTIF_004',
                    type: 'system',
                    message: 'System maintenance scheduled for June 20',
                    time: '2023-06-10T14:20:00Z',
                    read: true,
                    link: 'farmer-notifications.html'
                }
            ];

            renderNotifications(notifications);
        }, 1000);
    }

    // Render notifications
    function renderNotifications(notifications) {
        notificationList.innerHTML = '';

        if (notifications.length === 0) {
            notificationList.innerHTML = `
                <div class="text-center py-3">
                    <i class="fas fa-bell-slash text-muted fa-2x mb-2"></i>
                    <p class="mb-0">No notifications found</p>
                </div>
            `;
            return;
        }

        notifications.forEach(notif => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notif.read ? '' : 'unread'}`;
            
            const timeAgo = getTimeAgo(notif.time);
            
            notificationItem.innerHTML = `
                <a href="${notif.link}" class="text-decoration-none text-dark">
                    <div class="d-flex justify-content-between">
                        <strong>${notif.message}</strong>
                        <small class="notification-time">${timeAgo}</small>
                    </div>
                    <small class="text-muted">${notif.type.charAt(0).toUpperCase() + notif.type.slice(1)}</small>
                </a>
            `;
            
            notificationList.appendChild(notificationItem);
        });
    }

    // Mark all as read
    markAllReadBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        // In a real app, you would make an API call here
        notificationsBadge.classList.add('d-none');
        document.querySelectorAll('.notification-item.unread').forEach(item => {
            item.classList.remove('unread');
        });
    });

    // Logout functionality
    logoutBtn?.addEventListener('click', function(e) {
        e.preventDefault();
        // In a real app, you would handle logout process
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = 'login.html';
        }
    });

    // Helper function to calculate time ago
    function getTimeAgo(timestamp) {
        const now = new Date();
        const date = new Date(timestamp);
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;
        
        return 'Just now';
    }

    // Initialize
    const farmer = loadFarmerData();
    loadNotifications();

    // Update notification count in real-time (simulated)
    setInterval(() => {
        // In a real app, you would check for new notifications
        const newCount = Math.floor(Math.random() * 2); // Random 0 or 1
        if (newCount > 0) {
            const currentCount = parseInt(notificationsBadge.textContent) || 0;
            notificationsBadge.textContent = currentCount + newCount;
            notificationsBadge.classList.remove('d-none');
        }
    }, 30000); // Check every 30 seconds
});