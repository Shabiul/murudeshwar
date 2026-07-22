import React, { useState } from 'react';
import CrmLayout from '../../../components/crm/CrmLayout';
import RentalStatusBadge from '../../../components/shared/rental/RentalStatusBadge';
import VehicleBookingCalendar from '../../../components/shared/rental/VehicleBookingCalendar';
import VehicleInspectionModal from '../../../components/shared/rental/VehicleInspectionModal';
import { useBikeRental } from '../hooks/useBikeRental';
import { BOOKING_WORKFLOW } from '../types/bikeTypes';
import { validateBikeBookingForm, calculateBikeRentalCost } from '../utils/bikeValidation';

export default function BikeBookingsPage() {
  const { bikes, bookings, loading, addBooking, advanceBookingStatus } = useBikeRental();

  // Booking Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inspectBooking, setInspectBooking] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    bike_id: '',
    customer_name: '',
    customer_phone: '',
    driving_license_no: '',
    start_time: new Date().toISOString().slice(0, 16),
    end_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    deposit_paid: '1000'
  });

  const selectedBike = bikes.find(b => b.id === form.bike_id);
  const estimatedCost = selectedBike
    ? calculateBikeRentalCost(selectedBike.daily_rate, form.start_time, form.end_time)
    : 0;

  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const validation = validateBikeBookingForm(form);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    await addBooking({
      ...form,
      status: 'Reserve',
      total_amount: estimatedCost,
      deposit_paid: parseFloat(form.deposit_paid || 0),
      payment_status: 'Pending'
    });

    setIsModalOpen(false);
    setForm({
      bike_id: '',
      customer_name: '',
      customer_phone: '',
      driving_license_no: '',
      start_time: new Date().toISOString().slice(0, 16),
      end_time: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
      deposit_paid: '1000'
    });
    setErrors({});
  };

  const getNextWorkflowStep = (currentStatus) => {
    const idx = BOOKING_WORKFLOW.indexOf(currentStatus);
    if (idx !== -1 && idx < BOOKING_WORKFLOW.length - 1) {
      return BOOKING_WORKFLOW[idx + 1];
    }
    return null;
  };

  return (
    <CrmLayout
      title="Bike Rental Booking Operations"
      subtitle="Track reservation lifecycles, DL verifications, key handovers, and return inspections."
    >
      <div className="space-y-6 font-sans text-stone-800 dark:text-stone-100">
        
        {/* Visual Fleet Schedule Matrix */}
        <VehicleBookingCalendar bookings={bookings} vehicles={bikes} />

        {/* Bookings Action Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">Lifecycle Tracking</span>
            <h3 className="font-serif text-xl font-bold text-stone-900 dark:text-white">Recent Bike Bookings</h3>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-amber-500 text-stone-900 font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            <span>+</span> Create New Bike Reservation
          </button>
        </div>

        {/* Bookings Table */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px] text-xs">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Assigned Bike</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Total (Deposit)</th>
                <th className="py-3 px-4 text-right">Workflow Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">Loading bookings...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">No bike bookings created yet.</td>
                </tr>
              ) : (
                bookings.map((b) => {
                  const bike = bikes.find(v => v.id === b.bike_id);
                  const nextStep = getNextWorkflowStep(b.status);

                  return (
                    <tr key={b.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                      <td className="py-4 px-4 font-mono font-bold text-stone-900 dark:text-white">
                        {b.booking_code || b.id}
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-semibold text-stone-900 dark:text-white">{b.customer_name}</p>
                        <p className="text-[11px] text-stone-400">{b.customer_phone}</p>
                        <p className="text-[10px] text-stone-500 font-mono">DL: {b.driving_license_no}</p>
                      </td>

                      <td className="py-4 px-4">
                        {bike ? (
                          <div>
                            <p className="font-semibold text-stone-900 dark:text-white">{bike.model_name}</p>
                            <p className="text-[10px] text-stone-400 font-mono">{bike.registration_number}</p>
                          </div>
                        ) : (
                          <span className="text-stone-400">Unassigned</span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-[11px]">
                        <div>Pick: {new Date(b.start_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-stone-400">Ret: {new Date(b.end_time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      <td className="py-4 px-4">
                        <RentalStatusBadge status={b.status} />
                      </td>

                      <td className="py-4 px-4 font-mono">
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">₹{b.total_amount?.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-stone-400">Dep: ₹{b.deposit_paid}</div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        {nextStep ? (
                          <button
                            onClick={() => {
                              if (nextStep.includes('Inspection')) {
                                setInspectBooking({ booking: b, bike });
                              } else {
                                advanceBookingStatus(b.id, nextStep);
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

      {/* New Reservation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-white">New Bike Reservation</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              {errors.dates && <p className="text-rose-500 font-semibold text-[11px]">{errors.dates}</p>}
              
              <div>
                <label className="block font-semibold mb-1">Select Vehicle</label>
                <select
                  required
                  value={form.bike_id}
                  onChange={e => setForm({ ...form, bike_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                >
                  <option value="">-- Choose Bike/Scooter --</option>
                  {bikes.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.model_name} ({b.registration_number}) - ₹{b.daily_rate}/day [{b.status}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Customer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Hegde"
                    value={form.customer_name}
                    onChange={e => setForm({ ...form, customer_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                  {errors.customer_name && <p className="text-rose-500 text-[10px] mt-0.5">{errors.customer_name}</p>}
                </div>

                <div>
                  <label className="block font-semibold mb-1">Customer Phone</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={form.customer_phone}
                    onChange={e => setForm({ ...form, customer_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                  />
                  {errors.customer_phone && <p className="text-rose-500 text-[10px] mt-0.5">{errors.customer_phone}</p>}
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Driving License Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. KA30 2022001928"
                  value={form.driving_license_no}
                  onChange={e => setForm({ ...form, driving_license_no: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800"
                />
                {errors.driving_license_no && <p className="text-rose-500 text-[10px] mt-0.5">{errors.driving_license_no}</p>}
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

              {selectedBike && (
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-2xl border border-stone-200 dark:border-stone-700 flex justify-between font-semibold">
                  <span>Estimated Total Amount:</span>
                  <span className="font-mono text-emerald-600">₹{estimatedCost.toLocaleString('en-IN')}</span>
                </div>
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
                  Create Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Action Modal */}
      {inspectBooking && (
        <VehicleInspectionModal
          isOpen={!!inspectBooking}
          onClose={() => setInspectBooking(null)}
          vehicle={inspectBooking.bike}
          inspectionType={inspectBooking.booking?.status === 'Confirm' ? 'Pickup' : 'Return'}
          onSubmit={(inspectData) => {
            const next = inspectBooking.booking?.status === 'Confirm' ? 'Vehicle Inspection' : 'Inspection';
            advanceBookingStatus(inspectBooking.booking.id, next, {
              pickup_inspection_notes: inspectData.notes,
              pickup_odometer: inspectData.odometer
            });
            setInspectBooking(null);
          }}
        />
      )}
    </CrmLayout>
  );
}
