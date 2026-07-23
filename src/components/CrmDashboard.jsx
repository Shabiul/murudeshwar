import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import ForecastWidgets from './crm/ForecastWidgets';
import RecommendationCards from './crm/RecommendationCards';

export default function CrmDashboard() {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [selectedPropertyId, setSelectedPropertyId] = useState(() => {
        return localStorage.getItem('crm_selected_property_id') || 'all';
    });

    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(null);
    const [selectedTab, setSelectedTab] = useState('stays'); // 'stays' | 'scuba' | 'bikes' | 'contacts'
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'

    useEffect(() => {
        const handleScopeChange = () => {
            const propId = localStorage.getItem('crm_selected_property_id') || 'all';
            setSelectedPropertyId(propId);
        };
        const handleLeadsUpdate = () => {
            fetchLeads();
        };
        window.addEventListener('crmPropertyScopeChanged', handleScopeChange);
        window.addEventListener('crmLeadsUpdated', handleLeadsUpdate);
        return () => {
            window.removeEventListener('crmPropertyScopeChanged', handleScopeChange);
            window.removeEventListener('crmLeadsUpdated', handleLeadsUpdate);
        };
    }, []);

    // Notes inline edit states
    const [editingNotesId, setEditingNotesId] = useState(null);
    const [tempNotes, setTempNotes] = useState('');
    
    // Delete states
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    // Uploading state
    const [isUploading, setIsUploading] = useState(false);

    // Create Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        phone: '',
        serviceType: 'Stay',
        status: 'pending',
        adminNotes: '',
        // Stay details
        roomTitle: 'Deluxe Sea View Room',
        guests: '2 Guests',
        dates: '',
        // Scuba details
        courseName: 'PADI Open Water Diver',
        level: 'Beginner',
        duration: '4 Days',
        // Bike details
        bikeType: 'Royal Enfield Hunter 350',
        bikeDuration: '3 Days',
        // Contact details
        message: '',
        imageUrl: ''
    });

    // Edit Modal states
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingLead, setEditingLead] = useState(null);
    const [editForm, setEditForm] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        serviceType: 'Stay',
        status: 'pending',
        adminNotes: '',
        details: {}
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);

    // Map from Supabase database columns to React app state format
    const mapFromDb = (dbLead) => ({
        id: dbLead.id,
        serviceType: dbLead.service_type || 'Contact',
        name: dbLead.name || '',
        email: dbLead.email || '',
        phone: dbLead.phone || '',
        status: dbLead.status || 'pending',
        adminNotes: dbLead.admin_notes || '',
        timestamp: dbLead.created_at || new Date().toISOString(),
        details: typeof dbLead.details === 'string' ? JSON.parse(dbLead.details) : (dbLead.details || {})
    });

    // Fetch leads/bookings
    const fetchLeads = async () => {
        setLoading(true);
        setDbError(null);
        try {
            let query = supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (selectedPropertyId && selectedPropertyId !== 'all') {
                query = query.eq('property_id', selectedPropertyId);
            }

            const { data, error } = await query;

            if (error) throw error;
            if (data) setLeads(data.map(mapFromDb));
        } catch (error) {
            console.warn("Supabase fetch failed, falling back to localStorage. Error:", error);
            if (error.message && (error.message.includes('relation "leads" does not exist') || error.code === 'PGRST116')) {
                setDbError(`The "leads" table is missing in your Supabase database. Run the SQL script in your Supabase SQL Editor to set it up!`);
            } else {
                setDbError(`Supabase connection error: ${error.message || 'Unknown error'}. Fallback data enabled.`);
            }

            const stored = localStorage.getItem('crm_leads');
            if (stored) {
                try {
                    setLeads(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse localStorage crm_leads", e);
                }
            } else {
                setLeads([]);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchLeads();
        }
    }, [isAuthenticated, selectedPropertyId]);

    // Image upload handler
    const handleImageUpload = async (file, isEdit = false) => {
        if (!file) return;
        setIsUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
            const filePath = `attachments/${fileName}`;

            // Attempt Supabase Storage Upload
            const { data, error } = await supabase.storage
                .from('leads_attachments')
                .upload(filePath, file, { cacheControl: '3600', upsert: false });

            if (error) {
                // If storage bucket isn't set up, fallback to Base64
                throw new Error("Supabase Storage bucket error: " + error.message);
            }

            const { data: { publicUrl } } = supabase.storage
                .from('leads_attachments')
                .getPublicUrl(filePath);

            if (isEdit) {
                setEditForm(prev => ({
                    ...prev,
                    details: { ...prev.details, imageUrl: publicUrl }
                }));
            } else {
                setCreateForm(prev => ({ ...prev, imageUrl: publicUrl }));
            }
        } catch (err) {
            console.warn("Using base64 fallback for image upload:", err.message);
            const reader = new FileReader();
            reader.onloadend = () => {
                if (isEdit) {
                    setEditForm(prev => ({
                        ...prev,
                        details: { ...prev.details, imageUrl: reader.result }
                    }));
                } else {
                    setCreateForm(prev => ({ ...prev, imageUrl: reader.result }));
                }
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
        }
    };

    // Save lead helper
    const handleCreateLead = async (e) => {
        e.preventDefault();
        
        let detailsObj = {};
        if (createForm.serviceType === 'Stay') {
            detailsObj = {
                roomTitle: createForm.roomTitle,
                guests: createForm.guests,
                dates: createForm.dates
            };
        } else if (createForm.serviceType === 'Scuba') {
            detailsObj = {
                courseName: createForm.courseName,
                level: createForm.level,
                duration: createForm.duration
            };
        } else if (createForm.serviceType === 'Bike') {
            detailsObj = {
                bikeType: createForm.bikeType,
                duration: createForm.bikeDuration
            };
        } else if (createForm.serviceType === 'Contact') {
            detailsObj = {
                message: createForm.message
            };
        }

        if (createForm.imageUrl) {
            detailsObj.imageUrl = createForm.imageUrl;
        }

        const newLeadData = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            serviceType: createForm.serviceType,
            name: createForm.name.trim(),
            email: createForm.email.trim(),
            phone: createForm.phone.trim(),
            timestamp: new Date().toISOString(),
            status: createForm.status,
            adminNotes: createForm.adminNotes,
            details: detailsObj
        };

        try {
            const { error } = await supabase.from('leads').insert([{
                name: newLeadData.name,
                email: newLeadData.email,
                phone: newLeadData.phone || null,
                service_type: newLeadData.serviceType,
                status: newLeadData.status,
                admin_notes: newLeadData.adminNotes || null,
                details: newLeadData.details,
                property_id: selectedPropertyId === 'all' ? '00000000-0000-0000-0000-000000000001' : selectedPropertyId
            }]);

            if (error) throw error;
            await fetchLeads();
        } catch (error) {
            console.warn("Supabase insert failed, adding to local storage instead:", error);
            const stored = localStorage.getItem('crm_leads');
            const list = stored ? JSON.parse(stored) : [];
            list.unshift(newLeadData);
            localStorage.setItem('crm_leads', JSON.stringify(list));
            setLeads(list);
        }

        setIsCreateOpen(false);
        setCreateForm({
            name: '',
            email: '',
            phone: '',
            serviceType: 'Stay',
            status: 'pending',
            adminNotes: '',
            roomTitle: 'Deluxe Sea View Room',
            guests: '2 Guests',
            dates: '',
            courseName: 'PADI Open Water Diver',
            level: 'Beginner',
            duration: '4 Days',
            bikeType: 'Royal Enfield Bullet 350',
            bikeDuration: '3 Days',
            message: '',
            imageUrl: ''
        });
    };

    // Update lead helper
    const handleUpdateLead = async (e) => {
        e.preventDefault();
        if (!editingLead) return;

        try {
            const { error } = await supabase
                .from('leads')
                .update({
                    name: editForm.name.trim(),
                    email: editForm.email.trim(),
                    phone: editForm.phone.trim() || null,
                    service_type: editForm.serviceType,
                    status: editForm.status,
                    admin_notes: editForm.adminNotes || null,
                    details: editForm.details
                })
                .eq('id', editForm.id);

            if (error) throw error;
            await fetchLeads();
        } catch (error) {
            console.warn("Supabase update failed, editing local storage instead:", error);
            const updated = leads.map(l => 
                l.id === editForm.id 
                    ? { 
                        ...l, 
                        name: editForm.name.trim(), 
                        email: editForm.email.trim(),
                        phone: editForm.phone.trim(),
                        serviceType: editForm.serviceType,
                        status: editForm.status,
                        adminNotes: editForm.adminNotes,
                        details: editForm.details
                    } 
                    : l
            );
            setLeads(updated);
            localStorage.setItem('crm_leads', JSON.stringify(updated));
        }

        setIsEditOpen(false);
        setEditingLead(null);
    };

    // Quick status update
    const handleStatusChange = async (id, newStatus) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;
            await fetchLeads();
        } catch (error) {
            console.warn("Supabase status change failed, updating local storage:", error);
            const updated = leads.map(lead => 
                lead.id === id ? { ...lead, status: newStatus } : lead
            );
            setLeads(updated);
            localStorage.setItem('crm_leads', JSON.stringify(updated));
        }
    };

    // Quick note save
    const handleSaveNotes = async (id) => {
        try {
            const { error } = await supabase
                .from('leads')
                .update({ admin_notes: tempNotes })
                .eq('id', id);

            if (error) throw error;
            await fetchLeads();
        } catch (error) {
            console.warn("Supabase note save failed, saving to local storage:", error);
            const updated = leads.map(lead => 
                lead.id === id ? { ...lead, adminNotes: tempNotes } : lead
            );
            setLeads(updated);
            localStorage.setItem('crm_leads', JSON.stringify(updated));
        }
        setEditingNotesId(null);
    };

    // Delete lead
    const handleDeleteLead = async (id) => {
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', id);

            if (error) throw error;
            await fetchLeads();
        } catch (error) {
            console.warn("Supabase delete failed, deleting from local storage:", error);
            const updated = leads.filter(lead => lead.id !== id);
            setLeads(updated);
            localStorage.setItem('crm_leads', JSON.stringify(updated));
        }
        setDeleteConfirmId(null);
    };

    // Open full edit modal
    const openEditModal = (lead) => {
        setEditingLead(lead);
        setEditForm({
            id: lead.id,
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            serviceType: lead.serviceType,
            status: lead.status,
            adminNotes: lead.adminNotes,
            details: { ...lead.details }
        });
        setIsEditOpen(true);
    };

    // Export helper
    const handleExportData = (format) => {
        let content = '';
        let fileName = `leads_export_${Date.now()}`;
        
        if (format === 'json') {
            content = JSON.stringify(leads, null, 2);
            fileName += '.json';
        } else if (format === 'csv') {
            const headers = ['ID', 'Service', 'Name', 'Email', 'Phone', 'Date/Details', 'Status', 'Submitted At', 'Notes'];
            const rows = leads.map(lead => [
                lead.id,
                lead.serviceType,
                lead.name,
                lead.email,
                lead.phone || 'N/A',
                JSON.stringify(lead.details || {}).replace(/"/g, '""'),
                lead.status,
                lead.timestamp,
                (lead.adminNotes || '').replace(/"/g, '""')
            ]);
            content = [headers.join(','), ...rows.map(r => r.map(val => `"${val}"`).join(','))].join('\n');
            fileName += '.csv';
        }

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!user) return null;

    // Filter logic
    const filteredLeads = leads.filter(lead => {
        let matchTab = false;
        if (selectedTab === 'stays') matchTab = lead.serviceType === 'Stay';
        if (selectedTab === 'cars') matchTab = lead.serviceType === 'Car' || lead.serviceType === 'Taxi';
        if (selectedTab === 'bikes') matchTab = lead.serviceType === 'Bike';
        if (selectedTab === 'scuba') matchTab = lead.serviceType === 'Scuba';
        if (selectedTab === 'contacts') matchTab = lead.serviceType === 'Contact';

        const matchStatus = statusFilter === 'all' || lead.status === statusFilter;

        const query = searchQuery.toLowerCase().trim();
        const matchSearch = !query || 
            lead.name.toLowerCase().includes(query) || 
            lead.email.toLowerCase().includes(query) || 
            (lead.phone && lead.phone.toLowerCase().includes(query)) ||
            (lead.details && JSON.stringify(lead.details).toLowerCase().includes(query));

        return matchTab && matchStatus && matchSearch;
    });

    // Analytics calculations
    const totalLeads = leads.length;
    const pendingLeads = leads.filter(l => l.status === 'pending').length;
    const confirmedLeads = leads.filter(l => l.status === 'confirmed').length;
    const completedLeads = leads.filter(l => l.status === 'completed').length;
    const conversionRate = totalLeads ? Math.round(((confirmedLeads + completedLeads) / totalLeads) * 100) : 0;

    const estimatedRevenue = leads
        .filter(l => l.status === 'confirmed' || l.status === 'completed')
        .reduce((sum, lead) => {
            if (lead.serviceType === 'Stay') return sum + 12000;
            if (lead.serviceType === 'Scuba') return sum + 4500;
            if (lead.serviceType === 'Bike') return sum + 800;
            return sum;
        }, 0);

    // Active booking conflicts detection
    const activeConflicts = leads.filter((lead, index) => {
        if (lead.serviceType !== 'Stay' || lead.status !== 'confirmed') return false;
        return leads.some((other, oIdx) => 
            oIdx !== index &&
            other.serviceType === 'Stay' &&
            other.status === 'confirmed' &&
            other.details?.roomTitle?.toLowerCase() === lead.details?.roomTitle?.toLowerCase() &&
            other.details?.dates?.toLowerCase() === lead.details?.dates?.toLowerCase()
        );
    });

    const hasCreateConflict = createForm.serviceType === 'Stay' && leads.some(l =>
        l.serviceType === 'Stay' &&
        l.status === 'confirmed' &&
        l.details?.roomTitle?.toLowerCase() === createForm.roomTitle?.toLowerCase() &&
        l.details?.dates?.toLowerCase() === createForm.dates?.toLowerCase()
    );

    const hasEditConflict = editForm.serviceType === 'Stay' && leads.some(l =>
        l.id !== editForm.id &&
        l.serviceType === 'Stay' &&
        l.status === 'confirmed' &&
        l.details?.roomTitle?.toLowerCase() === editForm.details?.roomTitle?.toLowerCase() &&
        l.details?.dates?.toLowerCase() === editForm.details?.dates?.toLowerCase()
    );

    return (
        <CrmLayout title="Bookings & Leads" subtitle="Manage stays reservations, scuba diving bookings, bike rentals, and contact leads">
            <div className="relative font-sans">
                {/* ── SQL Configuration Banner ── */}
                <AnimatePresence>
                    {dbError && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-amber-500/10 border border-amber-300 rounded-3xl p-6 mb-8 text-left"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="max-w-3xl">
                                    <h4 className="font-serif text-lg text-amber-700 mb-1 flex items-center gap-2">
                                        [!] Database Table Setup Required
                                    </h4>
                                    <p className="text-slate-700 text-xs leading-relaxed">
                                        {dbError} Copy and paste this script directly into your Supabase SQL Editor.
                                    </p>
                                </div>
                                <button
                                    onClick={() => fetchLeads()}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs transition-colors"
                                >
                                    (i) Retry Database
                                </button>
                            </div>
                            <div className="mt-4 bg-slate-900 border border-slate-700 rounded-2xl p-4 overflow-x-auto text-[10px] font-mono text-emerald-400 leading-normal">
                                <pre>{`CREATE TABLE IF NOT EXISTS leads (
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
CREATE POLICY "Allow public read" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON leads FOR DELETE USING (true);`}</pre>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Analytics Block ── */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Inquiries</p>
                        <h3 className="text-4xl font-serif text-slate-900">{totalLeads}</h3>
                        <p className="text-[10px] text-emerald-600 mt-2">+ 100% organic growth</p>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Conversion Rate</p>
                        <h3 className="text-4xl font-serif text-slate-900">{conversionRate}%</h3>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${conversionRate}%` }} />
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Est. Revenue</p>
                        <h3 className="text-4xl font-serif text-amber-600">₹{estimatedRevenue.toLocaleString('en-IN')}</h3>
                        <p className="text-[10px] text-slate-500 mt-2">From confirmed/completed bookings</p>
                    </div>

                    <div className={`border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-colors ${activeConflicts.length > 0 ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200/80'}`}>
                        <div>
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${activeConflicts.length > 0 ? 'text-rose-600' : 'text-slate-400'}`}>Booking Conflicts</p>
                            <h3 className={`text-4xl font-serif ${activeConflicts.length > 0 ? 'text-rose-700' : 'text-slate-900'}`}>
                                {activeConflicts.length}
                            </h3>
                            <p className="text-[10px] text-slate-500 mt-2">
                                {activeConflicts.length > 0 ? '⚠️ Double bookings detected for stays' : '✅ All room slots clear'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ── AI Insights & Predictions Block ── */}
                <div className="flex flex-col gap-8 mb-8">
                    <ForecastWidgets propertyId={selectedPropertyId} leads={leads} />
                </div>

                {/* ── Filters, Controls & Create Button Bar ── */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0">
                            <input
                                type="text"
                                placeholder="Search leads..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-10 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                            onClick={() => setIsCreateOpen(true)}
                            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 flex items-center gap-1.5 shadow-sm"
                        >
                            ➕ Add Booking
                        </button>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mr-1">Export:</span>
                        <button
                            onClick={() => handleExportData('csv')}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold tracking-wider text-slate-700 transition-colors"
                        >
                            CSV File
                        </button>
                        <button
                            onClick={() => handleExportData('json')}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-semibold tracking-wider text-slate-700 transition-colors"
                        >
                            JSON Data
                        </button>
                    </div>
                </div>

                {/* ── Category tabs ── */}
                <div className="flex border-b border-slate-200 mb-6 overflow-x-auto scrollbar-none gap-2">
                    {[
                        { id: 'stays', label: 'Stays Booking' },
                        { id: 'cars', label: 'Car Rentals' },
                        { id: 'bikes', label: 'Bike Rentals' },
                        { id: 'scuba', label: 'Scuba Diving' },
                        { id: 'contacts', label: 'General Leads' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setSelectedTab(tab.id);
                                setStatusFilter('all');
                            }}
                            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all relative ${
                                selectedTab === tab.id 
                                    ? 'border-amber-500 text-amber-600' 
                                    : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ── Leads List Table ── */}
                <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                                    <th className="py-4 px-6">Client</th>
                                    <th className="py-4 px-6">Details</th>
                                    <th className="py-4 px-6">Submitted Date</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">Admin Notes</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-sans">
                                <AnimatePresence mode="popLayout">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                                                <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                                Loading CRM database...
                                            </td>
                                        </tr>
                                    ) : filteredLeads.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="py-12 text-center text-slate-400 text-sm">
                                                No leads matching the search filters.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLeads.map(lead => {
                                            const formattedDate = new Date(lead.timestamp).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            });

                                            const renderDetails = () => {
                                                let previewImg = lead.details?.imageUrl;
                                                return (
                                                    <div className="text-xs space-y-1.5 text-left">
                                                        {lead.serviceType === 'Stay' && (
                                                            <>
                                                                <p className="font-semibold text-slate-800">{lead.details?.roomTitle || 'Room Booking'}</p>
                                                                <p className="text-slate-500">Guests: {lead.details?.guests || '1 Guest'} | Dates: {lead.details?.dates || 'N/A'}</p>
                                                            </>
                                                        )}
                                                        {(lead.serviceType === 'Car' || lead.serviceType === 'Taxi') && (
                                                            <>
                                                                <p className="font-semibold text-slate-800">{lead.details?.vehicleName || lead.details?.roomTitle || 'Car Rental'}</p>
                                                                <p className="text-slate-500">Guests/Qty: {lead.details?.guests || '1 Vehicle'} | Dates: {lead.details?.dates || 'N/A'}</p>
                                                            </>
                                                        )}
                                                        {lead.serviceType === 'Scuba' && (
                                                            <>
                                                                <p className="font-semibold text-slate-800">{lead.details?.courseName || 'Scuba Session'}</p>
                                                                <p className="text-slate-500">Level: {lead.details?.level || 'Beginner'} | Duration: {lead.details?.duration || '4 Days'}</p>
                                                            </>
                                                        )}
                                                        {lead.serviceType === 'Bike' && (
                                                            <>
                                                                <p className="font-semibold text-slate-800">{lead.details?.bikeType || lead.details?.vehicleName || lead.details?.roomTitle || 'Bike Rental'}</p>
                                                                <p className="text-slate-500">Quantity: {lead.details?.guests || '1 Vehicle'} | Dates: {lead.details?.dates || lead.details?.duration || 'N/A'}</p>
                                                            </>
                                                        )}
                                                        {lead.serviceType === 'Contact' && (
                                                            <p className="text-slate-600 italic line-clamp-2">"{lead.details?.message || ''}"</p>
                                                        )}
                                                        {previewImg && (
                                                            <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 mt-1 shadow-sm group/thumb">
                                                                <img src={previewImg} alt="Attachment" className="w-full h-full object-cover" />
                                                                <a 
                                                                    href={previewImg} 
                                                                    target="_blank" 
                                                                    rel="noreferrer" 
                                                                    className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center text-[8px] text-white font-bold transition-opacity"
                                                                >
                                                                    VIEW
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            };

                                            const getStatusBadgeClass = (status) => {
                                                const base = "text-[10px] font-semibold px-2.5 py-1 rounded-full border uppercase tracking-wider inline-block ";
                                                if (status === 'pending') return base + "bg-amber-50 border-amber-200 text-amber-800";
                                                if (status === 'confirmed') return base + "bg-emerald-50 border-emerald-200 text-emerald-800";
                                                if (status === 'completed') return base + "bg-blue-50 border-blue-200 text-blue-800";
                                                if (status === 'cancelled') return base + "bg-red-50 border-red-200 text-red-800";
                                                return base;
                                            };

                                            return (
                                                <motion.tr
                                                    key={lead.id}
                                                    layout
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="hover:bg-slate-50/50 transition-colors"
                                                >
                                                    <td className="py-5 px-6">
                                                        <div className="leading-normal text-left">
                                                            <p className="font-bold text-slate-900 text-sm">{lead.name}</p>
                                                            <p className="text-slate-500 text-xs">{lead.email}</p>
                                                            {lead.phone && <p className="text-slate-500 text-[11px]">{lead.phone}</p>}
                                                        </div>
                                                    </td>

                                                    <td className="py-5 px-6">{renderDetails()}</td>

                                                    <td className="py-5 px-6 text-xs text-slate-500 text-left">{formattedDate}</td>

                                                    <td className="py-5 px-6 text-left">
                                                        <div className="flex flex-col space-y-1">
                                                            <span className={getStatusBadgeClass(lead.status)}>
                                                                {lead.status}
                                                            </span>
                                                            <select
                                                                value={lead.status}
                                                                onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                                                                className="bg-white border border-slate-200 rounded-md py-0.5 px-1.5 text-[10px] text-slate-600 focus:outline-none focus:border-amber-400 mt-1 max-w-[110px] shadow-sm font-sans"
                                                            >
                                                                <option value="pending">Pending</option>
                                                                <option value="confirmed">Confirmed</option>
                                                                <option value="completed">Completed</option>
                                                                <option value="cancelled">Cancelled</option>
                                                            </select>
                                                        </div>
                                                    </td>

                                                    <td className="py-5 px-6 text-xs max-w-xs text-left font-sans">
                                                        {editingNotesId === lead.id ? (
                                                            <div className="flex flex-col gap-2">
                                                                <textarea
                                                                    value={tempNotes}
                                                                    onChange={(e) => setTempNotes(e.target.value)}
                                                                    className="bg-white border border-slate-300 rounded p-1 text-slate-800 text-xs w-full min-h-[50px] resize-none"
                                                                />
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => handleSaveNotes(lead.id)}
                                                                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold shadow-sm"
                                                                    >
                                                                        Save
                                                                    </button>
                                                                    <button
                                                                        onClick={() => setEditingNotesId(null)}
                                                                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded text-[10px]"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="group relative">
                                                                <p className="text-slate-600 line-clamp-2">
                                                                    {lead.adminNotes || <span className="italic text-slate-300">No notes added yet</span>}
                                                                </p>
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingNotesId(lead.id);
                                                                        setTempNotes(lead.adminNotes || '');
                                                                    }}
                                                                    className="text-amber-600 text-[10px] underline mt-1 hover:text-amber-800"
                                                                >
                                                                    Edit Notes
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="py-5 px-6 text-right">
                                                        <div className="flex items-center justify-end gap-3 font-sans font-medium">
                                                            <button
                                                                onClick={() => openEditModal(lead)}
                                                                className="text-amber-600 hover:text-amber-800 text-xs transition-colors"
                                                            >
                                                                ✎ Edit
                                                            </button>
                                                            <button
                                                                onClick={() => setDeleteConfirmId(lead.id)}
                                                                className="text-rose-500 hover:text-rose-700 text-xs transition-colors"
                                                            >
                                                                ✕ Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })
                                    )}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── CREATE BOOKING MODAL ── */}
            <AnimatePresence>
                {isCreateOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white border border-slate-200 p-8 rounded-[32px] w-full max-w-lg shadow-2xl relative my-8"
                        >
                            <button
                                onClick={() => setIsCreateOpen(false)}
                                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 transition-colors"
                            >
                                ✕
                            </button>

                            <h3 className="font-serif text-3xl text-slate-900 mb-1 text-left">New Booking Entry</h3>
                            <p className="font-sans text-xs text-slate-500 mb-6 text-left font-medium">Manually seed booking details to Supabase.</p>

                            <form onSubmit={handleCreateLead} className="space-y-4 text-left">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Client Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={createForm.name}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors font-sans"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Category</label>
                                        <select
                                            value={createForm.serviceType}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, serviceType: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors font-sans"
                                        >
                                            <option value="Stay">Stay Booking</option>
                                            <option value="Scuba">Scuba Diving</option>
                                            <option value="Bike">Bike Rental</option>
                                            <option value="Contact">General Contact</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={createForm.email}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors font-sans"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Phone</label>
                                        <input
                                            type="text"
                                            value={createForm.phone}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors font-sans"
                                            placeholder="+91 99999 88888"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Status</label>
                                        <select
                                            value={createForm.status}
                                            onChange={(e) => setCreateForm(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors font-sans"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Dynamic Details Inputs based on Category */}
                                <div className="border-t border-slate-100 pt-4 space-y-4 font-sans">
                                    <h4 className="text-amber-600 text-[10px] uppercase tracking-widest font-bold">Category Details</h4>
                                    
                                    {createForm.serviceType === 'Stay' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 block">Room Title</label>
                                                    <input
                                                        type="text"
                                                        value={createForm.roomTitle}
                                                        onChange={(e) => setCreateForm(prev => ({ ...prev, roomTitle: e.target.value }))}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 block">Guests count</label>
                                                    <input
                                                        type="text"
                                                        value={createForm.guests}
                                                        onChange={(e) => setCreateForm(prev => ({ ...prev, guests: e.target.value }))}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Booking Dates</label>
                                                <input
                                                    type="text"
                                                    value={createForm.dates}
                                                    onChange={(e) => setCreateForm(prev => ({ ...prev, dates: e.target.value }))}
                                                    placeholder="e.g. 15 Aug - 20 Aug 2026"
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                                {hasCreateConflict && (
                                                    <p className="text-[10px] text-rose-500 font-medium mt-1">
                                                        ⚠️ Double Booking Conflict: This room is already booked on these dates!
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {createForm.serviceType === 'Scuba' && (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Course Name</label>
                                                <input
                                                    type="text"
                                                    value={createForm.courseName}
                                                    onChange={(e) => setCreateForm(prev => ({ ...prev, courseName: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Level</label>
                                                <input
                                                    type="text"
                                                    value={createForm.level}
                                                    onChange={(e) => setCreateForm(prev => ({ ...prev, level: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Duration</label>
                                                <input
                                                    type="text"
                                                    value={createForm.duration}
                                                    onChange={(e) => setCreateForm(prev => ({ ...prev, duration: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {createForm.serviceType === 'Bike' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Bike Model</label>
                                                <input
                                                    type="text"
                                                    value={createForm.bikeType}
                                                    onChange={(e) => setCreateForm(prev => ({ ...prev, bikeType: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Rental Duration</label>
                                                <input
                                                    type="text"
                                                    value={createForm.bikeDuration}
                                                    onChange={(e) => setCreateForm(prev => ({ ...prev, bikeDuration: e.target.value }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {createForm.serviceType === 'Contact' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 block">Message Text</label>
                                            <textarea
                                                value={createForm.message}
                                                onChange={(e) => setCreateForm(prev => ({ ...prev, message: e.target.value }))}
                                                rows="3"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs focus:outline-none focus:border-amber-400 resize-none"
                                                placeholder="Custom message details..."
                                            />
                                        </div>
                                    )}

                                    {/* Image Attachment Upload */}
                                    <div className="space-y-2 border-t border-slate-100 pt-4">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Attach Image Document</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e.target.files[0], false)}
                                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            />
                                            {isUploading && (
                                                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                            )}
                                        </div>
                                        {createForm.imageUrl && (
                                            <div className="w-20 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm relative group mt-1">
                                                <img src={createForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setCreateForm(prev => ({ ...prev, imageUrl: '' }))}
                                                    className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black text-white text-[8px] px-1 rounded"
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 border-t border-slate-100 pt-4">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Internal Admin Notes</label>
                                    <textarea
                                        value={createForm.adminNotes}
                                        onChange={(e) => setCreateForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                                        rows="2"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs focus:outline-none focus:border-amber-400 resize-none font-sans"
                                        placeholder="Add notes e.g. Advance paid, room allocation detail..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md"
                                >
                                    Confirm & Create Booking
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── EDIT BOOKING MODAL ── */}
            <AnimatePresence>
                {isEditOpen && editingLead && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white border border-slate-200 p-8 rounded-[32px] w-full max-w-lg shadow-2xl relative my-8"
                        >
                            <button
                                onClick={() => {
                                    setIsEditOpen(false);
                                    setEditingLead(null);
                                }}
                                className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 transition-colors"
                            >
                                ✕
                            </button>

                            <h3 className="font-serif text-3xl text-slate-900 mb-1 text-left">Edit Booking Entry</h3>
                            <p className="font-sans text-xs text-slate-500 mb-6 text-left font-medium">Update Supabase registration record.</p>

                            <form onSubmit={handleUpdateLead} className="space-y-4 text-left font-sans">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Client Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={editForm.name}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Category</label>
                                        <select
                                            value={editForm.serviceType}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, serviceType: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                                        >
                                            <option value="Stay">Stay Booking</option>
                                            <option value="Scuba">Scuba Diving</option>
                                            <option value="Bike">Bike Rental</option>
                                            <option value="Contact">General Contact</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Email</label>
                                        <input
                                            type="email"
                                            required
                                            value={editForm.email}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Phone</label>
                                        <input
                                            type="text"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Status</label>
                                        <select
                                            value={editForm.status}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400 transition-colors"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Dynamic Details Inputs based on Category */}
                                <div className="border-t border-slate-100 pt-4 space-y-4">
                                    <h4 className="text-amber-600 text-[10px] uppercase tracking-widest font-bold">Category Details</h4>
                                    
                                    {editForm.serviceType === 'Stay' && (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 block">Room Title</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.details.roomTitle || ''}
                                                        onChange={(e) => setEditForm(prev => ({ 
                                                            ...prev, 
                                                            details: { ...prev.details, roomTitle: e.target.value } 
                                                        }))}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[10px] text-slate-500 block">Guests count</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.details.guests || ''}
                                                        onChange={(e) => setEditForm(prev => ({ 
                                                            ...prev, 
                                                            details: { ...prev.details, guests: e.target.value } 
                                                        }))}
                                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Booking Dates</label>
                                                <input
                                                    type="text"
                                                    value={editForm.details.dates || ''}
                                                    onChange={(e) => setEditForm(prev => ({ 
                                                        ...prev, 
                                                        details: { ...prev.details, dates: e.target.value } 
                                                    }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                                {hasEditConflict && (
                                                    <p className="text-[10px] text-rose-500 font-medium mt-1">
                                                        ⚠️ Double Booking Conflict: This room is already booked on these dates!
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {editForm.serviceType === 'Scuba' && (
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Course Name</label>
                                                <input
                                                    type="text"
                                                    value={editForm.details.courseName || ''}
                                                    onChange={(e) => setEditForm(prev => ({ 
                                                        ...prev, 
                                                        details: { ...prev.details, courseName: e.target.value } 
                                                    }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Level</label>
                                                <input
                                                    type="text"
                                                    value={editForm.details.level || ''}
                                                    onChange={(e) => setEditForm(prev => ({ 
                                                        ...prev, 
                                                        details: { ...prev.details, level: e.target.value } 
                                                    }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Duration</label>
                                                <input
                                                    type="text"
                                                    value={editForm.details.duration || ''}
                                                    onChange={(e) => setEditForm(prev => ({ 
                                                        ...prev, 
                                                        details: { ...prev.details, duration: e.target.value } 
                                                    }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {editForm.serviceType === 'Bike' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Bike Model</label>
                                                <input
                                                    type="text"
                                                    value={editForm.details.bikeType || ''}
                                                    onChange={(e) => setEditForm(prev => ({ 
                                                        ...prev, 
                                                        details: { ...prev.details, bikeType: e.target.value } 
                                                    }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] text-slate-500 block">Rental Duration</label>
                                                <input
                                                    type="text"
                                                    value={editForm.details.duration || ''}
                                                    onChange={(e) => setEditForm(prev => ({ 
                                                        ...prev, 
                                                        details: { ...prev.details, duration: e.target.value } 
                                                    }))}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 text-xs focus:outline-none focus:border-amber-400"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {editForm.serviceType === 'Contact' && (
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-slate-500 block">Message Text</label>
                                            <textarea
                                                value={editForm.details.message || ''}
                                                onChange={(e) => setEditForm(prev => ({ 
                                                    ...prev, 
                                                    details: { ...prev.details, message: e.target.value } 
                                                }))}
                                                rows="3"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs focus:outline-none focus:border-amber-400 resize-none"
                                            />
                                        </div>
                                    )}

                                    {/* Image Attachment Upload */}
                                    <div className="space-y-2 border-t border-slate-100 pt-4">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Attach Image Document</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e.target.files[0], true)}
                                                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                                            />
                                            {isUploading && (
                                                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                            )}
                                        </div>
                                        {editForm.details.imageUrl && (
                                            <div className="w-20 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm relative group mt-1">
                                                <img src={editForm.details.imageUrl} alt="preview" className="w-full h-full object-cover" />
                                                <button 
                                                    type="button" 
                                                    onClick={() => setEditForm(prev => ({ 
                                                        ...prev, 
                                                        details: { ...prev.details, imageUrl: '' } 
                                                    }))}
                                                    className="absolute top-0.5 right-0.5 bg-black/60 hover:bg-black text-white text-[8px] px-1 rounded"
                                                >
                                                    REMOVE
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1 border-t border-slate-100 pt-4 font-sans">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Internal Admin Notes</label>
                                    <textarea
                                        value={editForm.adminNotes}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, adminNotes: e.target.value }))}
                                        rows="2"
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs focus:outline-none focus:border-amber-400 resize-none font-sans"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-sans font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-md"
                                >
                                    Save Changes
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirmId && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white border border-slate-200 p-8 rounded-3xl max-w-sm text-center shadow-2xl"
                        >
                            <h3 className="font-serif text-2xl text-slate-900 mb-2">Delete Lead Booking?</h3>
                            <p className="font-sans text-xs text-slate-500 mb-6 font-medium">
                                This action is permanent and will remove this inquiry from the CRM database.
                            </p>
                            <div className="flex gap-4 font-sans">
                                <button
                                    onClick={() => handleDeleteLead(deleteConfirmId)}
                                    className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                                >
                                    Yes, Delete
                                </button>
                                <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </CrmLayout>
    );
}
