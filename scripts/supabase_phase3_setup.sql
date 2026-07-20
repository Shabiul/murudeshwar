-- =============================================================================
-- Murudeshwar CRM - Phase 3 Guest & Resort Management Platform (NON-DESTRUCTIVE)
-- =============================================================================

-- 1. Visitor Logs Table
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

-- 2. Staff Leaves Table
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

-- 3. Staff Shifts Table
CREATE TABLE IF NOT EXISTS public.crm_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    staff_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    shift_type TEXT NOT NULL CHECK (shift_type IN ('Morning', 'Evening', 'Night')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.crm_shifts ENABLE ROW LEVEL SECURITY;

-- 4. Payments Table
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

-- 5. Invoices Table
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

-- 6. Restaurant Orders Table
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

-- 7. Scuba Dive Schedule Table
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

-- 8. Equipment & Vehicle Rentals Table
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
-- RLS Policies
-- =============================================================================
CREATE POLICY "Admins have full access to crm_visitors" ON public.crm_visitors FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_visitors" ON public.crm_visitors FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_visitors" ON public.crm_visitors FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update crm_visitors" ON public.crm_visitors FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to crm_leaves" ON public.crm_leaves FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_leaves" ON public.crm_leaves FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_leaves" ON public.crm_leaves FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to crm_shifts" ON public.crm_shifts FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_shifts" ON public.crm_shifts FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to crm_payments" ON public.crm_payments FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_payments" ON public.crm_payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_payments" ON public.crm_payments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to crm_invoices" ON public.crm_invoices FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_invoices" ON public.crm_invoices FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_invoices" ON public.crm_invoices FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to crm_restaurant_orders" ON public.crm_restaurant_orders FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_restaurant_orders" ON public.crm_restaurant_orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_restaurant_orders" ON public.crm_restaurant_orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update crm_restaurant_orders" ON public.crm_restaurant_orders FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to crm_scuba_schedule" ON public.crm_scuba_schedule FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_scuba_schedule" ON public.crm_scuba_schedule FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update crm_scuba_schedule" ON public.crm_scuba_schedule FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_scuba_schedule" ON public.crm_scuba_schedule FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to crm_rentals" ON public.crm_rentals FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view crm_rentals" ON public.crm_rentals FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert crm_rentals" ON public.crm_rentals FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update crm_rentals" ON public.crm_rentals FOR UPDATE USING (auth.role() = 'authenticated');
