import { getDbClient } from '../db/dbClient.js';

const inMemoryStaff = [
  { id: 'st_1', name: 'Manjunath Gowda', email: 'manju@murudeshwara.com', phone: '+91 94481 00112', role: 'Housekeeping Manager', department: 'Stay', status: 'Active' },
  { id: 'st_2', name: 'Prajwal Hegde', email: 'prajwal@murudeshwara.com', phone: '+91 98860 11223', role: 'Front Desk Lead', department: 'Operations', status: 'Active' },
  { id: 'st_3', name: 'Ramesh Naik', email: 'ramesh@murudeshwara.com', phone: '+91 91102 33445', role: 'Maintenance Engineer', department: 'Facility', status: 'Active' }
];

export async function getStaff(req, res) {
  try {
    const db = getDbClient();
    if (db) {
      const { data, error } = await db.from('crm_staff').select('*');
      if (!error && data) return res.json(data);
    }
    return res.json(inMemoryStaff);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

export async function createStaff(req, res) {
  try {
    const newStaff = {
      id: `st_${Date.now()}`,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      role: req.body.role || 'Staff Member',
      department: req.body.department || 'Stay',
      status: 'Active',
      created_at: new Date().toISOString()
    };

    const db = getDbClient();
    if (db) {
      const { data, error } = await db.from('crm_staff').insert([newStaff]).select();
      if (!error && data) return res.status(201).json(data[0]);
    }
    inMemoryStaff.push(newStaff);
    return res.status(201).json(newStaff);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
