-- =============================================================================
-- Murudeshwar CRM Database Setup (Separate Admin & Staff Tables - NON-DESTRUCTIVE)
-- Supabase Compatible Version
-- =============================================================================

-- =============================================================================
-- 1. Ensure Leads Table Exists (with all columns)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('Stay', 'Scuba', 'Bike', 'Contact')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    admin_notes TEXT,
    details JSONB,
    assigned_to UUID, -- Can reference either staff.id OR admins.id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'assigned_to') THEN
        ALTER TABLE public.leads ADD COLUMN assigned_to UUID;
    END IF;
END $$;

-- Enable RLS on leads (if not already enabled)
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 2. Ensure Lead Attachments Table Exists
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.lead_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    file_size BIGINT,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on lead_attachments
ALTER TABLE public.lead_attachments ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. Ensure Admins Table Exists
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add missing columns to admins
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.admins ADD COLUMN avatar_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'admins' AND column_name = 'phone') THEN
        ALTER TABLE public.admins ADD COLUMN phone TEXT;
    END IF;
END $$;

-- Enable RLS on admins
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 4. Ensure Staff Table Exists (with all profile fields)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    bio TEXT,
    hire_date DATE,
    categories TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL, -- ['Stay', 'Scuba', 'Bike', 'Contact']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add missing columns to staff
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'avatar_url') THEN
        ALTER TABLE public.staff ADD COLUMN avatar_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'phone') THEN
        ALTER TABLE public.staff ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'bio') THEN
        ALTER TABLE public.staff ADD COLUMN bio TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'hire_date') THEN
        ALTER TABLE public.staff ADD COLUMN hire_date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'is_active') THEN
        ALTER TABLE public.staff ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'staff' AND column_name = 'categories') THEN
        ALTER TABLE public.staff ADD COLUMN categories TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL;
    END IF;
END $$;

-- Enable RLS on staff
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. Ensure Audit Logs Table Exists
-- =============================================================================
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

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 6. Helper Function to Check if a User is an Admin
-- =============================================================================
DROP FUNCTION IF EXISTS public.is_admin(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.admins WHERE id = user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 7. Helper Function to Get User's Role
-- =============================================================================
DROP FUNCTION IF EXISTS public.get_user_role(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM public.admins WHERE id = user_id) THEN
        RETURN 'admin';
    ELSIF EXISTS (SELECT 1 FROM public.staff WHERE id = user_id) THEN
        RETURN 'staff';
    ELSE
        RETURN NULL;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 8. Helper Function to Get User's Name
-- =============================================================================
DROP FUNCTION IF EXISTS public.get_user_name(UUID) CASCADE;
CREATE OR REPLACE FUNCTION public.get_user_name(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_name TEXT;
BEGIN
    SELECT full_name INTO v_name FROM public.admins WHERE id = user_id;
    IF v_name IS NOT NULL THEN
        RETURN v_name;
    END IF;
    
    SELECT full_name INTO v_name FROM public.staff WHERE id = user_id;
    RETURN v_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 9. Trigger Function to Create Profile on Signup
-- =============================================================================
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_role TEXT;
    v_categories TEXT[];
BEGIN
    v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'staff');
    v_categories := COALESCE(
        (SELECT array_agg(value::text) FROM jsonb_array_elements_text(NEW.raw_user_meta_data->'categories')),
        ARRAY[]::TEXT[]
    );

    IF v_role = 'admin' THEN
        INSERT INTO public.admins (id, email, full_name, avatar_url, phone)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'phone'
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            avatar_url = EXCLUDED.avatar_url,
            phone = EXCLUDED.phone,
            updated_at = NOW();
    ELSE
        INSERT INTO public.staff (id, email, full_name, avatar_url, phone, bio, hire_date, categories)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'phone',
            NEW.raw_user_meta_data->>'bio',
            CASE 
                WHEN NEW.raw_user_meta_data->>'hire_date' IS NOT NULL 
                THEN (NEW.raw_user_meta_data->>'hire_date')::DATE 
                ELSE CURRENT_DATE 
            END,
            v_categories
        )
        ON CONFLICT (id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            avatar_url = EXCLUDED.avatar_url,
            phone = EXCLUDED.phone,
            bio = EXCLUDED.bio,
            hire_date = EXCLUDED.hire_date,
            categories = EXCLUDED.categories,
            updated_at = NOW();
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 10. Create Trigger
-- =============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- 11. Updated At Trigger Function
-- =============================================================================
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;
CREATE TRIGGER set_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_admins_updated_at ON public.admins;
CREATE TRIGGER set_admins_updated_at
    BEFORE UPDATE ON public.admins
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_staff_updated_at ON public.staff;
CREATE TRIGGER set_staff_updated_at
    BEFORE UPDATE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- 12. Audit Log Trigger Function
-- =============================================================================
DROP FUNCTION IF EXISTS public.handle_audit_log() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_action TEXT;
    v_old_values JSONB;
    v_new_values JSONB;
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit log triggers
DROP TRIGGER IF EXISTS audit_leads_changes ON public.leads;
CREATE TRIGGER audit_leads_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

DROP TRIGGER IF EXISTS audit_staff_changes ON public.staff;
CREATE TRIGGER audit_staff_changes
    AFTER INSERT OR UPDATE OR DELETE ON public.staff
    FOR EACH ROW EXECUTE FUNCTION public.handle_audit_log();

-- =============================================================================
-- 13. RLS Policies
-- =============================================================================
-- Drop all existing policies first for all tables
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Policies for Admins Table
CREATE POLICY "Admins can view all admins" ON public.admins
    FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update admins" ON public.admins
    FOR UPDATE USING (public.is_admin(auth.uid()));

-- Policies for Staff Table
CREATE POLICY "Admins have full access to staff" ON public.staff
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view their own profile" ON public.staff
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Staff can update their own profile" ON public.staff
    FOR UPDATE USING (id = auth.uid());

-- Policies for Leads Table
CREATE POLICY "Anyone can insert leads" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins have full access to leads" ON public.leads
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view assigned leads" ON public.leads
    FOR SELECT USING (assigned_to = auth.uid());

CREATE POLICY "Staff can view unassigned leads by category" ON public.leads
    FOR SELECT USING (
        assigned_to IS NULL AND
        public.is_admin(auth.uid()) = false AND
        EXISTS (
            SELECT 1 
            FROM public.staff 
            WHERE id = auth.uid() 
            AND service_type = ANY (categories)
        )
    );

CREATE POLICY "Staff can update assigned leads" ON public.leads
    FOR UPDATE USING (assigned_to = auth.uid());

-- Policies for Lead Attachments
CREATE POLICY "Admins have full access to attachments" ON public.lead_attachments
    FOR ALL USING (public.is_admin(auth.uid()));

CREATE POLICY "Staff can view attachments for their leads" ON public.lead_attachments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 
            FROM public.leads 
            WHERE leads.id = lead_attachments.lead_id 
            AND (leads.assigned_to = auth.uid() OR (
                leads.assigned_to IS NULL AND
                EXISTS (
                    SELECT 1 
                    FROM public.staff 
                    WHERE staff.id = auth.uid() 
                    AND leads.service_type = ANY (staff.categories)
                )
            ))
        )
    );

