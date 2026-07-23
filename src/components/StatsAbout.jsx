import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';

function Counter({ value, duration = 1.5 }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    useEffect(() => {
        if (!isInView) return;
        const isPercent = value.includes('%');
        const isPlus    = value.includes('+');
        const numStr    = value.replace(/[%+]/g, '');
        const target    = parseFloat(numStr);
        if (isNaN(target)) { setCount(value); return; }
        const hasDecimal  = numStr.includes('.');
        const startTime   = performance.now();
        const updateCount = (now) => {
            const progress     = Math.min((now - startTime) / (duration * 1000), 1);
            const easeProgress = progress * (2 - progress);
            const currentVal   = easeProgress * target;
            setCount(hasDecimal ? currentVal.toFixed(1) : Math.floor(currentVal));
            if (progress < 1) requestAnimationFrame(updateCount);
        };
        requestAnimationFrame(updateCount);
    }, [isInView, value, duration]);

    return (
        <span ref={ref}>
            {count}
            {value.includes('%') && '%'}
            {value.includes('+') && '+'}
        </span>
    );
}

const statsData = [
    { value: '4.8',   label: 'Guest Rating' },
    { value: '500+',  label: 'Happy Guests' },
    { value: '15+',   label: 'Years Experience' },
    { value: '100%',  label: 'Prime Location' },
];

export default function StatsAbout() {
    return (
        <section className="relative z-10 w-full bg-[#faf9f7] py-24 px-6 md:px-12 border-t border-stone-200">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">

                {/* Left Column */}
                <div className="lg:col-span-7 flex flex-col justify-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1.0] }}
                        className="flex flex-col items-start"
                    >
                        <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-4">
                            Our Story &amp; Passion
                        </span>
                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-stone-900 mb-6 leading-tight">
                            Crafting Lifelong <br />
                            <span className="text-gradient-gold">Ocean Memories</span>
                        </h2>
                        <p className="text-stone-500 font-sans text-base md:text-lg leading-relaxed mb-8 max-w-2xl">
                            Located along the pristine shores of Murudeshwar, Scuba Spirit is built on a passion for exploring the deep. We bring together world-class instruction, premium seaside accommodation, and local adventure services to create seamless coastal retreats. Every journey is curated to connect you deeply with the sea and the coastal spirit of India.
                        </p>

                        {/* Stats Row */}
                        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 mt-4">
                            {statsData.map((stat, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                                    className="flex flex-col border-l-2 border-brand-gold/30 pl-4 py-1 hover:border-brand-gold transition-colors duration-500 group"
                                >
                                    <span className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-stone-900 group-hover:text-brand-gold transition-colors duration-500">
                                        <Counter value={stat.value} />
                                    </span>
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400 mt-1">
                                        {stat.label}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        <Link
                            to="/about"
                            className="group inline-flex items-center justify-center px-8 py-3.5 bg-stone-900 text-white font-sans text-xs font-semibold tracking-widest uppercase rounded-full transition-all duration-300 hover:bg-brand-gold hover:scale-105"
                        >
                            <span className="flex items-center gap-2">
                                Know More
                                <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </span>
                        </Link>
                    </motion.div>
                </div>

                {/* Right Column: Image */}
                <div className="lg:col-span-5 relative w-full h-[400px] lg:h-[550px]">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full h-full rounded-[40px] overflow-hidden border border-stone-200 shadow-2xl shadow-stone-200/60"
                    >
                        <img
                            src="/Photos/image.png"
                            alt="Murudeshwara Shoreline"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                        />
                    </motion.div>
                </div>

            </div>
        </section>
    );
}
