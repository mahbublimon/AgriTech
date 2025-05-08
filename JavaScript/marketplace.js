document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements with null checks
    const productContainer = document.getElementById('productContainer');
    if (!productContainer) {
        console.error('Product container not found');
        return;
    }

    const pagination = document.getElementById('pagination') || { innerHTML: '' };
    const productModalElement = document.getElementById('productModal');
    if (!productModalElement) {
        console.error('Product modal not found');
        return;
    }
    const productModal = new bootstrap.Modal(productModalElement);
    const productModalTitle = document.getElementById('productModalTitle') || { textContent: '' };
    const productModalBody = document.getElementById('productModalBody') || { innerHTML: '' };
    const productSearch = document.getElementById('productSearch') || { value: '', addEventListener: () => {} };
    const categoryFilter = document.getElementById('categoryFilter') || { value: '', addEventListener: () => {} };
    const districtFilter = document.getElementById('districtFilter') || { value: '', addEventListener: () => {} };
    const cartBadge = document.getElementById('cartBadge') || { textContent: '', classList: { add: () => {}, remove: () => {} } };
    
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
    
    // Fetch products from API
    async function fetchProducts() {
        try {
            // Show loading state
            productContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading products...</p>
                </div>
            `;
            
            // In a real implementation, this would be an API call to your backend
            const response = await fetch('/api/products/approved'); // Endpoint to get approved products
            if (!response.ok) throw new Error('Failed to fetch products');
            
            products = await response.json();
            
            totalProducts = products.length;
            totalPages = Math.ceil(totalProducts / itemsPerPage);
            
            renderProducts();
            renderPagination();
            updateCartBadge();
            
            // Also fetch categories and districts for filters
            await loadFilters();
        } catch (error) {
            console.error('Error fetching products:', error);
            showError();
        }
    }
    
    // Load filter options
    async function loadFilters() {
        try {
            // Fetch categories
            const categoriesResponse = await fetch('/api/categories');
            if (categoriesResponse.ok) {
                const categories = await categoriesResponse.json();
                categoryFilter.innerHTML = `
                    <option value="">All Categories</option>
                    ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                `;
            }
            
            // Fetch districts
            const districtsResponse = await fetch('/api/districts');
            if (districtsResponse.ok) {
                const districts = await districtsResponse.json();
                districtFilter.innerHTML = `
                    <option value="">All Districts</option>
                    ${districts.map(dist => `<option value="${dist.id}">${dist.name}</option>`).join('')}
                `;
            }
        } catch (error) {
            console.error('Error loading filters:', error);
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
        
        document.getElementById('retryButton')?.addEventListener('click', fetchProducts);
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
                const matchesCategory = category ? product.category_id == category : true;
                const matchesDistrict = district ? product.district_id == district : true;
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
            
            document.getElementById('resetFilters')?.addEventListener('click', () => {
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
            productCard.className = 'col-md-6 col-lg-4 col-xl-3 mb-4';
            productCard.innerHTML = `
                <div class="card h-100 product-card">
                    <div class="product-img-container position-relative">
                        <img src="${product.images?.[0]?.url || 'images/default-product.jpg'}" 
                             alt="${product.name}" 
                             class="card-img-top product-img" 
                             style="height: 200px; object-fit: cover;">
                        ${product.stock < 10 ? '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Low Stock</span>' : ''}
                    </div>
                    <div class="card-body">
                        <h3 class="card-title product-title">${product.name}</h3>
                        <div class="product-price">৳${product.price.toFixed(2)}</div>
                        <div class="product-seller text-muted small">Sold by: ${product.farmer?.name || 'Local Farmer'}</div>
                        <div class="product-location text-muted small">
                            <i class="fas fa-map-marker-alt"></i> ${product.district?.name || 'Bangladesh'}
                        </div>
                        <div class="product-rating text-warning">
                            ${'★'.repeat(product.rating || 4)}${'☆'.repeat(5 - (product.rating || 4))}
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0">
                        <button class="btn btn-success w-100 view-details-btn" data-id="${product.id}">
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
    
    // Render pagination controls
    function renderPagination() {
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><span aria-hidden="true">&laquo;</span></a>`;
        prevLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
            }
        });
        pagination.appendChild(prevLi);
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${currentPage === i ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            pageLi.addEventListener('click', (e) => {
                e.preventDefault();
                currentPage = i;
                renderProducts();
            });
            pagination.appendChild(pageLi);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span></a>`;
        nextLi.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
            }
        });
        pagination.appendChild(nextLi);
    }
    
    // Show product details in modal
    async function showProductDetails(productId) {
        try {
            // Show loading in modal
            productModalTitle.textContent = 'Loading...';
            productModalBody.innerHTML = `
                <div class="text-center py-4">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
            productModal.show();
            
            // Fetch product details
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) throw new Error('Failed to fetch product details');
            const product = await response.json();
            
            let stockStatus;
            let stockClass;
            if (product.stock > 20) {
                stockStatus = 'In Stock';
                stockClass = 'text-success';
            } else if (product.stock > 0) {
                stockStatus = 'Low Stock';
                stockClass = 'text-warning';
            } else {
                stockStatus = 'Out of Stock';
                stockClass = 'text-danger';
            }
            
            // Create specs list
            const specs = {
                'Category': product.category?.name || 'N/A',
                'Unit Type': product.unit_type || 'N/A',
                'Harvest Date': product.harvest_date || 'N/A',
                'Organic': product.is_organic ? 'Yes' : 'No',
                'Premium': product.is_premium ? 'Yes' : 'No'
            };
            
            let specsHTML = '';
            for (const [key, value] of Object.entries(specs)) {
                specsHTML += `
                    <div class="row mb-2">
                        <div class="col-4 fw-bold">${key}:</div>
                        <div class="col-8">${value}</div>
                    </div>
                `;
            }
            
            // Create image carousel
            const imagesHTML = product.images?.length > 0 ? `
                <div id="productCarousel" class="carousel slide mb-3" data-bs-ride="carousel">
                    <div class="carousel-inner rounded">
                        ${product.images.map((img, index) => `
                            <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                <img src="${img.url}" class="d-block w-100" alt="${product.name}" style="height: 300px; object-fit: cover;">
                            </div>
                        `).join('')}
                    </div>
                    <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                </div>
            ` : `<img src="images/default-product.jpg" class="img-fluid rounded mb-3" alt="${product.name}" style="height: 300px; object-fit: cover;">`;
            
            productModalTitle.textContent = product.name;
            productModalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        ${imagesHTML}
                    </div>
                    <div class="col-md-6">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h3 class="mb-0">৳${product.price.toFixed(2)}</h3>
                            <span class="badge bg-success">${product.category?.name || 'Agricultural'}</span>
                        </div>
                        
                        <p class="${stockClass} mb-3">
                            <i class="fas fa-box"></i> ${stockStatus} (${product.stock} available)
                        </p>
                        
                        <div class="mb-4">
                            <label for="productQuantity" class="form-label">Quantity:</label>
                            <input type="number" class="form-control" id="productQuantity" 
                                   min="1" max="${product.stock}" value="1">
                        </div>
                        
                        <div class="card mb-4">
                            <div class="card-body">
                                <h5 class="card-title">Product Specifications</h5>
                                ${specsHTML}
                            </div>
                        </div>
                        
                        <div class="product-rating text-warning mb-3">
                            ${'★'.repeat(product.rating || 4)}${'☆'.repeat(5 - (product.rating || 4))}
                            (${product.review_count || Math.floor(Math.random() * 50) + 1} reviews)
                        </div>
                        
                        <h5>Product Description</h5>
                        <p>${product.description || 'No description available.'}</p>
                        
                        <div class="card mt-4">
                            <div class="card-body">
                                <h6 class="card-title"><i class="fas fa-user-tie me-2"></i> Farmer Information</h6>
                                <p class="mb-1"><strong>Name:</strong> ${product.farmer?.name || 'Local Farmer'}</p>
                                <p class="mb-1"><strong>Location:</strong> ${product.district?.name || 'Bangladesh'}</p>
                                <p class="mb-0"><strong>Member Since:</strong> ${new Date(product.farmer?.created_at).getFullYear() || '2020'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Initialize carousel if images exist
            if (product.images?.length > 0) {
                new bootstrap.Carousel(productModalBody.querySelector('#productCarousel'));
            }
            
            // Update add to cart button
            const addToCartBtn = document.getElementById('addToCartBtn');
            if (!addToCartBtn) return;
            
            if (product.stock === 0) {
                addToCartBtn.disabled = true;
                addToCartBtn.innerHTML = '<i class="fas fa-times-circle me-2"></i> Out of Stock';
            } else {
                addToCartBtn.disabled = false;
                addToCartBtn.innerHTML = '<i class="fas fa-cart-plus me-2"></i> Add to Cart';
                addToCartBtn.onclick = function() {
                    const quantityInput = document.getElementById('productQuantity');
                    const quantity = parseInt(quantityInput.value) || 1;
                    addToCart(product, quantity);
                    productModal.hide();
                };
            }
        } catch (error) {
            console.error('Error loading product details:', error);
            productModalBody.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Failed to load product details. Please try again.
                </div>
            `;
        }
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
                image: product.images?.[0]?.url || 'images/default-product.jpg',
                seller: product.farmer?.name || 'Local Farmer',
                quantity: quantity,
                maxQuantity: product.stock
            });
        }
        
        // Update localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        
        // Show success message
        showToast(`${quantity} × ${product.name} added to your cart!`);
    }
    
    // Helper function to show toast messages
    function showToast(message) {
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
                    ${message}
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