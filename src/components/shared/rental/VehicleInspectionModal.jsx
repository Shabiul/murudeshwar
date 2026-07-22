import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Vehicle Inspection Modal for Pre-Pickup & Post-Return Checks
 */
export default function VehicleInspectionModal({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  inspectionType = 'Pickup' // 'Pickup' | 'Return'
}) {
  const [odometer, setOdometer] = useState(vehicle?.odometer_reading || 0);
  const [fuelLevel, setFuelLevel] = useState('Full');
  const [helmetProvided, setHelmetProvided] = useState(true);
  const [cleanliness, setCleanliness] = useState('Clean');
  const [notes, setNotes] = useState('');

  if (!isOpen || !vehicle) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      inspectionType,
      odometer: parseInt(odometer, 10),
      fuelLevel,
      helmetProvided,
      cleanliness,
      notes: notes || 'Inspection passed clean.'
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-6"
        >
          <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
                {inspectionType} Inspection Checklist
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                {vehicle.model_name} ({vehicle.registration_number})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-white text-lg font-bold"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Current Odometer Reading (km)
                </label>
                <input
                  type="number"
                  required
                  value={odometer}
                  onChange={(e) => setOdometer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Fuel Level
                </label>
                <select
                  value={fuelLevel}
                  onChange={(e) => setFuelLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  <option value="Full">Full Tank</option>
                  <option value="3/4">3/4 Tank</option>
                  <option value="Half">1/2 Tank</option>
                  <option value="1/4">1/4 Tank</option>
                  <option value="Reserve">Reserve</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Cleanliness Status
                </label>
                <select
                  value={cleanliness}
                  onChange={(e) => setCleanliness(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
                >
                  <option value="Clean">Clean & Sanitized</option>
                  <option value="Moderate">Minor Dust/Mud</option>
                  <option value="Needs Wash">Needs Full Wash</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="helmetCheck"
                  checked={helmetProvided}
                  onChange={(e) => setHelmetProvided(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="helmetCheck" className="font-semibold text-stone-700 dark:text-stone-300">
                  Helmets / Accessories Verified
                </label>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Inspection Remarks / Pre-existing Scratch Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Log scratch locations, tire conditions, or mirror alignment..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-gold hover:bg-amber-500 text-stone-900 font-bold shadow-md transition-all"
              >
                Save Inspection Record
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
