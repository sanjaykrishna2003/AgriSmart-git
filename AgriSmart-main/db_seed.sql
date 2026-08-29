-- Create the database if not exists
CREATE DATABASE IF NOT EXISTS agrismart;
USE agrismart;

-- Disable foreign key checks for clean seed
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    district VARCHAR(100),
    state VARCHAR(100),
    is_verified TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Farms Table
CREATE TABLE IF NOT EXISTS farms (
    farm_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    farm_name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    area DOUBLE NOT NULL,
    soil_type VARCHAR(50),
    water_source VARCHAR(100),
    latitude DOUBLE,
    longitude DOUBLE,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Create Crops Table
CREATE TABLE IF NOT EXISTS crops (
    crop_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    crop_name VARCHAR(100) NOT NULL,
    duration INT NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL,
    season VARCHAR(50),
    planted_date DATE,
    expected_harvest_date DATE,
    farm_id BIGINT NOT NULL,
    yield DOUBLE,
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE
);

-- 4. Create Weather Table
CREATE TABLE IF NOT EXISTS weather_history (
    weather_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    temperature DOUBLE NOT NULL,
    rainfall DOUBLE,
    humidity DOUBLE,
    weather_condition VARCHAR(100),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    farm_id BIGINT NOT NULL,
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE
);

-- 5. Create Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
    recommendation_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    farm_id BIGINT NOT NULL,
    recommendation_type VARCHAR(50),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (farm_id) REFERENCES farms(farm_id) ON DELETE CASCADE
);

