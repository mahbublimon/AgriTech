document.addEventListener('DOMContentLoaded', function() {
    // Check investor authentication
    checkInvestorAuth();
    
    // Load investor profile data
    loadInvestorProfile();
    
    // Initialize event listeners
    initInvestorNavbar();
});

function checkInvestorAuth() {
    const authToken = localStorage.getItem('investorAuthToken');
    if (!authToken) {
        // Redirect to login with current page as redirect parameter
        const currentPage = encodeURIComponent(window.location.pathname);
        window.location.href = `login.html?redirect=${currentPage}&user_type=investor`;
    }
}

function loadInvestorProfile() {
    const authToken = localStorage.getItem('investorAuthToken');
    if (!authToken) return;

    fetch('/api/investor/profile', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }
        return response.json();
    })
    .then(data => {
        // Update profile picture in navbar
        const profilePics = document.querySelectorAll('#investorProfilePic, #investorProfilePicSm');
        profilePics.forEach(pic => {
            pic.src = data.profile_image || '../images/default-profile.jpg';
        });
        
        // Update investor name
        const nameElements = document.querySelectorAll('#investorName, #investorNameDropdown');
        nameElements.forEach(el => {
            el.textContent = `${data.first_name} ${data.last_name}`;
        });
        
        // Update notification count if available
        if (data.unread_notifications > 0) {
            const notificationBadge = document.getElementById('notificationCount');
            if (notificationBadge) {
                notificationBadge.textContent = data.unread_notifications;
                notificationBadge.classList.remove('d-none');
            }
        }
    })
    .catch(error => {
        console.error('Error loading investor profile:', error);
    });
}

function initInvestorNavbar() {
    // Logout functionality
    document.getElementById('investorLogoutBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Perform logout API call in a real application
        fetch('/api/investor/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('investorAuthToken')}`
            }
        })
        .finally(() => {
            // Clear local storage and redirect
            localStorage.removeItem('investorAuthToken');
            window.location.href = 'index.html';
        });
    });
    
    // Highlight current page in navbar
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
    
    // Load notifications
    loadNotifications();
}

function loadNotifications() {
    const authToken = localStorage.getItem('investorAuthToken');
    if (!authToken) return;

    fetch('/api/investor/notifications', {
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        const notificationList = document.getElementById('notificationList');
        notificationList.innerHTML = '';
        
        if (data.length === 0) {
            notificationList.innerHTML = `
                <div class="text-center py-3">
                    <i class="fas fa-bell-slash text-muted mb-2"></i>
                    <p class="mb-0 small">No new notifications</p>
                </div>
            `;
            return;
        }
        
        data.slice(0, 5).forEach(notification => {
            const notificationItem = document.createElement('div');
            notificationItem.className = `notification-item ${notification.read ? '' : 'unread'}`;
            notificationItem.innerHTML = `
                <a href="${notification.link}" class="d-block p-2 text-decoration-none text-dark">
                    <div class="d-flex justify-content-between">
                        <strong class="small">${notification.title}</strong>
                        <small class="text-muted">${formatDate(notification.created_at)}</small>
                    </div>
                    <p class="small mb-0 text-muted">${notification.message}</p>
                </a>
            `;
            notificationList.appendChild(notificationItem);
        });
    })
    .catch(error => {
        console.error('Error loading notifications:', error);
    });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

document.addEventListener('DOMContentLoaded', function() {
    // Load investor navbar
    fetch('Partials/investornavbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('investor-navbar-container').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading investor navbar:', error);
        });
    
    // Load footer
    fetch('Partials/investorfooter.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('investor-footer-container').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
});