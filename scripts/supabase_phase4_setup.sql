-- =============================================================================
-- Murudeshwara Resort CRM - Phase 4 Database Setup
-- Idempotent script to add Multi-Property, Communication Logs, and Reporting views
-- =============================================================================

-- 1. Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_name TEXT NOT NULL UNIQUE,
    location TEXT,
    contact_number TEXT,
    email TEXT,
    logo_url TEXT,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Set up basic policies for properties
CREATE POLICY select_properties_policy ON public.properties
    FOR SELECT TO authenticated USING (true);

CREATE POLICY modify_properties_policy ON public.properties
    FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Insert Default Property
INSERT INTO public.properties (id, property_name, location, contact_number, email, status)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Murudeshwara Resort',
    'Murudeshwar, Karnataka',
    '+91 8888888888',
    'contact@murudeshwararesort.com',
    'Active'
) ON CONFLICT (property_name) DO UPDATE 
SET location = EXCLUDED.location,
    contact_number = EXCLUDED.contact_number,
    email = EXCLUDED.email;

-- 2. Add property_id to existing tables with safety/idempotency
DO $$
BEGIN
    -- staff
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'property_id') THEN
        ALTER TABLE public.staff ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- rooms
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'rooms' AND column_name = 'property_id') THEN
        ALTER TABLE public.rooms ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- customers
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'customers' AND column_name = 'property_id') THEN
        ALTER TABLE public.customers ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- bookings
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bookings' AND column_name = 'property_id') THEN
        ALTER TABLE public.bookings ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- maintenance_requests
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'maintenance_requests' AND column_name = 'property_id') THEN
        ALTER TABLE public.maintenance_requests ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- housekeeping_tasks
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'housekeeping_tasks' AND column_name = 'property_id') THEN
        ALTER TABLE public.housekeeping_tasks ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- inventory_items
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'inventory_items' AND column_name = 'property_id') THEN
        ALTER TABLE public.inventory_items ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- crm_restaurant_orders
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_restaurant_orders' AND column_name = 'property_id') THEN
        ALTER TABLE public.crm_restaurant_orders ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- crm_rentals
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_rentals' AND column_name = 'property_id') THEN
        ALTER TABLE public.crm_rentals ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- crm_scuba_schedule
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_scuba_schedule' AND column_name = 'property_id') THEN
        ALTER TABLE public.crm_scuba_schedule ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- crm_payments
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_payments' AND column_name = 'property_id') THEN
        ALTER TABLE public.crm_payments ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
    -- crm_invoices
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'crm_invoices' AND column_name = 'property_id') THEN
        ALTER TABLE public.crm_invoices ADD COLUMN property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Default existing records to the default property ID
UPDATE public.staff SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.rooms SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.customers SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.bookings SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.maintenance_requests SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.housekeeping_tasks SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.inventory_items SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.crm_restaurant_orders SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.crm_rentals SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.crm_scuba_schedule SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.crm_payments SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;
UPDATE public.crm_invoices SET property_id = '00000000-0000-0000-0000-000000000001' WHERE property_id IS NULL;

-- 4. Create Communication Tables
CREATE TABLE IF NOT EXISTS public.communication_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
    type TEXT NOT NULL,
    template_name TEXT,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    payload JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.scheduled_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    recipient TEXT NOT NULL,
    channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email')),
    type TEXT NOT NULL,
    template_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
    send_at TIMESTAMP WITH TIME ZONE NOT NULL,
    payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    recipient TEXT NOT NULL,
    subject TEXT,
    body TEXT,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    recipient TEXT NOT NULL,
    message TEXT,
    template_name TEXT,
    status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for communication tables
ALTER TABLE public.communication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for communication tables
CREATE POLICY communication_logs_policy ON public.communication_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY scheduled_messages_policy ON public.scheduled_messages
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY email_logs_policy ON public.email_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY whatsapp_logs_policy ON public.whatsapp_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Helper & Analytical Views

-- Revenue by Property View
CREATE OR REPLACE VIEW public.view_revenue_by_property AS
SELECT 
    COALESCE(p.id, '00000000-0000-0000-0000-000000000001') AS property_id,
    COALESCE(p.property_name, 'Murudeshwara Resort') AS property_name,
    DATE_TRUNC('day', pay.payment_date) AS payment_date,
    SUM(pay.amount) AS total_revenue,
    COUNT(pay.id) AS transaction_count
FROM public.crm_payments pay
LEFT JOIN public.properties p ON pay.property_id = p.id
WHERE pay.status = 'Successful'
GROUP BY p.id, p.property_name, DATE_TRUNC('day', pay.payment_date);

-- Occupancy by Property View
CREATE OR REPLACE VIEW public.view_occupancy_by_property AS
SELECT 
    COALESCE(p.id, '00000000-0000-0000-0000-000000000001') AS property_id,
    COALESCE(p.property_name, 'Murudeshwara Resort') AS property_name,
    COUNT(r.id) FILTER (WHERE r.status = 'Occupied') AS occupied_rooms,
    COUNT(r.id) FILTER (WHERE r.status = 'Reserved') AS reserved_rooms,
    COUNT(r.id) FILTER (WHERE r.status = 'Available') AS available_rooms,
    COUNT(r.id) FILTER (WHERE r.status = 'Cleaning') AS cleaning_rooms,
    COUNT(r.id) FILTER (WHERE r.status = 'Maintenance') AS maintenance_rooms,
    COUNT(r.id) AS total_rooms,
    ROUND(
        (COUNT(r.id) FILTER (WHERE r.status = 'Occupied')::DECIMAL / 
         NULLIF(COUNT(r.id), 0) * 100), 2
    ) AS occupancy_percentage
FROM public.rooms r
LEFT JOIN public.properties p ON r.property_id = p.id
GROUP BY p.id, p.property_name;

-- Staff Task Performance View
CREATE OR REPLACE VIEW public.view_staff_performance AS
SELECT 
    s.id AS staff_id,
    s.full_name,
    COALESCE(s.property_id, '00000000-0000-0000-0000-000000000001') AS property_id,
    COUNT(t.id) AS total_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'Completed') AS completed_tasks,
    COUNT(t.id) FILTER (WHERE t.status = 'In Progress') AS active_tasks,
    ROUND(
        (COUNT(t.id) FILTER (WHERE t.status = 'Completed')::DECIMAL / 
         NULLIF(COUNT(t.id), 0) * 100), 2
    ) AS completion_rate
FROM public.staff s
LEFT JOIN public.housekeeping_tasks t ON t.assigned_staff_id = s.id
GROUP BY s.id, s.full_name, s.property_id;

-- Inventory Status View
CREATE OR REPLACE VIEW public.view_inventory_status AS
SELECT 
    i.id AS item_id,
    i.name,
    i.quantity,
    i.min_quantity,
    COALESCE(i.property_id, '00000000-0000-0000-0000-000000000001') AS property_id,
    CASE 
        WHEN i.quantity <= i.min_quantity THEN 'Low Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM public.inventory_items i;

-- Add updated_at trigger helper for properties
CREATE TRIGGER set_properties_updated_at BEFORE UPDATE ON public.properties
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
