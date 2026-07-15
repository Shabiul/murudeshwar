import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { loginUser, signUpUser, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('admin@murudeshwara.com');
    const [password, setPassword] = useState('NaazAiLabs@786345');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showRegisterHelper, setShowRegisterHelper] = useState(false);

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
            console.error('Login error:', error);
            const msg = error.message || 'Failed to authenticate.';
            
            if (msg.toLowerCase().includes('email not confirmed') || msg.toLowerCase().includes('confirm')) {
                setErrorMsg('Admin account was successfully created, but your Supabase project requires Email Confirmation. To fix this:\n\n1. Open your Supabase Console.\n2. Navigate to Auth -> Providers -> Email.\n3. Disable "Confirm email" toggle.\n4. Click Save, and try logging in again!');
            } else {
                setErrorMsg(msg);
                // If user does not exist in Supabase auth, show the register helper option
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
            setSuccessMsg('Admin user registered successfully in your Supabase Auth! Logging in...');
            // Automatically log in after registration
            setTimeout(async () => {
                try {
                    await loginUser(email, password);
                } catch (err) {
                    setErrorMsg('Registered, but failed to auto-login. Please type password and click Log In.');
                }
            }, 1500);
        } catch (error) {
            console.error('Registration error:', error);
            setErrorMsg(error.message || 'Failed to register admin account.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="min-h-screen bg-[#0c0c0c] text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Ambient Background Lights */}
            <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-brand-gold/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#142d42]/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[32px] shadow-2xl relative z-10"
            >
                {/* Logo & Header */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-brand-gold/10 border border-brand-gold/20 flex items-center justify-center font-serif text-3xl text-brand-gold font-bold">
                        M
                    </div>
                </div>
                <h1 className="font-serif text-4xl mb-2 text-center text-white font-medium">CRM Access Portal</h1>
                <p className="font-sans text-white/50 text-xs mb-8 text-center max-w-xs mx-auto">
                    Sign in with your authorized admin account to manage bookings, leads, and services.
                </p>

                {/* Status Messages */}
                <AnimatePresence mode="wait">
                    {errorMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-left"
                        >
                            <p className="font-semibold mb-1">Authentication Failed</p>
                            <p>{errorMsg}</p>
                        </motion.div>
                    )}

                    {successMsg && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl text-left"
                        >
                            <p className="font-semibold mb-1">Success</p>
                            <p>{successMsg}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Email / Password Form */}
                <form onSubmit={handleLogin} className="space-y-5 text-left">
                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@murudeshwara.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors font-sans"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 block mb-2">
                            Security Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-gold transition-colors font-sans"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full mt-4 py-3.5 bg-brand-gold hover:bg-brand-gold/90 disabled:bg-brand-gold/50 text-white font-sans font-bold uppercase tracking-wider rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            'Log In'
                        )}
                    </button>
                </form>

                {/* Registration Helper for Missing Database Users */}
                {showRegisterHelper && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 border-t border-white/5 pt-6 text-left"
                    >
                        <p className="text-[11px] text-white/40 mb-3 leading-relaxed">
                            No account found matching this email. If this is a new Supabase database, you can initialize this admin account now:
                        </p>
                        <button
                            onClick={handleRegisterAdmin}
                            disabled={isSubmitting}
                            className="w-full py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-semibold rounded-lg transition-colors"
                        >
                            Register admin in Supabase
                        </button>
                    </motion.div>
                )}

                <div className="mt-8 border-t border-white/5 pt-6 flex items-center justify-between text-[10px] text-white/30 font-sans uppercase tracking-widest">
                    <span>Protected Area</span>
                    <span>Murudeshwara CRM v2.0</span>
                </div>
            </motion.div>
        </section>
    );
}
