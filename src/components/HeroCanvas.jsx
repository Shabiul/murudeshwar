import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HeroCanvas() {
    return (
        <div className="relative w-full h-full bg-black flex items-center justify-center overflow-hidden">
            {/* Video Background */}
            <video
                src="/videos/videoplayback.webm"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover filter contrast-[1.05] saturate-[1.05]"
            />

            {/* Dark Overlay for Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/60 pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white flex flex-col items-center py-20">
                <motion.span
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-xs md:text-sm font-sans uppercase tracking-[0.3em] text-amber-400 mb-4 font-semibold"
                >
                    Welcome to Murudeshwar
                </motion.span>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.2 }}
                    className="font-serif text-[clamp(2.5rem,7vw,6rem)] leading-[1.05] tracking-tight mb-6 drop-shadow-2xl"
                >
                    EXPLORE PARADISE
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.4 }}
                    className="font-sans text-base md:text-xl text-white/80 max-w-2xl mb-8 font-light leading-relaxed"
                >
                    Experience coastal luxury, certified PADI scuba diving, beachfront stays, and seamless travel services. You deserve it.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.9, delay: 0.6 }}
                    className="flex flex-wrap justify-center gap-4"
                >
                    <Link to="/contact">
                        <button className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-full font-sans tracking-wider uppercase text-xs transition-all duration-300 shadow-lg hover:scale-105">
                            Contact Us
                        </button>
                    </Link>
                    <Link to="/beach-front-stay">
                        <button className="px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/30 rounded-full text-white font-sans tracking-wider uppercase text-xs hover:bg-white/20 transition-all duration-300 shadow-lg hover:scale-105">
                            Beach-Front Stay
                        </button>
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}

