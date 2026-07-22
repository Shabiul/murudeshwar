import React, { useState } from 'react';
import CrmLayout from '../../../components/crm/CrmLayout';
import RentalStatusBadge from '../../../components/shared/rental/RentalStatusBadge';
import { useCarRental } from '../hooks/useCarRental';

export default function DriverManagementPage() {
  const { drivers, loading, addDriver } = useCarRental();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    license_number: '',
    license_expiry: new Date(Date.now() + 86400000 * 365 * 3).toISOString().slice(0, 10),
    rating: '5.0',
    status: 'Available'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDriver({
      ...form,
      rating: parseFloat(form.rating)
    });
    setIsModalOpen(false);
    setForm({
      full_name: '',
      phone: '',
      license_number: '',
      license_expiry: new Date(Date.now() + 86400000 * 365 * 3).toISOString().slice(0, 10),
      rating: '5.0',
      status: 'Available'
    });
  };

  return (
    <CrmLayout
      title="Chauffeur & Driver Management"
      subtitle="Register resort drivers, verify commercial driving licenses, and track trip assignments."
    >
      <div className="space-y-6 font-sans text-stone-800 dark:text-stone-100">
        
        {/* Header Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Staff Directory</span>
            <h2 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Active Drivers ({drivers.length})</h2>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-amber-500 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>+</span> Onboard New Driver
          </button>
        </div>

        {/* Driver Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-stone-400 text-sm">Loading driver profiles...</div>
          ) : (
            drivers.map((d) => (
              <div key={d.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                      {d.full_name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-stone-900 dark:text-white">{d.full_name}</h3>
                      <p className="text-xs text-stone-500">{d.phone}</p>
                    </div>
                  </div>
                  <RentalStatusBadge status={d.status} />
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-stone-400">License No:</span>
                    <span className="font-mono font-semibold text-stone-800 dark:text-stone-200">{d.license_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">License Expiry:</span>
                    <span className="font-mono text-stone-800 dark:text-stone-200">{d.license_expiry}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Customer Rating:</span>
                    <span className="font-bold text-amber-500">{d.rating} ⭐</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Onboard Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">Onboard Driver</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Driver Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Manjunath Gowda"
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 94481 11223"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Commercial License Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DL-KA-30-20190011"
                  value={form.license_number}
                  onChange={e => setForm({ ...form, license_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">License Expiry Date</label>
                <input
                  type="date"
                  required
                  value={form.license_expiry}
                  onChange={e => setForm({ ...form, license_expiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 dark:text-stone-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-gold text-stone-900 font-bold"
                >
                  Save Driver Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </CrmLayout>
  );
}
