import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrmLayout from './crm/CrmLayout';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_RENTALS = [
  { id: 'rent-1', vehicle_type: 'Scooter', model_name: 'Honda Activa 6G', license_plate: 'KA-30-Q-1102', guest_name: 'Akash Hegde', rental_start: '2026-07-17T09:00:00Z', rental_end: null, rate_per_day: 500, damage_notes: 'None', status: 'Active' },
  { id: 'rent-2', vehicle_type: 'Bike', model_name: 'Royal Enfield Classic 350', license_plate: 'KA-30-M-9022', guest_name: 'Sarah Mitchell', rental_start: '2026-07-16T10:00:00Z', rental_end: '2026-07-17T10:00:00Z', rate_per_day: 1200, damage_notes: 'Left mirror slightly loose', status: 'Returned' },
  { id: 'rent-3', vehicle_type: 'Car', model_name: 'Mahindra Thar', license_plate: 'KA-30-Z-4500', guest_name: 'Karan Malhotra', rental_start: '2026-07-17T11:00:00Z', rental_end: null, rate_per_day: 3500, damage_notes: 'None', status: 'Active' }
];

export default function RentalDashboard() {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRentOpen, setIsRentOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    vehicle_type: 'Scooter',
    model_name: '',
    license_plate: '',
    guest_name: '',
    rate_per_day: '',
    damage_notes: 'None',
    status: 'Active'
  });

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('crm_rentals')
        .select('*')
        .order('rental_start', { ascending: false });

      if (error) throw error;
      setRentals(data && data.length > 0 ? data : MOCK_RENTALS);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setRentals(MOCK_RENTALS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentals();
  }, []);

  const handleCheckoutRental = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        vehicle_type: form.vehicle_type,
        model_name: form.model_name,
        license_plate: form.license_plate,
        guest_name: form.guest_name,
        rental_start: new Date().toISOString(),
        rental_end: null,
        rate_per_day: parseFloat(form.rate_per_day),
        damage_notes: form.damage_notes,
        status: 'Active'
      };

      const { data, error } = await supabase
        .from('crm_rentals')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setRentals(prev => [data[0], ...prev]);
      } else {
        const newMock = {
          id: `rent-mock-${Date.now()}`,
          ...payload,
          created_at: new Date().toISOString()
        };
        setRentals(prev => [newMock, ...prev]);
      }

      setIsRentOpen(false);
      setForm({
        vehicle_type: 'Scooter',
        model_name: '',
        license_plate: '',
        guest_name: '',
        rate_per_day: '',
        damage_notes: 'None',
        status: 'Active'
      });
    } catch (err) {
      console.error('Error checking out rental:', err);
      // fallback mock update
      const newMock = {
        id: `rent-mock-${Date.now()}`,
        ...form,
        rental_start: new Date().toISOString(),
        rental_end: null,
        created_at: new Date().toISOString()
      };
      setRentals(prev => [newMock, ...prev]);
      setIsRentOpen(false);
    }
  };

  const handleReturnRental = async (id, damageNotes = 'None') => {
    const returnTime = new Date().toISOString();
    try {
      const { error } = await supabase
        .from('crm_rentals')
        .update({ status: 'Returned', rental_end: returnTime, damage_notes: damageNotes })
        .eq('id', id);

      if (error) throw error;

      setRentals(prev => prev.map(r => r.id === id ? { ...r, status: 'Returned', rental_end: returnTime, damage_notes: damageNotes } : r));
    } catch (err) {
      console.error('Error returning rental:', err);
      setRentals(prev => prev.map(r => r.id === id ? { ...r, status: 'Returned', rental_end: returnTime, damage_notes: damageNotes } : r));
    }
  };

  const activeRentalsCount = rentals.filter(r => r.status === 'Active').length;
  const returnedRentalsCount = rentals.filter(r => r.status === 'Returned').length;
  const activeRevenueRate = rentals
    .filter(r => r.status === 'Active')
    .reduce((sum, r) => sum + parseFloat(r.rate_per_day), 0);

  return (
    <CrmLayout title="Vehicle & Gear Rentals" subtitle="Dispatch beach cruisers, trace bike damage records, and check keys in/out.">
      <div className="relative font-sans text-slate-800">
        
        {/* KPI Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Active Rentals</p>
            <h3 className="text-3xl font-serif text-slate-900">{activeRentalsCount} Vehicles</h3>
            <p className="text-[10px] text-amber-600 mt-2">● Checked out to active guests</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Active Rental Income</p>
            <h3 className="text-3xl font-serif text-emerald-600">₹{activeRevenueRate.toLocaleString('en-IN')}/day</h3>
            <p className="text-[10px] text-emerald-600 mt-2">✓ Realtime logistics revenue</p>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm">
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total Returns Today</p>
            <h3 className="text-3xl font-serif text-indigo-600">{returnedRentalsCount} Returned</h3>
            <p className="text-[10px] text-slate-500 mt-2">All vehicle keys verified</p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <h3 className="font-serif text-lg text-slate-800 font-medium">Rental Log</h3>
          <button
            onClick={() => setIsRentOpen(true)}
            className="w-full sm:w-auto px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs uppercase tracking-wider font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            🛵 Checkout Vehicle
          </button>
        </div>

        {/* Rentals Table */}
        <div className="bg-white border border-slate-200/80 rounded-[32px] overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-serif text-xl text-slate-900">Checkout History</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  <th className="py-4 px-8">Vehicle Model</th>
                  <th className="py-4 px-6">License Plate</th>
                  <th className="py-4 px-6">Guest Name</th>
                  <th className="py-4 px-6">Checkout Date</th>
                  <th className="py-4 px-6">Rate/Day</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans text-slate-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">Loading rentals database...</td>
                  </tr>
                ) : rentals.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400">No active vehicle logs.</td>
                  </tr>
                ) : (
                  rentals.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/40 transition-colors">
                      <td className="py-4 px-8">
                        <span className="font-semibold text-slate-900">{r.model_name}</span>
                        <span className="block text-[10px] text-slate-400 mt-0.5">{r.vehicle_type}</span>
                      </td>
                      <td className="py-4 px-6 font-mono font-semibold text-slate-800">{r.license_plate}</td>
                      <td className="py-4 px-6 font-medium text-slate-700">{r.guest_name}</td>
                      <td className="py-4 px-6 text-slate-400">{new Date(r.rental_start).toLocaleDateString('en-IN')}</td>
                      <td className="py-4 px-6 font-bold text-slate-900">₹{parseFloat(r.rate_per_day).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                          r.status === 'Active' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          r.status === 'Returned' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {r.status}
                        </span>
                        {r.damage_notes && r.damage_notes !== 'None' && (
                          <span className="block text-[9px] text-rose-600 mt-1 font-medium">⚠️ {r.damage_notes}</span>
                        )}
                      </td>
                      <td className="py-4 px-8 text-right">
                        {r.status === 'Active' && (
                          <button
                            onClick={() => {
                              const notes = prompt('Enter return damage notes (optional):', 'None');
                              handleReturnRental(r.id, notes || 'None');
                            }}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold uppercase text-[9px] tracking-wider px-3 py-1.5 rounded-xl transition-all"
                          >
                            ✓ Return Key
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Checkout Modal */}
        <AnimatePresence>
          {isRentOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                className="bg-white border border-slate-200 p-8 rounded-[32px] w-full max-w-md shadow-2xl relative my-8"
              >
                <button
                  onClick={() => setIsRentOpen(false)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-800 transition-colors"
                >
                  ✕
                </button>

                <h3 className="font-serif text-3xl text-slate-900 mb-1">Checkout Vehicle</h3>
                <p className="text-slate-500 text-xs mb-6 font-medium">Assign a rental keyset to a resort guest.</p>

                <form onSubmit={handleCheckoutRental} className="space-y-4 text-left font-sans">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Vehicle Type</label>
                      <select
                        value={form.vehicle_type}
                        onChange={(e) => setForm(prev => ({ ...prev, vehicle_type: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      >
                        <option value="Scooter">Scooter</option>
                        <option value="Bike">Geared Bike</option>
                        <option value="Car">Car</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Rate Per Day (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 500"
                        value={form.rate_per_day}
                        onChange={(e) => setForm(prev => ({ ...prev, rate_per_day: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Model Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Honda Activa 6G"
                      value={form.model_name}
                      onChange={(e) => setForm(prev => ({ ...prev, model_name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">License Plate</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. KA-30-Q-1102"
                      value={form.license_plate}
                      onChange={(e) => setForm(prev => ({ ...prev, license_plate: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Guest Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Akash Hegde"
                      value={form.guest_name}
                      onChange={(e) => setForm(prev => ({ ...prev, guest_name: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">Initial Damage Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Scratch on right side"
                      value={form.damage_notes}
                      onChange={(e) => setForm(prev => ({ ...prev, damage_notes: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-md"
                  >
                    Confirm Key Checkout
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </CrmLayout>
  );
}
