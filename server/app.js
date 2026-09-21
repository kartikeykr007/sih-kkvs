// ParimaN - Express Application Setup
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './db/database.js';
import authRoutes from './routes/auth.js';
import instrumentRoutes from './routes/instruments.js';
import applicationRoutes from './routes/applications.js';
import certificateRoutes from './routes/certificates.js';
import dashboardRoutes from './routes/dashboard.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();

// Global Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Helper to mount all routes under both /api and root /
// This ensures requests work whether Vercel serverless functions forward with /api prefix or strip it
const mountRoutes = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes(db));
  app.use(`${prefix}/instruments`, instrumentRoutes(db));
  app.use(`${prefix}/applications`, applicationRoutes(db));
  app.use(`${prefix}/certificates`, certificateRoutes(db));
  app.use(`${prefix}/dashboard`, dashboardRoutes(db));
  app.use(`${prefix}/admin`, adminRoutes(db));
  app.get(`${prefix}/health`, (req, res) => {
    res.json({
      status: 'ok',
      service: 'ParimaN API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      platform: process.env.VERCEL ? 'vercel-serverless' : 'node-server'
    });
  });
};

mountRoutes('/api');
mountRoutes('');

// Root check
app.get('/', (req, res) => {
  res.json({
    name: 'ParimaN - Legal Metrology Online Verification API',
    status: 'online',
    version: '1.0.0',
    documentation: 'https://github.com/kartikeykr007/sih-kkvs'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

export default app;
