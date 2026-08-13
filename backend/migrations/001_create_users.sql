-- ============================================
-- MIGRATION 001: Create Users Table
-- ============================================

CREATE TABLE IF NOT EXISTS Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('doctor', 'admin', 'nurse') DEFAULT 'doctor',
    specialization VARCHAR(100),
    hospital VARCHAR(200),
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123)
INSERT INTO Users (name, email, password, role) 
VALUES (
    'Admin', 
    'admin@diabetes.com', 
    '$2a$10$XQwLk5rjYzM5XxY5xY5xY5xY5xY5xY5xY5xY5xY5xY5xY5xY5xY5', 
    'admin'
);

-- Insert sample doctor
INSERT INTO Users (name, email, password, role, specialization, hospital) 
VALUES (
    'Dr. John Smith', 
    'doctor@diabetes.com', 
    '$2a$10$XQwLk5rjYzM5XxY5xY5xY5xY5xY5xY5xY5xY5xY5xY5xY5xY5xY5', 
    'doctor',
    'Endocrinology',
    'City Hospital'
);