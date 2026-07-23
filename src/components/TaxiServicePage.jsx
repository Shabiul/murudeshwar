import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReservationForm from './ReservationForm';
import VehicleScrollMarquee from './VehicleScrollMarquee';

const CAR_FLEET = [
  {
    name: 'Honda City ZX',
    category: 'Sedan',
    image: '/cars/2022_Honda_City_ZX_i-VTEC_(India)_front_view_(cropped).jpg',
    tag: 'Premium Sedan',
    desc: 'Spacious 5-seater sedan with i-VTEC engine, automatic climate control, and plush seating for smooth city & highway travel.'
  },
  {
    name: 'Maruti Suzuki Swift',
    category: 'Hatchback',
    image: '/cars/Suzuki-Swift-South-Africa-May-2022.webp',
    tag: 'Popular Hatch',
    desc: 'Fuel-efficient, easy handling 4-seater hatchback perfect for quick local trips and coastal exploration.'
  },
  {
    name: 'Maruti Suzuki Baleno',
    category: 'Hatchback',
    image: '/cars/baleno.jpg',
    tag: 'Comfort Hatch',
    desc: 'Premium hatchback offering spacious legroom, smart features, and high fuel economy.'
  },
  {
    name: 'Maruti Suzuki Celerio',
    category: 'Hatchback',
    image: '/cars/celerio.png',
    tag: 'Budget Friendly',
    desc: 'Compact hatchback for budget-conscious travellers exploring local attractions.'
  },
  {
    name: 'Maruti Suzuki Ertiga',
    category: 'SUV / MPV',
    image: '/cars/ertiga.webp',
    tag: 'Group Special',
    desc: 'Versatile 6+1 seater family car featuring comfortable seating and dual AC.'
  },
  {
    name: 'Tata Tiago',
    category: 'Hatchback',
    image: '/cars/tat tiago.webp',
    tag: 'Safe & Compact',
    desc: '4-star safety rated compact car designed for smooth coastal driving.'
  },
  {
    name: 'Toyota Etios',
    category: 'Sedan',
    image: '/cars/toyota-etios.jpg',
    tag: 'Reliable Sedan',
    desc: 'Proven reliability with massive boot space, smooth suspension, and comfortable rear seating.'
  },
  {
    name: 'Maruti Suzuki Wagon R',
    category: 'Hatchback',
    image: '/cars/wagon R.jpg',
    tag: 'Tallboy Design',
    desc: 'High headroom and easy ingress/egress, perfect for senior family members.'
  }
];

const services = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
      </svg>
    ),
    title: 'Murudeshwar Local Sightseeing',
    description: 'Visit the famous attractions around Murudeshwar in a comfortable taxi — the towering Shiva statue, the Murudeshwar Temple, and scenic coastal viewpoints.',
    color: '#2563eb',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    ),
    title: 'Gokarna Tour',
    description: 'Explore Om Beach, Kudle Beach, Mahabaleshwar Temple, and more with our experienced drivers who know every hidden gem.',
    color: '#059669',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: 'Jog Falls Tour',
    description: "Enjoy a scenic drive to one of India's highest waterfalls — a breathtaking cascade surrounded by lush greenery and misty valleys.",
    color: '#7c3aed',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.115 5.19l.319 1.913A6 6 0 008.11 10.36L9.75 12l-.387.775c-.217.433-.132.956.21 1.298l1.348 1.348c.21.21.329.497.329.795v1.089c0 .426.24.815.622 1.006l.153.076c.433.217.956.132 1.298-.21l.723-.723a8.7 8.7 0 002.288-4.042 1.087 1.087 0 00-.358-1.099l-1.33-1.108c-.251-.21-.582-.299-.905-.245l-1.17.195a1.125 1.125 0 01-.98-.314l-.295-.295a1.125 1.125 0 010-1.591l.13-.132a1.125 1.125 0 011.3-.21l.603.302a.809.809 0 001.086-1.086L14.25 7.5l1.256-.837a4.5 4.5 0 001.528-1.732l.146-.292M6.115 5.19A9 9 0 1017.18 4.64M6.115 5.19A8.965 8.965 0 0112 3c1.929 0 3.716.607 5.18 1.64" />
      </svg>
    ),
    title: 'Yana Caves Trip',
    description: 'Visit the unique limestone rock formations deep in the Western Ghats and enjoy nature at its most awe-inspiring.',
    color: '#ea580c',
  },
];

