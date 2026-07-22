import React, { useState } from 'react';
import CrmLayout from '../../../components/crm/CrmLayout';
import VehicleCard from '../../../components/shared/rental/VehicleCard';
import VehicleInspectionModal from '../../../components/shared/rental/VehicleInspectionModal';
import DamageReportModal from '../../../components/shared/rental/DamageReportModal';
import { useCarRental } from '../hooks/useCarRental';

export default function CarInventoryPage() {
  const { cars, loading, addCar } = useCarRental();
  const [filterCategory, setFilterCategory] = useState('All');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [inspectVehicle, setInspectVehicle] = useState(null);
  const [damageVehicle, setDamageVehicle] = useState(null);

  // Form State
  const [form, setForm] = useState({
    model_name: '',
    registration_number: '',
    category: 'SUV',
    seating_capacity: '5',
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    daily_rate: '',
    deposit_amount: '3000',
    odometer_reading: '',
    damage_notes: 'None'
  });

  const filteredCars = filterCategory === 'All'
    ? cars
    : cars.filter(c => c.category?.toLowerCase() === filterCategory.toLowerCase());

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await addCar({
      ...form,
      seating_capacity: parseInt(form.seating_capacity, 10),
      daily_rate: parseFloat(form.daily_rate),
      deposit_amount: parseFloat(form.deposit_amount),
      odometer_reading: parseInt(form.odometer_reading || 0, 10),
      status: 'Available'
    });
    setIsAddOpen(false);
    setForm({
      model_name: '',
      registration_number: '',
      category: 'SUV',
      seating_capacity: '5',
      fuel_type: 'Diesel',
      transmission: 'Automatic',
      daily_rate: '',
      deposit_amount: '3000',
      odometer_reading: '',
      damage_notes: 'None'
    });
  };

  return (
    <CrmLayout
      title="Car & Chauffeur Fleet Inventory"
      subtitle="Track SUVs, sedans, luxury cars, transmission specs, and availability statuses."
    >
      <div className="space-y-6 font-sans text-stone-800 dark:text-stone-100">
        
        {/* Header Action & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Car Fleet</span>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Active Cars ({cars.length})</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl">
              {['All', 'SUV', 'Sedan', 'Hatchback', 'Luxury', 'Van'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterCategory === cat
                      ? 'bg-brand-gold text-stone-900 font-bold shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-amber-500 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>+</span> Register New Car
            </button>
          </div>
        </div>

        {/* Car Fleet Cards Grid */}
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-sm">Loading car fleet inventory...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCars.map((car) => (
              <VehicleCard
                key={car.id}
                vehicle={car}
                vehicleCategory="car"
                onInspect={(v) => setInspectVehicle(v)}
                onLogMaintenance={(v) => setDamageVehicle(v)}
                onBook={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add New Car Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Register Car into Fleet</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Car Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Toyota Fortuner"
                    value={form.model_name}
                    onChange={e => setForm({ ...form, model_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">License Plate Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-30-P-1122"
                    value={form.registration_number}
                    onChange={e => setForm({ ...form, registration_number: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Sedan">Sedan</option>
                    <option value="Hatchback">Hatchback</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Van">Van</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Transmission</label>
                  <select
                    value={form.transmission}
                    onChange={e => setForm({ ...form, transmission: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Automatic">Automatic</option>
                    <option value="Manual">Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="3500"
                    value={form.daily_rate}
                    onChange={e => setForm({ ...form, daily_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Seating Capacity</label>
                  <input
                    type="number"
                    required
                    value={form.seating_capacity}
                    onChange={e => setForm({ ...form, seating_capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Fuel Type</label>
                  <select
                    value={form.fuel_type}
                    onChange={e => setForm({ ...form, fuel_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol">Petrol</option>
                    <option value="Electric">Electric</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.deposit_amount}
                    onChange={e => setForm({ ...form, deposit_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-gold text-stone-900 font-bold"
                >
                  Save Car
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Shared Modals */}
      <VehicleInspectionModal
        isOpen={!!inspectVehicle}
        onClose={() => setInspectVehicle(null)}
        vehicle={inspectVehicle}
        onSubmit={(data) => console.log('Car Inspection saved:', data)}
      />

      <DamageReportModal
        isOpen={!!damageVehicle}
        onClose={() => setDamageVehicle(null)}
        vehicle={damageVehicle}
        onSubmit={(data) => console.log('Car damage report logged:', data)}
      />
    </CrmLayout>
  );
}
