-- =============================================================================
-- Murudeshwar CRM - Phase 2 Resort Operations Database Setup (NON-DESTRUCTIVE)
-- =============================================================================

-- 1. Laundry Inventory Table
CREATE TABLE IF NOT EXISTS public.laundry_inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_type TEXT NOT NULL CHECK (item_type IN ('Bedsheets', 'Towels', 'Blankets', 'Pillow Covers')),
    dirty_qty INTEGER DEFAULT 0 CHECK (dirty_qty >= 0),
    washing_qty INTEGER DEFAULT 0 CHECK (washing_qty >= 0),
    drying_qty INTEGER DEFAULT 0 CHECK (drying_qty >= 0),
    ready_qty INTEGER DEFAULT 0 CHECK (ready_qty >= 0),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.laundry_inventory ENABLE ROW LEVEL SECURITY;

-- 2. Lost & Found Items Table
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

-- Enable RLS
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

-- 3. Assets Table (AC, TV, etc. tracking per room)
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

-- Enable RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

-- 4. Customer Timeline Table
CREATE TABLE IF NOT EXISTS public.customer_timeline (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('Inquiry Created', 'Booking Confirmed', 'Payment Received', 'Check-In', 'Activity Booking', 'Complaint Raised', 'Check-Out')),
    description TEXT,
    reference_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.customer_timeline ENABLE ROW LEVEL SECURITY;

-- 5. Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Guest Document', 'Employee Document', 'Room Document', 'Maintenance Document')),
    reference_id UUID, -- References room_id, customer_id, staff_id, or request_id
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 6. Inventory Items Table
CREATE TABLE IF NOT EXISTS public.inventory_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Cleaning Supplies', 'Room Amenities', 'Restaurant Stock', 'Scuba Equipment', 'Rental Equipment')),
    quantity INTEGER NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    unit TEXT NOT NULL DEFAULT 'pcs',
    min_threshold INTEGER NOT NULL DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- 7. Task Comments Table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- 8. Task Activity Logs Table
CREATE TABLE IF NOT EXISTS public.task_activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.task_activity_logs ENABLE ROW LEVEL SECURITY;

-- 9. AI Tables (AI Search preparation, conversations, recommendation engine tables)
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
-- Triggers for updated_at
-- =============================================================================
DROP TRIGGER IF EXISTS set_laundry_inventory_updated_at ON public.laundry_inventory;
CREATE TRIGGER set_laundry_inventory_updated_at BEFORE UPDATE ON public.laundry_inventory
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_lost_found_items_updated_at ON public.lost_found_items;
CREATE TRIGGER set_lost_found_items_updated_at BEFORE UPDATE ON public.lost_found_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_assets_updated_at ON public.assets;
CREATE TRIGGER set_assets_updated_at BEFORE UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_inventory_items_updated_at ON public.inventory_items;
CREATE TRIGGER set_inventory_items_updated_at BEFORE UPDATE ON public.inventory_items
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- RLS Policies
-- =============================================================================
CREATE POLICY "Admins have full access to laundry" ON public.laundry_inventory FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view laundry" ON public.laundry_inventory FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update laundry status" ON public.laundry_inventory FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to lost_found_items" ON public.lost_found_items FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view lost_found_items" ON public.lost_found_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update lost_found_items" ON public.lost_found_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert lost_found_items" ON public.lost_found_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to assets" ON public.assets FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view assets" ON public.assets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update assets status" ON public.assets FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to customer_timeline" ON public.customer_timeline FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view customer_timeline" ON public.customer_timeline FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to documents" ON public.documents FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view documents" ON public.documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert documents" ON public.documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to inventory" ON public.inventory_items FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view inventory" ON public.inventory_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can update inventory quantity" ON public.inventory_items FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to task_comments" ON public.task_comments FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view task_comments" ON public.task_comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can insert task_comments" ON public.task_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to task_activity_logs" ON public.task_activity_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Staff can view task_activity_logs" ON public.task_activity_logs FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins have full access to ai_conversation_logs" ON public.ai_conversation_logs FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins have full access to ai_recommendations" ON public.ai_recommendations FOR ALL USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins have full access to ai_activity_logs" ON public.ai_activity_logs FOR ALL USING (public.is_admin(auth.uid()));
