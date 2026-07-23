import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VehicleScrollMarquee
 * Single-card interactive vehicle showcase.
 * Displays exactly 1 vehicle card at a time that changes seamlessly on clicking Previous / Next buttons.
 */
export default function VehicleScrollMarquee({
  title = "Our Available Vehicles",
  subtitle = "Use the controls to view available models. Click the vehicle card to book.",
  vehicles = [],
  type = "car", // 'car' | 'bike'
  onSelectVehicle
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter vehicles if category filter is selected
  const categories = ['All', ...new Set(vehicles.map(v => v.category))];
  const filteredVehicles = selectedCategory === 'All' 
    ? vehicles 
    : vehicles.filter(v => v.category === selectedCategory);

  const total = filteredVehicles.length;
  const currentItem = filteredVehicles[currentIndex] || filteredVehicles[0];

  const handleNext = () => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
  };

  return (
    <div className="w-full py-16 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 text-white relative overflow-hidden border-y border-stone-800/80 shadow-2xl">
      {/* Background Decorative Lighting & Orbs */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 mb-4">
            <span className="w-2 h-2 rounded-full bg-brand-gold" />
            <span className="text-brand-gold text-xs font-mono uppercase tracking-widest font-semibold">
              {type === 'car' ? 'Car Fleet Showcase' : 'Bike Fleet Showcase'}
            </span>
          </div>

          <h2 className="font-serif text-3xl md:text-5xl text-white mb-4">
            {title}
          </h2>
          <p className="text-stone-400 font-sans text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </motion.div>

        {/* Category Filters Bar */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <div className="flex flex-wrap justify-center gap-2 bg-stone-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-stone-800 shadow-inner">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold font-sans transition-all duration-300 ${
                  selectedCategory === cat
                    ? 'bg-brand-gold text-stone-950 font-bold shadow-lg shadow-brand-gold/20 scale-105'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Single Vehicle Showcase Container */}
        {total === 0 || !currentItem ? (
          <div className="py-16 text-center text-stone-500 font-sans text-sm">
            No vehicles available in this category.
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Left Button */}
            <button
              onClick={handlePrev}
              disabled={total <= 1}
              className="absolute left-0 md:-left-16 z-30 w-12 h-12 rounded-2xl bg-stone-900/90 backdrop-blur-md border border-stone-700 text-stone-200 hover:text-brand-gold hover:border-brand-gold hover:bg-stone-800 flex items-center justify-center text-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl group"
              title="Previous Model"
            >
              <span className="group-hover:-translate-x-0.5 transition-transform">◄</span>
            </button>

            {/* Single Card Frame */}
            <div className="w-full max-w-xl mx-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory}-${currentIndex}`}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  onClick={() => onSelectVehicle && onSelectVehicle(currentItem)}
                  className="group relative bg-stone-900/95 backdrop-blur-2xl border border-brand-gold/40 rounded-3xl overflow-hidden shadow-2xl shadow-stone-950 cursor-pointer flex flex-col justify-between"
                >
                  {/* Image Section */}
                  <div className="relative aspect-[16/10] w-full bg-stone-950 overflow-hidden">
                    <img
                      src={currentItem.image}
                      alt={currentItem.name}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = type === 'car'
                          ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop'
                          : 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1000&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent opacity-80" />
                    
                    {/* Top Badge Tag & Index */}
                    <div className="absolute top-4 left-4 flex gap-2 items-center">
                      <span className="px-3.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-white/10 text-brand-gold text-xs font-mono uppercase font-bold tracking-wider">
                        {currentItem.tag || (type === 'car' ? 'Car Rental' : 'Bike Rental')}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4">
                      <span className="px-3.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md border border-stone-800 text-stone-300 text-xs font-mono font-bold">
                        {currentIndex + 1} of {total}
                      </span>
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-8 flex flex-col justify-between flex-grow">
                    <div>
                      <span className="text-xs font-sans font-semibold text-brand-gold uppercase tracking-widest block mb-1">
                        {currentItem.category}
                      </span>
                      <h3 className="font-serif text-2xl md:text-3xl font-bold text-white group-hover:text-brand-gold transition-colors duration-300 mb-3">
                        {currentItem.name}
                      </h3>
                      {currentItem.desc && (
                        <p className="text-stone-300 font-sans text-sm leading-relaxed mb-6">
                          {currentItem.desc}
                        </p>
                      )}
                    </div>

                    {/* Bottom Action */}
                    <div className="pt-5 border-t border-stone-800 flex items-center justify-between">
                      <span className="text-xs font-sans font-semibold text-stone-400 group-hover:text-brand-gold flex items-center gap-2 transition-colors">
                        Click card to reserve vehicle <span className="font-bold">→</span>
                      </span>

                      <button className="px-6 py-3 rounded-2xl bg-brand-gold hover:bg-white text-stone-950 font-sans text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg shadow-brand-gold/20">
                        Book Vehicle
                      </button>
                    </div>
                  </div>

                  {/* Highlight Border */}
                  <div className="absolute inset-0 border-2 border-brand-gold/0 group-hover:border-brand-gold/50 rounded-3xl pointer-events-none transition-all duration-500" />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Button */}
            <button
              onClick={handleNext}
              disabled={total <= 1}
              className="absolute right-0 md:-right-16 z-30 w-12 h-12 rounded-2xl bg-brand-gold text-stone-950 font-bold hover:bg-white flex items-center justify-center text-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl shadow-brand-gold/20 group"
              title="Next Model"
            >
              <span className="group-hover:translate-x-0.5 transition-transform">►</span>
            </button>
          </div>
        )}

        {/* Footer Navigation Dots */}
        {total > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            {filteredVehicles.map((v, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  currentIndex === i 
                    ? 'w-8 bg-brand-gold' 
                    : 'w-2.5 bg-stone-800 hover:bg-stone-700'
                }`}
                title={`Go to ${v.name}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
