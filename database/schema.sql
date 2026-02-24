-- Salon Management System - MySQL Database Schema with Owners Table
-- Updated version with dedicated owners table

-- Drop tables if they exist (for clean installation)
DROP TABLE IF EXISTS salon_hours;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS services;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS salons;
-- DROP TABLE IF EXISTS owners;
DROP TABLE IF EXISTS users;

-- Users Table (Regular customers and admins only)
CREATE TABLE users (
    id CHAR(36) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin','owner','user') NOT NULL DEFAULT 'user',
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;




-- Salons Table (now references owners table)
DROP TABLE IF EXISTS salons;

CREATE TABLE salons (
    id CHAR(36) PRIMARY KEY,
    owner_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'USA',
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    opening_time TIME,
    closing_time TIME,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Salon Staff Table
CREATE TABLE staff (
    id CHAR(36) NOT NULL,
    salon_id CHAR(36) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (salon_id)
        REFERENCES salons(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Services Table
CREATE TABLE services (
    id CHAR(36) NOT NULL,
    salon_id CHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_minutes INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (salon_id)
        REFERENCES salons(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Appointments Table
CREATE TABLE appointments (
    id CHAR(36) NOT NULL,
    salon_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    service_id CHAR(36),
    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status ENUM('pending','confirmed','completed','cancelled') DEFAULT 'pending',
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),

    FOREIGN KEY (salon_id)
        REFERENCES salons(id)
        ON DELETE CASCADE,

    FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    FOREIGN KEY (service_id)
        REFERENCES services(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Reviews Table
CREATE TABLE reviews (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    salon_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    appointment_id CHAR(36),
    rating INTEGER NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
    CHECK (rating >= 1 AND rating <= 5),
    INDEX idx_salon (salon_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments Table
CREATE TABLE payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    appointment_id CHAR(36) NOT NULL,
    user_id CHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending',
    transaction_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    INDEX idx_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Salon Working Hours Table
CREATE TABLE salon_hours (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    salon_id CHAR(36) NOT NULL,
    day_of_week INTEGER NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    is_closed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (salon_id) REFERENCES salons(id) ON DELETE CASCADE,
    CHECK (day_of_week >= 0 AND day_of_week <= 6),
    INDEX idx_salon_day (salon_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert default admin user (password: admin123)
-- INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
-- VALUES ('admin@salon.com',
-- '$2a$10$HWI1mp04sva1RYao1Xl1hO5i7qOZbHjURnpppM263MbpftyEVCFd2',
-- 'admin', 'System', 'Admin', '555-0000');

-- Insert sample owners (password: admin123 for all)
-- INSERT INTO users (email, password_hash, role, first_name, last_name, phone)
-- VALUES ('owner@salon.com',
-- '$2a$10$HWI1mp04sva1RYao1Xl1hO5i7qOZbHjURnpppM263MbpftyEVCFd2',
-- 'owner', 'John', 'Smith', '555-0001');

-- Insert sample salons (using the owner IDs)
-- INSERT INTO salons (id, owner_id, name, description, address, city, state, zip_code, phone, email, opening_time, closing_time, rating, total_reviews) VALUES
-- (UUID(), (SELECT id FROM owners WHERE email = 'owner@salon.com' LIMIT 1), 'Elite Barber Shop', 'Premium grooming services for the modern gentleman', '123 Main Street', 'New York', 'NY', '10001', '555-0101', 'elite@barber.com', '09:00:00', '20:00:00', 4.8, 127),
-- (UUID(), (SELECT id FROM owners WHERE email = 'owner2@salon.com' LIMIT 1), 'Luxury Hair Studio', 'High-end hair styling and coloring services', '456 Park Avenue', 'Los Angeles', 'CA', '90001', '555-0102', 'info@luxuryhair.com', '08:00:00', '19:00:00', 4.9, 203),
-- (UUID(), (SELECT id FROM owners WHERE email = 'owner3@salon.com' LIMIT 1), 'The Gentleman''s Cut', 'Traditional barbershop with modern techniques', '789 Oak Boulevard', 'Chicago', 'IL', '60601', '555-0103', 'contact@gentlemanscut.com', '10:00:00', '21:00:00', 4.7, 156),
-- (UUID(), (SELECT id FROM owners WHERE email = 'owner@salon.com' LIMIT 1), 'Beauty Haven Spa', 'Complete beauty and wellness services', '321 Elm Street', 'Miami', 'FL', '33101', '555-0104', 'hello@beautyhaven.com', '09:30:00', '18:30:00', 5.0, 89),
-- (UUID(), (SELECT id FROM owners WHERE email = 'owner3@salon.com' LIMIT 1), 'Modern Edge Salon', 'Contemporary cuts and styling', '654 Pine Road', 'Seattle', 'WA', '98101', '555-0105', 'info@modernedge.com', '08:30:00', '19:30:00', 4.6, 178);

-- Update owner salon counts
UPDATE owners SET total_salons = (SELECT COUNT(*) FROM salons WHERE salons.owner_id = owners.id);

-- Verify the data
SELECT 'USERS' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'OWNERS', COUNT(*) FROM owners
UNION ALL
SELECT 'SALONS', COUNT(*) FROM salons;

-- Show sample data
SELECT 'Admin User:' as info, email, first_name, last_name, role FROM users WHERE role = 'admin'
UNION ALL
SELECT 'Owner Accounts:', email, first_name, last_name, 'owner' FROM owners;

SELECT 
    s.name as salon_name,
    s.city,
    s.rating,
    CONCAT(o.first_name, ' ', o.last_name) as owner_name,
    o.business_name,
    o.total_salons
FROM salons s
JOIN owners o ON s.owner_id = o.id
ORDER BY s.rating DESC;
