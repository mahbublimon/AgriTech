document.addEventListener('DOMContentLoaded', function() {
    // Load navbar and footer
    loadNavbar();
    loadFooter();
    
    // Check authentication and load profile
    checkAuthAndLoadProfile();
});

function loadNavbar() {
    // Determine which navbar to load based on current page
    let navbarFile = 'components/navbar.html';
    
    if (window.location.pathname.includes('investor')) {
        navbarFile = 'components/investor-navbar.html';
    } else if (window.location.pathname.includes('farmer')) {
        navbarFile = 'components/farmer-navbar.html';
    }
    
    fetch(navbarFile)
    .then(response => response.text())
    .then(data => {
        document.getElementById('navbar-container').innerHTML = data;
        
        // Highlight current page in navbar
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    })
    .catch(error => {
        console.error('Error loading navbar:', error);
    });
}

function loadFooter() {
    fetch('components/footer.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('footer-container').innerHTML = data;
    })
    .catch(error => {
        console.error('Error loading footer:', error);
    });
}

function checkAuthAndLoadProfile() {
    // Check if user is logged in (farmer or investor)
    const farmerToken = localStorage.getItem('farmerAuthToken');
    const investorToken = localStorage.getItem('investorAuthToken');
    
    if (!farmerToken && !investorToken) {
        // No one is logged in
        return;
    }
    
    // Determine API endpoint based on user type
    const apiEndpoint = farmerToken ? '/api/farmer/profile' : '/api/investor/profile';
    const authToken = farmerToken || investorToken;
    
    // Load profile data
    fetch(apiEndpoint, {
        headers: {
            'Authorization': 'Bearer ' + authToken
        }
    })
    .then(response => response.json())
    .then(data => {
        // Update profile picture
        const profileImages = document.querySelectorAll('#profileImage, #profileImageSm');
        profileImages.forEach(img => {
            img.src = data.profile_image || 'images/default-profile.jpg';
        });
        
        // Update profile name
        const profileNames = document.querySelectorAll('#profileName, #profileNameDropdown');
        profileNames.forEach(name => {
            name.textContent = `${data.first_name} ${data.last_name}`;
        });
        
        // Update notification count if exists
        if (data.unread_notifications > 0) {
            const notificationBadge = document.getElementById('notificationCount');
            if (notificationBadge) {
                notificationBadge.textContent = data.unread_notifications;
                notificationBadge.classList.remove('d-none');
            }
        }
    })
    .catch(error => {
        console.error('Error loading profile:', error);
    });
    
    // Logout functionality
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        if (farmerToken) {
            localStorage.removeItem('farmerAuthToken');
        } else {
            localStorage.removeItem('investorAuthToken');
        }
        window.location.href = 'index.html';
    });
}