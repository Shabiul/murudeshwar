import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Damage Report Modal for Logging Vehicle Incidents and Repair Costs
 */
export default function DamageReportModal({
  isOpen,
  onClose,
  onSubmit,
  vehicle,
  bookingId
}) {
  const [description, setDescription] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [reportedBy, setReportedBy] = useState('Inspect Staff');

  if (!isOpen || !vehicle) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      vehicle_type: vehicle.vehicle_type ? 'bike' : 'car',
      vehicle_id: vehicle.id,
      booking_id: bookingId || null,
      reported_by: reportedBy,
      description,
      estimated_cost: parseFloat(estimatedCost || 0),
      status: 'Pending Review'
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500">
                Incident Audit
              </span>
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                Log Vehicle Damage Report
              </h3>
            </div>
            <button onClick={onClose} className="text-stone-400 hover:text-stone-600 dark:hover:text-white text-lg font-bold">
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700">
              <p className="font-semibold text-stone-900 dark:text-white">{vehicle.model_name}</p>
              <p className="text-[11px] text-stone-500 font-mono">{vehicle.registration_number}</p>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Reported By (Staff Name / Inspector)
              </label>
              <input
                type="text"
                required
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Damage Description
              </label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe dent locations, broken indicators, scratch dimensions..."
                className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Estimated Repair Cost (₹)
              </label>
              <input
                type="number"
                required
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="e.g. 1500"
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
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md transition-all"
              >
                File Damage Report
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
