import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import { useAuth } from '../../context/AuthContext';
import PropertySwitcher from './PropertySwitcher';

const NAV = [
  { path: '/crm', label: 'Overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { path: '/crm/bookings', label: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { path: '/crm/customers', label: 'Customers', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { path: '/crm/staff', label: 'Staff Directory', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
];

const OPERATIONS_NAV = [
  { path: '/crm/rooms', label: 'Rooms Inventory', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { path: '/crm/room-calendar', label: 'Schedules Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { path: '/crm/housekeeping', label: 'Housekeeping', icon: 'M9.813 15.904L9 21l5.096-.813a2 2 0 001.414-.586l5.096-5.096a2 2 0 000-2.828l-2.263-2.263a2 2 0 00-2.828 0l-5.096 5.096a2 2 0 00-.586 1.414zM21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { path: '/crm/maintenance', label: 'Maintenance', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z' },
  { path: '/crm/tasks', label: 'Kanban Tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
  { path: '/crm/lost-found', label: 'Lost & Found', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { path: '/crm/inventory', label: 'Inventory Stock', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { path: '/crm/documents', label: 'Documents Vault', icon: 'M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8' },
];

const RENTAL_NAV = [
  { path: '/crm/bikes/inventory', label: 'Bike Fleet', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { path: '/crm/bikes/bookings', label: 'Bike Reservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { path: '/crm/cars/inventory', label: 'Car Fleet', icon: 'M8 17a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4zM3 9l2-4h10l2 4M3 9h18v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' },
  { path: '/crm/cars/bookings', label: 'Car & Chauffeur Trips', icon: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1' },
  { path: '/crm/drivers', label: 'Chauffeur Drivers', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { path: '/crm/rentals/maintenance', label: 'Vehicle Damage Audit', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' }
];

const ANALYTICS_NAV = [
  { path: '/crm/notifications', label: 'Notification Center', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { path: '/crm/reports', label: 'Analytics Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z' },
  { path: '/crm/communications', label: 'Communication Center', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
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
  
  const navRef = useRef(null);

  // Restore sidebar scroll position on mount & navigation
  useEffect(() => {
    const savedScroll = sessionStorage.getItem('crm_sidebar_scroll');
    if (savedScroll && navRef.current) {
      navRef.current.scrollTop = parseInt(savedScroll, 10);
    }
  }, [location.pathname]);

  const handleSidebarClick = () => {
    if (navRef.current) {
      sessionStorage.setItem('crm_sidebar_scroll', navRef.current.scrollTop);
    }
  };
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const isActive = (path) => {
    if (path === '/crm') return location.pathname === '/crm';
    return location.pathname.startsWith(path);
  };

  // Mock global search pool (matches rooms, bookings, staff, customers)
  const searchPool = [
    { type: 'Room', label: 'Room 101 - Deluxe Sea View', link: '/crm/rooms' },
    { type: 'Room', label: 'Room 204 - Premium Beachside Cozy', link: '/crm/rooms' },
    { type: 'Staff', label: 'Prajwal Hegde (Scuba Instructor)', link: '/crm/staff' },
    { type: 'Staff', label: 'Manjunath Gowda (Stay Housekeeping)', link: '/crm/staff' },
    { type: 'Booking', label: 'Rohan Sharma (Stay - Pending)', link: '/crm/bookings' },
    { type: 'Booking', label: 'Anjali Desai (Scuba - Confirmed)', link: '/crm/bookings' },
    { type: 'Customer', label: 'John Doe (VIP guest)', link: '/crm/customers' },
    { type: 'Customer', label: 'Amit Varma (Regular guest)', link: '/crm/customers' }
  ];

  const filteredSearchResults = searchQuery
    ? searchPool.filter(item => item.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-[#f5f4f1] dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-stone-900 text-white shrink-0 fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link to="/crm" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-brand-gold flex items-center justify-center font-serif italic text-stone-900 text-lg font-bold">
              M
            </div>
            <div>
              <p className="font-serif text-sm font-semibold tracking-wide">Murudeshwara</p>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest text-left">CRM 2.0</p>
            </div>
          </Link>
        </div>

        <nav
          ref={navRef}
          onClick={handleSidebarClick}
          data-lenis-prevent
          className="flex-1 p-4 space-y-1 overflow-y-auto"
        >
          {NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={classNames(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.path)
                  ? 'bg-brand-gold text-stone-900 shadow-lg shadow-brand-gold/20'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </Link>
          ))}

          <div className="pt-3 pb-1">
            <p className="px-4 text-[9px] uppercase tracking-widest text-stone-500 font-bold">Resort Operations</p>
          </div>
          {OPERATIONS_NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={classNames(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.path)
                  ? 'bg-brand-gold text-stone-900 shadow-lg shadow-brand-gold/20'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </Link>
          ))}

          <div className="pt-3 pb-1">
            <p className="px-4 text-[9px] uppercase tracking-widest text-stone-500 font-bold">Vehicle Fleet & Rentals</p>
          </div>
          {RENTAL_NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={classNames(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive(item.path)
                  ? 'bg-brand-gold text-stone-900 shadow-lg shadow-brand-gold/20'
                  : 'text-stone-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <NavIcon d={item.icon} />
              {item.label}
            </Link>
          ))}

          <div className="pt-3 pb-1">
            <p className="px-4 text-[9px] uppercase tracking-widest text-stone-500 font-bold">Intelligence & Config</p>
          </div>
          {ANALYTICS_NAV.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={classNames(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
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
              <div className="pt-3 pb-1">
                <p className="px-4 text-[9px] uppercase tracking-widest text-stone-500 font-bold">Admin Actions</p>
              </div>
              <Link
                to="/crm/staff/new"
                className={classNames(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                  isActive('/crm/staff/new')
                    ? 'bg-brand-gold text-stone-900'
                    : 'text-stone-300 hover:bg-white/10 hover:text-white'
                )}
              >
                <NavIcon d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                Add Staff Member
              </Link>
            </>
          )}
        </nav>

        <div className="p-4 border-t border-white/10 bg-stone-950/40">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center text-xs font-bold">
                {(profile?.full_name || user?.name || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate max-w-[120px]">{profile?.full_name || user?.name}</p>
                <p className="text-[9px] text-stone-400 capitalize">{profile?.role || 'staff'}</p>
              </div>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {darkMode ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.364l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 text-center py-1.5 text-[10px] font-semibold text-stone-400 hover:text-white transition-colors rounded-lg hover:bg-white/5 border border-white/5"
            >
              Website
            </Link>
            <button
              onClick={() => { logout(); navigate('/crm/login'); }}
              className="flex-1 py-1.5 text-[10px] font-semibold text-stone-400 hover:text-rose-300 transition-colors rounded-lg hover:bg-white/5 border border-white/5"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* CRM Top Header Control Panel */}
        <header className="sticky top-0 z-30 bg-white/70 dark:bg-stone-900/70 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Search Trigger Button */}
            <div className="relative w-full max-w-xs sm:max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400 dark:text-stone-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Global search (Ctrl + K)..."
                onClick={() => setShowSearchModal(true)}
                readOnly
                className="w-full pl-9 pr-4 py-1.5 bg-stone-100 dark:bg-stone-850 hover:bg-stone-200/60 dark:hover:bg-stone-800/80 border border-stone-200 dark:border-stone-750 text-xs rounded-lg cursor-pointer focus:outline-none transition-colors"
              />
            </div>
          </div>
          
          {/* Quick Stats Panel Header Indicator */}
          <div className="flex items-center gap-3">
            <PropertySwitcher />
            <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50">
              System Online (:")
            </span>
          </div>
        </header>

        {/* Global Search Overlay Modal */}
        {showSearchModal && (
          <div className="fixed inset-0 z-50 bg-stone-950/50 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4">
            <div className="w-full max-w-xl bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden transition-all transform scale-100">
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search rooms, staff directory, leads, tasks..."
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-0 focus:ring-0 text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => { setShowSearchModal(false); setSearchQuery(''); }}
                  className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 text-xs px-2 py-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  ESC
                </button>
              </div>

              <div className="max-h-[320px] overflow-y-auto p-2">
                {searchQuery === '' ? (
                  <div className="p-4 text-center text-xs text-stone-400">
                    Type a query to search across the resort database.
                  </div>
                ) : filteredSearchResults.length > 0 ? (
                  <div className="space-y-1">
                    {filteredSearchResults.map((result, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setShowSearchModal(false);
                          setSearchQuery('');
                          navigate(result.link);
                        }}
                        className="w-full text-left p-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 rounded-xl flex items-center justify-between text-xs transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-900 dark:text-stone-100">{result.label}</span>
                          <span className="text-[10px] text-stone-400 mt-0.5">{result.type}</span>
                        </div>
                        <span className="text-[10px] text-brand-gold font-medium">Go to page &rarr;</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-stone-400">
                    No results found for "{searchQuery}". Try searching "Room", "Prajwal", or "Rohan".
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl flex-1">
          {(title || subtitle) && (
            <div className="mb-8">
              {title && <h1 className="font-serif text-2xl sm:text-3xl text-stone-900 dark:text-stone-50">{title}</h1>}
              {subtitle && <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

