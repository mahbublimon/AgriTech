document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const productContainer = document.getElementById('productContainer');
    const pagination = document.getElementById('pagination');
    const productModal = new bootstrap.Modal(document.getElementById('productModal'));
    const productModalTitle = document.getElementById('productModalTitle');
    const productModalBody = document.getElementById('productModalBody');
    const productSearch = document.getElementById('productSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    
    // Current page and items per page
    let currentPage = 1;
    const itemsPerPage = 12;
    let totalProducts = 0;
    let totalPages = 0;
    let products = [];
    
    // Fetch products from database
    async function fetchProducts() {
        try {
            // In a real application, this would be an API call to your backend
            // const response = await fetch('/api/products');
            // products = await response.json();
            
            // For demonstration, we'll simulate a database response
            products = await simulateDatabaseFetch();
            totalProducts = products.length;
            totalPages = Math.ceil(totalProducts / itemsPerPage);
            
            renderProducts();
            renderPagination();
        } catch (error) {
            console.error('Error fetching products:', error);
            productContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h3>Error loading products</h3>
                    <p>Please try again later</p>
                </div>
            `;
        }
    }
    
    // Simulate database fetch (replace with actual API call)
    async function simulateDatabaseFetch() {
        // This would come from your actual database
        const categories = ['vegetables', 'fruits', 'grains', 'dairy', 'equipment'];
        const simulatedProducts = [];
        
        // Generate 144 products (12 pages × 12 items)
        for (let i = 1; i <= 144; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const price = (Math.random() * 1000 + 10).toFixed(2);
            
            simulatedProducts.push({
                id: i,
                name: `Product ${i}`,
                description: `This is a detailed description of Product ${i}. It includes all the specifications and features that a buyer would want to know about this agricultural product.`,
                price: price,
                category: category,
                seller: `Farmer ${Math.floor(Math.random() * 50) + 1}`,
                rating: Math.floor(Math.random() * 5) + 1,
                stock: Math.floor(Math.random() * 100),
                image: `https://source.unsplash.com/random/300x300/?${category},agriculture&sig=${i}`
            });
        }
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return simulatedProducts;
    }
    
    // Render products for current page
    function renderProducts() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        let productsToDisplay = products.slice(startIndex, endIndex);
        
        // Apply filters if any
        const searchTerm = productSearch.value.toLowerCase();
        const category = categoryFilter.value;
        
        if (searchTerm || category) {
            productsToDisplay = products.filter(product => {
                const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                                     product.description.toLowerCase().includes(searchTerm);
                const matchesCategory = category ? product.category === category : true;
                return matchesSearch && matchesCategory;
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
                </div>
            `;
            return;
        }
        
        // Render product cards
        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-6 col-lg-4';
            productCard.innerHTML = `
                <div class="product-card">
                    <div class="product-img-container">
                        <img src="${product.image}" alt="${product.name}" class="product-img">
                    </div>
                    <div class="product-body">
                        <h3 class="product-title">${product.name}</h3>
                        <div class="product-price">৳${product.price}</div>
                        <div class="product-seller">Sold by: ${product.seller}</div>
                        <div class="product-rating">
                            ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                        </div>
                        <p class="product-description">${product.description}</p>
                        <button class="btn btn-success view-details-btn" data-id="${product.id}">
                            View Details
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
    
    // Render pagination
    function renderPagination() {
        pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Previous" id="prevPage">
                <span aria-hidden="true">&laquo;</span>
            </a>
        `;
        pagination.appendChild(prevLi);
        
        // Page numbers
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        if (startPage > 1) {
            const firstLi = document.createElement('li');
            firstLi.className = 'page-item';
            firstLi.innerHTML = `<a class="page-link" href="#" data-page="1">1</a>`;
            pagination.appendChild(firstLi);
            
            if (startPage > 2) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
                pagination.appendChild(ellipsisLi);
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageLi = document.createElement('li');
            pageLi.className = `page-item ${i === currentPage ? 'active' : ''}`;
            pageLi.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            pagination.appendChild(pageLi);
        }
        
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsisLi = document.createElement('li');
                ellipsisLi.className = 'page-item disabled';
                ellipsisLi.innerHTML = `<span class="page-link">...</span>`;
                pagination.appendChild(ellipsisLi);
            }
            
            const lastLi = document.createElement('li');
            lastLi.className = 'page-item';
            lastLi.innerHTML = `<a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>`;
            pagination.appendChild(lastLi);
        }
        
        // Next button
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `
            <a class="page-link" href="#" aria-label="Next" id="nextPage">
                <span aria-hidden="true">&raquo;</span>
            </a>
        `;
        pagination.appendChild(nextLi);
        
        // Add event listeners
        document.getElementById('prevPage')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        document.getElementById('nextPage')?.addEventListener('click', (e) => {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
        
        document.querySelectorAll('[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = parseInt(item.getAttribute('data-page'));
                if (page !== currentPage) {
                    currentPage = page;
                    renderProducts();
                    renderPagination();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
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
        
        productModalTitle.textContent = product.name;
        productModalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${product.image}" alt="${product.name}" class="modal-product-img">
                </div>
                <div class="col-md-6">
                    <h3 class="modal-product-price">৳${product.price}</h3>
                    <p class="${stockClass} modal-product-stock">
                        <i class="fas fa-box"></i> ${stockStatus} (${product.stock} available)
                    </p>
                    <p><strong>Seller:</strong> ${product.seller}</p>
                    <p><strong>Category:</strong> ${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</p>
                    <div class="product-rating mb-3">
                        ${'★'.repeat(product.rating)}${'☆'.repeat(5 - product.rating)}
                        (${Math.floor(Math.random() * 50) + 1} reviews)
                    </div>
                    <p>${product.description}</p>
                </div>
            </div>
        `;
        
        // Update add to cart button based on stock
        const addToCartBtn = document.getElementById('addToCartBtn');
        if (product.stock === 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.textContent = 'Out of Stock';
        } else {
            addToCartBtn.disabled = false;
            addToCartBtn.textContent = 'Add to Cart';
            addToCartBtn.onclick = function() {
                // In a real app, you would add to cart here
                alert(`${product.name} added to cart!`);
                productModal.hide();
            };
        }
        
        productModal.show();
    }
    
    // Event listeners for search and filter
    productSearch.addEventListener('input', renderProducts);
    categoryFilter.addEventListener('change', renderProducts);
    
    // Initialize
    fetchProducts();
});