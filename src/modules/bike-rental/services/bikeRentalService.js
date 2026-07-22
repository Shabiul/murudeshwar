import { supabase } from '../../../utils/supabaseClient';

const MOCK_BIKE_INVENTORY = [
  {
    id: 'bike-inv-1',
    model_name: 'Honda Activa 6G',
    registration_number: 'KA-30-Q-1102',
    vehicle_type: 'Scooter',
    engine_capacity: '110cc',
    fuel_type: 'Petrol',
    daily_rate: 500,
    deposit_amount: 1000,
    odometer_reading: 14200,
    status: 'Available',
    helmet_provided: true,
    damage_notes: 'Minor scratch on right side mirror casing.',
    image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'bike-inv-2',
    model_name: 'Royal Enfield Classic 350',
    registration_number: 'KA-30-M-9022',
    vehicle_type: 'Cruiser',
    engine_capacity: '350cc',
    fuel_type: 'Petrol',
    daily_rate: 1200,
    deposit_amount: 2500,
    odometer_reading: 8900,
    status: 'On Trip',
    helmet_provided: true,
    damage_notes: 'None',
    image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'bike-inv-3',
    model_name: 'KTM Duke 250',
    registration_number: 'KA-30-X-4411',
    vehicle_type: 'Sports',
    engine_capacity: '250cc',
    fuel_type: 'Petrol',
    daily_rate: 1600,
    deposit_amount: 3000,
    odometer_reading: 5200,
    status: 'Available',
    helmet_provided: true,
    damage_notes: 'None',
    image_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1000&auto=format&fit=crop'
  },
  {
    id: 'bike-inv-4',
    model_name: 'Hero Xpulse 200 4V',
    registration_number: 'KA-30-A-7700',
    vehicle_type: 'Adventure',
    engine_capacity: '200cc',
    fuel_type: 'Petrol',
    daily_rate: 1100,
    deposit_amount: 2000,
    odometer_reading: 11400,
    status: 'Maintenance',
    helmet_provided: true,
    damage_notes: 'Front brake pad replacement scheduled.',
    image_url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?q=80&w=1000&auto=format&fit=crop'
  }
];

const MOCK_BIKE_BOOKINGS = [
  {
    id: 'bike-bk-101',
    booking_code: 'BK-2026-001',
    bike_id: 'bike-inv-2',
    customer_name: 'Rahul Varma',
    customer_phone: '+91 98765 12345',
    driving_license_no: 'KA30 2021004921',
    start_time: '2026-07-22T09:00:00Z',
    end_time: '2026-07-24T18:00:00Z',
    status: 'On Trip',
    total_amount: 2400,
    deposit_paid: 2500,
    payment_status: 'Paid',
    pickup_odometer: 8900,
    created_at: new Date().toISOString()
  },
  {
    id: 'bike-bk-102',
    booking_code: 'BK-2026-002',
    bike_id: 'bike-inv-1',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 94481 99887',
    driving_license_no: 'DL14 2019882711',
    start_time: '2026-07-23T10:00:00Z',
    end_time: '2026-07-25T10:00:00Z',
    status: 'Confirm',
    total_amount: 1000,
    deposit_paid: 1000,
    payment_status: 'Pending',
    created_at: new Date().toISOString()
  }
];

export async function fetchBikeInventory() {
  try {
    const { data, error } = await supabase
      .from('bike_inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_BIKE_INVENTORY;
    }
    return data;
  } catch (err) {
    console.warn('Falling back to local bike inventory dataset:', err);
    return MOCK_BIKE_INVENTORY;
  }
}

export async function fetchBikeBookings() {
  try {
    const { data, error } = await supabase
      .from('bike_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return MOCK_BIKE_BOOKINGS;
    }
    return data;
  } catch (err) {
    console.warn('Falling back to local bike bookings dataset:', err);
    return MOCK_BIKE_BOOKINGS;
  }
}

export async function createBikeInventoryItem(item) {
  try {
    const { data, error } = await supabase
      .from('bike_inventory')
      .insert([item])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn('Simulating bike inventory creation locally:', err);
    return {
      id: `bike-inv-${Date.now()}`,
      ...item,
      created_at: new Date().toISOString()
    };
  }
}

export async function createBikeBooking(booking) {
  try {
    const { data, error } = await supabase
      .from('bike_bookings')
      .insert([booking])
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn('Simulating bike booking creation locally:', err);
    return {
      id: `bike-bk-${Date.now()}`,
      booking_code: `BK-2026-${Math.floor(100 + Math.random() * 900)}`,
      ...booking,
      created_at: new Date().toISOString()
    };
  }
}

export async function updateBikeBookingStatus(bookingId, status, additionalData = {}) {
  try {
    const { data, error } = await supabase
      .from('bike_bookings')
      .update({ status, ...additionalData })
      .eq('id', bookingId)
      .select();

    if (error) throw error;
    return data[0];
  } catch (err) {
    console.warn('Simulating bike status update locally:', err);
    return { id: bookingId, status, ...additionalData };
  }
}
