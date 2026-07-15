import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { loginUser, signUpUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showRegisterHelper, setShowRegisterHelper] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const from = location.state?.from?.pathname || '/crm';

    useEffect(() => {
        if (isAuthenticated) {
            navigate(from, { replace: true });
        }
    }, [isAuthenticated, navigate, from]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setShowRegisterHelper(false);
        setIsSubmitting(true);
        try {
            await loginUser(email, password);
            setSuccessMsg('Login successful! Redirecting...');
        } catch (error) {
            const msg = error.message || 'Failed to authenticate.';
            if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('confirm')) {
                setErrorMsg('Email confirmation required. In Supabase → Auth → Providers → Email, disable "Confirm email" and try again.');
            } else {
                setErrorMsg(msg);
                if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('user not found')) {
                    setShowRegisterHelper(true);
                }
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRegisterAdmin = async () => {
        setErrorMsg('');
        setSuccessMsg('');
        setIsSubmitting(true);
        try {
            await signUpUser(email, password);
            setSuccessMsg('Admin account created! Please try logging in now.');
            setShowRegisterHelper(false);
        } catch (error) {
            setErrorMsg(error.message || 'Registration failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-100 flex items-center justify-center px-4 relative overflow-hidden">
            {/* Ambient background blobs */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-stone-300/20 rounded-full blur-[80px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo / Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#071d32] shadow-lg mb-4">
                        <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                    <h1 className="font-serif text-3xl text-stone-900 mb-1">Admin Portal</h1>
                    <p className="text-stone-500 text-sm font-sans">Murudeshwar Resort Management</p>
                </div>

                {/* Card */}
                <div className="bg-white border border-stone-200/80 rounded-[28px] shadow-xl shadow-stone-200/60 p-8">
                    <h2 className="font-serif text-xl text-stone-800 mb-6">Sign In to Dashboard</h2>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 block">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all font-sans"
                                placeholder="admin@murudeshwara.com"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-stone-500 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 pr-10 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-all font-sans"
                                    placeholder="••••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <AnimatePresence>
                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-xs font-sans leading-relaxed"
                                >
                                    {errorMsg}
                                    {showRegisterHelper && (
                                        <button
                                            type="button"
                                            onClick={handleRegisterAdmin}
                                            disabled={isSubmitting}
                                            className="block mt-3 w-full py-2 bg-red-100 hover:bg-red-200 border border-red-300 text-red-700 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-colors"
                                        >
                                            Register Admin in Supabase →
                                        </button>
                                    )}
                                </motion.div>
                            )}
                            {successMsg && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                    className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-emerald-700 text-xs font-sans"
                                >
                                    ✓ {successMsg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3.5 bg-[#071d32] hover:bg-[#0d2d47] text-white font-sans font-bold text-sm uppercase tracking-widest rounded-xl transition-all duration-300 shadow-md disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Signing In...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>
                </div>


                <p className="text-center text-[11px] text-stone-400 mt-6">
                    Murudeshwar Resort · Secure Admin Access
                </p>
            </motion.div>
        </div>
    );
}
