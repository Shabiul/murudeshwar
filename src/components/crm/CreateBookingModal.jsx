import { useState, useRef } from 'react';
import classNames from 'classnames';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SERVICES,
  BOOKING_STATUS,
  ROOM_TYPES,
  SCUBA_PACKAGES,
  VEHICLE_TYPES,
} from '../../utils/crmConstants';
import { uploadCrmImages } from '../../utils/crmUpload';

const EMPTY = {
  name: '',
  email: '',
  phone: '',
  serviceType: 'Stay',
  status: 'pending',
  checkIn: '',
  checkOut: '',
  room: '',
  guests: 1,
  scubaPackage: '',
  diveDate: '',
  diveTime: '',
  vehicle: '',
  pickupDate: '',
  returnDate: '',
  notes: '',
};

export default function CreateBookingModal({ open, onClose, onCreated, staff = [] }) {
  const [form, setForm] = useState(EMPTY);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const fileRef = useRef(null);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((prev) => [...prev, ...files]);
    files.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviews((p) => [...p, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const buildDetails = () => {
    const base = { guests: form.guests };
    if (form.serviceType === 'Stay') {
      return { ...base, checkIn: form.checkIn, checkOut: form.checkOut, room: form.room };
    }
    if (form.serviceType === 'Scuba') {
      return { ...base, package: form.scubaPackage, diveDate: form.diveDate, diveTime: form.diveTime };
    }
    if (form.serviceType === 'Bike') {
      return { ...base, vehicle: form.vehicle, pickupDate: form.pickupDate, returnDate: form.returnDate };
    }
    return base;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrls = [];
      if (images.length > 0) {
        imageUrls = await uploadCrmImages(images, 'bookings');
      }

      await onCreated({
        name: form.name.trim(),
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        service_type: form.serviceType,
        status: form.status,
        notes: form.notes.trim() || null,
        details: buildDetails(),
        image_urls: imageUrls,
        assigned_to: assignedTo || null,
      });

      setForm(EMPTY);
      setImages([]);
      setPreviews([]);
      setAssignedTo('');
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create booking. Check console for details.');
    } finally {
      setUploading(false);
    }
  };

  const filteredStaff = staff.filter(
    (s) => !form.serviceType || form.serviceType === 'Contact' || (s.categories || []).includes(form.serviceType)
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border border-black/5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white/95 backdrop-blur px-8 py-6 border-b border-black/5 flex items-center justify-between rounded-t-3xl z-10">
                <div>
                  <h3 className="font-serif text-xl text-stone-900">New Booking</h3>
                  <p className="text-xs text-stone-500 mt-0.5">Create a booking for any service</p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                {/* Service type pills */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-3">Service</label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setForm({ ...form, serviceType: s.key })}
                        className={classNames(
                          'px-4 py-2 rounded-xl text-sm font-medium border transition-all',
                          form.serviceType === s.key
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-white text-stone-600 border-black/10 hover:border-black/20'
                        )}
                      >
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Guest Name *" required>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputCls}
                      placeholder="Full name"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className={inputCls}
                      placeholder="+91 ..."
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={inputCls}
                      placeholder="email@example.com"
                    />
                  </Field>
                  <Field label="Status">
                    <select
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className={inputCls}
                    >
                      {BOOKING_STATUS.map((s) => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                  </Field>
                </div>

                {/* Service-specific fields */}
                {form.serviceType === 'Stay' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-sky-50/50 rounded-2xl border border-sky-100">
                    <Field label="Check In">
                      <input type="date" value={form.checkIn} onChange={(e) => setForm({ ...form, checkIn: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Check Out">
                      <input type="date" min={form.checkIn} value={form.checkOut} onChange={(e) => setForm({ ...form, checkOut: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Room">
                      <select value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className={inputCls}>
                        <option value="">Select room</option>
                        {ROOM_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </Field>
                  </div>
                )}

                {form.serviceType === 'Scuba' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                    <Field label="Package">
                      <select value={form.scubaPackage} onChange={(e) => setForm({ ...form, scubaPackage: e.target.value })} className={inputCls}>
                        <option value="">Select package</option>
                        {SCUBA_PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </Field>
                    <Field label="Dive Date">
                      <input type="date" value={form.diveDate} onChange={(e) => setForm({ ...form, diveDate: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Time Slot">
                      <input type="time" value={form.diveTime} onChange={(e) => setForm({ ...form, diveTime: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                )}

                {form.serviceType === 'Bike' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                    <Field label="Vehicle">
                      <select value={form.vehicle} onChange={(e) => setForm({ ...form, vehicle: e.target.value })} className={inputCls}>
                        <option value="">Select vehicle</option>
                        {VEHICLE_TYPES.map((v) => <option key={v} value={v}>{v}</option>)}
                      </select>
                    </Field>
                    <Field label="Pickup">
                      <input type="datetime-local" value={form.pickupDate} onChange={(e) => setForm({ ...form, pickupDate: e.target.value })} className={inputCls} />
                    </Field>
                    <Field label="Return">
                      <input type="datetime-local" value={form.returnDate} onChange={(e) => setForm({ ...form, returnDate: e.target.value })} className={inputCls} />
                    </Field>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Guests">
                    <input type="number" min={1} value={form.guests} onChange={(e) => setForm({ ...form, guests: parseInt(e.target.value) || 1 })} className={inputCls} />
                  </Field>
                  {staff.length > 0 && (
                    <Field label="Assign Staff">
                      <select value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} className={inputCls}>
                        <option value="">Unassigned</option>
                        {filteredStaff.map((s) => (
                          <option key={s.id} value={s.id}>{s.full_name}</option>
                        ))}
                      </select>
                    </Field>
                  )}
                </div>

                <Field label="Notes">
                  <textarea
                    rows={2}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className={classNames(inputCls, 'resize-none')}
                    placeholder="Special requests, preferences..."
                  />
                </Field>

                {/* Image upload */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-2">Photos</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-stone-200 rounded-2xl p-6 text-center cursor-pointer hover:border-brand-gold/50 hover:bg-brand-gold/5 transition-all"
                  >
                    <p className="text-sm text-stone-500">Click to upload ID, room preference, or reference images</p>
                    <p className="text-xs text-stone-400 mt-1">PNG, JPG up to 5MB each</p>
                    <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </div>
                  {previews.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-3">
                      {previews.map((src, i) => (
                        <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition-opacity"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-black/5">
                  <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-100">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-8 py-2.5 rounded-xl bg-stone-900 text-white text-sm font-semibold hover:bg-brand-gold hover:text-stone-900 transition-all disabled:opacity-50"
                  >
                    {uploading ? 'Creating...' : 'Create Booking'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

const inputCls = 'w-full border border-black/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/30 bg-white';

function Field({ label, children, required }) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-widest text-stone-500 mb-1.5">
        {label}{required && ' *'}
      </label>
      {children}
    </div>
  );
}
