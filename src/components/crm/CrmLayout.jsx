import { Link, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { path: '/crm', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/crm/bookings', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { path: '/crm/staff', label: 'Staff', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

const ADMIN_NAV = [
  { path: '/crm/staff/new', label: 'Add Staff', icon: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z' },
];

function NavIcon({ d }) {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={d} />
    </svg>
  );
}

export default function CrmLayout({ children, title, subtitle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, logout, isAdmin } = useAuth();

  const isActive = (path) => {
    if (path === '/crm') return location.pathname === '/crm';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#f5f4f1] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-stone-900 text-white shrink-0 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-white/10">
          <Link to="/crm" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center font-serif italic text-stone-900 text-lg font-bold">
              M
            </div>
            <div>
              <p className="font-serif text-sm font-semibold tracking-wide">Murudeshwara</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest">Operations CRM</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={classNames(
                'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.path)
                  ? 'bg-brand-gold text-stone-900 shadow-lg shadow-brand-gold/20'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </Link>
          ))}

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-4 text-[10px] uppercase tracking-widest text-stone-500 font-semibold">Admin</p>
              </div>
              {ADMIN_NAV.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={classNames(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive(item.path)
                      ? 'bg-brand-gold text-stone-900'
                      : 'text-stone-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <NavIcon d={item.icon} />
                  {item.label}
                </Link>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-bold">
              {(profile?.full_name || user?.name || '?').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{profile?.full_name || user?.name}</p>
              <p className="text-[10px] text-stone-400 capitalize">{profile?.role || 'staff'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 text-center py-2 text-[11px] font-semibold text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              Website
            </Link>
            <button
              onClick={() => { logout(); navigate('/crm/login'); }}
              className="flex-1 py-2 text-[11px] font-semibold text-stone-400 hover:text-rose-300 transition-colors rounded-lg hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-black/5 px-4 py-3 flex items-center justify-between">
          <Link to="/crm" className="font-serif font-bold text-stone-900">CRM</Link>
          <div className="flex gap-2">
            <Link to="/crm/bookings" className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-700">Bookings</Link>
            <Link to="/crm/staff" className="text-xs px-3 py-1.5 rounded-full bg-stone-100 text-stone-700">Staff</Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="font-serif text-2xl sm:text-3xl text-stone-900">{title}</h1>}
              {subtitle && <p className="text-sm text-stone-500 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
