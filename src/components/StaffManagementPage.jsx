import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function StaffManagementPage() {
    const { user, profile, logout, isAdmin } = useAuth();
    const navigate = useNavigate();
    
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [editForm, setEditForm] = useState({ full_name: '', phone: '', bio: '', categories: [] });
    const [selectedCategory, setSelectedCategory] = useState('all');

    const calculateWorkExperience = (hireDate) => {
        if (!hireDate) return 'New';
        const hire = new Date(hireDate);
        const now = new Date();
        const diffTime = Math.abs(now - hire);
        const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
        
        if (diffMonths < 1) return 'New';
        if (diffMonths < 12) return `${diffMonths} mo${diffMonths !== 1 ? 's' : ''}`;
        const years = Math.floor(diffMonths / 12);
        const months = diffMonths % 12;
        if (months === 0) return `${years} yr${years !== 1 ? 's' : ''}`;
        return `${years} yr${years !== 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
    };

    const filteredStaff = staff.filter(member => {
        if (selectedCategory === 'all') return true;
        return member.categories?.includes(selectedCategory);
    });

    const fetchStaff = useCallback(async () => {
        if (!isAdmin) return;
        
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('staff')
                .select('*')
                .order('full_name');
            
            if (error) {
                console.error('Error fetching staff:', error);
            } else {
                setStaff(data || []);
            }
        } catch (err) {
            console.error('Unexpected error:', err);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchStaff();
    }, [fetchStaff]);

    const handleEditStaff = (staffMember) => {
        setEditingStaff(staffMember);
        setEditForm({
            full_name: staffMember.full_name || '',
            phone: staffMember.phone || '',
            bio: staffMember.bio || '',
            categories: staffMember.categories || []
        });
    };

    const handleUpdateStaff = async (e) => {
        e.preventDefault();
        try {
            await supabase
                .from('staff')
                .update(editForm)
                .eq('id', editingStaff.id);
            setEditingStaff(null);
            fetchStaff();
        } catch (error) {
            console.error('Error updating staff:', error);
        }
    };

    const handleToggleActive = async (staffId, currentStatus) => {
        try {
            await supabase
                .from('staff')
                .update({ is_active: !currentStatus })
                .eq('id', staffId);
            fetchStaff();
        } catch (error) {
            console.error('Error toggling staff status:', error);
        }
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-serif text-stone-900 mb-2">Access Denied</h1>
                    <p className="text-stone-600">You don't have permission to view this page.</p>
                    <Link to="/crm" className="mt-4 inline-block text-brand-gold hover:text-amber-700">Go to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <CrmLayout title="Staff Management" subtitle="Monitor active team members, view service credentials, and view historical logging">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-stone-900">Active Staff</h2>
                <div className="flex items-center gap-3">
                    <button onClick={fetchStaff} className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors">
                        Refresh
                    </button>
                    <Link to="/crm/staff/new" className="px-4 py-2 text-xs font-semibold bg-brand-gold text-stone-900 rounded-xl hover:brightness-110 transition-colors">
                        Add New Staff
                    </Link>
                </div>
            </div>

            {/* Department/Service Categories Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                        selectedCategory === 'all'
                            ? 'bg-brand-gold text-stone-900 border-brand-gold shadow-sm font-bold'
                            : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                    }`}
                >
                    All Staff
                </button>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                            selectedCategory === cat.key
                                ? 'bg-brand-gold text-stone-900 border-brand-gold shadow-sm font-bold'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-brand-gold border-t-transparent" />
                </div>
            ) : filteredStaff.length === 0 ? (
                <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                    <p className="text-stone-500 text-sm">No staff members found under this service category.</p>
                    <Link to="/crm/staff/new" className="mt-4 inline-block text-xs font-bold text-brand-gold hover:text-amber-700">Add staff member</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaff.map((member) => (
                            <motion.div 
                                key={member.id} 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-stone-200 flex items-center justify-center">
                                                {member.avatar_url ? (
                                                    <img src={member.avatar_url} alt={member.full_name} className="w-12 h-12 rounded-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-medium text-stone-600">{member.full_name?.charAt(0) || '?'}</span>
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-stone-900">{member.full_name}</h3>
                                                <p className="text-xs text-stone-500">{member.email}</p>
                                                <p className="text-[10px] text-stone-400 mt-0.5">Tenure: {member.hire_date ? calculateWorkExperience(member.hire_date) : 'New'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleToggleActive(member.id, member.is_active)}
                                            className={`px-2 py-1 text-xs rounded-full ${member.is_active !== false ? 'bg-emerald-100 text-emerald-700' : 'bg-stone-100 text-stone-600'}`}
                                        >
                                            {member.is_active !== false ? 'Active' : 'Inactive'}
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Categories</p>
                                            <div className="flex flex-wrap gap-1">
                                                {member.categories?.length > 0 ? (
                                                    member.categories.map(cat => (
                                                        <span key={cat} className="px-2 py-0.5 text-xs rounded-full bg-stone-100 text-stone-600">
                                                            {CATEGORIES.find(c => c.key === cat)?.label || cat}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-sm text-stone-400">No categories assigned</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {member.phone && (
                                            <div>
                                                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Phone</p>
                                                <p className="text-sm text-stone-700">{member.phone}</p>
                                            </div>
                                        )}
                                        
                                        {member.bio && (
                                            <div>
                                                <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Bio</p>
                                                <p className="text-sm text-stone-700 line-clamp-2">{member.bio}</p>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between">
                                        <Link to={`/crm/staff/${member.id}`} className="text-sm text-brand-gold hover:text-amber-700 font-medium">
                                            View Details
                                        </Link>
                                        <button onClick={() => handleEditStaff(member)} className="text-sm text-stone-600 hover:text-stone-900">
                                            Edit
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

            {/* Edit Staff Modal */}
            {editingStaff && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-stone-900 bg-opacity-75 transition-opacity" onClick={() => setEditingStaff(null)} />
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleUpdateStaff}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <h3 className="text-lg font-serif text-stone-900 mb-4">Edit Staff Member</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700">Full Name</label>
                                            <input type="text" required value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="mt-1 block w-full rounded-lg border-stone-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700">Phone</label>
                                            <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="mt-1 block w-full rounded-lg border-stone-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700">Bio</label>
                                            <textarea rows="3" value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} className="mt-1 block w-full rounded-lg border-stone-300 shadow-sm focus:border-brand-gold focus:ring-brand-gold" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-2">Categories</label>
                                            <div className="space-y-2">
                                                {CATEGORIES.map(cat => (
                                                    <label key={cat.key} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={editForm.categories.includes(cat.key)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setEditForm({...editForm, categories: [...editForm.categories, cat.key]});
                                                                } else {
                                                                    setEditForm({...editForm, categories: editForm.categories.filter(c => c !== cat.key)});
                                                                }
                                                            }}
                                                            className="rounded border-stone-300 text-brand-gold focus:ring-brand-gold"
                                                        />
                                                        <span className="ml-2 text-sm text-stone-700">{cat.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-stone-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button type="submit" className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-brand-gold text-base font-medium text-stone-900 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold sm:ml-3 sm:w-auto sm:text-sm">
                                        Save Changes
                                    </button>
                                    <button type="button" onClick={() => setEditingStaff(null)} className="mt-3 w-full inline-flex justify-center rounded-lg border border-stone-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-gold sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </CrmLayout>
    );
}
