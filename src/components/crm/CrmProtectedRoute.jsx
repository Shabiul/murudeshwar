import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CrmProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading, logout } = useAuth();
  const location = useLocation();

  // Listen for browser BACK button navigation inside CRM to auto-logout and redirect to main website
  useEffect(() => {
    if (!isAuthenticated) return;

    const handlePopState = async (e) => {
      try {
        // Await the asynchronous Supabase signOut call to ensure the session token is fully deleted
        // from local storage before page unload redirect triggers.
        await logout();
      } catch (err) {
        console.error("Auto-logout during back button navigation failed:", err);
      }
      window.location.href = '/';
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated, logout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-brand-gold border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/crm/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/crm" replace />;
  }

  return children;
}
