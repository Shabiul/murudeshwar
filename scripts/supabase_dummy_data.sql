-- Insert dummy leads
INSERT INTO public.leads (id, name, email, phone, service_type, status, admin_notes, details, created_at, updated_at) VALUES
('lead_mock_1', 'Rohan Sharma', 'rohan.sharma@gmail.com', '+91 98765 43210', 'Stay', 'pending', 'Interested in early check-in.', '{"checkIn": "2026-07-24", "checkOut": "2026-07-28", "room": "Deluxe Sea View Room", "guests": 2}', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours'),
('lead_mock_2', 'Anjali Desai', 'anjali.d@yahoo.com', '+91 94481 23456', 'Scuba', 'confirmed', 'Assigned Instructor Prajwal. Advance payment received.', '{"courseName": "PADI Open Water Diver", "level": "Beginner", "duration": "4 Days"}', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours'),
('lead_mock_3', 'David Miller', 'david.miller@hotmail.com', '+1 555-019-2834', 'Bike', 'completed', 'Rented Royal Enfield Bullet. Returned on time in perfect condition.', '{"bikeType": "Royal Enfield Bullet 350", "duration": "3 Days"}', NOW() - INTERVAL '12 hours', NOW() - INTERVAL '12 hours'),
('lead_mock_4', 'Vikram Malhotra', 'vikram.m@rediffmail.com', '+91 91102 98765', 'Contact', 'pending', 'Needs corporate package for 15 scuba divers.', '{"message": "Hello, do you offer group discounts for team building events (around 15 people) including both beach stays and beginner scuba diving sessions?"}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
('lead_mock_5', 'Priyah Patel', 'priyah.patel@outlook.com', '+91 88844 55566', 'Stay', 'confirmed', 'Room 204 assigned.', '{"checkIn": "2026-08-01", "checkOut": "2026-08-05", "room": "Deluxe Double Room", "guests": 3}', NOW() - INTERVAL '28 hours', NOW() - INTERVAL '28 hours'),
('lead_mock_6', 'Siddharth Sen', 'siddharth.s@outlook.com', '+91 99001 12233', 'Scuba', 'pending', 'Checking certification level prerequisites.', '{"courseName": "PADI Advanced Open Water", "level": "Advanced", "duration": "3 Days"}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('lead_mock_7', 'Karan Mehra', 'karan.m@gmail.com', '+91 77609 88877', 'Bike', 'cancelled', 'Cancelled by customer due to travel plan changes.', '{"bikeType": "Activa Scooter", "duration": "1 Day"}', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('lead_mock_8', 'John Doe', 'johndoe@gmail.com', '+1 234-567-8900', 'Stay', 'completed', 'Checked out today morning. Left a 5-star review.', '{"checkIn": "2026-07-10", "checkOut": "2026-07-15", "room": "Standard Double Room", "guests": 2}', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
('lead_mock_9', 'Meera Nair', 'meera.nair@gmail.com', '+91 95443 22110', 'Scuba', 'confirmed', 'Medical clearance form signed.', '{"courseName": "Discover Scuba Diving", "level": "Beginner", "duration": "1 Day"}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('lead_mock_10', 'Amit Varma', 'amit.varma@gmail.com', '+91 98860 98860', 'Contact', 'completed', 'Replied to email, sent pricing leaflet.', '{"message": "Can you please let me know the rental price for Scooty for a week, and is a security deposit required?"}', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days');

-- Insert dummy staff (you need to create these users in Supabase Auth first)
-- Replace the UUIDs with actual user IDs from your Supabase Auth
-- For now, let's just insert one dummy staff member
-- Note: You'll need to create these users in Supabase Auth first
