document.addEventListener('DOMContentLoaded', function() {
    // Check authentication status
    checkAuthStatus();
    
    // Load profile data
    loadProfileData();
    
    // Initialize form submission
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
    
    // Initialize image upload
    document.getElementById('profileImageUpload').addEventListener('change', handleImageUpload);
});

function checkAuthStatus() {
    // In a real app, this would check cookies/localStorage for auth token
    const isAuthenticated = localStorage.getItem('farmerAuthToken');
    
    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
}

function loadProfileData() {
    // Simulate API call to get farmer data
    fetch('/api/farmer/profile', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('farmerAuthToken')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load profile data');
        }
        return response.json();
    })
    .then(data => {
        populateProfileForm(data);
        updateVerificationStatus(data.verification_status);
    })
    .catch(error => {
        console.error('Error loading profile:', error);
        alert('Failed to load profile data. Please try again.');
    });
}

function populateProfileForm(data) {
    // Personal Info
    document.getElementById('firstName').value = data.first_name;
    document.getElementById('lastName').value = data.last_name;
    document.getElementById('email').value = data.email;
    document.getElementById('phone').value = data.phone;
    document.getElementById('nidNumber').value = data.nid_number || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('farmSize').value = data.farm_size || '';
    document.getElementById('experience').value = data.farming_experience || '';
    
    // Display name
    document.getElementById('farmerName').textContent = `${data.first_name} ${data.last_name}`;
    document.getElementById('farmerLocation').textContent = data.district_name || '';
    
    // Profile picture
    if (data.profile_image) {
        document.getElementById('profilePicture').src = data.profile_image;
    }
    
    // Load districts for dropdown
    loadDistricts(data.district_id);
}

function loadDistricts(selectedDistrictId) {
    fetch('/api/districts')
    .then(response => response.json())
    .then(districts => {
        const districtSelect = document.getElementById('district');
        
        districts.forEach(district => {
            const option = document.createElement('option');
            option.value = district.id;
            option.textContent = district.name;
            if (district.id === selectedDistrictId) {
                option.selected = true;
            }
            districtSelect.appendChild(option);
        });
    })
    .catch(error => {
        console.error('Error loading districts:', error);
        // Fallback to default districts
        const defaultDistricts = [
            {id: 1, name: 'Dhaka'},
            {id: 2, name: 'Chittagong'},
            {id: 3, name: 'Sylhet'},
            {id: 4, name: 'Khulna'},
            {id: 5, name: 'Barishal'},
            {id: 6, name: 'Rajshahi'},
            {id: 7, name: 'Rangpur'},
            {id: 8, name: 'Mymensingh'}
        ];
        
        const districtSelect = document.getElementById('district');
        defaultDistricts.forEach(district => {
            const option = document.createElement('option');
            option.value = district.id;
            option.textContent = district.name;
            if (district.id === selectedDistrictId) {
                option.selected = true;
            }
            districtSelect.appendChild(option);
        });
    });
}

function updateVerificationStatus(status) {
    const badge = document.getElementById('verificationBadge');
    const verificationSection = document.getElementById('verificationSection');
    
    switch(status) {
        case 'verified':
            badge.innerHTML = '<i class="fas fa-check-circle me-1"></i> Verified';
            badge.className = 'verification-badge verified';
            verificationSection.classList.add('d-none');
            break;
        case 'pending':
            badge.innerHTML = '<i class="fas fa-user-clock me-1"></i> Verification Pending';
            badge.className = 'verification-badge pending';
            verificationSection.classList.remove('d-none');
            break;
        default:
            badge.innerHTML = '<i class="fas fa-exclamation-circle me-1"></i> Not Verified';
            badge.className = 'verification-badge not-verified';
            verificationSection.classList.remove('d-none');
    }
}

function handleProfileUpdate(e) {
    e.preventDefault();
    
    // Validate form
    if (!validateProfileForm()) {
        return;
    }
    
    // Prepare form data
    const formData = {
        first_name: document.getElementById('firstName').value,
        last_name: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        district_id: document.getElementById('district').value,
        nid_number: document.getElementById('nidNumber').value || null,
        address: document.getElementById('address').value || null,
        farm_size: document.getElementById('farmSize').value || null,
        farming_experience: document.getElementById('experience').value || null
    };
    
    // Submit to server
    const submitBtn = document.querySelector('#profileForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Updating...';
    
    fetch('/api/farmer/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('farmerAuthToken')
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update profile');
        }
        return response.json();
    })
    .then(data => {
        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();
        
        // Update displayed name
        document.getElementById('farmerName').textContent = `${data.first_name} ${data.last_name}`;
    })
    .catch(error => {
        console.error('Error:', error);
        alert('There was an error updating your profile. Please try again.');
    })
    .finally(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i> Update Profile';
    });
}

function validateProfileForm() {
    let isValid = true;
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'district'];
    
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
    
    // Validate email format
    const email = document.getElementById('email').value;
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        document.getElementById('email').classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = 'Please enter a valid email address';
        
        document.getElementById('email').parentNode.appendChild(errorDiv);
        isValid = false;
    }
    
    // Validate phone number (Bangladeshi format)
    const phone = document.getElementById('phone').value;
    if (phone && !/^(\+88)?01[3-9]\d{8}$/.test(phone)) {
        document.getElementById('phone').classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = 'Please enter a valid Bangladeshi phone number';
        
        document.getElementById('phone').parentNode.appendChild(errorDiv);
        isValid = false;
    }
    
    return isValid;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image size should be less than 2MB');
        return;
    }
    
    if (!file.type.match('image.*')) {
        alert('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Show preview
        document.getElementById('profilePicture').src = e.target.result;
        
        // Upload to server
        uploadProfileImage(file);
    };
    reader.readAsDataURL(file);
}

function uploadProfileImage(file) {
    const formData = new FormData();
    formData.append('profile_image', file);
    
    fetch('/api/farmer/profile/image', {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('farmerAuthToken')
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to upload image');
        }
        return response.json();
    })
    .then(data => {
        // Update profile picture in navbar if exists
        const navbarProfilePic = document.querySelector('#farmer-navbar-container .profile-pic');
        if (navbarProfilePic) {
            navbarProfilePic.src = data.image_url;
        }
    })
    .catch(error => {
        console.error('Error uploading image:', error);
        alert('Failed to upload profile image. Please try again.');
    });
}