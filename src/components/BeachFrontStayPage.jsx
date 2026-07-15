import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import ReservationForm from './ReservationForm';

export default function BeachFrontStayPage() {
    const [showReserve, setShowReserve] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const rooms = [
        {
            id: "standard-double",
            title: "Standard Double Room",
            bed: "1 Bed",
            size: "350 sqft",
            popular: false,
            image: "/Photos/DSC_3854.JPG",
            description: "Our Standard Double Room is perfect for solo travelers, business travelers, and small families seeking comfort and convenience. Enjoy modern amenities and cozy spaces.",
            amenities: ["Queen bed", "Breakfast (optional)", "Free WiFi", "Room service", "Housekeeping service", "Mineral water", "+2 more"]
        },
        {
            id: "deluxe-double",
            title: "Deluxe Double Room",
            bed: "1 Bed",
            size: "400 sqft",
            popular: true,
            image: "/Photos/DSC_3958.JPG",
            description: "Experience the perfect mix of comfort, style, and natural beauty. Our Deluxe Rooms feature beachfront views offering beautiful sunset views and balcony access.",
            amenities: ["Queen bed", "Air conditioning", "Breakfast (optional)", "Kettle", "Free WiFi", "Room service", "+5 more"]
        },
        {
            id: "deluxe-sea-view",
            title: "Deluxe Sea View",
            bed: "1 Bed",
            size: "450 sqft",
            popular: true,
            image: "/Photos/DSC_3974.JPG",
            description: "Wake up to breathtaking views of the Arabian Sea in our premium Deluxe Sea View Room. Featuring a spacious floor plan, king-size bed, and premium amenities.",
            amenities: ["King bed", "Air conditioning", "Breakfast (optional)", "Kettle", "Free WiFi", "Room service", "+5 more"]
        }
    ];

    const services = [
        {
            title: "Airport Transfer",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
            )
        },
        {
            title: "Laundry",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                </svg>
            )
        },
        {
            title: "Quality Food",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
            )
        },
        {
            title: "Room Service",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )
        },
        {
            title: "CCTV Surveillance",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: "Free WiFi",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071a9.9 9.9 0 0114.14 0M1.414 8.929a15 15 0 0121.172 0" />
                </svg>
            )
        },
        {
            title: "Smart TV",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            title: "24/7 Reception",
            icon: (
                <svg className="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        }
    ];

    const whyStay = [
        {
            title: "Beach Access",
            desc: "Steps from the shore",
            icon: (
                <svg className="w-8 h-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-9v14" />
                </svg>
            )
        },
        {
            title: "Temple Proximity",
            desc: "Near Murudeshwar Temple",
            icon: (
                <svg className="w-8 h-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            title: "Top Rated",
            desc: "Loved by guests",
            icon: (
                <svg className="w-8 h-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.969 0 1.371 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.176 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
            )
        },
        {
            title: "24/7 Service",
            desc: "Always here for you",
            icon: (
                <svg className="w-8 h-8 text-stone-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )
        }
    ];

    const openBooking = (room) => {
        setSelectedRoom(room);
        setShowReserve(true);
    };

    return (
        <div className="min-h-screen bg-[#faf9f7] text-stone-900 pt-32 pb-24">
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                {/* Hero section */}
                <div className="relative h-[55vh] rounded-[40px] overflow-hidden mb-20 shadow-lg border border-stone-200">
                    <img
                        src="/Photos/DSC_0426.JPG"
                        alt="Beach Front Stay"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/25 flex flex-col items-center justify-center text-center px-4">
                        <span className="font-mono text-brand-gold text-xs md:text-sm tracking-[0.3em] uppercase mb-4 drop-shadow-sm">
                            Your Coastal Sanctuary
                        </span>
                        <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 drop-shadow-md">
                            Beach-Front Stays
                        </h1>
                        <button
                            onClick={() => openBooking({ title: "General Accommodation Stay" })}
                            className="px-8 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white font-sans tracking-widest uppercase text-xs hover:bg-brand-gold hover:text-black hover:border-brand-gold transition-all duration-300 shadow-md"
                        >
                            Inquire Now
                        </button>
                    </div>
                </div>

                {/* Accommodations Grid (From Image 3) */}
                <div className="mb-24">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-4 block">Premium Living</span>
                        <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">Our Accommodations</h2>
                        <p className="text-stone-500 font-sans text-sm">Select from our meticulously designed beachfront sanctuaries.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {rooms.map((room, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: idx * 0.1 }}
                                className="bg-white border border-stone-200 rounded-[28px] overflow-hidden shadow-sm hover:shadow-md hover:border-brand-gold/20 transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="relative h-[240px] overflow-hidden">
                                    <img
                                        src={room.image}
                                        alt={room.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                    />
                                    {room.popular && (
                                        <div className="absolute top-4 left-4 bg-brand-gold text-white font-sans text-[10px] tracking-wider font-semibold py-1.5 px-3 rounded-full flex items-center gap-1 shadow-sm uppercase">
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            Popular Choice
                                        </div>
                                    )}
                                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white font-sans text-xs px-3 py-1.5 rounded-full flex gap-3">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            </svg>
                                            {room.bed}
                                        </span>
                                        <span className="opacity-40">|</span>
                                        <span>{room.size}</span>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 flex flex-col flex-grow">
                                    <h3 className="font-serif text-2xl text-stone-900 mb-3">{room.title}</h3>
                                    <p className="text-stone-500 font-sans text-sm leading-relaxed mb-6 flex-grow">{room.description}</p>
                                    
                                    <div className="mb-6">
                                        <h4 className="font-sans font-semibold text-[10px] tracking-wider text-stone-400 mb-3 uppercase">Key Amenities</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {room.amenities.map((item, idx) => (
                                                <span key={idx} className="bg-stone-100 text-stone-600 font-sans text-[11px] px-3 py-1.5 rounded-full">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-auto">
                                        <Link
                                            to={`/beach-front-stay/${room.id}`}
                                            className="py-3 px-4 bg-transparent border border-stone-300 rounded-full font-sans text-xs tracking-wider uppercase text-stone-700 hover:bg-stone-50 transition-colors text-center"
                                        >
                                            View Details →
                                        </Link>
                                        <a
                                            href={`https://wa.me/919459363333?text=Hello,%20I'm%20interested%20in%20booking%20the%20${encodeURIComponent(room.title)}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="py-3 px-4 bg-stone-900 hover:bg-stone-850 text-white rounded-full font-sans text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                        >
                                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 001.333 4.982L2 22l5.233-1.372a9.948 9.948 0 004.779 1.218h.004c5.505 0 9.988-4.478 9.989-9.984 0-2.669-1.037-5.176-2.922-7.062A9.925 9.925 0 0012.012 2zm5.835 14.16c-.24.673-1.398 1.293-1.92 1.347-.478.05-1.096.068-1.748-.14a9.697 9.697 0 01-3.69-2.029l-.096-.084c-.31-.274-.633-.585-.92-0.89a9.123 9.123 0 01-2.062-2.955c-.244-.407-.272-.733-.082-.998.172-.24.372-.44.557-.655.127-.148.204-.265.297-.435.097-.183.05-.353-.025-.509-.074-.156-.665-1.602-.912-2.195-.24-.582-.487-.503-.665-.512h-.565c-.195 0-.51.073-.777.362-.267.288-1.02.996-1.02 2.429s1.042 2.818 1.187 3.014c.145.195 2.05 3.13 4.965 4.387 2.422 1.045 2.912.836 3.435.787.525-.049 1.69-.691 1.932-1.358.243-.668.243-1.24.17-1.358-.073-.119-.267-.195-.563-.343z"/>
                                            </svg>
                                            Book Now
                                        </a>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Our Services / Everything You Need (From Image 2) */}
                <div className="mb-24 bg-stone-900 text-white rounded-[40px] px-8 py-16 md:py-20 md:px-16 shadow-xl border border-stone-850">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-4 block">Our Services</span>
                        <h2 className="font-serif text-3xl md:text-5xl text-white">Everything You Need</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {services.map((service, idx) => (
                            <div
                                key={idx}
                                className="bg-white/5 border border-white/10 rounded-[20px] p-6 flex flex-col items-center text-center hover:bg-white/10 transition-colors duration-300"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 text-white">
                                    {React.cloneElement(service.icon, { className: "w-6 h-6 text-white" })}
                                </div>
                                <h3 className="font-sans font-semibold text-sm tracking-wide text-white">{service.title}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Why Stay With Us (From Image 4) */}
                <div className="bg-stone-50 border border-stone-200 rounded-[32px] p-8 md:p-12 shadow-sm text-center">
                    <h2 className="font-serif text-2xl md:text-3xl text-stone-900 mb-3">Why Stay With Us?</h2>
                    <p className="text-stone-500 font-sans text-xs tracking-wider uppercase mb-12">Experience the best of Murudeshwar hospitality</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {whyStay.map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center">
                                <div className="w-16 h-16 rounded-[20px] bg-white border border-stone-200 shadow-sm flex items-center justify-center mb-4">
                                    {item.icon}
                                </div>
                                <h3 className="font-serif text-sm font-semibold text-stone-900 mb-1">{item.title}</h3>
                                <p className="text-stone-400 font-sans text-[11px] uppercase tracking-wider">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Our Location Map Section */}
                <div className="mt-20 bg-white border border-stone-200 rounded-[32px] p-8 md:p-12 shadow-sm">
                    <div className="text-center max-w-2xl mx-auto mb-10">
                        <span className="font-mono text-brand-gold text-xs uppercase tracking-[0.3em] mb-4 block">Our Location</span>
                        <h2 className="font-serif text-2xl md:text-3xl text-stone-900 mb-3">How to Find Us</h2>
                        <p className="text-stone-500 font-sans text-sm">
                            Beach road, Murdeshwar Temple Main Rd, Matadahitlu, Murdeshwar, Karnataka 581350, India
                        </p>
                    </div>
                    <div className="w-full h-[350px] md:h-[450px] rounded-2xl overflow-hidden border border-stone-200 relative bg-stone-100 shadow-sm">
                        <iframe
                            title="Beach Front Stay Location Map"
                            src="https://maps.google.com/maps?q=Beach%20road%2C%20Murdeshwar%20Temple%20Main%20Rd%2C%20Matadahitlu%2C%20Murdeshwar%2C%20Karnataka%20581350%2C%20India&t=&z=16&ie=UTF8&iwloc=&output=embed"
                            className="w-full h-full border-0 absolute inset-0"
                            allowFullScreen=""
                            loading="lazy"
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showReserve && (
                    <ReservationForm
                        destination={selectedRoom || { title: "Beach Front Stay Booking", price: "Stay Inquiry" }}
                        onClose={() => setShowReserve(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
