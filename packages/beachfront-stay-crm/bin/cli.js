#!/usr/bin/env node

/**
 * Single-Command Full-Stack CLI Launcher for @murudeshwara/beachfront-stay-crm
 * Usage: npx @murudeshwara/beachfront-stay-crm
 */

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import open from 'open';
import { createStayCrmBackend } from '../backend/router.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageRoot = path.resolve(__dirname, '..');

const PORT = process.env.PORT || 4000;
const app = express();

app.use(cors());
app.use(express.json());

// 1. Mount Beach Front Stay CRM Backend REST API
app.use('/api/crm', createStayCrmBackend({
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
}));

// 2. Serve Static Assets and React UI Dashboard Build
const distPath = path.join(packageRoot, 'dist');
app.use(express.static(distPath));

// Fallback to index.html for SPA sub-routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// 3. Start Unified Server
app.listen(PORT, async () => {
  const url = `http://localhost:${PORT}`;
  console.log('\n===============================================================');
  console.log('🏖️  @murudeshwara/beachfront-stay-crm Full-Stack CRM Running!');
  console.log('===============================================================');
  console.log(`\n👉 CRM UI Dashboard:  ${url}`);
  console.log(`👉 REST API Backend:  ${url}/api/crm`);
  console.log(`👉 API Health Check: ${url}/api/crm/health`);
  console.log('\nPress Ctrl+C to stop server.\n');

  try {
    // Automatically open browser window
    await open(url);
  } catch (e) {
    // Ignore browser open errors in headless environments
  }
});
