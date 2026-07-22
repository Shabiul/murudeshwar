import React, { useState } from 'react';
import CrmLayout from '../../../components/crm/CrmLayout';
import VehicleCard from '../../../components/shared/rental/VehicleCard';
import VehicleInspectionModal from '../../../components/shared/rental/VehicleInspectionModal';
import DamageReportModal from '../../../components/shared/rental/DamageReportModal';
import { useBikeRental } from '../hooks/useBikeRental';

export default function BikeInventoryPage() {
  const { bikes, loading, addBike } = useBikeRental();
  const [filterType, setFilterType] = useState('All');

  // Modal States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [inspectVehicle, setInspectVehicle] = useState(null);
  const [damageVehicle, setDamageVehicle] = useState(null);

  // Form State
  const [form, setForm] = useState({
    model_name: '',
    registration_number: '',
    vehicle_type: 'Scooter',
    engine_capacity: '110cc',
    fuel_type: 'Petrol',
    daily_rate: '',
    deposit_amount: '1000',
    odometer_reading: '',
    damage_notes: 'None'
  });

  const filteredBikes = filterType === 'All'
    ? bikes
    : bikes.filter(b => b.vehicle_type?.toLowerCase() === filterType.toLowerCase());

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    await addBike({
      ...form,
      daily_rate: parseFloat(form.daily_rate),
      deposit_amount: parseFloat(form.deposit_amount),
      odometer_reading: parseInt(form.odometer_reading || 0, 10),
      status: 'Available'
    });
    setIsAddOpen(false);
    setForm({
      model_name: '',
      registration_number: '',
      vehicle_type: 'Scooter',
      engine_capacity: '110cc',
      fuel_type: 'Petrol',
      daily_rate: '',
      deposit_amount: '1000',
      odometer_reading: '',
      damage_notes: 'None'
    });
  };

  return (
    <CrmLayout
      title="Bike & Scooter Fleet Inventory"
      subtitle="Manage scooters, cruisers, adventure motorbikes, damage audit records, and daily rental rates."
    >
      <div className="space-y-6 font-sans text-stone-800 dark:text-stone-100">
        
        {/* Header Action & Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Fleet Management</span>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Active Bikes ({bikes.length})</h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 bg-stone-100 dark:bg-stone-800 p-1.5 rounded-2xl">
              {['All', 'Scooter', 'Cruiser', 'Sports', 'Adventure'].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    filterType === t
                      ? 'bg-brand-gold text-stone-900 font-bold shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-amber-500 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
            >
              <span>+</span> Register New Bike
            </button>
          </div>
        </div>

        {/* Bike Fleet Cards Grid */}
        {loading ? (
          <div className="py-12 text-center text-stone-400 text-sm">Loading bike inventory...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike) => (
              <VehicleCard
                key={bike.id}
                vehicle={bike}
                vehicleCategory="bike"
                onInspect={(v) => setInspectVehicle(v)}
                onLogMaintenance={(v) => setDamageVehicle(v)}
                onBook={() => {}}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add New Bike Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Register Bike into Fleet</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Model Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Enfield Hunter"
                    value={form.model_name}
                    onChange={e => setForm({ ...form, model_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Registration Plate Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. KA-30-Z-9900"
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
                    value={form.vehicle_type}
                    onChange={e => setForm({ ...form, vehicle_type: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="Scooter">Scooter</option>
                    <option value="Cruiser">Cruiser</option>
                    <option value="Sports">Sports</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="500"
                    value={form.daily_rate}
                    onChange={e => setForm({ ...form, daily_rate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    value={form.deposit_amount}
                    onChange={e => setForm({ ...form, deposit_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Engine Capacity</label>
                  <input
                    type="text"
                    placeholder="125cc"
                    value={form.engine_capacity}
                    onChange={e => setForm({ ...form, engine_capacity: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Odometer (km)</label>
                  <input
                    type="number"
                    placeholder="12000"
                    value={form.odometer_reading}
                    onChange={e => setForm({ ...form, odometer_reading: e.target.value })}
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
                  Save Vehicle
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
        onSubmit={(data) => console.log('Inspection saved:', data)}
      />

      <DamageReportModal
        isOpen={!!damageVehicle}
        onClose={() => setDamageVehicle(null)}
        vehicle={damageVehicle}
        onSubmit={(data) => console.log('Damage report logged:', data)}
      />
    </CrmLayout>
  );
}
