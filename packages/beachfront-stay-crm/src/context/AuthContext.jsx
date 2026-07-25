import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    const formatUser = (supabaseUser) => {
        if (!supabaseUser) return null;
        const email = supabaseUser.email;
        const name = supabaseUser.user_metadata?.full_name || email.split('@')[0];
        return {
            id: supabaseUser.id,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            email: email,
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
            provider: 'supabase'
        };
    };

    const fetchProfile = async (userId) => {
        if (!userId) return null;
        try {
            // First check admins
            const { data: adminData } = await supabase
                .from('admins')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (adminData) {
                return { ...adminData, role: 'admin' };
            }

            // Then check staff
            const { data: staffData } = await supabase
                .from('staff')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (staffData) {
                return { ...staffData, role: 'staff' };
            }
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
        return null;
    };

    const refreshProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            const prof = await fetchProfile(session.user.id);
            setProfile(prof);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const getSessionAndProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                const formatted = formatUser(session.user);
                const prof = await fetchProfile(session.user.id);
                if (isMounted) {
                    setUser(formatted);
                    setProfile(prof);
                }
            } else {
                if (isMounted) {
                    setUser(null);
                    setProfile(null);
                }
            }
            if (isMounted) {
                setLoading(false);
            }
        };

        getSessionAndProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                const formatted = formatUser(session.user);
                const prof = await fetchProfile(session.user.id);
                if (isMounted) {
                    setUser(formatted);
                    setProfile(prof);
                }
            } else {
                if (isMounted) {
                    setUser(null);
                    setProfile(null);
                }
            }
            if (isMounted) {
                setLoading(false);
            }
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const loginUser = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return formatUser(data.user);
    };

    const signUpUser = async (email, password, role = 'admin') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: role === 'admin' ? 'Naaz Admin' : 'Staff Member',
                    role: role
                }
            }
        });
        if (error) throw error;
        return formatUser(data.user);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    };

    const isAdmin = profile?.role === 'admin' || user?.email?.includes('admin') || user?.email === 'admin@murudeshwara.com';
    const isStaff = profile?.role === 'staff';

    return (
        <AuthContext.Provider value={{ 
            user, 
            profile, 
            loading, 
            loginUser, 
            signUpUser, 
            logout, 
            isAuthenticated: !!user,
            isAdmin,
            isStaff,
            refreshProfile
        }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

