import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import CrmLayout from './crm/CrmLayout';

const CATEGORIES = [
    { key: 'Stay', label: 'Beach Front Stay' },
    { key: 'Scuba', label: 'Scuba Diving' },
    { key: 'Bike', label: 'Bike Rental' },
    { key: 'Contact', label: 'General Contact' }
];

const getCategoryStyle = (key) => {
    switch (key) {
        case 'Stay':
            return 'bg-sky-50 text-sky-700 border-sky-200';
        case 'Scuba':
            return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        case 'Bike':
            return 'bg-orange-50 text-orange-700 border-orange-200';
        default:
            return 'bg-stone-50 text-stone-700 border-stone-200';
    }
};

const calculateWorkExperience = (hireDate) => {
    if (!hireDate) return 'New';
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now - hire);
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 1) return 'New';
    if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
    return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getCategoryLabel = (key) => CATEGORIES.find(c => c.key === key)?.label || key;

export default function StaffDetailPage() {
    const { isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState(null);
    const [assignedLeads, setAssignedLeads] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!isAdmin) return;
        fetchData();
    }, [isAdmin, id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, leadsRes, logsRes] = await Promise.all([
                supabase.from('staff').select('*').eq('id', id).single(),
                supabase.from('leads').select('*').eq('assigned_to', id).order('created_at', { ascending: false }),
                supabase.from('audit_logs').select('*').or(`record_id.eq.${id},performed_by.eq.${id}`).order('created_at', { ascending: false })
            ]);

            setStaff(staffRes.data);
            setAssignedLeads(leadsRes.data || []);
            setAuditLogs(logsRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return navigate('/crm/login');
    if (!isAdmin) return navigate('/crm');

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-brand-gold border-t-transparent" />
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
                <h2 className="font-serif text-2xl text-stone-900 mb-2">Staff not found</h2>
                <p className="text-sm text-stone-500 font-sans mb-6">The staff member you're looking for doesn't exist.</p>
                <Link
                    to="/crm/staff"
                    className="px-6 py-3 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-brand-gold hover:text-stone-900 transition-all duration-300 font-sans"
                >
                    Back to Staff
                </Link>
            </div>
        );
    }

    return (
        <CrmLayout title="Staff Profile Details" subtitle={`Manage profile settings and view lead allocation history for ${staff.full_name}`}>
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link
                        to="/crm/staff"
                        className="px-4 py-2 rounded-xl font-sans text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all duration-300"
                    >
                        ← Back to Staff Directory
                    </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Staff Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-black/8 rounded-3xl p-6"
                        >
                            <div className="flex items-start gap-6 mb-6">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-gold/20 to-brand-gold/40 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {staff.avatar_url ? (
                                        <img src={staff.avatar_url} alt={staff.full_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl text-brand-gold font-serif">{staff.full_name?.charAt(0)?.toUpperCase()}</span>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h1 className="font-serif text-2xl text-stone-900 truncate">{staff.full_name}</h1>
                                        {!staff.is_active && (
                                            <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">Inactive</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-stone-500 font-sans mb-1">{staff.email}</p>
                                    {staff.phone && <p className="text-sm text-stone-500 font-sans mb-2">{staff.phone}</p>}
                                    <div className="flex items-center gap-1 text-sm text-stone-600 font-sans">
                                        <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{calculateWorkExperience(staff.hire_date)} at Murudeshwara</span>
                                    </div>
                                    {staff.hire_date && (
                                        <div className="flex items-center gap-1 text-sm text-stone-500 font-sans mt-1">
                                            <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <span>Hired on {formatDate(staff.hire_date)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-xs text-stone-500 mb-2 uppercase tracking-widest font-sans">Categories</p>
                                {staff.categories?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {staff.categories.map(c => (
                                            <span
                                                key={c}
                                                className={classNames(
                                                    'inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-full border',
                                                    getCategoryStyle(c)
                                                )}
                                            >
                                                {getCategoryLabel(c)}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-stone-400 font-sans">No categories assigned</p>
                                )}
                            </div>

                            {staff.bio && (
                                <div>
                                    <p className="text-xs text-stone-500 mb-2 uppercase tracking-widest font-sans">Bio</p>
                                    <p className="text-sm text-stone-600 font-sans">{staff.bio}</p>
                                </div>
                            )}
                        </motion.div>

                        {/* Assigned Leads */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border border-black/8 rounded-3xl p-6"
                        >
                            <h2 className="font-serif text-xl text-stone-900 mb-4">Assigned Leads</h2>
                            {assignedLeads.length === 0 ? (
                                <p className="text-sm text-stone-500 font-sans">No leads assigned yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {assignedLeads.map((lead) => (
                                        <Link
                                            key={lead.id}
                                            to={`/crm/leads/${lead.id}`}
                                            className="flex items-center justify-between p-4 border border-black/10 rounded-2xl hover:bg-stone-50 transition-all duration-300"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-stone-900 font-sans">{lead.name}</p>
                                                <p className="text-xs text-stone-500 font-sans">{formatDate(lead.created_at)}</p>
                                            </div>
                                            <span className={classNames(
                                                'inline-flex items-center px-3 py-1 text-[11px] font-semibold rounded-full border capitalize',
                                                getCategoryStyle(lead.service_type)
                                            )}>
                                                {getCategoryLabel(lead.service_type)}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white border border-black/8 rounded-3xl p-6"
                        >
                            <h2 className="font-serif text-xl text-stone-900 mb-4">Activity & Audit Logs</h2>
                            {auditLogs.length === 0 ? (
                                <p className="text-sm text-stone-500 font-sans">No logs found.</p>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {auditLogs.map((log) => (
                                        <div key={log.id} className="flex gap-3 border-b border-stone-100 pb-3 last:border-0 last:pb-0">
                                            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-stone-900 font-sans uppercase tracking-wider">
                                                    {log.action} (Table: {log.table_name})
                                                </p>
                                                <p className="text-[10px] text-stone-400 font-sans mt-0.5">{formatDate(log.created_at)}</p>
                                                {log.changed_fields && Object.keys(log.changed_fields).length > 0 && (
                                                    <div className="mt-2 text-[10px] text-stone-600 font-mono bg-stone-50 p-2 rounded-xl border border-stone-200">
                                                        {Object.entries(log.changed_fields).map(([k, v]) => (
                                                            <div key={k} className="truncate">
                                                                <span className="font-semibold text-stone-700">{k}:</span> {v && typeof v === 'object' ? `${JSON.stringify(v.old)} → ${JSON.stringify(v.new)}` : String(v)}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </CrmLayout>
    );
}
