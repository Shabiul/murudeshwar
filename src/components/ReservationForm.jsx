import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

export default function ReservationForm({ destination, onClose }) {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        guests: '1 Guest',
        dates: ''
    });
    const [errors, setErrors] = useState({});

    // Resolve details with safe fallbacks to prevent broken images
    const displayInfo = {
        title: destination?.title || "Plan Your Journey",
        price: destination?.price || "Tailored Experience",
        image: destination?.image || destination?.images?.interior || "https://images.unsplash.com/photo-1476900543704-4312b78632f8?q=80&w=2670&auto=format&fit=crop"
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Simple client-side validation
        const newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First name required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name required";
        if (!formData.email.trim()) {
            newErrors.email = "Email required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.dates) newErrors.dates = "Please select dates";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Save lead to Supabase / LocalStorage database for CRM
        const newLead = {
            id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            serviceType: 'Stay',
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email.trim(),
            phone: '',
            timestamp: new Date().toISOString(),
            status: 'pending',
            adminNotes: '',
            details: {
                roomTitle: displayInfo.title,
                guests: formData.guests,
                dates: formData.dates
            }
        };

        const saveLead = async () => {
            try {
                const { error } = await supabase.from('leads').insert([{
                    name: newLead.name,
                    email: newLead.email,
                    phone: null,
                    service_type: newLead.serviceType,
                    status: newLead.status,
                    admin_notes: null,
                    details: newLead.details
                }]);
                if (error) throw error;
            } catch (error) {
                console.warn("Supabase insert failed, falling back to localStorage:", error);
                const storedLeads = localStorage.getItem('crm_leads');
                const leadsList = storedLeads ? JSON.parse(storedLeads) : [];
                leadsList.unshift(newLead);
                localStorage.setItem('crm_leads', JSON.stringify(leadsList));
            }
        };
        saveLead();

        setIsSubmitted(true);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 flex items-center justify-center text-white transition-colors"
                >
                    ✕
                </button>

                <AnimatePresence mode="wait">
                    {!isSubmitted ? (
                        <motion.form
                            key="form"
                            onSubmit={handleSubmit}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Header Image */}
                            <div className="h-40 w-full relative">
                                <img
                                    src={displayInfo.image}
                                    alt={displayInfo.title}
                                    className="w-full h-full object-cover opacity-60"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#111] to-transparent" />
                                <div className="absolute bottom-4 left-6">
                                    <h3 className="font-serif text-2xl text-white">{displayInfo.title}</h3>
                                    <p className="text-brand-gold text-[11px] font-mono uppercase tracking-widest">{displayInfo.price}</p>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="p-8 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold block">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className={`w-full bg-white/5 border ${errors.firstName ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                                            placeholder="John"
                                        />
                                        {errors.firstName && <span className="text-[10px] text-red-400 font-sans block">{errors.firstName}</span>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold block">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className={`w-full bg-white/5 border ${errors.lastName ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                                            placeholder="Doe"
                                        />
                                        {errors.lastName && <span className="text-[10px] text-red-400 font-sans block">{errors.lastName}</span>}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold block">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                                        placeholder="john@example.com"
                                    />
                                    {errors.email && <span className="text-[10px] text-red-400 font-sans block">{errors.email}</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold block">Guests</label>
                                        <select
                                            name="guests"
                                            value={formData.guests}
                                            onChange={handleInputChange}
                                            className="w-full bg-[#1e1e1e] border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors"
                                        >
                                            <option>1 Guest</option>
                                            <option>2 Guests</option>
                                            <option>3-4 Guests</option>
                                            <option>5+ Guests</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-white/50 font-semibold block">Dates</label>
                                        <input
                                            type="date"
                                            name="dates"
                                            value={formData.dates}
                                            onChange={handleInputChange}
                                            className={`w-full bg-white/5 border ${errors.dates ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-2.5 text-white/80 text-sm focus:outline-none focus:border-brand-gold transition-colors`}
                                        />
                                        {errors.dates && <span className="text-[10px] text-red-400 font-sans block">{errors.dates}</span>}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-4 bg-brand-gold hover:bg-white text-black font-sans font-bold uppercase tracking-widest rounded-xl transition-all duration-300 shadow-lg hover:shadow-brand-gold/10"
                                    >
                                        Confirm Reservation
                                    </button>
                                    <p className="text-center text-white/40 text-[9px] mt-3 uppercase tracking-wider font-mono">
                                        Our concierge will contact you within 24 hours.
                                    </p>
                                </div>
                            </div>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="p-12 text-center flex flex-col items-center justify-center space-y-6"
                        >
                            {/* Animated Success Checkmark */}
                            <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center text-emerald-500 relative">
                                <motion.svg
                                    className="w-10 h-10"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="3"
                                    viewBox="0 0 24 24"
                                >
                                    <motion.path
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                    />
                                </motion.svg>
                            </div>

                            <div className="space-y-2">
                                <h3 className="font-serif text-3xl text-white">Reservation Confirmed!</h3>
                                <p className="text-stone-400 text-sm font-sans max-w-sm mx-auto">
                                    Thank you, <span className="text-white font-medium">{formData.firstName}</span>. Your inquiry for the <span className="text-brand-gold font-medium">{displayInfo.title}</span> has been received. Our concierge team will reach out to you shortly.
                                </p>
                            </div>

                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-white font-sans text-xs tracking-widest uppercase transition-all"
                            >
                                Close Window
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    );
}
