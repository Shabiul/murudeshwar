import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
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

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(formatUser(session?.user));
            setLoading(false);
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(formatUser(session?.user));
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const loginUser = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return formatUser(data.user);
    };

    const signUpUser = async (email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'Naaz Admin'
                }
            }
        });
        if (error) throw error;
        return formatUser(data.user);
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginUser, signUpUser, logout, isAuthenticated: !!user }}>
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
