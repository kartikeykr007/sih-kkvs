// ParimaN - Universal Database Provider
// Seamlessly supports local development (Node / better-sqlite3 / node:sqlite)
// and Vercel Serverless Functions (AWS Lambda /tmp with Node 22+ built-in SQLite)

import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { initializeDatabase } from './schema.js';
import { seedDatabase } from './seed.js';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let dbInstance = null;

export function getDatabase() {
  if (dbInstance) return dbInstance;

  const isVercel = Boolean(process.env.VERCEL);
  let dbPath;

  if (isVercel) {
    // In Vercel Serverless, only /tmp is writable
    dbPath = path.join(os.tmpdir(), 'pariman.db');
  } else {
    // Local development storage
    const dataDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        console.warn('Could not create local data directory, falling back to tmp:', err.message);
      }
    }
    dbPath = process.env.DB_PATH || path.join(dataDir, 'pariman.db');
  }

  let db = null;
  let engine = 'none';

  // 1. Try Node.js 22+ built-in node:sqlite (zero native compilation, zero node-gyp, 100% cloud & serverless compatible)
  try {
    const { DatabaseSync } = require('node:sqlite');
    db = new DatabaseSync(dbPath);
    engine = 'node:sqlite';

    // Polyfill pragma helper for better-sqlite3 compatibility
    if (!db.pragma) {
      db.pragma = (str) => {
        try {
          db.exec(`PRAGMA ${str}`);
        } catch (e) {
          // Ignore unsupported pragmas in memory/sync
        }
      };
    }
  } catch (err1) {
    // 2. Fallback to better-sqlite3
    try {
      const BetterSqlite3 = require('better-sqlite3');
      db = new BetterSqlite3(dbPath);
      engine = 'better-sqlite3';
    } catch (err2) {
      console.error('CRITICAL: Failed to load SQLite engine (node:sqlite or better-sqlite3):', err1?.message, err2?.message);
      throw new Error(`Could not initialize SQLite database: ${err1?.message || err2?.message}`);
    }
  }

  // Auto-initialize schema & seed demo data if tables do not exist
  try {
    const tableCheck = db.prepare("SELECT count(name) as c FROM sqlite_master WHERE type='table' AND name='users'").get();
    if (!tableCheck || tableCheck.c === 0) {
      console.log(`🏛️  Initializing & seeding ParimaN database via [${engine}] at ${dbPath}`);
      initializeDatabase(db);
      seedDatabase(db);
    }
  } catch (e) {
    console.warn('Checking database schema produced error, running initialization:', e.message);
    try {
      initializeDatabase(db);
      seedDatabase(db);
    } catch (initErr) {
      console.error('Fatal initialization error:', initErr);
    }
  }

  dbInstance = db;
  return dbInstance;
}

export const db = getDatabase();
