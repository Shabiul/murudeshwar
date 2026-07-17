import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../context/AuthContext';
import CrmLayout from './crm/CrmLayout';

const CATEGORIES = [
    { key: 'Stay', label: 'Beach Front Stay' },
    { key: 'Scuba', label: 'Scuba Diving' },
    { key: 'Bike', label: 'Bike Rental' },
    { key: 'Contact', label: 'General Contact' }
];

const STATUS_OPTIONS = ['pending', 'confirmed', 'completed', 'cancelled'];

const getStatusStyle = (status) => {
    switch (status) {
        case 'confirmed':
            return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'completed':
            return 'bg-slate-50 text-slate-700 border-slate-200';
        case 'cancelled':
            return 'bg-rose-50 text-rose-700 border-rose-200';
        default:
            return 'bg-amber-50 text-amber-700 border-amber-200';
    }
};

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

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export default function LeadDetailPage() {
    const { user, profile, logout, isAdmin, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [lead, setLead] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [staff, setStaff] = useState([]);
    const [scrolled, setScrolled] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        if (!profile) return;
        fetchData();
    }, [profile?.id, id]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [leadsRes, attachmentsRes, staffRes] = await Promise.all([
                supabase.from('leads').select('*, assigned:assigned_to(id, full_name, avatar_url)').eq('id', id).single(),
                supabase.from('lead_attachments').select('*').eq('lead_id', id).order('created_at', { ascending: false }),
                isAdmin ? supabase.from('staff').select('id, full_name').eq('is_active', true) : { data: [] }
            ]);

            setLead(leadsRes.data);
            setAttachments(attachmentsRes.data || []);
            setStaff(staffRes.data || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        await supabase.from('leads').update({ status: newStatus }).eq('id', id);
        await fetchData();
    };

    const handleAssign = async (staffId) => {
        await supabase.from('leads').update({ assigned_to: staffId || null }).eq('id', id);
        await fetchData();
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `leads/${id}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('DIVERS')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('DIVERS')
                .getPublicUrl(filePath);

            await supabase.from('lead_attachments').insert({
                lead_id: id,
                file_name: file.name,
                file_url: publicUrl,
                file_type: file.type,
                file_size: file.size,
                uploaded_by: user?.id
            });

            await fetchData();
        } catch (err) {
            console.error('Error uploading file:', err);
            alert('Error uploading file');
        } finally {
            setUploading(false);
        }
    };

    const handleSaveNotes = async () => {
        await supabase.from('leads').update({ admin_notes: notes }).eq('id', id);
        await fetchData();
    };

    const getCategoryLabel = (key) => CATEGORIES.find(c => c.key === key)?.label || key;

    if (!profile) return null;
    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-brand-gold border-t-transparent" />
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-8">
                <h2 className="font-serif text-2xl text-stone-900 mb-2">Lead not found</h2>
                <p className="text-sm text-stone-500 font-sans mb-6">The lead you're looking for doesn't exist.</p>
                <Link
                    to="/crm"
                    className="px-6 py-3 rounded-full bg-stone-900 text-white text-xs font-semibold hover:bg-brand-gold hover:text-stone-900 transition-all duration-300 font-sans"
                >
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <CrmLayout title="Lead Booking Details" subtitle={`Manage status, details, notes, and attachments for ${lead.name}`}>
            <div className="max-w-5xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link
                        to="/crm"
                        className="px-4 py-2 rounded-xl font-sans text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all duration-300"
                    >
                        ← Back to Bookings & Leads
                    </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lead Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white border border-black/8 rounded-3xl p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="font-serif text-2xl text-stone-900">{lead.name}</h1>
                                    {lead.email && <p className="text-sm text-stone-500 font-sans mt-1">{lead.email}</p>}
                                    {lead.phone && <p className="text-sm text-stone-500 font-sans">{lead.phone}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={classNames(
                                        'inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-full border',
                                        getCategoryStyle(lead.service_type)
                                    )}>
                                        {getCategoryLabel(lead.service_type)}
                                    </span>
                                    {isAdmin ? (
                                        <select
                                            value={lead.status}
                                            onChange={(e) => handleStatusChange(e.target.value)}
                                            className="text-xs border border-black/10 rounded-full px-3 py-1.5 bg-white font-sans focus:outline-none focus:ring-2 focus:ring-brand-gold/30"
                                        >
                                            {STATUS_OPTIONS.map(s => (
                                                <option key={s} value={s} className="capitalize">{s}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span className={classNames(
                                            'inline-flex items-center px-3 py-1.5 text-[11px] font-semibold rounded-full border capitalize',
                                            getStatusStyle(lead.status)
                                        )}>
                                            {lead.status}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {lead.details?.checkIn && (
                                <div className="p-4 bg-stone-50 rounded-2xl mb-4">
                                    <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-widest mb-2 font-sans">Booking Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <p className="text-xs text-stone-500 font-sans">Check-in</p>
                                            <p className="text-sm font-medium text-stone-900 font-sans">{formatDate(lead.details.checkIn)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-stone-500 font-sans">Check-out</p>
                                            <p className="text-sm font-medium text-stone-900 font-sans">{formatDate(lead.details.checkOut)}</p>
                                        </div>
                                        {lead.details.room && (
                                            <div>
                                                <p className="text-xs text-stone-500 font-sans">Room</p>
                                                <p className="text-sm font-medium text-stone-900 font-sans">{lead.details.room}</p>
                                            </div>
                                        )}
                                        {lead.details.guests && (
                                            <div>
                                                <p className="text-xs text-stone-500 font-sans">Guests</p>
                                                <p className="text-sm font-medium text-stone-900 font-sans">{lead.details.guests}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {lead.notes && (
                                <div className="mb-4">
                                    <h3 className="text-xs font-semibold text-stone-700 uppercase tracking-widest mb-2 font-sans">Customer Notes</h3>
                                    <p className="text-sm text-stone-600 font-sans italic">{lead.notes}</p>
                                </div>
                            )}

                            {isAdmin && (
                                <div>
                                    <label className="text-xs font-semibold text-stone-700 uppercase tracking-widest mb-2 font-sans block">Internal Notes</label>
                                    <textarea
                                        value={notes !== '' ? notes : lead.admin_notes || ''}
                                        onChange={(e) => setNotes(e.target.value)}
                                        rows={3}
                                        className="w-full border border-black/10 rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 resize-none"
                                        placeholder="Add internal notes..."
                                    />
                                    <button
                                        onClick={handleSaveNotes}
                                        className="mt-2 px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-full hover:bg-brand-gold hover:text-stone-900 transition-all duration-300 font-sans"
                                    >
                                        Save Notes
                                    </button>
                                </div>
                            )}
                        </motion.div>

                        {/* Attachments */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white border border-black/8 rounded-3xl p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-serif text-xl text-stone-900">Attachments</h2>
                                <label className="px-4 py-2 bg-brand-gold text-stone-900 text-xs font-semibold rounded-full hover:brightness-110 transition-all duration-300 cursor-pointer font-sans">
                                    {uploading ? 'Uploading...' : 'Upload File'}
                                    <input
                                        type="file"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                            {attachments.length === 0 ? (
                                <p className="text-sm text-stone-500 font-sans">No attachments yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {attachments.map((att) => (
                                        <a
                                            key={att.id}
                                            href={att.file_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 border border-black/10 rounded-2xl hover:bg-stone-50 transition-all duration-300"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0">
                                                {att.file_type?.startsWith('image/') ? (
                                                    <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-5 h-5 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-stone-900 font-sans truncate">{att.file_name}</p>
                                                <p className="text-xs text-stone-500 font-sans">{formatDate(att.created_at)}</p>
                                            </div>
                                        </a>
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
                            <h2 className="font-serif text-xl text-stone-900 mb-4">Assigned To</h2>
                            {isAdmin ? (
                                <div>
                                    <select
                                        value={lead.assigned_to || ''}
                                        onChange={(e) => handleAssign(e.target.value)}
                                        className="w-full border border-black/10 rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 bg-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {staff.map(s => (
                                            <option key={s.id} value={s.id}>{s.full_name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : lead.assigned ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-gold/20 to-brand-gold/40 flex items-center justify-center flex-shrink-0">
                                        {lead.assigned.avatar_url ? (
                                            <img src={lead.assigned.avatar_url} alt={lead.assigned.full_name} className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <span className="text-lg text-brand-gold font-serif">{lead.assigned.full_name?.charAt(0)?.toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-stone-900 font-sans">{lead.assigned.full_name}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-stone-500 font-sans">Unassigned</p>
                            )}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white border border-black/8 rounded-3xl p-6"
                        >
                            <h2 className="font-serif text-xl text-stone-900 mb-4">Timeline</h2>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-2 h-2 rounded-full bg-brand-gold mt-1.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-stone-900 font-sans">Lead created</p>
                                        <p className="text-xs text-stone-500 font-sans">{formatDate(lead.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </CrmLayout>
    );
}
