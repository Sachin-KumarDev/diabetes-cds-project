-- ============================================
-- MIGRATION 003: Create Predictions Table
-- ============================================

CREATE TABLE IF NOT EXISTS Predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patientId INT NOT NULL,
    
    -- Patient Input Data
    gender VARCHAR(10),
    age FLOAT,
    hypertension INT,
    heartDisease INT,
    smokingHistory VARCHAR(50),
    bmi FLOAT,
    hba1c FLOAT,
    bloodGlucose INT,
    
    -- Prediction Results
    prediction INT NOT NULL,
    probability FLOAT NOT NULL,
    riskLevel ENUM('HIGH', 'MODERATE', 'LOW') NOT NULL,
    confidence VARCHAR(20),
    
    -- Explanation & Notes
    explanation JSON,
    doctorNotes TEXT,
    
    -- Metadata
    createdBy INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    FOREIGN KEY (patientId) REFERENCES Patients(id) ON DELETE CASCADE,
    FOREIGN KEY (createdBy) REFERENCES Users(id) ON DELETE CASCADE
);

-- Add indexes for faster queries
CREATE INDEX idx_predictions_patientId ON Predictions(patientId);
CREATE INDEX idx_predictions_createdAt ON Predictions(createdAt);
CREATE INDEX idx_predictions_riskLevel ON Predictions(riskLevel);

-- Insert sample prediction for testing
INSERT INTO Predictions (
    patientId, gender, age, hypertension, heartDisease, 
    smokingHistory, bmi, hba1c, bloodGlucose,
    prediction, probability, riskLevel, confidence, doctorNotes, createdBy
) 
VALUES (
    1, 'Male', 45, 0, 0,
    'never', 33.6, 6.8, 160,
    1, 0.788, 'HIGH', '78.8%',
    'Patient shows elevated glucose and HbA1c. Recommend lifestyle changes.',
    1
);