import React from 'react';
import { motion } from 'framer-motion';
import WhatsAppIcon from './WhatsAppIcon';

export default function FloatingWhatsApp() {
    const phoneNumber = '919459363333';
    const message = encodeURIComponent("Hi! I would like to inquire about bookings and services at Murudeshwara.");
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

    return (
        <motion.a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.5 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-[#25D366] hover:bg-[#20BA56] text-white rounded-full shadow-2xl shadow-[#25D366]/40 group transition-all duration-300 border border-white/20"
            aria-label="Chat on WhatsApp with Murudeshwara"
        >
            <WhatsAppIcon className="w-6 h-6 fill-current text-white animate-pulse" />
            <span className="hidden sm:inline font-sans text-xs font-bold tracking-wider uppercase pr-1">
                Chat with Us
            </span>
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
            </span>
        </motion.a>
    );
}
