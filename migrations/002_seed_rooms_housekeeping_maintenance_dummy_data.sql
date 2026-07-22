-- Seed Dummy Data for Rooms, Staff, Housekeeping, Maintenance, and Inventory

-- 1. Seed public.rooms table
INSERT INTO public.rooms (room_number, room_type, floor, capacity, price, status, amenities, notes) VALUES
('101', 'Standard Room', 1, 2, 2500.00, 'Available', ARRAY['WiFi', 'AC', 'TV'], 'Near the lawn area'),
('102', 'Standard Room', 1, 2, 2500.00, 'Occupied', ARRAY['WiFi', 'AC', 'TV'], 'Quiet corner room'),
('201', 'Deluxe Room', 2, 3, 4000.00, 'Cleaning', ARRAY['WiFi', 'AC', 'TV', 'Balcony'], 'Sea-facing view'),
('202', 'Suite', 2, 4, 7500.00, 'Maintenance', ARRAY['WiFi', 'AC', 'TV', 'Mini Bar', 'Balcony'], 'AC compressor issue'),
('301', 'Beachfront Villa', 1, 5, 12000.00, 'Available', ARRAY['WiFi', 'AC', 'TV', 'Private Pool', 'Sea View'], 'Premium guest favorite')
ON CONFLICT (room_number) DO UPDATE SET 
    room_type = EXCLUDED.room_type,
    floor = EXCLUDED.floor,
    capacity = EXCLUDED.capacity,
    price = EXCLUDED.price,
    status = EXCLUDED.status,
    amenities = EXCLUDED.amenities,
    notes = EXCLUDED.notes;

-- 2. Seed public.staff table
INSERT INTO public.staff (full_name, email, phone, role, status) VALUES
('Ramesh Kumar', 'ramesh.kumar@murudeshwara.com', '+91 99001 22334', 'housekeeping', 'active'),
('Anita Devi', 'anita.devi@murudeshwara.com', '+91 99002 33445', 'housekeeping', 'active'),
('Sunita Gowda', 'sunita.gowda@murudeshwara.com', '+91 99003 44556', 'housekeeping', 'active'),
('Vijay Naik', 'vijay.naik@murudeshwara.com', '+91 99004 55667', 'maintenance', 'active'),
('Suresh Kumar', 'suresh.kumar@murudeshwara.com', '+91 99005 66778', 'maintenance', 'active')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    status = EXCLUDED.status;

-- 3. Seed public.housekeeping_tasks table
-- Clear existing to avoid duplicate tasks on rerun
DELETE FROM public.housekeeping_tasks;

INSERT INTO public.housekeeping_tasks (room_id, assigned_staff_id, status, priority, notes) VALUES
(
    (SELECT id FROM public.rooms WHERE room_number = '101' LIMIT 1),
    (SELECT id FROM public.staff WHERE email = 'ramesh.kumar@murudeshwara.com' LIMIT 1),
    'Pending',
    'Medium',
    'Guests checkout at 11 AM'
),
(
    (SELECT id FROM public.rooms WHERE room_number = '102' LIMIT 1),
    (SELECT id FROM public.staff WHERE email = 'anita.devi@murudeshwara.com' LIMIT 1),
    'In Progress',
    'High',
    'VIP Room checkin today'
),
(
    (SELECT id FROM public.rooms WHERE room_number = '201' LIMIT 1),
    (SELECT id FROM public.staff WHERE email = 'sunita.gowda@murudeshwara.com' LIMIT 1),
    'Completed',
    'Low',
    'General cleaning complete'
);

-- 4. Seed public.maintenance_requests table
-- Clear existing to avoid duplicate requests on rerun
DELETE FROM public.maintenance_requests;

INSERT INTO public.maintenance_requests (room_id, assigned_staff_id, category, priority, status, description, resolution_notes) VALUES
(
    (SELECT id FROM public.rooms WHERE room_number = '202' LIMIT 1),
    (SELECT id FROM public.staff WHERE email = 'vijay.naik@murudeshwara.com' LIMIT 1),
    'AC',
    'High',
    'Reported',
    'AC unit making loud noise and not cooling.',
    NULL
),
(
    (SELECT id FROM public.rooms WHERE room_number = '201' LIMIT 1),
    (SELECT id FROM public.staff WHERE email = 'suresh.kumar@murudeshwara.com' LIMIT 1),
    'Plumbing',
    'Emergency',
    'Working',
    'Water leak in the bathroom shower faucet.',
    'Repairing the pipeline gasket.'
),
(
    (SELECT id FROM public.rooms WHERE room_number = '101' LIMIT 1),
    (SELECT id FROM public.staff WHERE email = 'vijay.naik@murudeshwara.com' LIMIT 1),
    'Electrical',
    'Low',
    'Completed',
    'Bedside lamp bulb replacement.',
    'Replaced standard yellow bulb with warm white LED bulb.'
);

-- 5. Seed public.lost_found_items table
-- Clear existing to avoid duplicate records
DELETE FROM public.lost_found_items;

INSERT INTO public.lost_found_items (item_name, found_by, found_location, claimed_status, claimed_by_name, claimed_by_phone) VALUES
('Gold Wedding Ring', 'Anita Devi', 'Pool Shower Room', 'Unclaimed', NULL, NULL),
('iPhone 15 Pro Max', 'Subhash Rao', 'Beachside Restaurant', 'Claimed', 'John Doe', '+91 98765 43210'),
('Scuba Diving Fins', 'Manjunath Hegde', 'Scuba Diving Deck', 'Unclaimed', NULL, NULL);

-- 6. Seed public.inventory_items table
-- Clear existing to avoid duplicate records
DELETE FROM public.inventory_items;

INSERT INTO public.inventory_items (name, category, quantity, unit, min_threshold) VALUES
('Scuba Diving Regulator', 'Scuba Equipment', 12, 'pcs', 15),
('Premium Toiletries Kit', 'Room Amenities', 85, 'kits', 50),
('Floor Disinfectant (5L)', 'Cleaning Supplies', 3, 'cans', 10),
('Premium Coffee Beans (1kg)', 'Restaurant Stock', 18, 'bags', 10),
('Yamaha Outboard Engine Oil', 'Rental Equipment', 2, 'liters', 5);
