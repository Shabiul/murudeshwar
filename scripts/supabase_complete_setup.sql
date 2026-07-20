-- =============================================================================
-- Murudeshwara Resort CRM - Complete Unified Database Setup (Idempotent)
-- Consolidates Phase 1, Phase 2, and Phase 3 operations
-- =============================================================================

-- =============================================================================
-- 1. Helper Functions & Trigger Handlers
-- =============================================================================

-- Trigger function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Check if user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins'
    ) AND EXISTS (
        SELECT 1 FROM public.admins WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fetch full name of user (admin or staff)
CREATE OR REPLACE FUNCTION public.get_user_name(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_name TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'admins') THEN
        SELECT full_name INTO v_name FROM public.admins WHERE id = user_id;
        IF v_name IS NOT NULL THEN
            RETURN v_name;
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'staff') THEN
        SELECT full_name INTO v_name FROM public.staff WHERE id = user_id;
        RETURN v_name;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger function to log audit entries automatically
CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
    v_old_values JSONB;
    v_new_values JSONB;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'audit_logs'
    ) THEN
        IF TG_OP = 'DELETE' THEN
            RETURN OLD;
        ELSE
            RETURN NEW;
        END IF;
    END IF;

    IF TG_OP = 'INSERT' THEN
        v_action = 'INSERT';
        v_old_values = NULL;
        v_new_values = to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action = 'UPDATE';
        v_old_values = to_jsonb(OLD);
        v_new_values = to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_action = 'DELETE';
        v_old_values = to_jsonb(OLD);
        v_new_values = NULL;
    END IF;

    INSERT INTO public.audit_logs (
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        performed_by,
        performed_by_name
    ) VALUES (
        v_action,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id 
            ELSE NEW.id 
        END,
        v_old_values,
        v_new_values,
        auth.uid(),
        public.get_user_name(auth.uid())
    );

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================================================
-- 2. Prerequisite Core Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    hire_date DATE,
    categories TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('Stay', 'Scuba', 'Bike', 'Contact')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    admin_notes TEXT,
    details JSONB,
    assigned_to UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    performed_by UUID REFERENCES auth.users(id),
    performed_by_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. Phase 1 Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    vip_tag BOOLEAN DEFAULT false,
    blacklist_tag BOOLEAN DEFAULT false,
    preferred_room TEXT,
    preferred_activities TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_food TEXT,
    preferred_payment_method TEXT,
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    gov_id_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_number TEXT NOT NULL UNIQUE,
    room_type TEXT NOT NULL CHECK (room_type IN ('Standard Room', 'Deluxe Room', 'Suite', 'Family Room', 'Beachfront Villa')),
    floor INTEGER NOT NULL DEFAULT 1,
    capacity INTEGER NOT NULL DEFAULT 2,
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Reserved', 'Occupied', 'Cleaning', 'Maintenance', 'Inspection', 'Out of Service')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.housekeeping_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Inspection', 'Completed')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
    assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.maintenance_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Electrical', 'Plumbing', 'Furniture', 'AC', 'Television', 'WiFi', 'Water Leakage', 'Painting', 'Civil Repairs')),
    priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Emergency')),
    status TEXT NOT NULL DEFAULT 'Reported' CHECK (status IN ('Reported', 'Assigned', 'Working', 'Completed', 'Verified')),
    description TEXT NOT NULL,
    assigned_staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
    reported_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    department TEXT NOT NULL CHECK (department IN ('Reception', 'Housekeeping', 'Maintenance', 'Restaurant', 'Scuba', 'Rentals')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled', 'Overdue')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
    read BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. Phase 2 Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.laundry_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_type TEXT NOT NULL CHECK (item_type IN ('Bedsheets', 'Towels', 'Blankets', 'Pillow Covers')),
    dirty_qty INTEGER DEFAULT 0 CHECK (dirty_qty >= 0),
    washing_qty INTEGER DEFAULT 0 CHECK (washing_qty >= 0),
    drying_qty INTEGER DEFAULT 0 CHECK (drying_qty >= 0),
    ready_qty INTEGER DEFAULT 0 CHECK (ready_qty >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.laundry_inventory ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.lost_found_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_name TEXT NOT NULL,
    found_by TEXT NOT NULL,
    found_location TEXT NOT NULL,
    image_url TEXT,
    claimed_status TEXT DEFAULT 'Unclaimed' CHECK (claimed_status IN ('Unclaimed', 'Claimed')),
    claimed_by_name TEXT,
    claimed_by_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('AC', 'TV', 'Furniture', 'Plumbing', 'Electrical', 'WiFi')),
    room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Operational' CHECK (status IN ('Operational', 'Needs Repair', 'Under Maintenance', 'Broken')),
    serial_number TEXT,
    last_inspected_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.customer_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('Inquiry Created', 'Booking Confirmed', 'Payment Received', 'Check-In', 'Activity Booking', 'Complaint Raised', 'Check-Out')),
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.customer_timeline ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Guest Document', 'Employee Document', 'Room Document', 'Maintenance Document')),
    reference_id UUID,
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Cleaning Supplies', 'Room Amenities', 'Restaurant Stock', 'Scuba Equipment', 'Rental Equipment')),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'pcs',
    min_threshold INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.task_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.ai_conversation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.ai_conversation_logs ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.ai_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    recommendation_text TEXT NOT NULL,
    confidence_score NUMERIC(3,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.ai_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.ai_activity_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. Phase 3 Tables
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.crm_visitors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    vehicle_number TEXT,
    purpose TEXT NOT NULL,
    entry_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    exit_time TIMESTAMP WITH TIME ZONE,
    parking_slot TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_visitors ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_leaves (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected')),
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_leaves ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    shift_type TEXT NOT NULL CHECK (shift_type IN ('Morning', 'Evening', 'Night')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_shifts ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('UPI', 'Card', 'Bank Transfer', 'Cash')),
    payment_type TEXT DEFAULT 'Advance' CHECK (payment_type IN ('Advance', 'Final Payment', 'Refund')),
    status TEXT DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_payments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_number TEXT UNIQUE NOT NULL,
    booking_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0.00,
    tax NUMERIC(10, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Partially Paid', 'Paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_invoices ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_restaurant_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number TEXT,
    room_number TEXT,
    order_items JSONB NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Preparing', 'Served', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_restaurant_orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_scuba_schedule (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dive_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    instructor_name TEXT NOT NULL,
    boat_name TEXT,
    medical_waiver_checked BOOLEAN DEFAULT FALSE,
    max_divers INTEGER DEFAULT 6,
    divers_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_scuba_schedule ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_rentals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('Bike', 'Scooter', 'Car')),
    model_name TEXT NOT NULL,
    license_plate TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    rental_start TIMESTAMP WITH TIME ZONE NOT NULL,
    rental_end TIMESTAMP WITH TIME ZONE,
    rate_per_day NUMERIC(10, 2) NOT NULL,
    damage_notes TEXT,
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Returned', 'Damaged')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_rentals ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. Table & Schema Modifications
-- =============================================================================

-- Add customer_id reference to leads table if it does not already exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'leads' 
          AND column_name = 'customer_id'
    ) THEN
        ALTER TABLE public.leads ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================================================
-- 7. High-Performance Indexes
-- =============================================================================

-- Customers
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_vip ON public.customers(vip_tag) WHERE vip_tag = true;
CREATE INDEX IF NOT EXISTS idx_customers_blacklist ON public.customers(blacklist_tag) WHERE blacklist_tag = true;

-- Rooms
CREATE INDEX IF NOT EXISTS idx_rooms_room_number ON public.rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- Housekeeping Tasks
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_room ON public.housekeeping_tasks(room_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_staff ON public.housekeeping_tasks(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_housekeeping_tasks_status ON public.housekeeping_tasks(status);

-- Maintenance Requests
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_room ON public.maintenance_requests(room_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_staff ON public.maintenance_requests(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_requests_status ON public.maintenance_requests(status);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read) WHERE read = false;

-- Assets
CREATE INDEX IF NOT EXISTS idx_assets_room_id ON public.assets(room_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);

-- Customer Timeline
CREATE INDEX IF NOT EXISTS idx_customer_timeline_customer ON public.customer_timeline(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_timeline_event ON public.customer_timeline(event_type);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_reference_id ON public.documents(reference_id);
CREATE INDEX IF NOT EXISTS idx_documents_uploaded_by ON public.documents(uploaded_by);

-- Inventory Items
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON public.inventory_items(category);

-- Task Comments & Activity Logs
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_activity_logs_task ON public.task_activity_logs(task_id);

-- CRM Leaves & Shifts
CREATE INDEX IF NOT EXISTS idx_crm_leaves_staff ON public.crm_leaves(staff_id);
CREATE INDEX IF NOT EXISTS idx_crm_leaves_status ON public.crm_leaves(status);
CREATE INDEX IF NOT EXISTS idx_crm_shifts_staff_date ON public.crm_shifts(staff_id, shift_date);

-- CRM Payments & Invoices
CREATE INDEX IF NOT EXISTS idx_crm_payments_booking ON public.crm_payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_crm_invoices_booking ON public.crm_invoices(booking_id);
CREATE INDEX IF NOT EXISTS idx_crm_invoices_number ON public.crm_invoices(invoice_number);

-- CRM Restaurant Orders
CREATE INDEX IF NOT EXISTS idx_crm_restaurant_orders_room ON public.crm_restaurant_orders(room_number);
CREATE INDEX IF NOT EXISTS idx_crm_restaurant_orders_status ON public.crm_restaurant_orders(status);

-- CRM Scuba Schedule
CREATE INDEX IF NOT EXISTS idx_crm_scuba_schedule_date ON public.crm_scuba_schedule(dive_date);

-- CRM Rentals
CREATE INDEX IF NOT EXISTS idx_crm_rentals_plate ON public.crm_rentals(license_plate);
CREATE INDEX IF NOT EXISTS idx_crm_rentals_status ON public.crm_rentals(status);

-- =============================================================================
-- 8. Updated At & Audit Log Triggers
-- =============================================================================

-- Drop triggers to ensure idempotency
DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
DROP TRIGGER IF EXISTS set_rooms_updated_at ON public.rooms;
DROP TRIGGER IF EXISTS set_housekeeping_tasks_updated_at ON public.housekeeping_tasks;
DROP TRIGGER IF EXISTS set_maintenance_requests_updated_at ON public.maintenance_requests;
DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS set_laundry_inventory_updated_at ON public.laundry_inventory;
DROP TRIGGER IF EXISTS set_lost_found_items_updated_at ON public.lost_found_items;
DROP TRIGGER IF EXISTS set_assets_updated_at ON public.assets;
DROP TRIGGER IF EXISTS set_inventory_items_updated_at ON public.inventory_items;

DROP TRIGGER IF EXISTS audit_customers_changes ON public.customers;
DROP TRIGGER IF EXISTS audit_rooms_changes ON public.rooms;
DROP TRIGGER IF EXISTS audit_housekeeping_tasks_changes ON public.housekeeping_tasks;
DROP TRIGGER IF EXISTS audit_maintenance_requests_changes ON public.maintenance_requests;
DROP TRIGGER IF EXISTS audit_tasks_changes ON public.tasks;

-- Recreate updated_at triggers
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_rooms_updated_at BEFORE UPDATE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_housekeeping_tasks_updated_at BEFORE UPDATE ON public.housekeeping_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_laundry_inventory_updated_at BEFORE UPDATE ON public.laundry_inventory
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_lost_found_items_updated_at BEFORE UPDATE ON public.lost_found_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_assets_updated_at BEFORE UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Recreate audit log triggers
CREATE TRIGGER audit_customers_changes AFTER INSERT OR UPDATE OR DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_rooms_changes AFTER INSERT OR UPDATE OR DELETE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_housekeeping_tasks_changes AFTER INSERT OR UPDATE OR DELETE ON public.housekeeping_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_maintenance_requests_changes AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

CREATE TRIGGER audit_tasks_changes AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- =============================================================================
-- 9. Row Level Security (RLS) Policies
-- =============================================================================

-- Customers Policies
DROP POLICY IF EXISTS "Admins have full access to customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can view customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can insert customers" ON public.customers;
DROP POLICY IF EXISTS "Staff can update customers" ON public.customers;

CREATE POLICY "Admins have full access to customers" ON public.customers FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view customers" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert customers" ON public.customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update customers" ON public.customers FOR UPDATE USING (auth.role() = 'authenticated');

-- Rooms Policies
DROP POLICY IF EXISTS "Admins have full access to rooms" ON public.rooms;
DROP POLICY IF EXISTS "Staff can view rooms" ON public.rooms;
DROP POLICY IF EXISTS "Staff can update rooms status" ON public.rooms;

CREATE POLICY "Admins have full access to rooms" ON public.rooms FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view rooms" ON public.rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update rooms status" ON public.rooms FOR UPDATE USING (auth.role() = 'authenticated');

-- Housekeeping Policies
DROP POLICY IF EXISTS "Admins have full access to housekeeping_tasks" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "Staff can view housekeeping_tasks" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "Staff can update assigned housekeeping_tasks" ON public.housekeeping_tasks;

CREATE POLICY "Admins have full access to housekeeping_tasks" ON public.housekeeping_tasks FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view housekeeping_tasks" ON public.housekeeping_tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update assigned housekeeping_tasks" ON public.housekeeping_tasks FOR UPDATE USING (auth.role() = 'authenticated');

-- Maintenance Policies
DROP POLICY IF EXISTS "Admins have full access to maintenance_requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Staff can view maintenance_requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Staff can update maintenance_requests" ON public.maintenance_requests;
DROP POLICY IF EXISTS "Staff can insert maintenance_requests" ON public.maintenance_requests;

CREATE POLICY "Admins have full access to maintenance_requests" ON public.maintenance_requests FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view maintenance_requests" ON public.maintenance_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update maintenance_requests" ON public.maintenance_requests FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert maintenance_requests" ON public.maintenance_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tasks Policies
DROP POLICY IF EXISTS "Admins have full access to tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff can view tasks" ON public.tasks;
DROP POLICY IF EXISTS "Staff can update their own tasks" ON public.tasks;

CREATE POLICY "Admins have full access to tasks" ON public.tasks FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view tasks" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update their own tasks" ON public.tasks FOR UPDATE USING (assigned_to = auth.uid());

-- Notifications Policies
DROP POLICY IF EXISTS "Admins have full access to notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own or global notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Admins have full access to notifications" ON public.notifications FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view their own or global notifications" ON public.notifications FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Laundry Policies
DROP POLICY IF EXISTS "Admins have full access to laundry" ON public.laundry_inventory;
DROP POLICY IF EXISTS "Staff can view laundry" ON public.laundry_inventory;
DROP POLICY IF EXISTS "Staff can update laundry status" ON public.laundry_inventory;

CREATE POLICY "Admins have full access to laundry" ON public.laundry_inventory FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view laundry" ON public.laundry_inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update laundry status" ON public.laundry_inventory FOR UPDATE USING (auth.role() = 'authenticated');

-- Lost & Found Policies
DROP POLICY IF EXISTS "Admins have full access to lost_found_items" ON public.lost_found_items;
DROP POLICY IF EXISTS "Staff can view lost_found_items" ON public.lost_found_items;
DROP POLICY IF EXISTS "Staff can update lost_found_items" ON public.lost_found_items;
DROP POLICY IF EXISTS "Staff can insert lost_found_items" ON public.lost_found_items;

CREATE POLICY "Admins have full access to lost_found_items" ON public.lost_found_items FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view lost_found_items" ON public.lost_found_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update lost_found_items" ON public.lost_found_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert lost_found_items" ON public.lost_found_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Assets Policies
DROP POLICY IF EXISTS "Admins have full access to assets" ON public.assets;
DROP POLICY IF EXISTS "Staff can view assets" ON public.assets;
DROP POLICY IF EXISTS "Staff can update assets status" ON public.assets;

CREATE POLICY "Admins have full access to assets" ON public.assets FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view assets" ON public.assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update assets status" ON public.assets FOR UPDATE USING (auth.role() = 'authenticated');

-- Customer Timeline Policies
DROP POLICY IF EXISTS "Admins have full access to customer_timeline" ON public.customer_timeline;
DROP POLICY IF EXISTS "Staff can view customer_timeline" ON public.customer_timeline;

CREATE POLICY "Admins have full access to customer_timeline" ON public.customer_timeline FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view customer_timeline" ON public.customer_timeline FOR SELECT USING (auth.role() = 'authenticated');

-- Documents Policies
DROP POLICY IF EXISTS "Admins have full access to documents" ON public.documents;
DROP POLICY IF EXISTS "Staff can view documents" ON public.documents;
DROP POLICY IF EXISTS "Staff can insert documents" ON public.documents;

CREATE POLICY "Admins have full access to documents" ON public.documents FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view documents" ON public.documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert documents" ON public.documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Inventory Policies
DROP POLICY IF EXISTS "Admins have full access to inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Staff can view inventory" ON public.inventory_items;
DROP POLICY IF EXISTS "Staff can update inventory quantity" ON public.inventory_items;

CREATE POLICY "Admins have full access to inventory" ON public.inventory_items FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view inventory" ON public.inventory_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update inventory quantity" ON public.inventory_items FOR UPDATE USING (auth.role() = 'authenticated');

-- Task Comments Policies
DROP POLICY IF EXISTS "Admins have full access to task_comments" ON public.task_comments;
DROP POLICY IF EXISTS "Staff can view task_comments" ON public.task_comments;
DROP POLICY IF EXISTS "Staff can insert task_comments" ON public.task_comments;

CREATE POLICY "Admins have full access to task_comments" ON public.task_comments FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view task_comments" ON public.task_comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert task_comments" ON public.task_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Task Activity Logs Policies
DROP POLICY IF EXISTS "Admins have full access to task_activity_logs" ON public.task_activity_logs;
DROP POLICY IF EXISTS "Staff can view task_activity_logs" ON public.task_activity_logs;

CREATE POLICY "Admins have full access to task_activity_logs" ON public.task_activity_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view task_activity_logs" ON public.task_activity_logs FOR SELECT USING (auth.role() = 'authenticated');

-- AI Logs, Recommendations, Activity Policies
DROP POLICY IF EXISTS "Admins have full access to ai_conversation_logs" ON public.ai_conversation_logs;
DROP POLICY IF EXISTS "Admins have full access to ai_recommendations" ON public.ai_recommendations;
DROP POLICY IF EXISTS "Admins have full access to ai_activity_logs" ON public.ai_activity_logs;

CREATE POLICY "Admins have full access to ai_conversation_logs" ON public.ai_conversation_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins have full access to ai_recommendations" ON public.ai_recommendations FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins have full access to ai_activity_logs" ON public.ai_activity_logs FOR ALL USING (public.is_admin(auth.uid()));

-- CRM Visitors Policies
DROP POLICY IF EXISTS "Admins have full access to crm_visitors" ON public.crm_visitors;
DROP POLICY IF EXISTS "Staff can view crm_visitors" ON public.crm_visitors;
DROP POLICY IF EXISTS "Staff can insert crm_visitors" ON public.crm_visitors;
DROP POLICY IF EXISTS "Staff can update crm_visitors" ON public.crm_visitors;

CREATE POLICY "Admins have full access to crm_visitors" ON public.crm_visitors FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_visitors" ON public.crm_visitors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_visitors" ON public.crm_visitors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update crm_visitors" ON public.crm_visitors FOR UPDATE USING (auth.role() = 'authenticated');

-- CRM Leaves Policies
DROP POLICY IF EXISTS "Admins have full access to crm_leaves" ON public.crm_leaves;
DROP POLICY IF EXISTS "Staff can view crm_leaves" ON public.crm_leaves;
DROP POLICY IF EXISTS "Staff can insert crm_leaves" ON public.crm_leaves;

CREATE POLICY "Admins have full access to crm_leaves" ON public.crm_leaves FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_leaves" ON public.crm_leaves FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_leaves" ON public.crm_leaves FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CRM Shifts Policies
DROP POLICY IF EXISTS "Admins have full access to crm_shifts" ON public.crm_shifts;
DROP POLICY IF EXISTS "Staff can view crm_shifts" ON public.crm_shifts;

CREATE POLICY "Admins have full access to crm_shifts" ON public.crm_shifts FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_shifts" ON public.crm_shifts FOR SELECT USING (auth.role() = 'authenticated');

-- CRM Payments Policies
DROP POLICY IF EXISTS "Admins have full access to crm_payments" ON public.crm_payments;
DROP POLICY IF EXISTS "Staff can view crm_payments" ON public.crm_payments;
DROP POLICY IF EXISTS "Staff can insert crm_payments" ON public.crm_payments;

CREATE POLICY "Admins have full access to crm_payments" ON public.crm_payments FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_payments" ON public.crm_payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_payments" ON public.crm_payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CRM Invoices Policies
DROP POLICY IF EXISTS "Admins have full access to crm_invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Staff can view crm_invoices" ON public.crm_invoices;
DROP POLICY IF EXISTS "Staff can insert crm_invoices" ON public.crm_invoices;

CREATE POLICY "Admins have full access to crm_invoices" ON public.crm_invoices FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_invoices" ON public.crm_invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_invoices" ON public.crm_invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- CRM Restaurant Orders Policies
DROP POLICY IF EXISTS "Admins have full access to crm_restaurant_orders" ON public.crm_restaurant_orders;
DROP POLICY IF EXISTS "Staff can view crm_restaurant_orders" ON public.crm_restaurant_orders;
DROP POLICY IF EXISTS "Staff can insert crm_restaurant_orders" ON public.crm_restaurant_orders;
DROP POLICY IF EXISTS "Staff can update crm_restaurant_orders" ON public.crm_restaurant_orders;

CREATE POLICY "Admins have full access to crm_restaurant_orders" ON public.crm_restaurant_orders FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_restaurant_orders" ON public.crm_restaurant_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_restaurant_orders" ON public.crm_restaurant_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update crm_restaurant_orders" ON public.crm_restaurant_orders FOR UPDATE USING (auth.role() = 'authenticated');

-- CRM Scuba Policies
DROP POLICY IF EXISTS "Admins have full access to crm_scuba_schedule" ON public.crm_scuba_schedule;
DROP POLICY IF EXISTS "Staff can view crm_scuba_schedule" ON public.crm_scuba_schedule;
DROP POLICY IF EXISTS "Staff can insert crm_scuba_schedule" ON public.crm_scuba_schedule;
DROP POLICY IF EXISTS "Staff can update crm_scuba_schedule" ON public.crm_scuba_schedule;

CREATE POLICY "Admins have full access to crm_scuba_schedule" ON public.crm_scuba_schedule FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_scuba_schedule" ON public.crm_scuba_schedule FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_scuba_schedule" ON public.crm_scuba_schedule FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update crm_scuba_schedule" ON public.crm_scuba_schedule FOR UPDATE USING (auth.role() = 'authenticated');

-- CRM Rentals Policies
DROP POLICY IF EXISTS "Admins have full access to crm_rentals" ON public.crm_rentals;
DROP POLICY IF EXISTS "Staff can view crm_rentals" ON public.crm_rentals;
DROP POLICY IF EXISTS "Staff can insert crm_rentals" ON public.crm_rentals;
DROP POLICY IF EXISTS "Staff can update crm_rentals" ON public.crm_rentals;

CREATE POLICY "Admins have full access to crm_rentals" ON public.crm_rentals FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_rentals" ON public.crm_rentals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_rentals" ON public.crm_rentals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update crm_rentals" ON public.crm_rentals FOR UPDATE USING (auth.role() = 'authenticated');
