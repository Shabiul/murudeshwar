import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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

export default function CreateStaffPage() {
    const { isAdmin, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [form, setForm] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        bio: '',
        hireDate: new Date().toISOString().split('T')[0],
        categories: [],
        avatarUrl: ''
    });

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const handleCategoryToggle = (catKey) => {
        setForm({
            ...form,
            categories: form.categories.includes(catKey)
                ? form.categories.filter(c => c !== catKey)
                : [...form.categories, catKey]
        });
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('DIVERS')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('DIVERS')
                .getPublicUrl(filePath);

            setForm({ ...form, avatarUrl: publicUrl });
        } catch (error) {
            console.error('Error uploading avatar:', error);
            alert('Error uploading avatar');
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password || !form.fullName) return;
        setLoading(true);
        try {
            // Save admin session before creating staff user
            const { data: { session: adminSession } } = await supabase.auth.getSession();

            // Create auth user for the staff member
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: form.password,
                options: {
                    data: {
                        full_name: form.fullName,
                        role: 'staff',
                    }
                }
            });
            if (signUpError) throw signUpError;

            // Insert staff record into the staff table
            if (data?.user?.id) {
                const { error: insertError } = await supabase.from('staff').insert({
                    id: data.user.id,
                    full_name: form.fullName,
                    email: form.email,
                    phone: form.phone || null,
                    bio: form.bio || null,
                    hire_date: form.hireDate || new Date().toISOString().split('T')[0],
                    avatar_url: form.avatarUrl || null,
                    categories: form.categories,
                    is_active: true,
                });
                if (insertError) console.error('Staff table insert error:', insertError);
            }

            // Restore the admin session so we don't get logged out
            if (adminSession) {
                await supabase.auth.setSession({
                    access_token: adminSession.access_token,
                    refresh_token: adminSession.refresh_token,
                });
            }

            alert('Staff created successfully!');
            navigate('/crm/staff');
        } catch (error) {
            console.error('Error creating staff:', error);
            alert('Failed to create staff: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) return navigate('/crm/login');
    if (!isAdmin) return navigate('/crm');

    return (
        <CrmLayout title="Add New Staff" subtitle="Create a new staff member credentials and assign service access levels">
            <div className="max-w-3xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-black/8 rounded-3xl shadow-sm p-8"
                >
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h2 className="font-serif text-2xl text-stone-900 mb-1">Staff Credentials</h2>
                            <p className="text-sm text-stone-500 font-sans">Provide email address and role setup details</p>
                        </div>
                        <Link
                            to="/crm/staff"
                            className="px-4 py-2 rounded-xl font-sans text-xs font-semibold bg-stone-100 text-stone-700 hover:bg-stone-200 transition-all duration-300"
                        >
                            ← Staff Directory
                        </Link>
                    </div>

                        {/* Avatar Upload */}
                        <div className="mb-8 flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-gold/20 to-brand-gold/40 flex items-center justify-center overflow-hidden">
                                    {form.avatarUrl ? (
                                        <img src={form.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-4xl text-brand-gold font-serif">
                                            {form.fullName?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    )}
                                </div>
                                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-stone-900 rounded-full flex items-center justify-center cursor-pointer hover:bg-brand-gold transition-colors">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                    />
                                </label>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-stone-900 font-sans">Profile Photo</p>
                                <p className="text-xs text-stone-500 font-sans">
                                    {uploadingAvatar ? 'Uploading...' : 'Upload a photo for the staff member'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-widest">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={form.fullName}
                                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                        className="w-full border border-black/10 rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all"
                                        placeholder="Enter staff full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-widest">Email *</label>
                                    <input
                                        type="email"
                                        required
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full border border-black/10 rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all"
                                        placeholder="staff@example.com"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-widest">Password *</label>
                                    <input
                                        type="password"
                                        required
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        className="w-full border border-black/10 rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all"
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-widest">Phone</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full border border-black/10 rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all"
                                        placeholder="+91 98765 43210"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-widest">Hire Date</label>
                                <input
                                    type="date"
                                    value={form.hireDate}
                                    onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                                    className="w-full border border-black/10 rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all bg-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-2 uppercase tracking-widest">Bio</label>
                                <textarea
                                    rows={3}
                                    value={form.bio}
                                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                                    className="w-full border border-black/10 rounded-2xl px-4 py-3 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 focus:border-brand-gold/50 transition-all resize-none"
                                    placeholder="A short bio about the staff member"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-stone-700 mb-3 uppercase tracking-widest">Categories</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {CATEGORIES.map(cat => (
                                        <label
                                            key={cat.key}
                                            className={classNames(
                                                "flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all duration-300",
                                                form.categories.includes(cat.key)
                                                    ? "border-brand-gold bg-brand-gold/10"
                                                    : "border-black/10 hover:border-black/20 hover:bg-stone-50"
                                            )}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={form.categories.includes(cat.key)}
                                                onChange={() => handleCategoryToggle(cat.key)}
                                                className="w-5 h-5 rounded border-stone-300 text-brand-gold focus:ring-brand-gold"
                                            />
                                            <span className="text-sm font-sans text-stone-700">{cat.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-black/5">
                                <Link
                                    to="/crm/staff"
                                    className="px-6 py-3 text-xs font-semibold text-stone-600 hover:text-stone-800 bg-stone-100 rounded-full transition-all duration-300 font-sans"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-stone-900 text-white text-xs font-semibold rounded-full hover:bg-brand-gold hover:text-stone-900 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-sans"
                                >
                                    {loading ? 'Creating...' : 'Create Staff'}
                                </button>
                            </div>
                        </form>
                </motion.div>
            </div>
        </CrmLayout>
    );
}
