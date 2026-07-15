import fs from 'fs';
import { attractions } from '../src/data/attractions.js';
import { crew } from '../src/data/crew.js';
import { galleryData } from '../src/data/galleryData.js';
import { padiCourses } from '../src/data/padiCourses.js';
import { roomsData } from '../src/data/roomsData.js';
import { services } from '../src/data/services.js';
import { bentoCards } from '../src/data/travelData.js';
import { destinations } from '../src/data/destinations.js';

const siteContent = {
    attractions,
    crew,
    galleryData,
    padiCourses,
    roomsData,
    services,
    travelData: bentoCards,
    destinations
};

let sql = `-- Setup SQL script for Murudeshwara Resort Database

-- Create site_content table
CREATE TABLE IF NOT EXISTS site_content (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to avoid errors
DROP POLICY IF EXISTS "Allow public read" ON site_content;
DROP POLICY IF EXISTS "Allow public insert" ON site_content;
DROP POLICY IF EXISTS "Allow public update" ON site_content;
DROP POLICY IF EXISTS "Allow public delete" ON site_content;

-- Recreate policies
CREATE POLICY "Allow public read" ON site_content FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON site_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON site_content FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON site_content FOR DELETE USING (true);

-- Seed site_content table with all static datasets
INSERT INTO site_content (key, data) VALUES
`;

const keys = Object.keys(siteContent);
keys.forEach((key, idx) => {
    const jsonStr = JSON.stringify(siteContent[key], null, 2);
    // Escape single quotes for SQL insertion
    const escapedJsonStr = jsonStr.replace(/'/g, "''");
    sql += `('${key}', '${escapedJsonStr}'::jsonb)`;
    if (idx < keys.length - 1) {
        sql += `,\n`;
    } else {
        sql += `\n`;
    }
});

sql += `ON CONFLICT (key) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW();\n\n`;

// Add leads table setup too
sql += `-- Create leads table (CRM bookings and inquiries)
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    service_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read" ON leads;
DROP POLICY IF EXISTS "Allow public insert" ON leads;
DROP POLICY IF EXISTS "Allow public update" ON leads;
DROP POLICY IF EXISTS "Allow public delete" ON leads;

CREATE POLICY "Allow public read" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON leads FOR DELETE USING (true);
`;

fs.writeFileSync('../seed_database.sql', sql);
console.log('Successfully generated seed_database.sql in the root directory!');
