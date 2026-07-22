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

-- 2. Seed auth.users first to satisfy foreign key constraints
INSERT INTO auth.users (id, email, raw_user_meta_data, raw_app_meta_data, aud, role) VALUES
('00000000-0000-0000-0000-000000000001', 'ramesh.kumar@murudeshwara.com', '{"full_name": "Ramesh Kumar"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000002', 'anita.devi@murudeshwara.com', '{"full_name": "Anita Devi"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000003', 'sunita.gowda@murudeshwara.com', '{"full_name": "Sunita Gowda"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000004', 'vijay.naik@murudeshwara.com', '{"full_name": "Vijay Naik"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated'),
('00000000-0000-0000-0000-000000000005', 'suresh.kumar@murudeshwara.com', '{"full_name": "Suresh Kumar"}', '{"provider": "email", "providers": ["email"]}', 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 3. Seed public.staff table using correct columns (categories, is_active)
INSERT INTO public.staff (id, email, full_name, phone, categories, is_active) VALUES
('00000000-0000-0000-0000-000000000001', 'ramesh.kumar@murudeshwara.com', 'Ramesh Kumar', '+91 99001 22334', ARRAY['Stay', 'Contact'], true),
('00000000-0000-0000-0000-000000000002', 'anita.devi@murudeshwara.com', 'Anita Devi', '+91 99002 33445', ARRAY['Stay'], true),
('00000000-0000-0000-0000-000000000003', 'sunita.gowda@murudeshwara.com', 'Sunita Gowda', '+91 99003 44556', ARRAY['Stay'], true),
('00000000-0000-0000-0000-000000000004', 'vijay.naik@murudeshwara.com', 'Vijay Naik', '+91 99004 55667', ARRAY['Stay'], true),
('00000000-0000-0000-0000-000000000005', 'suresh.kumar@murudeshwara.com', 'Suresh Kumar', '+91 99005 66778', ARRAY['Stay'], true)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    categories = EXCLUDED.categories,
    is_active = EXCLUDED.is_active;

-- 4. Seed public.housekeeping_tasks table
-- Clear existing to avoid duplicate tasks on rerun
DELETE FROM public.housekeeping_tasks;

INSERT INTO public.housekeeping_tasks (room_id, assigned_staff_id, status, priority, notes) VALUES
(
    (SELECT id FROM public.rooms WHERE room_number = '101' LIMIT 1),
    '00000000-0000-0000-0000-000000000001',
    'Pending',
    'Medium',
    'Guests checkout at 11 AM'
),
(
    (SELECT id FROM public.rooms WHERE room_number = '102' LIMIT 1),
    '00000000-0000-0000-0000-000000000002',
    'In Progress',
    'High',
    'VIP Room checkin today'
),
(
    (SELECT id FROM public.rooms WHERE room_number = '201' LIMIT 1),
    '00000000-0000-0000-0000-000000000003',
    'Completed',
    'Low',
    'General cleaning complete'
);

-- 5. Seed public.maintenance_requests table
-- Clear existing to avoid duplicate requests on rerun
DELETE FROM public.maintenance_requests;

INSERT INTO public.maintenance_requests (room_id, assigned_staff_id, category, priority, status, description, resolution_notes) VALUES
(
    (SELECT id FROM public.rooms WHERE room_number = '202' LIMIT 1),
    '00000000-0000-0000-0000-000000000004',
    'AC',
    'High',
    'Reported',
    'AC unit making loud noise and not cooling.',
    NULL
),
(
    (SELECT id FROM public.rooms WHERE room_number = '201' LIMIT 1),
    '00000000-0000-0000-0000-000000000005',
    'Plumbing',
    'Emergency',
    'Working',
    'Water leak in the bathroom shower faucet.',
    'Repairing the pipeline gasket.'
),
(
    (SELECT id FROM public.rooms WHERE room_number = '101' LIMIT 1),
    '00000000-0000-0000-0000-000000000004',
    'Electrical',
    'Low',
    'Completed',
    'Bedside lamp bulb replacement.',
    'Replaced standard yellow bulb with warm white LED bulb.'
);

-- 6. Seed public.lost_found_items table
-- Clear existing to avoid duplicate records
DELETE FROM public.lost_found_items;

INSERT INTO public.lost_found_items (item_name, found_by, found_location, claimed_status, claimed_by_name, claimed_by_phone) VALUES
('Gold Wedding Ring', 'Anita Devi', 'Pool Shower Room', 'Unclaimed', NULL, NULL),
('iPhone 15 Pro Max', 'Subhash Rao', 'Beachside Restaurant', 'Claimed', 'John Doe', '+91 98765 43210'),
('Scuba Diving Fins', 'Manjunath Hegde', 'Scuba Diving Deck', 'Unclaimed', NULL, NULL);

-- 7. Seed public.inventory_items table
-- Clear existing to avoid duplicate records
DELETE FROM public.inventory_items;

INSERT INTO public.inventory_items (name, category, quantity, unit, min_threshold) VALUES
('Scuba Diving Regulator', 'Scuba Equipment', 12, 'pcs', 15),
('Premium Toiletries Kit', 'Room Amenities', 85, 'kits', 50),
('Floor Disinfectant (5L)', 'Cleaning Supplies', 3, 'cans', 10),
('Premium Coffee Beans (1kg)', 'Restaurant Stock', 18, 'bags', 10),
('Yamaha Outboard Engine Oil', 'Rental Equipment', 2, 'liters', 5);
