import React from 'react';
import { motion } from 'framer-motion';

const amenities = [
    { name: 'Luxurious Beach View', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" /></svg> },
    { name: 'Airport Drop Facility', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L6 12zm0 0h7" /></svg> },
    { name: 'Free Wi-Fi', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.342 15.558a3 3 0 014.243 0M6.514 12.73a7 7 0 019.9 0M3.686 9.9a11 11 0 0115.63 0M12 18.5a1 1 0 100-2 1 1 0 000 2z" /></svg> },
    { name: 'Laundry Services', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 3a3 3 0 00-3 3v1.25M12 3a3 3 0 013 3v1.25m-6 0h6m-7.5 3h9a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25h-9A2.25 2.25 0 014.5 18.5v-6A2.25 2.25 0 016.75 10.25z" /></svg> },
    { name: 'Quality & Hygienic Meals', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21V9m0 0a3 3 0 016 0v3m-6-3a3 3 0 00-6 0v3m12 0h-3m-6 0H3" /></svg> },
    { name: '24×7 Room Services', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
    { name: 'CCTV Surveillance', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> },
    { name: 'Smart TV Available', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h14.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z" /></svg> },
    { name: 'Parking Facility', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15h3a3 3 0 100-6H9v9" /><rect x="3" y="3" width="18" height="18" rx="4" /></svg> },
    { name: 'Spacious Modern Rooms', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10v9m18-9v9M3 14h18M3 10a2 2 0 012-2h14a2 2 0 012 2v4M7 8v2M17 8v2" /></svg> },
];

export default function WhyChooseUs() {
    return (
        <section className="relative z-10 w-full bg-stone-100 py-24 px-6 md:px-12 border-t border-stone-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

                {/* Left Column */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-4 block">
                            Why Choose Us
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-6 leading-tight">
                            Best Stays &amp; Adventures <br />
                            in <span className="text-gradient-gold">Murudeshwar</span>
                        </h2>
                        <p className="text-stone-500 font-sans text-base md:text-lg leading-relaxed mb-12 max-w-2xl">
                            Murudeshwar is a beautiful coastal town in Karnataka, famous for its magnificent Shiva statue overlooking the Arabian Sea. At Murudeshwara, we ensure a premium stay and travel experience — luxury beachfront accommodations, PADI-certified scuba diving, and top-tier bike rental services.
                        </p>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
                            {[
                                {
                                    title: 'Prime Location',
                                    desc: 'Direct beach access with iconic temple views.',
                                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                },
                                {
                                    title: 'Premium Quality',
                                    desc: 'Luxury accommodations with modern amenities.',
                                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                },
                                {
                                    title: 'Family Friendly',
                                    desc: 'Perfect for families and pilgrims alike.',
                                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                },
                            ].map((card, i) => (
                                <div key={i} className="bg-white border border-stone-200 rounded-[24px] p-6 hover:border-brand-gold/40 hover:shadow-md transition-all duration-300 group">
                                    <div className="w-11 h-11 rounded-full bg-brand-gold/10 flex items-center justify-center text-brand-gold mb-4 group-hover:bg-brand-gold group-hover:text-white transition-all duration-300">
                                        {card.icon}
                                    </div>
                                    <h4 className="font-serif text-lg text-stone-900 mb-2">{card.title}</h4>
                                    <p className="text-stone-500 text-xs font-sans leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>

                        {/* Amenities Grid */}
                        <div className="mb-12 border-t border-stone-200 pt-10">
                            <h3 className="font-serif text-2xl text-stone-900 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-brand-gold rounded-full" />
                                Premium Amenities &amp; Services
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {amenities.map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 bg-white border border-stone-200 rounded-2xl p-3.5 hover:border-brand-gold/30 hover:shadow-sm transition-all duration-300">
                                        <div className="text-brand-gold shrink-0">{item.icon}</div>
                                        <span className="text-stone-700 font-sans text-sm font-medium">{item.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA Row */}
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://wa.me/919459363333?text=Hi!%20I%20am%20interested%20in%20booking%20stays%20at%20Murudeshwar."
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#25D366] hover:bg-[#20BA56] text-white font-sans text-xs font-bold tracking-widest uppercase rounded-full shadow-md transition-all duration-300 hover:scale-105"
                            >
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.717-1.464L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.793 1.453 5.429 0 9.85-4.388 9.854-9.782.002-2.613-1.013-5.07-2.86-6.92C16.587 2.056 14.139 1.04 11.53 1.04c-5.43 0-9.851 4.388-9.854 9.781 0 1.778.49 3.5 1.42 5.021l-1.016 3.71 3.825-.997 1.152.689zm11.366-7.74c-.095-.15-.35-.24-.743-.43-.39-.19-2.316-1.127-2.674-1.255-.357-.128-.618-.19-.875.19-.256.38-.992 1.25-1.216 1.503-.224.25-.449.28-.842.09-.393-.19-1.657-.6-3.156-1.916-1.165-1.025-1.952-2.29-2.18-2.675-.227-.38-.024-.588.173-.777.176-.17.39-.43.585-.645.195-.213.26-.364.39-.607.129-.24.064-.45-.032-.64-.097-.19-.875-2.08-1.2-2.844-.318-.75-.64-.648-.876-.66-.227-.01-.487-.01-.747-.01-.26 0-.682.097-1.04.48-.357.38-1.363 1.31-1.363 3.19 0 1.88 1.385 3.69 1.58 3.944.195.25 2.72 4.1 6.589 5.753.92.39 1.64.62 2.2.8 1 .31 1.9.266 2.61.16.8-.12 2.45-.98 2.79-1.93.34-.95.34-1.77.24-1.93z" />
                                </svg>
                                WhatsApp
                            </a>
                            <a
                                href="tel:+919459363333"
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-sans text-xs font-bold tracking-widest uppercase rounded-full shadow-md transition-all duration-300 hover:scale-105"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                                Call Now
                            </a>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Image */}
                <div className="lg:col-span-5 relative w-full h-[400px] lg:h-[600px] sticky top-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full h-full rounded-[40px] overflow-hidden border border-stone-200 shadow-2xl shadow-stone-300/40"
                    >
                        <img
                            src="https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2650&auto=format&fit=crop"
                            alt="Luxury Stay Interior"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
