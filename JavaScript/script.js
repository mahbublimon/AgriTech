// Load navbar and footer on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Load navbar
    fetch('Partials/navbar.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            const navbarContainer = document.getElementById('navbar-container');
            if (navbarContainer) {
                navbarContainer.innerHTML = data;
                initializeAuthState();
                initializeBootstrapComponents();
                setupHoverDropdowns();
            }
        })
        .catch(error => console.error('Error loading navbar:', error));

    // Load footer
    fetch('Partials/footer.html')
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        })
        .then(data => {
            const footerContainer = document.getElementById('footer-container');
            if (footerContainer) footerContainer.innerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));

    // Initialize Bootstrap components
    function initializeBootstrapComponents() {
        // Initialize carousel
        const carousels = document.querySelectorAll('.carousel');
        carousels.forEach(el => {
            new bootstrap.Carousel(el);
        });
    }

    // Setup hover dropdown functionality
    function setupHoverDropdowns() {
        const dropdowns = document.querySelectorAll('.dropdown-hover');
        
        dropdowns.forEach(dropdown => {
            // Show on hover
            dropdown.addEventListener('mouseenter', function() {
                if (window.innerWidth > 992) { // Only for desktop
                    const menu = this.querySelector('.dropdown-menu');
                    menu.classList.add('show');
                }
            });
            
            // Hide when mouse leaves
            dropdown.addEventListener('mouseleave', function() {
                if (window.innerWidth > 992) {
                    const menu = this.querySelector('.dropdown-menu');
                    menu.classList.remove('show');
                }
            });
            
            // Keep mobile click functionality
            if (window.innerWidth <= 992) {
                const toggle = dropdown.querySelector('.dropdown-toggle');
                toggle.setAttribute('data-bs-toggle', 'dropdown');
            }
        });
    }

    // Check and update authentication state
    function initializeAuthState() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        const userType = localStorage.getItem('userType');

        if (isLoggedIn) {
            // Hide login/register links
            document.querySelectorAll('.auth-link').forEach(el => {
                el.style.display = 'none';
            });

            // Show protected links
            document.querySelectorAll('.protected-link').forEach(el => {
                el.style.display = 'block';
            });

            // Update dropdown text
            const dropdownToggle = document.querySelector('#authDropdown .dropdown-toggle');
            if (dropdownToggle) {
                dropdownToggle.innerHTML = `<i class="fas fa-user-circle me-1"></i> ${userType ? userType.charAt(0).toUpperCase() + userType.slice(1) : 'Account'}`;
            }

            // Add logout event
            const logoutLink = document.getElementById('logoutLink');
            if (logoutLink) {
                logoutLink.addEventListener('click', function(e) {
                    e.preventDefault();
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userType');
                    window.location.href = 'index.html';
                });
            }
        }
    }

    // Update on window resize
    window.addEventListener('resize', function() {
        const dropdowns = document.querySelectorAll('.dropdown-hover');
        dropdowns.forEach(dropdown => {
            const toggle = dropdown.querySelector('.dropdown-toggle');
            if (window.innerWidth <= 992) {
                toggle.setAttribute('data-bs-toggle', 'dropdown');
            } else {
                toggle.removeAttribute('data-bs-toggle');
            }
        });
    });
});