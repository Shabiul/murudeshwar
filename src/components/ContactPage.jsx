import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../utils/supabaseClient';

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json"
                },
                body: JSON.stringify({
                    access_key: "0a743d71-5311-4994-bdfa-d3fed6bd5dc1",
                    name: formData.name,
                    email: formData.email,
                    message: formData.message
                })
            });

            const result = await response.json();
            if (result.success) {
                // Save lead to Supabase / LocalStorage database for CRM
                const newLead = {
                    id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    serviceType: 'Contact',
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone: '',
                    timestamp: new Date().toISOString(),
                    status: 'pending',
                    adminNotes: '',
                    details: {
                        message: formData.message
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

                setSubmitStatus('success');
                setFormData({ name: '', email: '', message: '' });
            } else {
                setSubmitStatus('error');
            }
        } catch (error) {
            console.error("Error submitting form", error);
            setSubmitStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <section className="min-h-screen bg-[#0c0c0c] text-white pt-32 pb-20 relative overflow-hidden">
            {/* Background Ambient */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">

                {/* Left: Info */}
                <div className="mt-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <p className="font-sans text-brand-gold text-sm tracking-[0.3em] uppercase mb-6">
                            Contact Us
                        </p>
                        <h1 className="font-serif text-6xl md:text-8xl mb-8 leading-tight">
                            Let's start the <br /> conversation.
                        </h1>
                        <p className="font-sans text-white/60 text-lg leading-relaxed max-w-md mb-12">
                            Whether you are planning a sabbatical, a honeymoon, or a corporate retreat, our experts are ready to craft your perfect itinerary.
                        </p>

                        <div className="space-y-8 font-sans">
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Contact Person</h3>
                                <p className="text-white/80 text-xl font-light">Prajwal Prajwal Venkatraman</p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Phone</h3>
                                <p className="text-white/80 text-xl font-light">
                                    <a href="tel:+919459363333" className="hover:text-brand-gold transition-colors">+91 94593 63333</a>
                                </p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Address</h3>
                                <p className="text-white/80 text-lg font-light leading-relaxed">
                                    Beach road, Murdeshwar Temple Main Rd,<br />
                                    Matadahitlu, Murdeshwar,<br />
                                    Karnataka 581350, India
                                </p>
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Email</h3>
                                <p className="text-white/80 text-xl font-light">
                                    <a href="mailto:concierge@murudeshwara.com" className="hover:text-brand-gold transition-colors">concierge@murudeshwara.com</a>
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Right: Form */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 md:p-12 rounded-3xl">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/50">Name</label>
                                <input
                                    required
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-white/50">Email</label>
                                <input
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-white/50">Message</label>
                            <textarea
                                required
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                rows="4"
                                className="w-full bg-transparent border-b border-white/20 py-3 text-white focus:outline-none focus:border-brand-gold transition-colors resize-none"
                                placeholder="Tell us about your dream trip..."
                            />
                        </div>

                        {submitStatus === 'success' && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm font-sans">
                                Thank you! Your message has been sent successfully. We will get back to you shortly.
                            </div>
                        )}
                        {submitStatus === 'error' && (
                            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-sans">
                                Something went wrong. Please try again or contact us directly.
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-white disabled:bg-white/40 disabled:cursor-not-allowed text-black font-sans font-bold uppercase tracking-widest py-4 rounded-full hover:bg-brand-gold disabled:hover:bg-white/40 transition-colors mt-4"
                        >
                            {submitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}
