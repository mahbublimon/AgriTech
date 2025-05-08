document.addEventListener('DOMContentLoaded', function() {
    // Load investor navbar
    fetch('Patials/usernavbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('user-navbar-container').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading investor navbar:', error);
        });
    
    // Load footer
    fetch('Partials/userfooter.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('user-footer-container').innerHTML = data;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
});