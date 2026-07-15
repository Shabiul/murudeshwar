import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomsData } from '../data/roomsData';
import ReservationForm from './ReservationForm';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomDetailPage() {
    const { roomId } = useParams();
    const [showReserve, setShowReserve] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Fallback to deluxe-sea-view if not found or invalid
    const room = roomsData[roomId] || roomsData["deluxe-sea-view"];

    const getIcon = (type) => {
        switch (type) {
            case "bed":
                return (
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-9v14" />
                    </svg>
                );
            case "wifi":
                return (
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.9 9.9 0 0114.14 0M1.414 8.929a15 15 0 0121.172 0" />
                    </svg>
                );
            case "droplet":
                return (
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                );
            case "home":
                return (
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                );
            case "coffee":
                return (
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707" />
                    </svg>
                );
            case "sparkles":
                return (
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.286L13 21l-2.286-5.714L5 12l5.714-2.286L13 3z" />
                    </svg>
                );
            case "layout":
                return (
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                );
            case "bell":
                return (
                    <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                );
            case "users":
                return (
                    <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                );
            case "briefcase":
                return (
                    <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case "heart":
                return (
                    <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                );
            case "map-pin":
                return (
                    <svg className="w-6 h-6 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    // Ideal For list metadata mapping to correct icons
    const getIdealForIcon = (idealName) => {
        switch (idealName.toLowerCase()) {
            case "solo travelers":
            case "solo explorers":
            case "backpackers":
                return (
                    <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                );
            case "business trips":
            case "short trips":
                return (
                    <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                );
            case "small families":
            case "families":
                return (
                    <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                    </svg>
                );
            case "weekend getaways":
            case "staycations":
            case "couples":
            case "honeymooners":
            case "ocean lovers":
            case "luxury seekers":
            case "photographers":
            case "explorers":
            case "budget seekers":
                return (
                    <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                );
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f7] text-stone-900 pt-28 pb-20">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-mono text-stone-400 mb-8 uppercase tracking-wider">
                    <Link to="/" className="hover:text-brand-gold transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/beach-front-stay" className="hover:text-brand-gold transition-colors">Accommodation</Link>
                    <span>/</span>
                    <span className="text-stone-600">{room.title}</span>
                </div>

                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-10">
                    <div className="inline-block bg-stone-100 border border-stone-200/50 text-stone-600 font-sans text-[10px] tracking-wider font-semibold py-1.5 px-4 rounded-full shadow-sm uppercase mb-4">
                        {room.sizeBadge}
                    </div>
                    <h1 className="font-serif text-4xl md:text-5xl text-stone-900 tracking-tight leading-none mb-4">
                        {room.title}
                    </h1>
                    <p className="font-sans text-sm md:text-base text-stone-500 leading-relaxed max-w-2xl mx-auto">
                        {room.subtitle}
                    </p>
                </div>

                {/* Centered Large Main Image with Pill Badges Overlay */}
                <div className="relative w-full max-w-5xl mx-auto h-[350px] sm:h-[450px] md:h-[550px] rounded-[32px] overflow-hidden shadow-lg group mb-12">
                    <img
                        src={room.images.interior}
                        alt="Room Interior View"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                    
                    {/* Bottom-left Pill Badges overlay */}
                    <div className="absolute bottom-6 left-6 flex flex-wrap gap-2.5 z-10">
                        {room.overlayBadges.map((badgeText, idx) => (
                            <span
                                key={idx}
                                className="bg-white/20 backdrop-blur-md border border-white/20 text-white font-sans text-xs px-4 py-2 rounded-full shadow-md tracking-wide"
                            >
                                {badgeText}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Ideal For Section - styled with gray backdrop card */}
                <div className="bg-stone-100/60 border border-stone-200/50 rounded-[28px] p-6 max-w-5xl mx-auto mb-16 shadow-sm">
                    <h3 className="text-center font-sans text-[10px] text-stone-500 uppercase tracking-widest mb-4 font-semibold">Ideal For</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {room.idealFor.map((ideal, idx) => (
                            <div key={idx} className="bg-white border border-stone-200/40 rounded-xl py-3 px-5 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md transition-all">
                                {getIdealForIcon(ideal)}
                                <span className="font-sans font-medium text-xs text-stone-750 uppercase tracking-wider">{ideal}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Split Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start max-w-5xl mx-auto mb-16">
                    {/* Left Column: Description Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="font-serif text-2xl md:text-3xl text-stone-900 leading-tight">
                            {room.mainTitle}
                        </h2>
                        
                        <div className="font-sans text-stone-600 text-sm md:text-base leading-relaxed space-y-4">
                            <p>{room.description[0]}</p>
                            
                            <AnimatePresence initial={false}>
                                {(isExpanded || room.description.length <= 1) ? (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        {room.description.slice(1).map((para, i) => (
                                            <p key={i}>{para}</p>
                                        ))}
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>
                        </div>

                        {room.description.length > 1 && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="font-sans text-xs md:text-sm font-semibold text-brand-gold hover:text-amber-600 transition-colors uppercase tracking-wider flex items-center gap-1 mt-4"
                            >
                                {isExpanded ? "Read Less ↑" : "Read More ↓"}
                            </button>
                        )}
                    </div>

                    {/* Right Column: Floating Booking Card */}
                    <div className="bg-white border border-stone-200 rounded-[28px] overflow-hidden shadow-md lg:sticky lg:top-28 w-full max-w-md mx-auto">
                        <div className="p-8 flex flex-col">
                            <div className="text-center mb-6">
                                <span className="font-sans text-[10px] text-stone-400 block uppercase tracking-wider mb-1">Starting from</span>
                                <h3 className="font-serif text-3xl text-stone-900 font-bold mb-1">{room.bookingCard.priceTitle}</h3>
                                <p className="font-sans text-[10px] text-stone-400 block uppercase tracking-wider">per night</p>
                            </div>

                            <hr className="border-stone-100 mb-6" />

                            {/* Check list */}
                            <ul className="space-y-3.5 mb-8">
                                {room.bookingCard.bullets.map((bullet, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-stone-600 font-sans">
                                        <div className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5 text-emerald-600">
                                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTAs */}
                            <div className="space-y-3">
                                <a
                                    href={`https://wa.me/919459363333?text=Hello,%20I'm%20interested%20in%20booking%20the%20${encodeURIComponent(room.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-4 px-6 bg-[#071d32] hover:bg-[#0f2d4a] text-white font-sans text-xs tracking-widest font-semibold uppercase flex items-center justify-center gap-2 rounded-xl transition-all shadow-sm"
                                >
                                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.982L2 22l5.233-1.372a9.948 9.948 0 004.779 1.218h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.925 9.925 0 0012.012 2zm5.835 14.16c-.24.673-1.398 1.293-1.92 1.347-.478.05-1.096.068-1.748-.14a9.697 9.697 0 01-3.69-2.029l-.096-.084c-.31-.274-.633-.585-.92-0.89a9.123 9.123 0 01-2.062-2.955c-.244-.407-.272-.733-.082-.998.172-.24.372-.44.557-.655.127-.148.204-.265.297-.435.097-.183.05-.353-.025-.509-.074-.156-.665-1.602-.912-2.195-.24-.582-.487-.503-.665-.512h-.565c-.195 0-.51.073-.777.362-.267.288-1.02.996-1.02 2.429s1.042 2.818 1.187 3.014c.145.195 2.05 3.13 4.965 4.387 2.422 1.045 2.912.836 3.435.787.525-.049 1.69-.691 1.932-1.358.243-.668.243-1.24.17-1.358-.073-.119-.267-.195-.563-.343z" />
                                    </svg>
                                    Book via WhatsApp
                                </a>

                                <Link
                                    to="/beach-front-stay"
                                    className="w-full py-4 px-6 bg-transparent hover:bg-stone-50 border border-stone-250 text-stone-700 font-sans text-xs tracking-widest font-semibold uppercase flex items-center justify-center gap-2 rounded-xl transition-all"
                                >
                                    View All Rooms →
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Highlights Columns (3 Centered Feature Cards) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
                    {room.highlights.map((highlight, idx) => (
                        <div key={idx} className="bg-white border border-stone-200/80 rounded-[24px] p-8 shadow-sm flex flex-col items-center text-center">
                            <div className="w-12 h-12 rounded-full bg-stone-50 border border-stone-200/50 flex items-center justify-center mb-4 text-brand-gold">
                                {getIcon(highlight.icon)}
                            </div>
                            <h4 className="font-serif text-base text-stone-900 mb-2 font-semibold">{highlight.title}</h4>
                            <p className="font-sans text-xs text-stone-500 leading-relaxed">{highlight.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Why Choose Section */}
                <div className="bg-white border border-stone-200 rounded-[28px] p-8 md:p-12 max-w-5xl mx-auto mb-16 shadow-sm">
                    <h3 className="font-serif text-2xl text-stone-900 mb-8 text-center md:text-left">
                        Why Choose {room.title}?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {room.whyChoose.map((choose, idx) => (
                            <div key={idx} className="flex gap-4">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="font-serif text-sm font-semibold text-stone-900">{choose.title}</h4>
                                    <p className="font-sans text-xs text-stone-500 leading-relaxed">{choose.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Amenities Section */}
                <div className="max-w-5xl mx-auto mb-16">
                    <div className="text-center mb-10">
                        <h2 className="font-serif text-2xl text-stone-900 mb-2">Room Amenities</h2>
                        <p className="text-stone-400 font-sans text-xs uppercase tracking-wider font-semibold">Everything you need for a comfortable stay</p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {room.amenities.map((item, idx) => (
                            <div key={idx} className="bg-white border border-stone-200/80 rounded-[20px] p-5 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                                <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-3 text-brand-gold">
                                    {getIcon(item.icon)}
                                </div>
                                <h4 className="font-sans font-semibold text-xs text-stone-850 mb-1">{item.name}</h4>
                                <p className="font-sans text-[10px] text-stone-400 uppercase tracking-wider">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Location Map Section */}
                <div className="mb-20 bg-white border border-stone-200 rounded-[32px] p-8 md:p-12 shadow-sm max-w-5xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-8">
                        <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-3 block">Location</span>
                        <h2 className="font-serif text-2xl text-stone-900 mb-2">Where you'll be staying</h2>
                        <p className="text-stone-500 font-sans text-xs sm:text-sm">
                            Beach road, Murdeshwar Temple Main Rd, Matadahitlu, Murdeshwar, Karnataka 581350, India
                        </p>
                    </div>
                    <div className="w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden border border-stone-200 relative bg-stone-100 shadow-sm">
                        <iframe
                            title="Room Location Map"
                            src="https://maps.google.com/maps?q=Beach%20road%2C%20Murdeshwar%20Temple%20Main%20Rd%2C%20Matadahitlu%2C%20Murdeshwar%2C%20Karnataka%20581350%2C%20India&t=&z=16&ie=UTF8&iwloc=&output=embed"
                            className="w-full h-full border-0 absolute inset-0"
                            allowFullScreen=""
                            loading="lazy"
                        />
                    </div>
                </div>

                {/* Bottom Banner CTA */}
                <div className="bg-[#071d32] text-white rounded-[32px] p-8 md:p-14 text-center shadow-xl border border-[#0f2d4a] relative overflow-hidden max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/5 via-transparent to-transparent opacity-60"></div>
                    <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                        <h2 className="font-serif text-3xl md:text-4xl text-white">Ready for a Comfortable Stay?</h2>
                        <p className="font-sans text-xs md:text-sm text-stone-300 leading-relaxed">
                            Book your {room.title} today and experience the perfect blend of comfort, value, and personal care at KVK Beach Residency.
                        </p>
                        <button
                            onClick={() => setShowReserve(true)}
                            className="px-8 py-3.5 bg-brand-gold hover:bg-white text-black hover:scale-105 rounded-full font-sans text-xs tracking-widest font-semibold uppercase transition-all shadow-md"
                        >
                            Book Your Stay Now
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showReserve && (
                    <ReservationForm
                        destination={{ title: room.title, price: "Room Booking", image: room.images.interior }}
                        onClose={() => setShowReserve(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
