-- ========================================================
-- Beach Front Stay CRM & Staff Management Database Schema
-- Compatible with PostgreSQL & Supabase
-- ========================================================

-- 1. CRM Rooms Table
CREATE TABLE IF NOT EXISTS crm_rooms (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Stay',
    status TEXT DEFAULT 'Available',
    price_per_night NUMERIC NOT NULL,
    max_guests INTEGER DEFAULT 2,
    amenities JSONB DEFAULT '[]'::jsonb,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 2. CRM Leads & Reservations Table
CREATE TABLE IF NOT EXISTS crm_leads (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    service_type TEXT DEFAULT 'Stay',
    status TEXT DEFAULT 'Pending',
    admin_notes TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 3. Staff Directory Table
CREATE TABLE IF NOT EXISTS crm_staff (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    joined_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 4. Shift Roster Table
CREATE TABLE IF NOT EXISTS crm_shifts (
    id TEXT PRIMARY KEY,
    staff_id TEXT REFERENCES crm_staff(id) ON DELETE CASCADE,
    staff_name TEXT NOT NULL,
    shift_date DATE NOT NULL,
    shift_type TEXT NOT NULL, -- Morning, Evening, Night
    status TEXT DEFAULT 'Scheduled',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 5. Leave Requests Table
CREATE TABLE IF NOT EXISTS crm_leaves (
    id TEXT PRIMARY KEY,
    staff_id TEXT REFERENCES crm_staff(id) ON DELETE CASCADE,
    staff_name TEXT NOT NULL,
    leave_type TEXT NOT NULL, -- Casual, Sick, Paid
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending', -- Pending, Approved, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 6. Housekeeping Tasks Table
CREATE TABLE IF NOT EXISTS crm_housekeeping (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    assigned_staff_name TEXT,
    status TEXT DEFAULT 'Pending', -- Pending, In Progress, Cleaned, Inspected
    last_cleaned TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 7. Maintenance Tickets Table
CREATE TABLE IF NOT EXISTS crm_maintenance (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    issue_description TEXT NOT NULL,
    priority TEXT DEFAULT 'Medium', -- Low, Medium, High, Urgent
    status TEXT DEFAULT 'Open', -- Open, In Progress, Resolved
    assigned_technician TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 8. Staff Task Kanban Table
CREATE TABLE IF NOT EXISTS crm_tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    assignee_name TEXT,
    priority TEXT DEFAULT 'Normal',
    status TEXT DEFAULT 'Todo', -- Todo, In Progress, Review, Completed
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS crm_payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT,
    customer_name TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    payment_method TEXT DEFAULT 'UPI',
    status TEXT DEFAULT 'Completed',
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Row Level Security (RLS) Policies
ALTER TABLE crm_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_housekeeping ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select rooms" ON crm_rooms FOR SELECT USING (true);
CREATE POLICY "Allow public select leads" ON crm_leads FOR SELECT USING (true);
CREATE POLICY "Allow public select staff" ON crm_staff FOR SELECT USING (true);
CREATE POLICY "Allow public select shifts" ON crm_shifts FOR SELECT USING (true);
CREATE POLICY "Allow public select leaves" ON crm_leaves FOR SELECT USING (true);
CREATE POLICY "Allow public select housekeeping" ON crm_housekeeping FOR SELECT USING (true);
CREATE POLICY "Allow public select maintenance" ON crm_maintenance FOR SELECT USING (true);
CREATE POLICY "Allow public select tasks" ON crm_tasks FOR SELECT USING (true);
CREATE POLICY "Allow public select payments" ON crm_payments FOR SELECT USING (true);
