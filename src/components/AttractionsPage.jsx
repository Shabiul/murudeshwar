import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSiteData } from '../hooks/useSiteData';
import { attractions as fallbackAttractions } from '../data/attractions';

// Premium SVG Icon Components (AI Slop-Free)
const PinIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const StarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ClockIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CompassIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export default function AttractionsPage() {
  const { data: attractions } = useSiteData('attractions', fallbackAttractions);
  const [selectedAttraction, setSelectedAttraction] = useState(null);

  return (
    <div 
      className="min-h-screen w-full text-stone-900 bg-cover bg-fixed bg-center"
      style={{ backgroundImage: "url('/gallery/rocky_texture_bg.png')" }}
    >
      {/* Rock Climbing Adventure Hero Banner */}
      <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden flex items-center justify-center">
        <img 
          src="/gallery/attractions_rock_climbing.png" 
          alt="Adventure & Rock Climbing" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Gradient light overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-stone-900/10 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mt-16">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-4 py-1.5 mb-4 text-xs font-mono tracking-widest text-white border border-white/20 rounded-full bg-black/10 backdrop-blur-md uppercase"
          >
            Coastal Adventures
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-serif text-4xl md:text-7xl text-white mb-6 drop-shadow-md"
          >
            Explore <span className="text-brand-gold font-bold">Attractions</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-white/90 font-sans text-lg md:text-xl max-w-2xl mx-auto drop-shadow"
          >
            Must-visit locations in and around Murudeshwar.
          </motion.p>
        </div>
      </div>

      {/* Attractions Grid Container */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction, idx) => (
            <motion.div
              key={attraction.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="group relative overflow-hidden cursor-pointer bg-white/90 backdrop-blur-sm rounded-3xl border border-stone-200/60 shadow-sm hover:shadow-md hover:border-brand-gold/30 transition-all duration-300 flex flex-col h-full"
              onClick={() => setSelectedAttraction(attraction)}
            >
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                {attraction.featured && (
                  <div className="absolute top-4 right-4 bg-brand-gold text-white text-[10px] font-mono tracking-wider uppercase font-bold px-3 py-1.5 rounded-full shadow-md">
                    Featured
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent p-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm text-white">
                      <PinIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-white leading-tight">{attraction.name}</h3>
                      <p className="text-white/80 text-xs mt-0.5">{attraction.shortDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 flex flex-col justify-between flex-grow">
                <div>
                  <p className="text-stone-600 text-sm leading-relaxed mb-6">
                    {attraction.description}
                  </p>
                  {attraction.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-start gap-2 mb-4 p-3 bg-stone-50/80 rounded-xl border border-stone-100">
                      <span className="text-brand-gold mt-1">
                        <StarIcon className="w-3.5 h-3.5" />
                      </span>
                      <p className="text-xs text-stone-700 leading-normal">{highlight}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-stone-100">
                  <div className="flex items-center gap-4 text-xs text-stone-500 font-mono">
                    <span className="flex items-center gap-1.5">
                      <CompassIcon className="w-3.5 h-3.5 text-stone-400" />
                      {attraction.distance}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <ClockIcon className="w-3.5 h-3.5 text-stone-400" />
                      {attraction.timings}
                    </span>
                  </div>
                  <button className="flex items-center gap-1 text-stone-900 font-semibold text-xs tracking-wider uppercase hover:text-brand-gold transition-colors">
                    Explore
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Attraction Detail Modal */}
      <AnimatePresence>
        {selectedAttraction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 md:p-10"
            onClick={() => setSelectedAttraction(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-[#faf9f6]/95 backdrop-blur-md text-stone-900 rounded-[30px] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-72 w-full overflow-hidden">
                <img
                  src={selectedAttraction.image}
                  alt={selectedAttraction.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent p-8">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md text-white">
                      <PinIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="font-serif text-2xl md:text-3xl text-white leading-tight">{selectedAttraction.name}</h2>
                      <p className="text-white/80 text-sm mt-1">{selectedAttraction.shortDescription}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="font-serif text-xl text-stone-900 mb-4 font-semibold">About this attraction</h3>
                <p className="text-stone-600 mb-8 leading-relaxed text-sm">{selectedAttraction.description}</p>

                {selectedAttraction.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-start gap-3 mb-4 p-4 bg-stone-50/80 rounded-2xl border border-stone-100">
                    <span className="text-brand-gold mt-1">
                      <StarIcon className="w-4 h-4" />
                    </span>
                    <p className="text-stone-700 text-xs leading-normal">{highlight}</p>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-4 p-4 bg-stone-50/80 rounded-xl border border-stone-200/55 text-stone-700">
                    <CompassIcon className="w-5 h-5" />
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">Distance</p>
                      <p className="font-bold text-stone-900 text-sm">{selectedAttraction.distance}</p>
                      <p className="text-[10px] text-stone-400">from hotel</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-stone-50/80 rounded-xl border border-stone-200/55 text-stone-700">
                    <ClockIcon className="w-5 h-5" />
                    <div>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest font-mono">Timings</p>
                      <p className="font-bold text-stone-900 text-sm">{selectedAttraction.timings}</p>
                      <p className="text-[10px] text-stone-400">visit hours</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAttraction(null)}
                  className="w-full py-4 bg-stone-900 text-white rounded-xl font-semibold hover:bg-brand-gold transition-colors font-mono uppercase tracking-widest text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}