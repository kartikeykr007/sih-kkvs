// ParimaN - Express Server
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/schema.js';
import { seedDatabase } from './db/seed.js';
import authRoutes from './routes/auth.js';
import instrumentRoutes from './routes/instruments.js';
import applicationRoutes from './routes/applications.js';
import certificateRoutes from './routes/certificates.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Ensure data directory exists
import fs from 'fs';
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Initialize database
const dbPath = process.env.DB_PATH || path.join(dataDir, 'pariman.db');
const db = new Database(dbPath);
initializeDatabase(db);
seedDatabase(db);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes(db));
app.use('/api/instruments', instrumentRoutes(db));
app.use('/api/applications', applicationRoutes(db));
app.use('/api/certificates', certificateRoutes(db));
app.use('/api/dashboard', dashboardRoutes(db));
app.use('/api/admin', adminRoutes(db));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'ParimaN API', version: '1.0.0' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🏛️  ParimaN API Server running on http://localhost:${PORT}`);
  console.log(`   Legal Metrology Verification System - SIH 2026\n`);
});
