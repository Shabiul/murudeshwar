import { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ReservationForm from './ReservationForm';
import { useAuth } from '../context/AuthContext';

export default function Header() {
    const [scrolled, setScrolled]               = useState(false);
    const [showReserve, setShowReserve]         = useState(false);
    const [isOpen, setIsOpen]                   = useState(false);
    const [isDropdownOpen, setIsDropdownOpen]   = useState(false);
    const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen]       = useState(false);
    const dropdownRef = useRef(null);
    const location    = useLocation();
    const { user, isAuthenticated, logout } = useAuth();

    /* Close menus on route change */
    useEffect(() => {
        setIsOpen(false);
        setIsDropdownOpen(false);
        setMobileServicesOpen(false);
    }, [location.pathname]);

    /* Scroll detection */
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    /* Close dropdown on outside click */
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const navItems = [
        { name: 'Home',        path: '/' },
        { name: 'About',       path: '/about' },
        {
            name: 'Services',
            isDropdown: true,
            subItems: [
                { name: 'Scuba Diving',     path: '/courses' },
                { name: 'Beach-Front Stay', path: '/beach-front-stay' },
                { name: 'Bike Rental',      path: '/bike-rental' },
            ],
        },
        { name: 'Gallery',     path: '/gallery' },
        { name: 'Attractions', path: '/attractions' },
        { name: 'Crew',        path: '/crew' },
        { name: 'Courses',     path: '/courses' },
    ];

    /* ── Always light theme ── */
    const light = true;

    /* Shared text colour helpers */
    const navLinkCls = (isActive) => classNames(
        'transition-colors uppercase tracking-wide relative font-sans',
        scrolled ? 'text-[11px]' : 'text-xs',
        isActive
            ? 'text-brand-gold font-bold'
            : 'text-stone-700 hover:text-brand-gold'
    );

    return (
        <>
            <header
                className={classNames(
                    'fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out flex flex-col backdrop-blur-md border',
                    {
                        'w-[95%] max-w-7xl py-4 px-8 bg-white/60  border-black/8':  !scrolled && !isOpen,
                        'w-[95%] max-w-7xl py-4 px-8 bg-white     border-black/10': !scrolled && isOpen,
                        'w-[92%] max-w-6xl py-2 px-5  bg-white/80 border-black/10': scrolled  && !isOpen,
                        'w-[92%] max-w-6xl py-2 px-5  bg-white    border-black/10': scrolled  && isOpen,
                        'rounded-[24px]': isOpen,
                        'rounded-full':   !isOpen,
                    }
                )}
            >
                {/* ── Top row ── */}
                <div className="w-full flex items-center justify-between relative">

                    {/* Logo */}
                    <Link
                        to="/"
                        className={classNames(
                            'font-serif font-bold tracking-widest flex items-center gap-2 group transition-all duration-300 text-stone-900',
                            scrolled ? 'text-base md:text-lg' : 'text-xl'
                        )}
                    >
                        <div className={classNames(
                            'rounded-full flex items-center justify-center font-serif italic bg-stone-900 text-white group-hover:bg-brand-gold transition-all duration-300',
                            scrolled ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-lg'
                        )}>
                            M
                        </div>
                        <span>MURUDESHWARA</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className={classNames(
                        'hidden lg:flex items-center justify-center flex-grow font-sans transition-all duration-300',
                        scrolled ? 'gap-5' : 'gap-10'
                    )}>
                        {navItems.map(item => {
                                /* ── Dropdown item ── */
                                if (item.isDropdown) {
                                    const isSubActive = item.subItems.some(s => location.pathname === s.path);
                                    return (
                                        <div key={item.name} className="relative py-2" ref={dropdownRef}>
                                            {/* Toggle button — click to open/close, hover also works */}
                                            <button
                                                onClick={() => setIsDropdownOpen(prev => !prev)}
                                                onMouseEnter={() => setIsDropdownOpen(true)}
                                                className={classNames(
                                                    'uppercase tracking-wide flex items-center gap-1.5 font-sans outline-none relative transition-colors duration-200',
                                                    scrolled ? 'text-[11px]' : 'text-xs',
                                                    isSubActive
                                                        ? 'text-brand-gold font-bold'
                                                        : 'text-stone-700 hover:text-brand-gold'
                                                )}
                                            >
                                                <span>{item.name}</span>
                                                <svg
                                                    style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}
                                                    className="w-3.5 h-3.5"
                                                    fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                                {isSubActive && <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-gold" />}
                                            </button>

                                            {/* Dropdown panel — stays open until outside click or link click */}
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: '100%',
                                                    left: '50%',
                                                    transform: isDropdownOpen
                                                        ? 'translateX(-50%) translateY(0) scale(1)'
                                                        : 'translateX(-50%) translateY(-6px) scale(0.96)',
                                                    opacity: isDropdownOpen ? 1 : 0,
                                                    pointerEvents: isDropdownOpen ? 'auto' : 'none',
                                                    transition: 'opacity 0.2s ease, transform 0.2s ease',
                                                    transformOrigin: 'top center',
                                                    marginTop: '10px',
                                                    minWidth: '210px',
                                                    zIndex: 200,
                                                }}
                                                className="bg-white/95 border border-black/8 rounded-2xl shadow-xl py-2 flex flex-col overflow-hidden backdrop-blur-xl"
                                            >
                                                {item.subItems.map(sub => {
                                                    const active = location.pathname === sub.path;
                                                    return (
                                                        <Link
                                                            key={sub.name}
                                                            to={sub.path}
                                                            onClick={() => setIsDropdownOpen(false)}
                                                            className={classNames(
                                                                'px-5 py-3 text-[11px] uppercase tracking-wider transition-colors text-left font-sans',
                                                                active
                                                                    ? 'text-brand-gold font-semibold bg-stone-50'
                                                                    : 'text-stone-600 hover:text-brand-gold hover:bg-stone-50'
                                                            )}
                                                        >
                                                            {sub.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                }

                                /* ── Regular nav link ── */
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={navLinkCls(isActive)}
                                    >
                                        {item.name}
                                        {isActive && <span className="absolute -bottom-1 left-0 w-full h-px bg-brand-gold" />}
                                    </Link>
                                );
                            })}
                        </nav>

                    {/* Right side — CTA + burger */}
                    <div className="flex items-center gap-4 md:gap-5">
                        {isAuthenticated ? (
                            <div className="relative hidden lg:block" onMouseEnter={() => setUserMenuOpen(true)} onMouseLeave={() => setUserMenuOpen(false)}>
                                <button
                                    onClick={() => setUserMenuOpen(prev => !prev)}
                                    className="flex items-center gap-2 outline-none group"
                                >
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-8 h-8 rounded-full border border-stone-300 group-hover:border-brand-gold transition-colors"
                                    />
                                </button>
                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                                            className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl py-2 z-[210] origin-top-right overflow-hidden"
                                        >
                                            <div className="px-4 py-2 border-b border-stone-105 mb-1">
                                                <p className="text-[11px] font-bold text-stone-800 truncate">{user.name}</p>
                                                <p className="text-[9px] text-stone-400 truncate capitalize">{user.provider} Admin</p>
                                            </div>
                                            <Link
                                                to="/crm"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="block px-4 py-2 text-xs text-stone-605 hover:bg-stone-50 hover:text-brand-gold font-sans font-semibold text-left"
                                            >
                                                CRM Dashboard
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    logout();
                                                    setUserMenuOpen(false);
                                                }}
                                                className="w-full text-left block px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-sans font-semibold"
                                            >
                                                Logout
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className={classNames(
                                    'hidden lg:inline-block uppercase tracking-wide font-sans font-semibold hover:text-brand-gold transition-colors duration-200 text-stone-700',
                                    scrolled ? 'text-[11px]' : 'text-xs'
                                )}
                            >
                                Login
                            </Link>
                        )}

                        <Link
                            to="/contact"
                            className={classNames(
                                'rounded-full font-sans font-semibold bg-stone-900 text-white hover:bg-brand-gold transition-all duration-300 hover:scale-105 inline-block text-center',
                                scrolled ? 'px-4 py-1.5 text-xs' : 'px-5 py-2 md:px-6 text-xs md:text-sm'
                            )}
                        >
                            Contact
                        </Link>

                        {/* Burger */}
                        <button
                            onClick={() => setIsOpen(prev => !prev)}
                            className="lg:hidden p-1.5 rounded-full text-stone-900 hover:bg-black/5 transition-colors"
                            aria-label="Toggle Menu"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                {isOpen
                                    ? <path d="M18 6L6 18M6 6l12 12" />
                                    : <path d="M4 12h16M4 6h16M4 18h16" />
                                }
                            </svg>
                        </button>
                    </div>
                </div>

                {/* ── Mobile menu ── */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: 'easeInOut' }}
                            className="w-full lg:hidden pt-4 pb-2 flex flex-col gap-2 mt-3 border-t border-black/10 overflow-hidden"
                        >
                            {navItems.map(item => {
                                if (item.isDropdown) {
                                    const isSubActive = item.subItems.some(s => location.pathname === s.path);
                                    return (
                                        <div key={item.name} className="flex flex-col">
                                            <button
                                                onClick={() => setMobileServicesOpen(prev => !prev)}
                                                className={classNames(
                                                    'text-xs uppercase tracking-widest py-2 font-sans font-medium flex items-center justify-between w-full text-left transition-colors',
                                                    isSubActive ? 'text-brand-gold font-bold' : 'text-stone-800'
                                                )}
                                            >
                                                <span>{item.name}</span>
                                                <svg
                                                    className={classNames('w-4 h-4 transition-transform duration-300', { 'rotate-180': mobileServicesOpen })}
                                                    fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            <AnimatePresence>
                                                {mobileServicesOpen && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="pl-4 flex flex-col gap-1.5 border-l-2 border-brand-gold/30 my-1 overflow-hidden"
                                                    >
                                                        {item.subItems.map(sub => {
                                                            const active = location.pathname === sub.path;
                                                            return (
                                                                <Link
                                                                    key={sub.name}
                                                                    to={sub.path}
                                                                    onClick={() => { setIsOpen(false); setMobileServicesOpen(false); }}
                                                                    className={classNames(
                                                                        'text-[10px] uppercase tracking-wider py-1.5 font-sans transition-colors block',
                                                                        active ? 'text-brand-gold font-semibold' : 'text-stone-500 hover:text-brand-gold'
                                                                    )}
                                                                >
                                                                    {sub.name}
                                                                </Link>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                }

                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        onClick={() => setIsOpen(false)}
                                        className={classNames(
                                            'text-xs uppercase tracking-widest py-1.5 font-sans font-medium block transition-colors',
                                            isActive ? 'text-brand-gold font-bold' : 'text-stone-800 hover:text-brand-gold'
                                        )}
                                    >
                                        {item.name}
                                    </Link>
                                );
                            })}

                            {/* Mobile Auth options */}
                            <div className="border-t border-black/5 mt-3 pt-3 flex flex-col gap-2">
                                {isAuthenticated ? (
                                    <>
                                        <div className="flex items-center gap-3 py-1.5">
                                            <img
                                                src={user.avatar}
                                                alt={user.name}
                                                className="w-7 h-7 rounded-full border border-stone-300"
                                            />
                                            <div className="leading-tight text-left">
                                                <p className="text-[11px] font-bold text-stone-800 truncate">{user.name}</p>
                                                <p className="text-[9px] text-stone-400 truncate capitalize">{user.provider} Admin</p>
                                            </div>
                                        </div>
                                        <Link
                                            to="/crm"
                                            onClick={() => setIsOpen(false)}
                                            className="text-xs uppercase tracking-widest py-1.5 font-sans font-semibold text-brand-gold block"
                                        >
                                            CRM Dashboard
                                        </Link>
                                        <button
                                            onClick={() => {
                                                logout();
                                                setIsOpen(false);
                                            }}
                                            className="text-xs uppercase tracking-widest py-1.5 font-sans font-semibold text-rose-600 text-left block"
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        to="/login"
                                        onClick={() => setIsOpen(false)}
                                        className="text-xs uppercase tracking-widest py-1.5 font-sans font-semibold text-stone-850 hover:text-brand-gold block"
                                    >
                                        Admin Login
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            <AnimatePresence>
                {showReserve && <ReservationForm onClose={() => setShowReserve(false)} />}
            </AnimatePresence>
        </>
    );
}