const highlights = [
  {
    label: 'Local Sightseeing',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    label: 'Outstation Trips',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V14.25M3 14.25h18M12 4.5c-3.176 0-6.013 1.86-7.18 4.707l-1.445 3.513c-.068.165-.102.344-.102.525V14.25m17.25 0a1.125 1.125 0 001.125-1.125v-.312c0-.18-.034-.36-.102-.525l-1.445-3.513C18.013 6.36 15.176 4.5 12 4.5z" />
      </svg>
    ),
  },
  {
    label: 'Railway Station Pickup & Drop',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6a4.5 4.5 0 11-9 0M18 16.5V21m-12 0v-4.5M12 12a1 1 0 100-2 1 1 0 000 2zm-7.5 4.5h15m-15 0a1.5 1.5 0 01-1.5-1.5V9a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 9v6a1.5 1.5 0 01-1.5 1.5H4.5z" />
      </svg>
    ),
  },
  {
    label: 'Airport Transfers',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L6 12zm0 0h7" />
      </svg>
    ),
  },
  {
    label: 'Family & Group Tours',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-2.533-3.076 12.006 12.006 0 00-8.222 0 4.125 4.125 0 00-2.533 3.076 9.317 9.317 0 004.12 1.246 9.37 9.37 0 002.622-.372zM15 12.5a3 3 0 100-6 3 3 0 000 6zM7.5 11.25a2.25 2.25 0 110-4.5 2.25 2.25 0 010 4.5zM7.5 14.25A5.106 5.106 0 003 18.2v.3c0 .17.135.305.305.305h3.09c.27 0 .5-.213.5-.485v-1.12c0-.528.188-1.047.53-1.464" />
      </svg>
    ),
  },
  {
    label: '24×7 Taxi Service',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function TaxiServicePage() {
  const [showReserve, setShowReserve] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowReserve(true);
  };

  return (
    <section className="min-h-screen w-full bg-[#faf9f7] text-stone-900">
      {/* ─── Hero Section ─── */}
      <div className="relative w-full overflow-hidden" style={{ minHeight: '85vh' }}>
        {/* Decorative background pattern */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #f0f7ff 0%, #faf9f7 30%, #fff7ed 60%, #faf9f7 100%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Floating blurred orbs */}
          <div className="absolute top-20 right-[15%] w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-[10%] w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute top-[40%] left-[50%] w-60 h-60 bg-emerald-200/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8"
          >
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V14.25M3 14.25h18M12 4.5c-3.176 0-6.013 1.86-7.18 4.707l-1.445 3.513c-.068.165-.102.344-.102.525V14.25m17.25 0a1.125 1.125 0 001.125-1.125v-.312c0-.18-.034-.36-.102-.525l-1.445-3.513C18.013 6.36 15.176 4.5 12 4.5z" />
            </svg>
            <span className="text-blue-700 text-xs font-semibold tracking-widest uppercase font-sans">
              Trusted Car & Taxi Rental Service
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-[clamp(2.5rem,7vw,5rem)] leading-[1.05] mb-6 max-w-4xl"
          >
            Naik Tour <span className="text-gradient-gold">&</span> Travels
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-stone-500 font-sans text-lg md:text-xl max-w-2xl mb-4 leading-relaxed"
          >
            Experience the beauty of Coastal Karnataka with comfortable, safe, and affordable car & taxi services in{' '}
            <span className="text-stone-800 font-semibold">Murudeshwar, Karnataka</span>.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-stone-400 font-sans text-base max-w-2xl mb-10 leading-relaxed"
          >
            Whether you're visiting Murudeshwar Temple, Gokarna, Jog Falls, Netrani Island, Yana Caves, or nearby
            attractions — Naik Tour and Travels offers reliable taxi services with experienced local drivers.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setSelectedVehicle(null);
              setShowReserve(true);
            }}
            className="px-10 py-4 bg-stone-900 text-white rounded-full font-sans font-semibold tracking-widest uppercase text-xs hover:bg-brand-gold transition-all duration-300 shadow-xl shadow-stone-900/10"
          >
            Book Your Ride Today
          </motion.button>
        </div>
      </div>

      {/* ─── Highlights Strip ─── */}
      <div className="w-full bg-white border-y border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {highlights.map((item, idx) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-stone-50/80 border border-stone-100 hover:border-brand-gold/30 hover:bg-amber-50/50 transition-all duration-300 group"
              >
                <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <span className="text-xs font-sans font-semibold text-stone-700 leading-tight">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── About Section ─── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-brand-gold mb-4 font-semibold">
              About Our Service
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 leading-tight">
              Comfortable, Punctual &{' '}
              <span className="text-gradient-gold">Memorable</span>
            </h2>
            <p className="text-stone-500 font-sans leading-relaxed text-lg mb-6">
              Whether you're visiting Murudeshwar Temple, Gokarna, Jog Falls, Netrani Island, Yana Caves, or nearby
              attractions, Naik Tour and Travels offers reliable taxi services with experienced local drivers. We aim to
              make every journey comfortable, punctual, and memorable.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Safe & Reliable', 'Affordable Rates', 'Local Expertise', 'On-Time'].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-xs font-sans font-semibold border border-stone-150 hover:bg-brand-gold/10 hover:border-brand-gold/30 hover:text-stone-800 transition-all duration-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-stone-200/60 border border-stone-100">
              <img
                src="/cars/2022_Honda_City_ZX_i-VTEC_(India)_front_view_(cropped).jpg"
                alt="Honda City ZX Car Rental"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-stone-100 px-6 py-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.129-1.125V14.25M3 14.25h18M12 4.5c-3.176 0-6.013 1.86-7.18 4.707l-1.445 3.513c-.068.165-.102.344-.102.525V14.25m17.25 0a1.125 1.125 0 001.125-1.125v-.312c0-.18-.034-.36-.102-.525l-1.445-3.513C18.013 6.36 15.176 4.5 12 4.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800 font-sans">Naik Tour and Travels Fleet</p>
                      <p className="text-xs text-stone-400 font-sans">Murudeshwar, Karnataka</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ─── Services Grid ─── */}
      <div className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="font-mono text-xs tracking-[0.3em] uppercase text-brand-gold mb-4 font-semibold">
              What We Offer
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
              Our <span className="text-gradient-gold">Services</span>
            </h2>
            <p className="text-stone-400 font-sans text-base max-w-xl mx-auto">
              Explore the best of Coastal Karnataka with our curated tours and reliable transportation.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="group relative p-8 rounded-3xl border border-stone-100 bg-[#faf9f7] hover:bg-white hover:shadow-xl hover:shadow-stone-100/80 hover:border-stone-200 transition-all duration-500"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${service.color}10`, color: service.color }}
                >
                  {service.icon}
                </div>
                <h3 className="font-serif text-2xl text-stone-800 mb-3">{service.title}</h3>
                <p className="text-stone-500 font-sans text-sm leading-relaxed">{service.description}</p>
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]"
                  style={{ backgroundColor: service.color }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Transfers Section ─── */}
      <div className="w-full bg-[#faf9f7] py-24 border-t border-stone-150">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl p-8 md:p-10 border border-stone-100 shadow-xl shadow-stone-200/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L6 12zm0 0h7" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl text-stone-900 mb-4">Airport Transfers</h3>
                <p className="text-stone-500 font-sans text-sm mb-6 leading-relaxed">
                  Hassle-free transfers to and from all major regional airports. We track your flight and ensure on-time pick-ups.
                </p>
                <ul className="space-y-3">
                  {['Mangalore Airport', 'Goa Airport', 'Hubli Airport'].map((airport) => (
                    <li key={airport} className="flex items-center gap-3 font-sans text-stone-700 text-sm font-medium">
                      <span className="text-emerald-500">✓</span> {airport}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-3xl p-8 md:p-10 border border-stone-100 shadow-xl shadow-stone-200/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6a4.5 4.5 0 11-9 0M18 16.5V21m-12 0v-4.5M12 12a1 1 0 100-2 1 1 0 000 2zm-7.5 4.5h15m-15 0a1.5 1.5 0 01-1.5-1.5V9a1.5 1.5 0 011.5-1.5h15A1.5 1.5 0 0121 9v6a1.5 1.5 0 01-1.5 1.5H4.5z" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl text-stone-900 mb-4">Railway Station Pickup & Drop</h3>
                <p className="text-stone-500 font-sans text-sm mb-6 leading-relaxed">
                  Quick and reliable transfers from Murudeshwar Railway Station. Skip the taxi lines and enjoy a seamless travel experience.
                </p>
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-100 text-xs font-sans text-stone-500 italic">
                  * Dynamic scheduling matches any delay in train arrivals. Safe local drivers with baggage assistance.
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── BUTTON-CONTROLLED INTERACTIVE CAR FLEET SHOWCASE ─── */}
      <VehicleScrollMarquee
        title="Our Available Car Fleet"
        subtitle="Explore our fleet using the Previous and Next buttons. Click any car to reserve!"
        vehicles={CAR_FLEET}
        type="car"
        onSelectVehicle={handleSelectVehicle}
      />

      {/* ─── Why Choose Us, Packages, and Fleet ─── */}
      <div className="w-full bg-white py-24 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Why Choose Us & Customer Promise */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1 space-y-8"
            >
              <div>
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-brand-gold mb-3 font-semibold">
                  Why Travel With Us
                </p>
                <h3 className="font-serif text-3xl text-stone-900 mb-6">Why Choose Us?</h3>
                <ul className="space-y-4">
                  {[
                    'Experienced local drivers',
                    'Clean & well-maintained vehicles',
                    'Affordable pricing',
                    'Safe family travel',
                    'On-time service',
                    '24/7 customer support',
                    'Customized tour packages'
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 font-sans text-stone-700 text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
                <h4 className="font-serif text-lg text-stone-900 mb-3 font-bold">Customer Promise</h4>
                <p className="text-stone-500 font-sans text-xs leading-relaxed italic">
                  "At Naik Tour and Travels, customer satisfaction is our priority. We provide safe, reliable, and hassle-free transportation so you can enjoy your vacation without worrying about travel arrangements."
                </p>
              </div>
            </motion.div>

            {/* Popular Sightseeing Packages */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-1"
            >
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-brand-gold mb-3 font-semibold">
                Popular Trips
              </p>
              <h3 className="font-serif text-3xl text-stone-900 mb-6">Sightseeing Packages</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Murudeshwar Half-Day Tour',
                  'Murudeshwar Full-Day Tour',
                  'Murudeshwar + Gokarna',
                  'Jog Falls Day Trip',
                  'Murudeshwar + Yana Caves',
                  'Murudeshwar + Honnavar',
                  'Murudeshwar + Maravanthe Beach',
                  'Customized Tour Packages'
                ].map((pkg) => (
                  <div key={pkg} className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f7] border border-stone-100 hover:border-brand-gold/20 transition-colors duration-300">
                    <span className="text-stone-800 font-sans text-sm font-semibold">{pkg}</span>
                    <span className="text-xs text-brand-gold font-sans font-bold">→</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Our Fleet Overview */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-brand-gold mb-3 font-semibold">
                Featured Fleet
              </p>
              <h3 className="font-serif text-3xl text-stone-900 mb-6">Available Cars</h3>
              <div className="grid grid-cols-1 gap-3">
                {CAR_FLEET.slice(0, 4).map((car) => (
                  <div 
                    key={car.name} 
                    onClick={() => handleSelectVehicle(car)}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-md cursor-pointer transition-all duration-300"
                  >
                    <img
                      src={car.image}
                      alt={car.name}
                      className="w-16 h-12 object-cover rounded-xl border border-stone-200"
                    />
                    <div className="flex-grow">
                      <h4 className="font-sans text-sm font-bold text-stone-800">{car.name}</h4>
                      <p className="text-[10px] font-sans font-semibold text-brand-gold uppercase">{car.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ─── CTA Section ─── */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[40px] overflow-hidden"
        >
          {/* Gradient background */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 50%, #1e293b 100%)',
            }}
          />
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">
                Book Your Ride <span className="text-brand-gold">Today!</span>
              </h2>
              <p className="text-white/60 font-sans text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Planning your Murudeshwar trip? Contact Naik Tour and Travels for comfortable taxis, affordable
                sightseeing packages, and professional local drivers.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedVehicle(null);
                    setShowReserve(true);
                  }}
                  className="px-10 py-4 bg-brand-gold text-black rounded-full font-sans font-semibold tracking-widest uppercase text-xs hover:bg-white hover:text-stone-900 transition-all duration-300 shadow-xl shadow-brand-gold/20"
                >
                  Book Now
                </motion.button>
                <a
                  href="tel:+919999999999"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full font-sans font-semibold tracking-widest uppercase text-xs hover:bg-white/20 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.806-5.165-4.148-6.97-6.97l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  Call Us
                </a>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Reservation Modal */}
      <AnimatePresence>
        {showReserve && (
          <ReservationForm
            destination={
              selectedVehicle
                ? { title: selectedVehicle.name, serviceType: 'Car', image: selectedVehicle.image }
                : { title: 'Naik Tour & Travels', serviceType: 'Car', image: '/cars/2022_Honda_City_ZX_i-VTEC_(India)_front_view_(cropped).jpg' }
            }
            onClose={() => {
              setShowReserve(false);
              setSelectedVehicle(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
