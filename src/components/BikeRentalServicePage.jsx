import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReservationForm from './ReservationForm';
import VehicleScrollMarquee from './VehicleScrollMarquee';

const BIKE_FLEET = [
  {
    name: 'Royal Enfield Hunter 350',
    category: 'Cruiser',
    image: '/bikes/2022-royal-enfield-hunter-350.webp',
    tag: 'Cruiser Classic',
    desc: 'Pure thumping retro cruiser with high stability and commanding riding stance for coastal highways.'
  },
  {
    name: 'Suzuki Access 125',
    category: 'Scooter',
    image: '/bikes/access.png',
    tag: 'Top Rated',
    desc: 'Smooth 125cc gearless scooter with high storage capacity and comfortable seating for two.'
  },
  {
    name: 'Bajaj Platina 100',
    category: 'Commuter',
    image: '/bikes/bajaj-platina-100-01-right-side-view_270x180.webp',
    tag: 'High Mileage',
    desc: 'Ultra-economical 100cc motorcycle with Comfortec suspension for long rides.'
  },
  {
    name: 'Honda Shine 125',
    category: 'Commuter',
    image: '/bikes/honda shine.png',
    tag: 'Executive Bike',
    desc: 'Reliable 5-speed 125cc commuter motorcycle for smooth everyday riding.'
  },
  {
    name: 'Honda SP 125',
    category: 'Commuter',
    image: '/bikes/honda sp 125.png',
    tag: 'Sporty Commuter',
    desc: 'Stylish digital instrument cluster, LED headlight, and high performance.'
  },
  {
    name: 'Honda Activa 6G',
    category: 'Scooter',
    image: '/bikes/honda-activa-i-pic-21.webp',
    tag: 'Most Popular',
    desc: 'India’s favorite automatic scooter. Easy gearless operation for stress-free riding.'
  },
  {
    name: 'TVS Jupiter 110',
    category: 'Scooter',
    image: '/bikes/jupiter.png',
    tag: 'Comfort Ride',
    desc: 'Soft suspension, external fuel filling, and wide footboard for maximum comfort.'
  },
  {
    name: 'Bajaj Platina 110',
    category: 'Commuter',
    image: '/bikes/platina.png',
    tag: 'Economy Commuter',
    desc: 'First-in-segment 110cc engine with superior fuel efficiency and comfortable long riding seat.'
  }
];

const services = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <circle cx="6.5" cy="16.5" r="2.5" />
        <circle cx="17.5" cy="16.5" r="2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 5h-4l-2 5h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 16.5h8a2 2 0 002-2v-4H9.5L7 16.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 16.5h6" />
      </svg>
    ),
    title: 'City Cruisers & Scooters',
    description: 'Perfect for easy city cruising, temple visits, and beachfront rides. Easy handling, high mileage, and automatic transmission.',
    color: '#059669',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <circle cx="5" cy="16" r="3" />
        <circle cx="19" cy="16" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 9c1.5-1.5 4-1.5 5.5 0L17 11h-8l1-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 6h-3.5L11 11" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l4 10" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 16h6l3-5m-9 5l3-5h4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17h11" />
      </svg>
    ),
    title: 'Royal Enfield & Cruiser Bikes',
    description: 'Feel the thump of classic Royal Enfield motorcycles. Perfectly tuned for high-stability, coastal highways, and long rides.',
    color: '#7c3aed',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <circle cx="5" cy="16" r="3" />
        <circle cx="19" cy="16" r="3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 4l1.5 3H12" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 7L19 16" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 10l3.5-3h3L17 11.5H10L9 10z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 16l4-6h5m-7 6l2-2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 11.5l2 4.5" />
      </svg>
    ),
    title: 'Adventure & Off-Road Bikes',
    description: 'Rugged build quality, long-travel suspension, and high-performance tyres for off-road trails, forest routes, and caves.',
    color: '#ea580c',
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.75" viewBox="0 0 24 24">
        <circle cx="5.5" cy="15.5" r="3.5" />
        <circle cx="18.5" cy="15.5" r="3.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 15.5l4.5-7h4.5l4 7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 8.5l2.5 7h-7l4.5-7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 8.5h3" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 8.5h-2" />
      </svg>
    ),
    title: 'Premium Bicycles',
    description: 'Eco-friendly, multi-geared hybrid and mountain bicycles for scenic explorations, beach side trails, and healthy fitness loops.',
    color: '#2563eb',
  },
];

