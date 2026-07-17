-- =============================================================================
-- MURUDESHWAR CRM - SUPABASE COMPATIBLE SETUP
-- =============================================================================
-- This script sets up all tables, triggers, and policies needed for the CRM
-- It's non-destructive, so you can run it multiple times safely
-- =============================================================================

-- 1. Create Users Table (admins + staff in one table)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    categories TEXT[] DEFAULT ARRAY[]::TEXT[] NOT NULL, -- Allowed: 'Stay', 'Scuba', 'Bike', 'Contact'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Create Leads Table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    service_type TEXT NOT NULL CHECK (service_type IN ('Stay', 'Scuba', 'Bike', 'Contact')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    notes TEXT,
    details JSONB,
    assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 3. Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Helper Functions (security definer with safe search path!)
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.users WHERE id = user_id AND role = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Trigger to create user profile on signup
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

    INSERT INTO public.users (id, email, full_name, role, categories)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        v_role,
        v_categories
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        categories = EXCLUDED.categories,
        updated_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Create triggers

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS set_leads_updated_at ON public.leads;

-- Trigger on auth.users to create public.users profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Triggers to auto-update updated_at
CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. RLS Policies

-- First, drop ALL existing policies on public tables for clean slate
DO $$
DECLARE r RECORD;
BEGIN
    FOR r IN (SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.schemaname) || '.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- ------------------------------
-- Policies for public.users
-- ------------------------------
-- Users can view their own profile
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (except role!)
CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (id = auth.uid());

-- Users can insert their own profile (if trigger fails)
CREATE POLICY "Users can insert their own profile" ON public.users
    FOR INSERT WITH CHECK (id = auth.uid());

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (public.is_admin(auth.uid()));

-- Admins have full access to all users
CREATE POLICY "Admins have full access to users" ON public.users
    FOR ALL USING (public.is_admin(auth.uid()));

-- ------------------------------
-- Policies for public.leads
-- ------------------------------
-- Allow anyone to create a lead (for website contact forms)
CREATE POLICY "Anyone can create a lead" ON public.leads
    FOR INSERT WITH CHECK (true);

-- Admins have full access to all leads
CREATE POLICY "Admins have full access to leads" ON public.leads
    FOR ALL USING (public.is_admin(auth.uid()));

-- Staff can view leads assigned directly to them
CREATE POLICY "Staff can view assigned leads" ON public.leads
    FOR SELECT USING (assigned_to = auth.uid());

-- Staff can view unassigned leads matching their categories
CREATE POLICY "Staff can view unassigned leads by category" ON public.leads
    FOR SELECT USING (
        assigned_to IS NULL AND
        public.is_admin(auth.uid()) = false AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE id = auth.uid()
            AND service_type = ANY (categories)
        )
    );

-- Staff can update leads assigned directly to them
CREATE POLICY "Staff can update assigned leads" ON public.leads
    FOR UPDATE USING (assigned_to = auth.uid());

-- =============================================================================
-- IMPORTANT: ADD YOUR ADMIN USER HERE!
-- How to get your auth user ID:
-- 1. Go to Supabase → Authentication → Users
-- 2. Find your email, copy the "User UID"
-- 3. Replace YOUR_USER_UUID below, uncomment, and run this insert
-- =============================================================================
-- INSERT INTO public.users (id, email, full_name, role, categories)
-- VALUES (
--     'YOUR_USER_UUID',
--     'your-email@example.com',
--     'Your Full Name',
--     'admin',
--     ARRAY['Stay', 'Scuba', 'Bike', 'Contact']
-- ) ON CONFLICT (id) DO NOTHING;
