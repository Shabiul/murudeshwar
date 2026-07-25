import { getDbClient } from '../db/dbClient.js';

// In-memory fallback data store if DB client is not configured
const inMemoryRooms = [
  { id: '101', title: 'Deluxe Sea View Room', category: 'Stay', status: 'Available', price_per_night: 4500, max_guests: 2 },
  { id: '102', title: 'Beachside Villa Suite', category: 'Stay', status: 'Occupied', price_per_night: 8500, max_guests: 4 },
  { id: '103', title: 'Executive Ocean Suite', category: 'Stay', status: 'Available', price_per_night: 6200, max_guests: 3 },
];

const inMemoryBookings = [
  { id: 'lead_mock_1', serviceType: 'Stay', name: 'Rohan Sharma', email: 'rohan@gmail.com', phone: '+91 98765 43210', status: 'pending', details: { roomTitle: 'Deluxe Sea View Room' } },
  { id: 'lead_mock_2', serviceType: 'Stay', name: 'Priyah Patel', email: 'priyah@gmail.com', phone: '+91 88844 55566', status: 'confirmed', details: { roomTitle: 'Beachside Villa Suite' } }
];

export async function getRooms(req, res) {
  try {
    const db = getDbClient();
    if (db) {
      const { data, error } = await db.from('crm_rooms').select('*');
      if (!error && data) return res.json(data);
    }
    return res.json(inMemoryRooms);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function getBookings(req, res) {
  try {
    const db = getDbClient();
    if (db) {
      const { data, error } = await db.from('crm_leads').select('*').eq('service_type', 'Stay');
      if (!error && data) return res.json(data);
    }
    return res.json(inMemoryBookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createBooking(req, res) {
  try {
    const newBooking = {
      id: `lead_${Date.now()}`,
      serviceType: 'Stay',
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      status: 'pending',
      details: req.body.details || {},
      created_at: new Date().toISOString()
    };

    const db = getDbClient();
    if (db) {
      const { data, error } = await db.from('crm_leads').insert([newBooking]).select();
      if (!error && data) return res.status(201).json(data[0]);
    }
    inMemoryBookings.unshift(newBooking);
    return res.status(201).json(newBooking);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
