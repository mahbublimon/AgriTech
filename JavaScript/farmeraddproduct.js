document.addEventListener('DOMContentLoaded', function() {
    // Load dynamic data (categories and districts)
    loadFormData();
    
    // Initialize image preview functionality
    initImagePreview();
    
    // Form submission handler
    document.getElementById('addProductForm').addEventListener('submit', handleFormSubmit);
});

function loadFormData() {
    // In a real application, these would come from API calls
    // For demonstration, we'll use mock data that would come from database
    
    // Load categories
    fetch('/api/categories')
        .then(response => response.json())
        .then(categories => {
            const categorySelect = document.getElementById('productCategory');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading categories:', error);
            // Fallback to default options
            const defaultCategories = [
                {id: 'vegetables', name: 'Vegetables'},
                {id: 'fruits', name: 'Fruits'},
                {id: 'grains', name: 'Grains'},
                {id: 'fish', name: 'Fish'},
                {id: 'poultry', name: 'Poultry'},
                {id: 'dairy', name: 'Dairy'},
                {id: 'spices', name: 'Spices'}
            ];
            
            const categorySelect = document.getElementById('productCategory');
            defaultCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        });
    
    // Load districts
    fetch('/api/districts')
        .then(response => response.json())
        .then(districts => {
            const districtSelect = document.getElementById('productDistrict');
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading districts:', error);
            // Fallback to default options
            const defaultDistricts = [
                {id: 'dhaka', name: 'Dhaka'},
                {id: 'chittagong', name: 'Chittagong'},
                {id: 'sylhet', name: 'Sylhet'},
                {id: 'khulna', name: 'Khulna'},
                {id: 'barishal', name: 'Barishal'},
                {id: 'rajshahi', name: 'Rajshahi'},
                {id: 'rangpur', name: 'Rangpur'},
                {id: 'mymensingh', name: 'Mymensingh'}
            ];
            
            const districtSelect = document.getElementById('productDistrict');
            defaultDistricts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
        });
}

function initImagePreview() {
    const imageInput = document.getElementById('productImage');
    const previewContainer = document.getElementById('imagePreviewContainer');
    
    imageInput.addEventListener('change', function() {
        previewContainer.innerHTML = '';
        
        if (this.files.length > 5) {
            alert('You can upload a maximum of 5 images');
            this.value = '';
            return;
        }
        
        Array.from(this.files).forEach((file, index) => {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                alert(`File ${file.name} is too large (max 5MB)`);
                return;
            }
            
            if (!file.type.match('image.*')) {
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewDiv = document.createElement('div');
                previewDiv.className = 'position-relative';
                
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'image-preview';
                img.alt = 'Product preview';
                
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-image-btn';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.onclick = function() {
                    previewDiv.remove();
                    // Remove the file from input
                    const dt = new DataTransfer();
                    const files = imageInput.files;
                    
                    for (let i = 0; i < files.length; i++) {
                        if (index !== i) {
                            dt.items.add(files[i]);
                        }
                    }
                    
                    imageInput.files = dt.files;
                };
                
                previewDiv.appendChild(img);
                previewDiv.appendChild(removeBtn);
                previewContainer.appendChild(previewDiv);
            };
            reader.readAsDataURL(file);
        });
    });
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
        return;
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('name', document.getElementById('productName').value);
    formData.append('category_id', document.getElementById('productCategory').value);
    formData.append('description', document.getElementById('productDescription').value);
    formData.append('price', document.getElementById('productPrice').value);
    formData.append('stock', document.getElementById('productStock').value);
    formData.append('unit_type', document.getElementById('unitType').value);
    formData.append('district_id', document.getElementById('productDistrict').value);
    formData.append('harvest_date', document.getElementById('productHarvestDate').value);
    formData.append('is_organic', document.getElementById('organicCertified').checked ? 1 : 0);
    formData.append('is_premium', document.getElementById('premiumQuality').checked ? 1 : 0);
    
    // Append all images
    const imageInput = document.getElementById('productImage');
    for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images[]', imageInput.files[i]);
    }
    
    // Submit to server
    const submitBtn = document.querySelector('.btn-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Adding...';
    
    // In a real application, this would be an API call
    fetch('/api/products', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Reset form
        document.getElementById('addProductForm').reset();
        document.getElementById('imagePreviewContainer').innerHTML = '';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error submitting your product. Please try again.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i> Add Product';
    });
}

function validateForm() {
    let isValid = true;
    const requiredFields = [
        'productName', 'productCategory', 'productDescription',
        'productPrice', 'productStock', 'productDistrict',
        'productHarvestDate', 'productImage'
    ];
    
    // Clear previous validation
    document.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    document.querySelectorAll('.invalid-feedback').forEach(el => {
        el.remove();
    });
    
    // Validate required fields
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value) {
            field.classList.add('is-invalid');
            
            const errorDiv = document.createElement('div');
            errorDiv.className = 'invalid-feedback';
            errorDiv.textContent = 'This field is required';
            
            field.parentNode.appendChild(errorDiv);
            isValid = false;
        }
    });
    
    // Validate image count
    const imageInput = document.getElementById('productImage');
    if (imageInput.files.length === 0) {
        imageInput.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = 'Please upload at least one image';
        
        imageInput.parentNode.appendChild(errorDiv);
        isValid = false;
    }
    
    // Validate price and stock
    const price = parseFloat(document.getElementById('productPrice').value);
    if (price <= 0) {
        document.getElementById('productPrice').classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = 'Price must be greater than 0';
        
        document.getElementById('productPrice').parentNode.appendChild(errorDiv);
        isValid = false;
    }
    
    const stock = parseInt(document.getElementById('productStock').value);
    if (stock <= 0) {
        document.getElementById('productStock').classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = 'Stock must be greater than 0';
        
        document.getElementById('productStock').parentNode.appendChild(errorDiv);
        isValid = false;
    }
    
    // Validate harvest date (not in future)
    const harvestDate = new Date(document.getElementById('productHarvestDate').value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (harvestDate > today) {
        document.getElementById('productHarvestDate').classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = 'Harvest date cannot be in the future';
        
        document.getElementById('productHarvestDate').parentNode.appendChild(errorDiv);
        isValid = false;
    }
    
    return isValid;
}