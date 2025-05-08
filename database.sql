-- Farmers table
CREATE TABLE farmers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    district_id INT NOT NULL,
    address TEXT,
    nid_number VARCHAR(20) UNIQUE,
    profile_image VARCHAR(255),
    farm_size DECIMAL(10,2),
    farming_experience INT,
    status ENUM('active', 'pending', 'suspended') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Farmer verification table
CREATE TABLE farmer_verifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    nid_front_image VARCHAR(255) NOT NULL,
    nid_back_image VARCHAR(255) NOT NULL,
    status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    verified_by INT,
    verified_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (verified_by) REFERENCES admins(id)
);

-- Categories table
CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Districts table
CREATE TABLE districts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    division VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    category_id INT NOT NULL,
    district_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock DECIMAL(10,2) NOT NULL,
    unit_type ENUM('kg', 'g', 'piece', 'dozen', 'liter') NOT NULL DEFAULT 'kg',
    harvest_date DATE NOT NULL,
    is_organic BOOLEAN NOT NULL DEFAULT FALSE,
    is_premium BOOLEAN NOT NULL DEFAULT FALSE,
    status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id),
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (district_id) REFERENCES districts(id)
);

-- Product images table
CREATE TABLE product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Investors Table
CREATE TABLE investors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nid_number VARCHAR(20) UNIQUE,
    profile_image VARCHAR(255),
    address TEXT,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Loan Applications Table
CREATE TABLE loan_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    loan_amount DECIMAL(12,2) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    repayment_period INT NOT NULL, -- in months
    interest_rate DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'funded', 'completed') DEFAULT 'pending',
    crop_type VARCHAR(50),
    land_size DECIMAL(10,2), -- in acres
    district VARCHAR(50),
    expected_harvest_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(id)
);

-- Loan Documents Table
CREATE TABLE loan_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    document_type ENUM('nid_front', 'nid_back', 'land_doc', 'crop_photo') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

-- Investments Table
CREATE TABLE investments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investor_id INT NOT NULL,
    loan_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    expected_roi DECIMAL(12,2) NOT NULL,
    status ENUM('active', 'completed', 'defaulted') DEFAULT 'active',
    investment_date DATE NOT NULL,
    maturity_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (investor_id) REFERENCES investors(id),
    FOREIGN KEY (loan_id) REFERENCES loan_applications(id)
);

-- Payments Table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    investment_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL,
    status ENUM('pending', 'completed', 'late') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (investment_id) REFERENCES investments(id)
);

-- Users Table (Common fields for all user types)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    user_type ENUM('farmer', 'investor', 'user') NOT NULL,
    profile_image VARCHAR(255),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(100),
    verification_expires DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login DATETIME,
    status ENUM('active', 'suspended', 'pending_verification') DEFAULT 'pending_verification'
);

-- Farmers Table (Additional fields for farmers)
CREATE TABLE farmers (
    farmer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    farm_location VARCHAR(255),
    district VARCHAR(100),
    farm_size DECIMAL(10,2) COMMENT 'In acres',
    farming_experience INT COMMENT 'In years',
    main_crops VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Farmer Documents Table
CREATE TABLE farmer_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    document_type ENUM('nid_front', 'nid_back', 'land_document', 'other') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id) ON DELETE CASCADE
);

-- Investors Table (Additional fields for investors)
CREATE TABLE investors (
    investor_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    company_name VARCHAR(100),
    investment_range ENUM('1-10', '10-50', '50-100', '100+'),
    investment_interests VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Investor Documents Table
CREATE TABLE investor_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,
    investor_id INT NOT NULL,
    document_type ENUM('nid', 'company_registration', 'other') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verification_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (investor_id) REFERENCES investors(investor_id) ON DELETE CASCADE
);

-- Regular Users Table (Additional fields for regular users)
CREATE TABLE regular_users (
    user_id INT NOT NULL PRIMARY KEY,
    interests SET('organic', 'tech', 'market', 'education'),
    newsletter_subscription BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- User Sessions Table
CREATE TABLE user_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
    token_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Loan Applications Table
CREATE TABLE loan_applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    farmer_id INT NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    repayment_period INT NOT NULL COMMENT 'In months',
    status ENUM('pending', 'approved', 'rejected', 'disbursed', 'completed') DEFAULT 'pending',
    district VARCHAR(50) NOT NULL,
    farm_size DECIMAL(10,2) COMMENT 'In acres',
    crop_type VARCHAR(50),
    harvest_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (farmer_id) REFERENCES farmers(farmer_id)
);

-- Loan Documents Table
CREATE TABLE loan_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    type ENUM('nid', 'land', 'crop', 'other') NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (loan_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

-- Farmers Table (Referenced)
CREATE TABLE farmers (
    farmer_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    farm_location VARCHAR(255),
    district VARCHAR(100),
    farm_size DECIMAL(10,2) COMMENT 'In acres',
    farming_experience INT COMMENT 'In years',
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Users Table (Referenced)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    profile_image VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    user_type ENUM('farmer', 'investor', 'user') NOT NULL,
    interests TEXT,  -- For regular users (multiple selections as a comma-separated string, or it can be a many-to-many relationship in a separate table)
    terms_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Farmer-specific fields
CREATE TABLE farmer_details (
    user_id INT PRIMARY KEY,
    farm_location VARCHAR(255),
    farm_size DECIMAL(10, 2),  -- Assuming acres, can be a decimal value
    land_document VARCHAR(255),  -- File path or URL
    nid_front VARCHAR(255),  -- File path or URL
    nid_back VARCHAR(255),  -- File path or URL
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Investor-specific fields
CREATE TABLE investor_details (
    user_id INT PRIMARY KEY,
    company_name VARCHAR(255),
    investment_range ENUM('1-10', '10-50', '50-100', '100+') NOT NULL,
    company_document VARCHAR(255),  -- File path or URL
    investor_nid VARCHAR(255),  -- File path or URL
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Regular User-specific interests (could be a many-to-many relationship)
CREATE TABLE user_interests (
    user_id INT,
    interest VARCHAR(255),
    PRIMARY KEY (user_id, interest),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