const highlights = [
  {
    label: 'Serviced Two-Wheelers',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="6" cy="16" r="2.5" />
        <circle cx="18" cy="16" r="2.5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 16l4-5h4l4 5M10 11l1-3h3" />
      </svg>
    ),
  },
  {
    label: 'Helmets Included',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4a8 8 0 00-8 8v3a2 2 0 002 2h1a2 2 0 002-2v-2a1 1 0 011-1h4a1 1 0 011 1v2a2 2 0 002 2h1a2 2 0 002-2v-3a8 8 0 00-8-8z" />
      </svg>
    ),
  },
  {
    label: 'Flexible Rental Packages',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
  },
  {
    label: 'Convenient Pickups',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
      </svg>
    ),
  },
  {
    label: '24/7 Road Support',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.653 2.653 0 1021 17.25l-5.83-5.83m0 0a2.915 2.915 0 01-4.243-4.243l3.38-3.38m-3.38 3.38L4.24 16.08a2.536 2.536 0 003.58 3.58l5.83-5.83m0 0a2.917 2.917 0 004.243-4.243l-3.38-3.38M17.25 3h3.75v3.75" />
      </svg>
    ),
  },
  {
    label: 'Transparent Support',
    icon: (
      <svg className="w-5 h-5 text-brand-gold" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    ),
  },
];

