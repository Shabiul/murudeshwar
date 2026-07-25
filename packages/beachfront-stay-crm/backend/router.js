import { Router } from 'express';
import { getRooms, getBookings, createBooking } from './controllers/stayController.js';
import { getStaff, createStaff } from './controllers/staffController.js';
import { initDb } from './db/dbClient.js';

export function createStayCrmBackend(config = {}) {
  if (config.supabaseUrl && (config.supabaseServiceKey || config.supabaseAnonKey)) {
    initDb(config);
  }

  const router = Router();

  // Healthcheck endpoint
  router.get('/health', (req, res) => {
    res.json({ status: 'ok', service: '@murudeshwara/beachfront-stay-crm backend', timestamp: new Date() });
  });

  // Stay Operations API Routes
  router.get('/rooms', getRooms);
  router.get('/bookings', getBookings);
  router.post('/bookings', createBooking);

  // Staff Management API Routes
  router.get('/staff', getStaff);
  router.post('/staff', createStaff);

  return router;
}

export default createStayCrmBackend;
