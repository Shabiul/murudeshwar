export const SERVICES = [
  { key: 'Stay', label: 'Beach Front Stay', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', color: 'sky' },
  { key: 'Scuba', label: 'Scuba Diving', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z', color: 'indigo' },
  { key: 'Bike', label: 'Rental Services', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'orange' },
  { key: 'Contact', label: 'General Inquiry', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', color: 'stone' },
];

export const STAFF_SERVICES = SERVICES.filter((s) => s.key !== 'Contact');

export const BOOKING_STATUS = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'checked_in', label: 'Checked In' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

export const ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Suite',
  'Family Room',
  'Beachfront Villa',
];

export const SCUBA_PACKAGES = [
  'Discover Scuba Diving',
  'PADI Open Water',
  'PADI Advanced Open Water',
  'Fun Dive',
  'Night Dive',
];

export const VEHICLE_TYPES = [
  'Royal Enfield Bullet',
  'Activa Scooter',
  'Mountain Bike',
  'City Cruiser',
];

export const statusStyles = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  checked_in: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-slate-50 text-slate-700 border-slate-200',
  cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const serviceStyles = {
  Stay: 'bg-sky-50 text-sky-700 border-sky-200',
  Scuba: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Bike: 'bg-orange-50 text-orange-700 border-orange-200',
  Contact: 'bg-stone-50 text-stone-700 border-stone-200',
};

export const getServiceLabel = (key) =>
  SERVICES.find((s) => s.key === key)?.label || key;

export const getStatusLabel = (key) =>
  BOOKING_STATUS.find((s) => s.key === key)?.label || key;
