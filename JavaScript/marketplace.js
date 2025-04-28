document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productContainer = document.getElementById('productContainer');
    const pagination = document.getElementById('pagination');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productModalTitle = document.getElementById('productModalTitle');
    const productModalBody = document.getElementById('productModalBody');
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const districtFilter = document.getElementById('districtFilter');
    const cartBadge = document.getElementById('cartBadge');
    
    // Current page and items per page
    let currentPage = 1;
    const itemsPerPage = 12;
    let totalProducts = 0;
    let totalPages = 0;
    let products = [];
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart badge
    function updateCartBadge() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartBadge.textContent = totalItems;
        if (totalItems > 0) {
            cartBadge.classList.remove('d-none');
        } else {
            cartBadge.classList.add('d-none');
        }
    }
    
    // Bangladeshi agricultural products dataset with images
    const productDatabase = [
        {
            id: 1,
            name: "Fresh Aromatic Rice (Chinigura)",
            description: "Premium quality Chinigura rice, known for its distinctive aroma and fine grains. Grown organically in the fertile fields of Dinajpur.",
            price: 120.00,
            category: "rice",
            district: "dinajpur",
            seller: "Abdul Karim",
            sellerId: 101,
            rating: 5,
            stock: 150,
            image: "Images/products/chinigura-rice.jpg",
            specs: {
                type: "Long Grain",
                weight: "5kg bag",
                harvest: "November 2023",
                organic: "Yes"
            }
        },
        {
            id: 2,
            name: "Mango (Himsagar)",
            description: "Sweet and juicy Himsagar mangoes from Rajshahi. Each mango is hand-picked at perfect ripeness.",
            price: 250.00,
            category: "fruits",
            district: "rajshahi",
            seller: "Rahima Begum",
            sellerId: 102,
            rating: 4,
            stock: 75,
            image: "Images/products/himsagar-mango.jpg",
            specs: {
                type: "Himsagar",
                weight: "1kg (approx 3-4 pieces)",
                harvest: "June 2023",
                organic: "No"
            }
        },
        {
            id: 3,
            name: "Hilsa Fish (Ilish)",
            description: "Fresh Padma river Hilsa, caught same morning. Perfect for traditional Bengali dishes.",
            price: 1500.00,
            category: "fish",
            district: "chandpur",
            seller: "Fisherman's Cooperative",
            sellerId: 103,
            rating: 5,
            stock: 20,
            image: "Images/products/hilsa-fish.jpg",
            specs: {
                type: "Freshwater",
                weight: "1kg (approx 1 fish)",
                preserved: "Ice chilled",
                origin: "Padma River"
            }
        },
        {
            id: 4,
            name: "Red Lentils (Masoor Dal)",
            description: "High protein red lentils grown in the northern regions of Bangladesh. Perfect for dal preparations.",
            price: 95.00,
            category: "rice",
            district: "rangpur",
            seller: "Northern Farmers Group",
            sellerId: 104,
            rating: 4,
            stock: 200,
            image: "Images/products/red-lentils.jpg",
            specs: {
                type: "Split Lentils",
                weight: "1kg packet",
                harvest: "March 2023",
                organic: "Yes"
            }
        }
    ];

    // Fetch products (simulating database)
    async function fetchProducts() {
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Clone our product database
            products = JSON.parse(JSON.stringify(productDatabase));
            
            // In a real app, we would add more products from an API
            // Let's duplicate our products to simulate more inventory
            const additionalProducts = [];
            for (let i = 0; i < 4; i++) {
                productDatabase.forEach(prod => {
                    const newProd = JSON.parse(JSON.stringify(prod));
                    newProd.id = (productDatabase.length + 1) + i * productDatabase.length + prod.id;
                    newProd.price = (parseFloat(prod.price) * (1 + Math.random() * 0.3 - 0.15)).toFixed(2);
                    newProd.stock = Math.floor(prod.stock * (0.7 + Math.random() * 0.6));
                    additionalProducts.push(newProd);
                });
            }
            products = products.concat(additionalProducts);
            
            totalProducts = products.length;
            totalPages = Math.ceil(totalProducts / itemsPerPage);
            
            renderProducts();
            renderPagination();
            updateCartBadge();
        } catch (error) {
            console.error('Error fetching products:', error);
            showError();
        }
    }
    
    function showError() {
        productContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                <h3>Error loading products</h3>
                <p>Please try again later</p>
                <button class="btn btn-outline-success mt-3" id="retryButton">
                    <i class="fas fa-sync-alt me-2"></i> Retry
                </button>
            </div>
        `;
        
        document.getElementById('retryButton').addEventListener('click', fetchProducts);
    }
    
    // Render products for current page
    function renderProducts() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        let productsToDisplay = products.slice(startIndex, endIndex);
        
        // Apply filters
        const searchTerm = productSearch.value.toLowerCase();
        const category = categoryFilter.value;
        const district = districtFilter.value;
        
        if (searchTerm || category || district) {
            productsToDisplay = products.filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                                     product.description.toLowerCase().includes(searchTerm);
                const matchesCategory = category ? product.category === category : true;
                const matchesDistrict = district ? product.district === district : true;
                return matchesSearch && matchesCategory && matchesDistrict;
            });
            
            // Update pagination for filtered results
            totalProducts = productsToDisplay.length;
            totalPages = Math.ceil(totalProducts / itemsPerPage);
            currentPage = 1;
            
            // Get new slice for first page of filtered results
            productsToDisplay = productsToDisplay.slice(0, itemsPerPage);
        }
        
        // Clear container
        productContainer.innerHTML = '';
        
        if (productsToDisplay.length === 0) {
            productContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h3>No products found</h3>
                    <p>Try adjusting your search or filters</p>
                    <button class="btn btn-outline-success mt-3" id="resetFilters">
                        Reset All Filters
                    </button>
                </div>
            `;
            
            document.getElementById('resetFilters').addEventListener('click', () => {
                productSearch.value = '';
                categoryFilter.value = '';
                districtFilter.value = '';
                renderProducts();
            });
            return;
        }
        
        // Render product cards
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-6 col-lg-4 col-xl-3';
            productCard.innerHTML = `
                <div class="product-card">
                    <div class="product-img-container">
                        <img src="${product.image}" alt="${product.name}" class="product-img">
                        ${product.stock < 10 ? '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Low Stock</span>' : ''}
                    </div>
                    <div class="product-body">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">৳${product.price}</div>
                        <div class="product-seller">Sold by: ${product.seller}</div>
                        <div class="product-location">
                            <i class="fas fa-map-marker-alt"></i> ${product.district.charAt(0).toUpperCase() + product.district.slice(1)}
                        </div>
                        <div class="product-rating">
                            ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                        </div>
                        <button class="btn btn-success view-details-btn" data-id="${product.id}">
                            <i class="fas fa-eye me-2"></i> View Details
                        </button>
                    </div>
                </div>
            `;
            productContainer.appendChild(productCard);
        });
        
        // Add event listeners to view buttons
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const productId = parseInt(this.getAttribute('data-id'));
                showProductDetails(productId);
            });
        });
    }
    
    // Show product details in modal
    function showProductDetails(productId) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        
        let stockStatus;
        let stockClass;
        if (product.stock > 20) {
            stockStatus = 'In Stock';
            stockClass = 'in-stock';
        } else if (product.stock > 0) {
            stockStatus = 'Low Stock';
            stockClass = 'low-stock';
        } else {
            stockStatus = 'Out of Stock';
            stockClass = 'out-of-stock';
        }
        
        // Create specs list
        let specsHTML = '';
        for (const [key, value] of Object.entries(product.specs || {})) {
            specsHTML += `
                <div class="spec-item">
                    <strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong>
                    <span>${value}</span>
                </div>
            `;
        }
        
        productModalTitle.textContent = product.name;
        productModalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${product.image}" alt="${product.name}" class="modal-product-img img-fluid">
                </div>
                <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h3 class="modal-product-price mb-0">৳${product.price}</h3>
                        <span class="badge bg-success">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</span>
                    </div>
                    
                    <p class="${stockClass} modal-product-stock">
                        <i class="fas fa-box"></i> ${stockStatus} (${product.stock} available)
                    </p>
                    
                    <div class="mb-3">
                        <label for="productQuantity" class="form-label">Quantity:</label>
                        <input type="number" class="form-control" id="productQuantity" min="1" max="${product.stock}" value="1">
                    </div>
                    
                    <div class="product-specs">
                        ${specsHTML}
                    </div>
                    
                    <div class="product-rating mb-3">
                        ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                        (${Math.floor(Math.random() * 50) + 1} reviews)
                    </div>
                    
                    <h5>Product Description</h5>
                    <p>${product.description}</p>
                    
                    <div class="seller-info mt-4 p-3 bg-light rounded">
                        <h6><i class="fas fa-user-tie me-2"></i> Seller Information</h6>
                        <p class="mb-1"><strong>Name:</strong> ${product.seller}</p>
                        <p class="mb-1"><strong>Location:</strong> ${product.district.charAt(0).toUpperCase() + product.district.slice(1)} District</p>
                        <p class="mb-0"><strong>Member Since:</strong> ${2020 + Math.floor(Math.random() * 3)}</p>
                    </div>
                </div>
            </div>
        `;
        
        // Update add to cart button
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (product.stock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerHTML = '<i class="fas fa-times-circle me-2"></i> Out of Stock';
        } else {
            addToCartBtn.disabled = false;
            addToCartBtn.innerHTML = '<i class="fas fa-cart-plus me-2"></i> Add to Cart';
            addToCartBtn.onclick = function() {
                const quantity = parseInt(document.getElementById('productQuantity').value) || 1;
                addToCart(product, quantity);
                productModal.hide();
            };
        }
        
        productModal.show();
    }
    
    // Add product to cart
    function addToCart(product, quantity) {
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                seller: product.seller,
                quantity: quantity,
                maxQuantity: product.stock
            });
        }
        
        // Update localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'position-fixed bottom-0 end-0 p-3';
        toast.style.zIndex = '11';
        toast.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header bg-success text-white">
                    <strong class="me-auto">Added to Cart</strong>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">
                    ${quantity} × ${product.name} added to your cart!
                </div>
            </div>
        `;
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
    
    // Initialize
    fetchProducts();
    updateCartBadge();
    
    // Event listeners for search and filters
    productSearch.addEventListener('input', renderProducts);
    categoryFilter.addEventListener('change', renderProducts);
    districtFilter.addEventListener('change', renderProducts);
});