-- 6. Create Schemes Table
CREATE TABLE IF NOT EXISTS schemes (
    scheme_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scheme_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    benefits VARCHAR(255),
    eligibility_criteria TEXT,
    required_documents TEXT,
    official_link VARCHAR(255),
    state VARCHAR(100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Clear existing data
TRUNCATE TABLE recommendations;
TRUNCATE TABLE weather_history;
TRUNCATE TABLE crops;
TRUNCATE TABLE farms;
TRUNCATE TABLE users;
TRUNCATE TABLE schemes;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Seed System Users (Admin & Base Officer only — NO dummy farmers)
INSERT INTO users (user_id, name, phone, email, password_hash, role, district, state, created_at) VALUES
(1, 'Siddharth Sharma', '9999988888', 'admin@agrismart.com', '$2a$10$JvuidiCaQA5a4ubogBjFVebrh3UH9arLoW0TDF6GYmL6762iOCUl6', 'ADMIN', 'Chandigarh', 'Punjab', '2026-01-01 09:00:00'),
(102, 'Officer Priya', '9777766666', 'officer@agrismart.com', '$2a$10$JvuidiCaQA5a4ubogBjFVebrh3UH9arLoW0TDF6GYmL6762iOCUl6', 'OFFICER', 'Ambala', 'Haryana', '2026-01-15 14:00:00');

-- 2. Seed Schemes (System Reference Data)
INSERT INTO schemes (scheme_id, scheme_name, category, description, benefits, eligibility_criteria, required_documents, official_link, state) VALUES
(1, 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)', 'Financial Assistance', 'Income support scheme providing financial benefit to all landholding farmer families across India to buy agriculture inputs.', '₹6,000 per year in 3 equal installments', 'All landholding farmer families with cultivable land in their name.', 'Aadhaar Card, Land Records, Bank Account Details', 'https://pmkisan.gov.in', 'All States'),
(2, 'Kisan Credit Card (KCC)', 'Loans', 'Provides farmers with timely access to short-term credit loans for cultivation, crop production, and post-harvest maintenance expenses.', 'Short-term credit up to ₹3 Lakhs at low interest rate (4%)', 'All farmers, tenant farmers, and sharecroppers.', 'Aadhaar Card, Land Possession Certificate, Bank Account Details', 'https://pmkisan.gov.in/Documents/KCC.pdf', 'All States'),
(3, 'PMFBY (Pradhan Mantri Fasal Bima Yojana)', 'Insurance', 'Crop insurance scheme offering financial security to farmers against crop failure or damages caused by natural disasters, pests, or disease.', 'Comprehensive crop insurance coverage with low premium (1.5% to 5%)', 'All farmers growing notified crops in notified areas.', 'Aadhaar Card, Sowing Certificate, Land Records, Bank Passbook', 'https://pmfby.gov.in', 'All States'),
(4, 'Tamil Nadu Free Agricultural Power Scheme', 'Subsidies', 'State government initiative providing free agricultural electricity to farmers to operate pump sets for crop irrigation.', '100% free electricity supply for agricultural irrigation pumps', 'Tamil Nadu resident landholding farmers owning agricultural pump sets.', 'Aadhaar Card, Land Ownership Documents (Patta/Chitta), Pump Set details', 'https://www.tangedco.org', 'Tamil Nadu'),
(5, 'PM Kisan Maan-Dhan Yojana (PM-KMY)', 'Financial Assistance', 'A voluntary and contributory pension scheme for old age protection and social security of Small and Marginal Farmers (SMFs) owning cultivable land.', 'Minimum assured pension of ₹3,000 per month after reaching 60 years of age', 'Small and marginal farmers aged between 18 to 40 years with cultivable land up to 2 hectares.', 'Aadhaar Card, Savings Bank Account, Aadhaar-linked Mobile Number', 'https://pmkmy.gov.in', 'All States'),
(6, 'PMKSY - Per Drop More Crop (PDMC)', 'Subsidies', 'Focuses on water use efficiency at farm level through micro-irrigation technologies like drip and sprinkler irrigation systems.', 'Up to 55% subsidy for small and marginal farmers, and 45% for other farmers for micro-irrigation installation', 'All landholding farmers with access to water sources.', 'Aadhaar Card, Land Records, Electricity Bill, Drip design installation plan', 'https://pmksy.gov.in', 'All States'),
(7, 'Paramparagat Krishi Vikas Yojana (PKVY)', 'Subsidies', 'Promotes organic farming through a cluster approach and PGS certification. Supports organic farming practices and marketing.', 'Financial assistance of ₹50,000 per hectare over 3 years, with 62% provided as subsidy for organic inputs', 'Farmers formed in clusters of 20 hectares (minimum 50 farmers).', 'Aadhaar Card, Land Records, PGS Cluster Registration', 'https://pgsindia-ncof.gov.in', 'All States'),
(8, 'Soil Health Card Scheme', 'Financial Assistance', 'Assists state governments to issue soil health cards to all farmers. Provides nutrient status of soil and recommendation of fertilizers.', 'Free soil testing and customized fertilizer recommendation card every 2 years', 'All farmers owning cultivable lands in India.', 'Aadhaar Card, Soil Sample Collection Slip, Land Records', 'https://soilhealth.dac.gov.in', 'All States'),
(9, 'National Agriculture Market (e-NAM)', 'Financial Assistance', 'Pan-India electronic trading portal which networks the existing APMC mandis to create a unified national market for agricultural commodities.', 'Direct online selling of produce to buyers across India without middlemen, getting competitive prices', 'All individual farmers, FPOs, and traders.', 'Aadhaar Card, Bank Account Details, Mobile Number', 'https://enam.gov.in', 'All States'),
(10, 'SMAM (Sub-Mission on Agricultural Mechanization)', 'Subsidies', 'Promotes agricultural mechanization by providing subsidies for buying modern agricultural machinery like tractors, rotavators, power tillers.', '40% to 50% subsidy on purchase of verified agricultural machinery', 'All landholding farmers, special preference to women and SC/ST farmers.', 'Aadhaar Card, Land Records (Patta), Bank Account Details, Machinery quotation', 'https://agrimachinery.nic.in', 'All States'),
(11, 'Punjab Free Power Scheme for Agriculture', 'Subsidies', 'State government initiative providing free electricity supply to agricultural tube wells to support irrigation for farmers in Punjab.', '100% free electricity supply for agricultural tubewells', 'Punjab resident landholding farmers owning agricultural electric pump tube wells.', 'Aadhaar Card, Land Ownership Certificate', 'https://www.pspcl.in', 'Punjab'),
(12, 'Haryana Bhavantar Bharpayee Yojana (BBY)', 'Financial Assistance', 'State scheme compensating farmers for price deficit of horticultural crops (vegetables & fruits) when market prices fall below floor prices.', 'Price compensation difference deposited directly to bank accounts', 'Haryana resident farmers registered on Meri Fasal Mera Byora (MFMB) portal cultivating notified crops.', 'Aadhaar Card, Meri Fasal Mera Byora Registration Slip, Bank Account', 'https://ekharid.haryana.gov.in', 'Haryana');
