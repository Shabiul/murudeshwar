import React, { useState } from 'react';
import CrmLayout from '../../../components/crm/CrmLayout';
import RentalStatusBadge from '../../../components/shared/rental/RentalStatusBadge';
import VehicleBookingCalendar from '../../../components/shared/rental/VehicleBookingCalendar';
import VehicleInspectionModal from '../../../components/shared/rental/VehicleInspectionModal';
import PricingCard from '../../../components/shared/rental/PricingCard';
import { useCarRental } from '../hooks/useCarRental';
import { CAR_WORKFLOW } from '../types/carTypes';
import { validateCarBooking, calculateCarRentalCost } from '../utils/carValidation';

export default function CarBookingsPage() {
  const { cars, drivers, bookings, loading, addBooking, advanceStatus } = useCarRental();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectBooking, setInspectBooking] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    car_id: '',
    driver_id: '',
    customer_name: '',
    customer_phone: '',
    driving_license_no: '',
    is_chauffeur_driven: false,
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    deposit_paid: '3000'
  });

  const selectedCar = cars.find(c => c.id === form.car_id);
  const estimatedTotal = selectedCar
    ? calculateCarRentalCost(
        selectedCar.daily_rate,
        form.is_chauffeur_driven,
        500,
        form.start_time,
        form.end_time
      )
    : 0;

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const validation = validateCarBooking(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await addBooking({
      ...form,
      status: form.driver_id || form.is_chauffeur_driven ? 'Driver Assignment' : 'Reservation',
      total_amount: estimatedTotal,
      deposit_paid: parseFloat(form.deposit_paid || 0),
      payment_status: 'Pending'
    });

    setIsModalOpen(false);
    setForm({
      car_id: '',
      driver_id: '',
      customer_name: '',
      customer_phone: '',
      driving_license_no: '',
      is_chauffeur_driven: false,
      start_time: new Date().toISOString().slice(0, 16),
      end_time: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
      deposit_paid: '3000'
    });
    setErrors({});
  };

  const getNextWorkflowStep = (currentStatus) => {
    const idx = CAR_WORKFLOW.indexOf(currentStatus);
    if (idx !== -1 && idx < CAR_WORKFLOW.length - 1) {
      return CAR_WORKFLOW[idx + 1];
    }
    return null;
  };

  return (
    <CrmLayout
      title="Car Rental & Chauffeur Trips"
      subtitle="Manage SUV bookings, driver dispatch, trip verifications, and post-trip returns."
    >
      <div className="space-y-6 font-sans text-stone-800 dark:text-stone-100">
        
        {/* Fleet Booking Calendar */}
        <VehicleBookingCalendar bookings={bookings} vehicles={cars} />

        {/* Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Car Operations</span>
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Active Car Bookings</h3>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-amber-500 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>+</span> New Car Booking / Trip
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px] text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                <th className="py-3 px-4">Booking Code</th>
                <th className="py-3 px-4">Guest Details</th>
                <th className="py-3 px-4">Car Specs</th>
                <th className="py-3 px-4">Chauffeur / Driver</th>
                <th className="py-3 px-4">Rental Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 font-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">Loading car bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-stone-400">No car bookings recorded yet.</td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const car = cars.find(c => c.id === b.car_id);
                  const driver = drivers.find(d => d.id === b.driver_id);
                  const nextStep = getNextWorkflowStep(b.status);

                  return (
                    <tr key={b.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="py-4 px-4 font-mono font-bold text-stone-900 dark:text-white">
                        {b.booking_code || b.id}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-stone-900 dark:text-white">{b.customer_name}</p>
                        <p className="text-[11px] text-stone-400">{b.customer_phone}</p>
                      </td>

                      <td className="py-4 px-4">
                        {car ? (
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-white">{car.model_name}</p>
                            <p className="text-[10px] text-stone-400 font-mono">{car.registration_number}</p>
                          </div>
                        ) : (
                          <span className="text-stone-400">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        {b.is_chauffeur_driven ? (
                          <div>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-200">
                              Chauffeur
                            </span>
                            <p className="text-[11px] font-semibold text-stone-900 dark:text-white mt-1">
                              {driver?.full_name || 'Assigning Driver...'}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300">
                              Self-Drive
                            </span>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">DL: {b.driving_license_no || 'N/A'}</p>
                          </div>
                        )}
                      </td>

                      <td className="py-4 px-4 text-[11px]">
                        <div>Start: {new Date(b.start_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit' })}</div>
                        <div className="text-stone-400">End: {new Date(b.end_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit' })}</div>
                      </td>

                      <td className="py-4 px-4">
                        <RentalStatusBadge status={b.status} />
                      </td>

                      <td className="py-4 px-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        ₹{b.total_amount?.toLocaleString('en-IN')}
                      </td>

                      <td className="py-4 px-4 text-right">
                        {nextStep ? (
                          <button
                            onClick={() => {
                              if (nextStep === 'Inspection') {
                                setInspectBooking({ booking: b, car });
                              } else {
                                advanceStatus(b.id, nextStep);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 text-white dark:text-stone-900 text-[11px] font-bold transition-all"
                          >
                            Advance to {nextStep} →
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px]">✓ Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Car Booking Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">New Car Booking</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              {errors.dates && <p className="text-rose-500 font-semibold text-[11px]">{errors.dates}</p>}

              <div>
                <label className="block font-semibold mb-1">Select Car</label>
                <select
                  required
                  value={form.car_id}
                  onChange={e => setForm({ ...form, car_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="">-- Choose Car --</option>
                  {cars.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.model_name} ({c.registration_number}) - ₹{c.daily_rate}/day [{c.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-2xl border border-stone-200 dark:border-stone-700">
                <input
                  type="checkbox"
                  id="chauffeurToggle"
                  checked={form.is_chauffeur_driven}
                  onChange={e => setForm({ ...form, is_chauffeur_driven: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                <label htmlFor="chauffeurToggle" className="font-semibold text-stone-900 dark:text-white">
                  Include Chauffeur Driver Service (+₹500/day)
                </label>
              </div>

              {form.is_chauffeur_driven ? (
                <div>
                  <label className="block font-semibold mb-1">Assign Chauffeur Driver</label>
                  <select
                    value={form.driver_id}
                    onChange={e => setForm({ ...form, driver_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  >
                    <option value="">-- Select Available Driver --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.full_name} ({d.phone}) - Rating: {d.rating} ⭐ [{d.status}]
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold mb-1">Customer Driving License No.</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL04 2021004921"
                    value={form.driving_license_no}
                    onChange={e => setForm({ ...form, driving_license_no: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Guest Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anish Hegde"
                    value={form.customer_name}
                    onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Guest Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98860 11223"
                    value={form.customer_phone}
                    onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Pickup Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.start_time}
                    onChange={e => setForm({ ...form, start_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Return Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={form.end_time}
                    onChange={e => setForm({ ...form, end_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                </div>
              </div>

              {selectedCar && (
                <PricingCard
                  dailyRate={selectedCar.daily_rate}
                  durationDays={2}
                  depositAmount={selectedCar.deposit_amount}
                  isChauffeur={form.is_chauffeur_driven}
                  chauffeurAllowance={500}
                />
              )}

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
                  Confirm Car Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Modal */}
      {inspectBooking && (
        <VehicleInspectionModal
          isOpen={!!inspectBooking}
          onClose={() => setInspectBooking(null)}
          vehicle={inspectBooking.car}
          inspectionType="Return"
          onSubmit={(data) => {
            advanceStatus(inspectBooking.booking.id, 'Inspection', {
              inspection_notes: data.notes
            });
            setInspectBooking(null);
          }}
        />
      )}
    </CrmLayout>
  );
}