export default function BikeRentalServicePage() {
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
              background: 'linear-gradient(135deg, #f0fdf4 0%, #faf9f7 30%, #fff7ed 60%, #faf9f7 100%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Floating blurred orbs */}
          <div className="absolute top-20 right-[15%] w-72 h-72 bg-emerald-200/20 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-[10%] w-80 h-80 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute top-[40%] left-[50%] w-60 h-60 bg-blue-200/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-20 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-8"
          >
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="5" cy="18" r="2.5" />
              <circle cx="19" cy="18" r="2.5" />
              <path d="M10 8.5h4L16.5 12h-8L10 8.5z M5 18h14M16.5 12v3.5M7.5 18l1-6M16.5 18l-1.5-6M12 8.5V6a1.5 1.5 0 00-1.5-1.5H8" />
            </svg>
            <span className="text-emerald-700 text-xs font-semibold tracking-widest uppercase font-sans">
              Naik Bike Rental Services
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-serif text-[clamp(2.5rem,7vw,5rem)] leading-[1.05] mb-6 max-w-4xl"
          >
            Explore on <span className="text-gradient-gold">Two Wheels</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-stone-500 font-sans text-lg md:text-xl max-w-2xl mb-4 leading-relaxed"
          >
            Uncover Murudeshwar's coastal roads, golden beaches, and hidden nature trails with absolute freedom.
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-stone-400 font-sans text-base max-w-2xl mb-10 leading-relaxed"
          >
            Skip the traffic and avoid waiting times. Choose from our premium range of well-serviced scooters, classic Royal Enfield cruisers, off-road adventure bikes, or multi-geared sports bicycles.
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
            Rent Your Bike Now
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
              Premium Bike Rentals
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-6 leading-tight">
              Explore At Your Own{' '}
              <span className="text-gradient-gold">Pace & Rhythm</span>
            </h2>
            <p className="text-stone-500 font-sans leading-relaxed text-lg mb-6">
              Avoid waiting for public transport or calling expensive cabs. Rent a scooter or a motorcycle from Naik Bike Rentals and experience the complete freedom of exploring Murudeshwar’s golden beaches, temple streets, and scenic coastal highways. We keep all our vehicles perfectly serviced to ensure a trouble-free riding experience.
            </p>
            <div className="flex flex-wrap gap-3">
              {['Helmets Provided', 'Serviced Fleet', 'No Hidden Fees', 'Local Trail Guides'].map((tag) => (
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
                src="/bikes/2022-royal-enfield-hunter-350.webp"
                alt="Royal Enfield Hunter 350 Bike Rental"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-stone-100 px-6 py-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="5" cy="18" r="2.5" />
                        <circle cx="19" cy="18" r="2.5" />
                        <path d="M10 8.5h4L16.5 12h-8L10 8.5z M5 18h14M16.5 12v3.5M7.5 18l1-6M16.5 18l-1.5-6M12 8.5V6a1.5 1.5 0 00-1.5-1.5H8" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-800 font-sans">Naik Bike Rentals Fleet</p>
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
              Our Rental Fleet
            </p>
            <h2 className="font-serif text-4xl md:text-5xl text-stone-900 mb-4">
              Choose Your <span className="text-gradient-gold">Riding Style</span>
            </h2>
            <p className="text-stone-400 font-sans text-base max-w-xl mx-auto">
              Pick the perfect set of wheels to match your itinerary and exploration comfort.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((bike, idx) => (
              <motion.div
                key={bike.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.12 }}
                className="group relative p-8 rounded-3xl border border-stone-100 bg-[#faf9f7] hover:bg-white hover:shadow-xl hover:shadow-stone-100/80 hover:border-stone-200 transition-all duration-500"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${bike.color}10`, color: bike.color }}
                >
                  {bike.icon}
                </div>
                <h3 className="font-serif text-2xl text-stone-800 mb-3">{bike.title}</h3>
                <p className="text-stone-500 font-sans text-sm leading-relaxed">{bike.description}</p>
                <div
                  className="absolute top-0 right-0 w-32 h-32 rounded-bl-[100px] opacity-[0.03] transition-opacity duration-500 group-hover:opacity-[0.06]"
                  style={{ backgroundColor: bike.color }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Riding Trails & Conditions ─── */}
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
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl text-stone-900 mb-4">Popular Riding Trails</h3>
                <p className="text-stone-500 font-sans text-sm mb-6 leading-relaxed">
                  Beautiful recommended routes optimized for two-wheelers around Coastal Karnataka.
                </p>
                <ul className="space-y-3">
                  {[
                    'Murudeshwar Coastal Beach Loop (Scenic beachfront)',
                    'Goa-Mangalore Highway Ride (For Cruisers)',
                    'Idagunji Temple Trail (Quiet country roads)',
                    'Bhatkal Beach & Port Track (Coastal views)'
                  ].map((trail) => (
                    <li key={trail} className="flex items-center gap-3 font-sans text-stone-700 text-sm font-medium">
                      <span className="text-emerald-500">✓</span> {trail}
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
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl text-stone-900 mb-4">Rental Requirements</h3>
                <p className="text-stone-500 font-sans text-sm mb-6 leading-relaxed">
                  Simple prerequisites to make your rental process quick and hassle-free.
                </p>
                <ul className="space-y-3">
                  {[
                    'Valid Driving License (DL) for 2-wheelers',
                    'Original Aadhaar Card or Passport for verification',
                    'Refundable Security Deposit',
                    'Safe riding habits & helmet compliance'
                  ].map((req) => (
                    <li key={req} className="flex items-center gap-3 font-sans text-stone-700 text-sm font-medium">
                      <span className="text-amber-500">✓</span> {req}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── BUTTON-CONTROLLED INTERACTIVE BIKE FLEET SHOWCASE ─── */}
      <VehicleScrollMarquee
        title="Our Available Bike Fleet"
        subtitle="Browse our fleet using the Previous and Next buttons. Click any bike to rent!"
        vehicles={BIKE_FLEET}
        type="bike"
        onSelectVehicle={handleSelectVehicle}
      />

      {/* ─── Why Choose Us & Fleet Grid ─── */}
      <div className="w-full bg-white py-24 border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

            {/* Why Choose Us */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-1 space-y-8"
            >
              <div>
                <p className="font-mono text-xs tracking-[0.3em] uppercase text-brand-gold mb-3 font-semibold">
                  Why Ride With Us
                </p>
                <h3 className="font-serif text-3xl text-stone-900 mb-6">Why Choose Naik</h3>
                <ul className="space-y-4">
                  {[
                    'Well-serviced, high-mileage scooters',
                    'Helmets provided for safety',
                    'Extremely competitive rates',
                    'No hidden mileage limits',
                    'Quick pick-up & drop locations',
                    '24/7 breakdown assistance',
                    'Custom route & local guide tips'
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 font-sans text-stone-700 text-sm">
                      <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
                <h4 className="font-serif text-lg text-stone-900 mb-3">Customer Promise</h4>
                <p className="text-stone-500 font-sans text-xs leading-relaxed italic">
                  "At Naik Bike Rentals, we ensure every two-wheeler undergoes strict maintenance inspections. We promise a reliable ride, fair pricing, and absolute freedom on your coastal exploration."
                </p>
              </div>
            </motion.div>

            {/* Popular Rental Packages */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-1"
            >
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-brand-gold mb-3 font-semibold">
                Flexible Rates
              </p>
              <h3 className="font-serif text-3xl text-stone-900 mb-6">Rental Packages</h3>
              <div className="grid grid-cols-1 gap-3">
                {[
                  'Hourly Rental Packages',
                  'Half-Day Explorer Special',
                  'Full 24-Hour Rental',
                  'Multi-Day Tourist Discount',
                  'Weekly Special Package',
                  'Eco-Bicycle Daily Pass',
                  'Weekend Riding Special',
                  'Custom Group Rentals'
                ].map((pkg) => (
                  <div key={pkg} className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f7] border border-stone-100 hover:border-brand-gold/20 transition-colors duration-300">
                    <span className="text-stone-800 font-sans text-sm font-semibold">{pkg}</span>
                    <span className="text-xs text-brand-gold font-sans font-bold">→</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Featured Bikes */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-1"
            >
              <p className="font-mono text-xs tracking-[0.3em] uppercase text-brand-gold mb-3 font-semibold">
                Featured Bikes
              </p>
              <h3 className="font-serif text-3xl text-stone-900 mb-6">Available Fleet</h3>
              <div className="grid grid-cols-1 gap-3">
                {BIKE_FLEET.slice(0, 4).map((bike) => (
                  <div 
                    key={bike.name} 
                    onClick={() => handleSelectVehicle(bike)}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-white hover:shadow-md cursor-pointer transition-all duration-300"
                  >
                    <img
                      src={bike.image}
                      alt={bike.name}
                      className="w-16 h-12 object-cover rounded-xl border border-stone-200"
                    />
                    <div className="flex-grow">
                      <h4 className="font-sans text-sm font-bold text-stone-800">{bike.name}</h4>
                      <p className="text-[10px] font-sans font-semibold text-brand-gold uppercase">{bike.category}</p>
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
              background: 'linear-gradient(135deg, #064e3b 0%, #022c22 50%, #064e3b 100%)',
            }}
          />
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />

          <div className="relative z-10 px-8 md:px-16 py-16 md:py-20 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">
                Ride Free, Explore <span className="text-brand-gold">More!</span>
              </h2>
              <p className="text-white/60 font-sans text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
                Planning your Murudeshwar trip? Contact Naik Bike Rentals for geared motorcycles, simple automatic gearless scooters, or hybrid bicycles.
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
                  Book Your Bike
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
                ? { title: selectedVehicle.name, serviceType: 'Bike', image: selectedVehicle.image }
                : { title: 'Naik Bike Rentals', serviceType: 'Bike', image: '/bikes/2022-royal-enfield-hunter-350.webp' }
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
