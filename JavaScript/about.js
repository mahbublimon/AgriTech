// Load navbar and footer
document.addEventListener('DOMContentLoaded', function() {
    // Load navbar
    fetch('Partials/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            setActiveNav('about');
        });

    // Load footer
    fetch('Partials/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });
});

// Set active navigation link
function setActiveNav(page) {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `${page}.html`) {
            link.classList.add('active');
        }
    });
}