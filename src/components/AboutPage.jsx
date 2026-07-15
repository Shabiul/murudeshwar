import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function AboutPage() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    const cards = [
        {
            title: "Prime Location",
            description: "Surrounded by the beautiful Arabian Sea and Murudeshwar Temple, turning your stay into luxurious sightseeing.",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            )
        },
        {
            title: "Budget Friendly",
            description: "Budget-friendly stay with prime accommodations and balcony view of Murudeshwar Temple.",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
        {
            title: "Luxury Rooms",
            description: "Elegantly furnished rooms with modern amenities to make your stay worthy.",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 9a5 5 0 005 5c0 2 1.657 3.657 3.657 3.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 3h6m0 0v6m0-6L14 10" />
                </svg>
            )
        },
        {
            title: "Personalized Service",
            description: "Dedicated staff ensuring attentive and personalized service for your comfort.",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            )
        },
        {
            title: "Memorable Experience",
            description: "From sunrise yoga to sunset beach views, we make your visit memorable.",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-[#faf9f7] text-stone-900 pt-32 pb-24 px-6 md:px-12">
            <div className="max-w-7xl mx-auto">
                {/* Hero Header */}
                <div className="relative h-[45vh] rounded-[40px] overflow-hidden mb-16 shadow-lg border border-stone-200">
                    <img
                        src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=2670&auto=format&fit=crop"
                        alt="About Us"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="text-center">
                            <h1 className="font-serif text-5xl md:text-7xl mb-4 text-white drop-shadow-md">About Us</h1>
                            <p className="font-sans text-xs md:text-sm tracking-[0.2em] uppercase text-white/90">Our Story</p>
                        </div>
                    </div>
                </div>

                {/* About Content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20 items-center">
                    <div>
                        <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-4 block">Who We Are</span>
                        <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-6 leading-tight">
                            Providing the Best Coastal Experience in <span className="text-gradient-gold">Murudeshwar</span>
                        </h2>
                        <p className="text-stone-500 font-sans text-base leading-relaxed mb-6">
                            We are committed to delivering top-tier hospitality and adventure services. From premium beachfront stay accommodations with breathtaking temple views to certified scuba diving courses and reliable bike rentals, we ensure every aspect of your trip is handled with absolute professionalism.
                        </p>
                        <p className="text-stone-500 font-sans text-base leading-relaxed">
                            Our team of experienced instructors, friendly local guides, and attentive staff work around the clock to create seamless, memorable journeys along the beautiful shores of Karnataka.
                        </p>
                    </div>
                    <div className="relative h-[320px] rounded-[32px] overflow-hidden shadow-xl border border-stone-200">
                        <img
                            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2670&auto=format&fit=crop"
                            alt="Coastal Scuba"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Why Choose Us Cards Section (From Image 1) */}
                <div className="mb-20">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-4 block">Our Pillars</span>
                        <h2 className="font-serif text-3xl md:text-4xl text-stone-900">Why Travelers Choose Us</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cards.map((card, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-white border border-stone-200/80 rounded-[24px] p-8 shadow-sm hover:shadow-md hover:border-brand-gold/30 transition-all duration-300 flex flex-col items-start"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center mb-6">
                                    {card.icon}
                                </div>
                                <h3 className="font-serif text-xl text-stone-900 font-semibold mb-3">{card.title}</h3>
                                <p className="text-stone-500 font-sans text-sm leading-relaxed">{card.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
