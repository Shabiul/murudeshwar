import React, { useState } from 'react';
import RentalStatusBadge from './RentalStatusBadge';

/**
 * Shared Visual Calendar Grid for Tracking Vehicle Fleet Reservations
 */
export default function VehicleBookingCalendar({ bookings = [], vehicles = [] }) {
  const [filterType, setFilterType] = useState('All');

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  const filteredVehicles = filterType === 'All' 
    ? vehicles 
    : vehicles.filter(v => (v.vehicle_type || v.category || '').toLowerCase() === filterType.toLowerCase());

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800 pb-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">
            Fleet Schedule & Booking Calendar
          </h3>
          <p className="text-xs text-stone-500">Live 7-day pickup, return, and availability grid.</p>
        </div>

        <div className="flex items-center gap-2">
          {['All', 'Scooter', 'Cruiser', 'SUV', 'Sedan'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filterType === type
                  ? 'bg-brand-gold text-stone-900 font-bold'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid Matrix */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              <th className="py-3 px-4 w-48">Vehicle</th>
              {dates.map((date, idx) => (
                <th key={idx} className="py-3 px-3 text-center">
                  <div>{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                  <div className="text-stone-900 dark:text-white text-xs">{date.getDate()} {date.toLocaleDateString('en-US', { month: 'short' })}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-xs">
            {filteredVehicles.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-stone-400">
                  No vehicles registered in fleet.
                </td>
              </tr>
            ) : (
              filteredVehicles.map(v => (
                <tr key={v.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="py-3 px-4 font-semibold text-stone-900 dark:text-white">
                    <div>{v.model_name}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{v.registration_number}</div>
                  </td>

                  {dates.map((d, dIdx) => {
                    const dayStr = d.toISOString().split('T')[0];
                    const activeBooking = bookings.find(
                      b => (b.bike_id === v.id || b.car_id === v.id) &&
                        b.start_time?.startsWith(dayStr)
                    );

                    return (
                      <td key={dIdx} className="py-3 px-2 text-center">
                        {activeBooking ? (
                          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-[10px]">
                            <p className="font-bold text-amber-900 dark:text-amber-300 truncate">{activeBooking.customer_name}</p>
                            <RentalStatusBadge status={activeBooking.status} />
                          </div>
                        ) : (
                          <span className="inline-block w-full text-[10px] text-emerald-600 dark:text-emerald-400 py-1 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-lg">
                            Available
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
