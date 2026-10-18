-- ============================================
-- MIGRATION 002: Create Patients Table
-- ============================================

CREATE TABLE IF NOT EXISTS Patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    contactNumber VARCHAR(20),
    email VARCHAR(100),
    address TEXT,
    medicalHistory TEXT,
    createdBy INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE CASCADE
);

-- Insert sample patients
INSERT INTO Patients (patientId, name, age, gender, contactNumber, email, address, medicalHistory, createdBy) 
VALUES 
('PAT-2024-0001', 'Sachin Kumar', 21, 'Male', '+1-555-0101', 'sachin@gmail.com', '123 Main St, City, State 12345', 'Hypertension, Family history of diabetes', 1),
('PAT-2024-0002', 'Jane Smith', 38, 'Female', '+1-555-0102', 'jane.smith@email.com', '456 Oak Ave, City, State 12345', 'Gestational diabetes history', 1),
('PAT-2024-0003', 'Robert Johnson', 52, 'Male', '+1-555-0103', 'robert.j@email.com', '789 Pine Rd, City, State 12345', 'Obesity, High cholesterol', 2);