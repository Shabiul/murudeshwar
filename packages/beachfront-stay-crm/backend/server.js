import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { createStayCrmBackend } from './router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Mount the Beach Front Stay & Staff CRM API backend
app.use('/api/crm', createStayCrmBackend({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}));

// Serve compiled React UI dashboard static files
const distPath = path.join(packageRoot, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA sub-routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 @murudeshwara/beachfront-stay-crm Server listening on http://localhost:${PORT}`);
  console.log(`👉 UI Dashboard: http://localhost:${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/crm/health`);
  console.log(`🏨 Rooms API:   http://localhost:${PORT}/api/crm/rooms`);
  console.log(`👥 Staff API:   http://localhost:${PORT}/api/crm/staff\n`);
});
