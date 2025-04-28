document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const addProductForm = document.getElementById('addProductForm');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    
    // Form submission
    addProductForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const product = {
            id: Date.now(),
            name: document.getElementById('productName').value,
            category: document.getElementById('productCategory').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stock: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value,
            district: document.getElementById('productDistrict').value,
            harvestDate: document.getElementById('productHarvestDate').value,
            organic: document.getElementById('organicCertified').checked,
            image: 'Images/products/default-product.jpg', // Default image, would be replaced with uploaded image in real app
            seller: 'Current Farmer', // Would be fetched from user session in real app
            sellerId: 123, // Would be fetched from user session in real app
            rating: 5, // Default rating for new products
            createdAt: new Date().toISOString()
        };
        
        // In a real app, you would upload the image to a server here
        // For this demo, we'll just simulate the process
        
        // Save product to localStorage (simulating database)
        const products = JSON.parse(localStorage.getItem('farmerProducts')) || [];
        products.push(product);
        localStorage.setItem('farmerProducts', JSON.stringify(products));
        
        // Show success modal
        successModal.show();
        
        // Reset form
        addProductForm.reset();
    });
    
    // Load navbar and footer
    fetch('../Partials/navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar-container').innerHTML = data;
            // Set active nav
            const farmerDashboardLink = document.querySelector('.nav-link[href="farmer-dashboard.html"]');
            if (farmerDashboardLink) {
                farmerDashboardLink.classList.add('active');
            }
        });

    fetch('../Partials/footer.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('footer-container').innerHTML = data;
        });
});