-- =============================================================================
-- Murudeshwar CRM - Phase 1 Resort Operations Database Setup (NON-DESTRUCTIVE)
-- =============================================================================

-- 1. Customers Table
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

-- Enable RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 2. Rooms Table
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

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 3. Housekeeping Tasks Table
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

-- Enable RLS
ALTER TABLE public.housekeeping_tasks ENABLE ROW LEVEL SECURITY;

-- 4. Maintenance Requests Table
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

-- Enable RLS
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;

-- 5. Tasks Table
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

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'alert')),
    read BOOLEAN DEFAULT false,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 7. Add customer_id reference to leads table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'customer_id') THEN
        ALTER TABLE public.leads ADD COLUMN customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =============================================================================
-- Triggers for updated_at
-- =============================================================================
DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_rooms_updated_at ON public.rooms;
CREATE TRIGGER set_rooms_updated_at BEFORE UPDATE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_housekeeping_tasks_updated_at ON public.housekeeping_tasks;
CREATE TRIGGER set_housekeeping_tasks_updated_at BEFORE UPDATE ON public.housekeeping_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_maintenance_requests_updated_at ON public.maintenance_requests;
CREATE TRIGGER set_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_tasks_updated_at ON public.tasks;
CREATE TRIGGER set_tasks_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- Audit Logs Triggers
-- =============================================================================
DROP TRIGGER IF EXISTS audit_customers_changes ON public.customers;
CREATE TRIGGER audit_customers_changes AFTER INSERT OR UPDATE OR DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

DROP TRIGGER IF EXISTS audit_rooms_changes ON public.rooms;
CREATE TRIGGER audit_rooms_changes AFTER INSERT OR UPDATE OR DELETE ON public.rooms
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

DROP TRIGGER IF EXISTS audit_housekeeping_tasks_changes ON public.housekeeping_tasks;
CREATE TRIGGER audit_housekeeping_tasks_changes AFTER INSERT OR UPDATE OR DELETE ON public.housekeeping_tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

DROP TRIGGER IF EXISTS audit_maintenance_requests_changes ON public.maintenance_requests;
CREATE TRIGGER audit_maintenance_requests_changes AFTER INSERT OR UPDATE OR DELETE ON public.maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

DROP TRIGGER IF EXISTS audit_tasks_changes ON public.tasks;
CREATE TRIGGER audit_tasks_changes AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Customers Policies
CREATE POLICY "Admins have full access to customers" ON public.customers FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view customers" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert customers" ON public.customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update customers" ON public.customers FOR UPDATE USING (auth.role() = 'authenticated');

-- Rooms Policies
CREATE POLICY "Admins have full access to rooms" ON public.rooms FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view rooms" ON public.rooms FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update rooms status" ON public.rooms FOR UPDATE USING (auth.role() = 'authenticated');

-- Housekeeping Policies
CREATE POLICY "Admins have full access to housekeeping_tasks" ON public.housekeeping_tasks FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view housekeeping_tasks" ON public.housekeeping_tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update assigned housekeeping_tasks" ON public.housekeeping_tasks FOR UPDATE USING (auth.role() = 'authenticated');

-- Maintenance Policies
CREATE POLICY "Admins have full access to maintenance_requests" ON public.maintenance_requests FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view maintenance_requests" ON public.maintenance_requests FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update maintenance_requests" ON public.maintenance_requests FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert maintenance_requests" ON public.maintenance_requests FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Tasks Policies
CREATE POLICY "Admins have full access to tasks" ON public.tasks FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view tasks" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update their own tasks" ON public.tasks FOR UPDATE USING (assigned_to = auth.uid());

-- Notifications Policies
CREATE POLICY "Admins have full access to notifications" ON public.notifications FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Users can view their own or global notifications" ON public.notifications FOR SELECT USING (user_id IS NULL OR user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
