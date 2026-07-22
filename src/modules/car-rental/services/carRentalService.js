import { supabase } from '../../../utils/supabaseClient';

const MOCK_CARS = [
  {
    id: 'car-1',
    model_name: 'Mahindra Thar 4x4',
    registration_number: 'KA-30-Z-4500',
    category: 'SUV',
    seating_capacity: 4,
    fuel_type: 'Diesel',
    transmission: 'Automatic',
    daily_rate: 3500,
    deposit_amount: 5000,
    odometer_reading: 24500,
    status: 'Available',
    is_chauffeur_available: true,
    damage_notes: 'None',
    image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'car-2',
    model_name: 'Toyota Innova Crysta',
    registration_number: 'KA-30-P-8800',
    category: 'Van',
    seating_capacity: 7,
    fuel_type: 'Diesel',
    transmission: 'Manual',
    daily_rate: 4200,
    deposit_amount: 5000,
    odometer_reading: 48000,
    status: 'On Trip',
    is_chauffeur_available: true,
    damage_notes: 'Rear bumper scratch.',
    image_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'car-3',
    model_name: 'Honda City i-VTEC',
    registration_number: 'KA-30-C-1234',
    category: 'Sedan',
    seating_capacity: 5,
    fuel_type: 'Petrol',
    transmission: 'Automatic',
    daily_rate: 2800,
    deposit_amount: 3000,
    odometer_reading: 19800,
    status: 'Available',
    is_chauffeur_available: true,
    damage_notes: 'None',
    image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1000&auto=format&fit=crop'
  }
];

const MOCK_DRIVERS = [
  {
    id: 'drv-1',
    full_name: 'Ganesh Naik',
    phone: '+91 98801 22334',
    license_number: 'DL-KA-30-20180091',
    license_expiry: '2030-05-15',
    rating: 4.9,
    status: 'Available',
    assigned_vehicle_id: 'car-1'
  },
  {
    id: 'drv-2',
    full_name: 'Subhash Gowda',
    phone: '+91 97412 88776',
    license_number: 'DL-KA-30-20150042',
    license_expiry: '2028-11-20',
    rating: 4.8,
    status: 'On Trip',
    assigned_vehicle_id: 'car-2'
  }
];

const MOCK_CAR_BOOKINGS = [
  {
    id: 'car-bk-201',
    booking_code: 'CBK-2026-001',
    car_id: 'car-2',
    driver_id: 'drv-2',
    customer_name: 'Karan Malhotra',
    customer_phone: '+91 99000 88776',
    driving_license_no: 'DL04 2020112233',
    start_time: '2026-07-22T08:00:00Z',
    end_time: '2026-07-25T20:00:00Z',
    is_chauffeur_driven: true,
    status: 'Trip',
    total_amount: 14100,
    deposit_paid: 5000,
    payment_status: 'Paid',
    created_at: new Date().toISOString()
  }
];

export async function fetchCarInventory() {
  try {
    const { data, error } = await supabase.from('car_inventory').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return MOCK_CARS;
    return data;
  } catch (err) {
    console.warn('Falling back to local car inventory dataset:', err);
    return MOCK_CARS;
  }
}

export async function fetchDrivers() {
  try {
    const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return MOCK_DRIVERS;
    return data;
  } catch (err) {
    console.warn('Falling back to local drivers dataset:', err);
    return MOCK_DRIVERS;
  }
}

export async function fetchCarBookings() {
  try {
    const { data, error } = await supabase.from('car_bookings').select('*').order('created_at', { ascending: false });
    if (error || !data || data.length === 0) return MOCK_CAR_BOOKINGS;
    return data;
  } catch (err) {
    console.warn('Falling back to local car bookings dataset:', err);
    return MOCK_CAR_BOOKINGS;
  }
}

export async function createCarItem(item) {
  try {
    const { data, error } = await supabase.from('car_inventory').insert([item]).select();
    if (error) throw error;
    return data[0];
  } catch (err) {
    return { id: `car-${Date.now()}`, ...item, created_at: new Date().toISOString() };
  }
}

export async function createDriverItem(driver) {
  try {
    const { data, error } = await supabase.from('drivers').insert([driver]).select();
    if (error) throw error;
    return data[0];
  } catch (err) {
    return { id: `drv-${Date.now()}`, ...driver, created_at: new Date().toISOString() };
  }
}

export async function createCarBooking(booking) {
  try {
    const { data, error } = await supabase.from('car_bookings').insert([booking]).select();
    if (error) throw error;
    return data[0];
  } catch (err) {
    return {
      id: `car-bk-${Date.now()}`,
      booking_code: `CBK-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...booking,
      created_at: new Date().toISOString()
    };
  }
}

export async function updateCarBookingStatus(bookingId, status, extra = {}) {
  try {
    const { data, error } = await supabase.from('car_bookings').update({ status, ...extra }).eq('id', bookingId).select();
    if (error) throw error;
    return data[0];
  } catch (err) {
    return { id: bookingId, status, ...extra };
  }
}
