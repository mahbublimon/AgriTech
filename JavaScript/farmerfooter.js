document.addEventListener('DOMContentLoaded', function() {
    // Current year for copyright
    document.querySelector('.farmer-footer .col-md-6 p')?.innerHTML = 
        `&copy; ${new Date().getFullYear()} AgriTech. All rights reserved.`;
    
    // Add click event for smooth scrolling to top
    document.querySelector('.farmer-footer .navbar-brand')?.addEventListener('click', function(e) {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});