CREATE POLICY "Staff can upload attachments for their leads" ON public.lead_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM public.leads 
            WHERE leads.id = lead_attachments.lead_id 
            AND (leads.assigned_to = auth.uid() OR (
                leads.assigned_to IS NULL AND
                EXISTS (
                    SELECT 1 
                    FROM public.staff 
                    WHERE staff.id = auth.uid() 
                    AND leads.service_type = ANY (staff.categories)
                )
            ))
        )
    );

-- Policies for Audit Logs
CREATE POLICY "Admins can view all audit logs" ON public.audit_logs
    FOR SELECT USING (public.is_admin(auth.uid()));

-- =============================================================================
-- 14. Supabase Storage Policies (Run separately in SQL Editor)
-- =============================================================================
-- First, create the buckets if they don't exist in Supabase Storage UI:
-- - DIVERS (for avatars and general files)
-- Then uncomment and run the following:
/*
-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policies for DIVERS bucket
CREATE POLICY "Authenticated users can upload to DIVERS" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'DIVERS' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Authenticated users can update their own files in DIVERS" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'DIVERS' AND
        auth.uid() = owner
    );

CREATE POLICY "Authenticated users can delete their own files in DIVERS" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'DIVERS' AND
        auth.uid() = owner
    );

CREATE POLICY "Public can view files in DIVERS" ON storage.objects
    FOR SELECT USING (bucket_id = 'DIVERS');
*/

-- =============================================================================
-- IMPORTANT: Add your admin user to the admins table manually!
-- Replace 'YOUR_USER_UUID' and 'admin@example.com' with your actual values!
-- =============================================================================
-- INSERT INTO public.admins (id, email, full_name) 
-- VALUES (
--     'YOUR_USER_UUID', 
--     'admin@example.com', 
--     'Admin User'
-- ) ON CONFLICT (id) DO NOTHING;
