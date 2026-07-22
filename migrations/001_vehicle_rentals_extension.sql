-- Migration: 001_vehicle_rentals_extension.sql
-- Description: Isolated Extension Schema for Bike & Car Rental CRM Modules
-- Backward Compatible: Does not alter or remove any existing tables or functions.

-- 1. Bike Inventory Table
CREATE TABLE IF NOT EXISTS bike_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100) NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50) NOT NULL DEFAULT 'Scooter', -- Scooter, Cruiser, Sports, Adventure
  engine_capacity VARCHAR(50),
  fuel_type VARCHAR(30) DEFAULT 'Petrol',
  daily_rate DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 1000.00,
  odometer_reading INTEGER DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'Available', -- Available, Reserved, On Trip, Maintenance, Retired
  helmet_provided BOOLEAN DEFAULT TRUE,
  damage_notes TEXT DEFAULT 'None',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bike Pricing Table
CREATE TABLE IF NOT EXISTS bike_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID REFERENCES bike_inventory(id) ON DELETE CASCADE,
  rate_hourly DECIMAL(10,2),
  rate_daily DECIMAL(10,2) NOT NULL,
  rate_weekly DECIMAL(10,2),
  weekend_multiplier DECIMAL(3,2) DEFAULT 1.15,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bike Bookings Table
CREATE TABLE IF NOT EXISTS bike_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(30) UNIQUE NOT NULL,
  bike_id UUID REFERENCES bike_inventory(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_id_proof VARCHAR(100),
  driving_license_no VARCHAR(50) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Availability',
  -- Workflow: Availability -> Reserve -> Confirm -> Vehicle Inspection -> Pickup -> Return -> Inspection -> Invoice -> Complete
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2) DEFAULT 0.00,
  payment_status VARCHAR(30) DEFAULT 'Pending',
  pickup_odometer INTEGER,
  return_odometer INTEGER,
  pickup_inspection_notes TEXT,
  return_inspection_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bike Maintenance Table
CREATE TABLE IF NOT EXISTS bike_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID REFERENCES bike_inventory(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL, -- General Service, Oil Change, Tire Replacement, Repair
  issue_description TEXT,
  cost DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'Scheduled', -- Scheduled, In Progress, Completed
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bike Documents Table
CREATE TABLE IF NOT EXISTS bike_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bike_id UUID REFERENCES bike_inventory(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- RC, Insurance, Pollution Certificate, Permit
  file_url TEXT NOT NULL,
  expiry_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Car Inventory Table
CREATE TABLE IF NOT EXISTS car_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_name VARCHAR(100) NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'SUV', -- SUV, Sedan, Hatchback, Luxury, Van
  seating_capacity INTEGER NOT NULL DEFAULT 5,
  fuel_type VARCHAR(30) DEFAULT 'Diesel',
  transmission VARCHAR(30) DEFAULT 'Manual', -- Manual, Automatic
  daily_rate DECIMAL(10,2) NOT NULL,
  deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 3000.00,
  odometer_reading INTEGER DEFAULT 0,
  status VARCHAR(30) NOT NULL DEFAULT 'Available', -- Available, Reserved, On Trip, Maintenance
  is_chauffeur_available BOOLEAN DEFAULT TRUE,
  damage_notes TEXT DEFAULT 'None',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Drivers Table (Chauffeurs)
CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  license_number VARCHAR(50) UNIQUE NOT NULL,
  license_expiry DATE NOT NULL,
  rating DECIMAL(3,2) DEFAULT 5.00,
  status VARCHAR(30) DEFAULT 'Available', -- Available, On Trip, Off Duty
  assigned_vehicle_id UUID REFERENCES car_inventory(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Car Pricing Table
CREATE TABLE IF NOT EXISTS car_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES car_inventory(id) ON DELETE CASCADE,
  rate_per_day DECIMAL(10,2) NOT NULL,
  rate_per_km DECIMAL(10,2) DEFAULT 15.00,
  chauffeur_allowance_per_day DECIMAL(10,2) DEFAULT 500.00,
  weekend_multiplier DECIMAL(3,2) DEFAULT 1.20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Car Bookings Table
CREATE TABLE IF NOT EXISTS car_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code VARCHAR(30) UNIQUE NOT NULL,
  car_id UUID REFERENCES car_inventory(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES drivers(id) ON DELETE SET NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  driving_license_no VARCHAR(50),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_chauffeur_driven BOOLEAN DEFAULT FALSE,
  status VARCHAR(40) NOT NULL DEFAULT 'Availability',
  -- Workflow: Availability -> Driver Assignment -> Reservation -> Confirmation -> Pickup -> Trip -> Return -> Inspection -> Invoice
  total_amount DECIMAL(10,2) NOT NULL,
  deposit_paid DECIMAL(10,2) DEFAULT 0.00,
  payment_status VARCHAR(30) DEFAULT 'Pending',
  pickup_odometer INTEGER,
  return_odometer INTEGER,
  inspection_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Car Maintenance Table
CREATE TABLE IF NOT EXISTS car_maintenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  car_id UUID REFERENCES car_inventory(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  issue_description TEXT,
  cost DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'Scheduled',
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Vehicle Damage Reports Table (Shared across bikes and cars)
CREATE TABLE IF NOT EXISTS vehicle_damage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_code VARCHAR(30) UNIQUE NOT NULL,
  vehicle_type VARCHAR(20) NOT NULL, -- 'bike' or 'car'
  vehicle_id UUID NOT NULL,
  booking_id UUID,
  reported_by VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  estimated_cost DECIMAL(10,2) DEFAULT 0.00,
  status VARCHAR(30) DEFAULT 'Pending Review', -- Pending Review, Approved, Repaired, Closed
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies Enabling Security
ALTER TABLE bike_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE bike_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bike_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE bike_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE bike_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE car_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_damage_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read bike_inventory" ON bike_inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert bike_inventory" ON bike_inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update bike_inventory" ON bike_inventory FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read bike_bookings" ON bike_bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert bike_bookings" ON bike_bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update bike_bookings" ON bike_bookings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read car_inventory" ON car_inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert car_inventory" ON car_inventory FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update car_inventory" ON car_inventory FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read car_bookings" ON car_bookings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert car_bookings" ON car_bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update car_bookings" ON car_bookings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read drivers" ON drivers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert drivers" ON drivers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update drivers" ON drivers FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated read vehicle_damage_reports" ON vehicle_damage_reports FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated insert vehicle_damage_reports" ON vehicle_damage_reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated update vehicle_damage_reports" ON vehicle_damage_reports FOR UPDATE USING (auth.role() = 'authenticated');
