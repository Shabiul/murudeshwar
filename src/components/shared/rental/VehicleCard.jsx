import React from 'react';
import RentalStatusBadge from './RentalStatusBadge';

/**
 * Shared Vehicle Card for displaying spec sheets, daily pricing, and action triggers.
 */
export default function VehicleCard({
  vehicle,
  onBook,
  onInspect,
  onLogMaintenance,
  vehicleCategory = 'bike' // 'bike' | 'car'
}) {
  const {
    id,
    model_name,
    registration_number,
    vehicle_type,
    category,
    daily_rate,
    deposit_amount,
    odometer_reading,
    status,
    fuel_type,
    transmission,
    seating_capacity,
    is_chauffeur_available,
    damage_notes,
    image_url
  } = vehicle;

  const isBike = vehicleCategory === 'bike';

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Card Header & Badge */}
        <div className="p-5 border-b border-stone-100 dark:border-stone-800/80 flex items-start justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
              {isBike ? (vehicle_type || 'Scooter/Bike') : (category || 'SUV/Car')}
            </span>
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white mt-0.5">
              {model_name}
            </h3>
            <p className="text-xs text-stone-500 font-mono mt-0.5">{registration_number}</p>
          </div>
          <RentalStatusBadge status={status} />
        </div>

        {/* Vehicle Image Placeholder / Display */}
        <div className="h-40 bg-stone-100 dark:bg-stone-800 relative overflow-hidden flex items-center justify-center p-4">
          <img
            src={
              image_url ||
              (isBike
                ? 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop')
            }
            alt={model_name}
            className="w-full h-full object-cover rounded-2xl"
          />
          <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            ₹{daily_rate?.toLocaleString('en-IN')}/day
          </div>
        </div>

        {/* Key Specs */}
        <div className="p-5 grid grid-cols-2 gap-3 text-xs text-stone-600 dark:text-stone-300">
          <div className="flex items-center gap-2">
            <span className="text-stone-400">⛽ Fuel:</span>
            <span className="font-medium text-stone-900 dark:text-white">{fuel_type || 'Petrol'}</span>
          </div>

          {!isBike && (
            <div className="flex items-center gap-2">
              <span className="text-stone-400">⚙️ Trans:</span>
              <span className="font-medium text-stone-900 dark:text-white">{transmission || 'Manual'}</span>
            </div>
          )}

          {!isBike && seating_capacity && (
            <div className="flex items-center gap-2">
              <span className="text-stone-400">👥 Seats:</span>
              <span className="font-medium text-stone-900 dark:text-white">{seating_capacity} Seats</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-stone-400">🛣️ Odo:</span>
            <span className="font-medium text-stone-900 dark:text-white">{odometer_reading ? `${odometer_reading} km` : 'N/A'}</span>
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <span className="text-stone-400">🔒 Security Deposit:</span>
            <span className="font-medium text-stone-900 dark:text-white">₹{deposit_amount?.toLocaleString('en-IN')}</span>
          </div>

          {damage_notes && damage_notes !== 'None' && (
            <div className="col-span-2 p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-300">
              ⚠️ Notes: {damage_notes}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2">
        <button
          onClick={() => onInspect?.(vehicle)}
          className="px-3 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors"
        >
          Inspect
        </button>

        {onLogMaintenance && (
          <button
            onClick={() => onLogMaintenance(vehicle)}
            className="px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
          >
            Service
          </button>
        )}

        <button
          disabled={status !== 'Available'}
          onClick={() => onBook?.(vehicle)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all ${
            status === 'Available'
              ? 'bg-brand-gold hover:bg-amber-500 text-stone-900 font-bold'
              : 'bg-stone-200 dark:bg-stone-800 text-stone-400 cursor-not-allowed'
          }`}
        >
          {status === 'Available' ? 'Reserve Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
}
