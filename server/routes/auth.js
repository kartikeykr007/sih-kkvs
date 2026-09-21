// ParimaN - Auth Routes
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { generateToken } from '../middleware/auth.js';

const JWT_SECRET = process.env.JWT_SECRET || 'pariman_sih2026_demo_secret_key';

export default function authRoutes(db) {
  const router = Router();

  // POST /api/auth/login
  router.post('/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      db.prepare('INSERT INTO audit_logs (id, user_id, action, entity_type, details) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), user.id, 'USER_LOGIN', 'user', `User logged in: ${user.email}`);

      res.json({ token, user: userWithoutPassword });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/auth/register
  router.post('/register', (req, res) => {
    try {
      const { email, password, full_name, phone, organization, district, address } = req.body;

      if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Email, password, and full name are required' });
      }

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const id = uuidv4();

      db.prepare(`
        INSERT INTO users (id, email, password, role, full_name, phone, organization, district, address)
        VALUES (?, ?, ?, 'applicant', ?, ?, ?, ?, ?)
      `).run(id, email, hashedPassword, full_name, phone || null, organization || null, district || null, address || null);

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
      const token = generateToken(user);
      const { password: _, ...userWithoutPassword } = user;

      db.prepare('INSERT INTO notifications (id, user_id, title, message, type) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), id, 'Welcome to ParimaN!', 'Your account has been created successfully. Start by registering your instruments.', 'success');

      res.status(201).json({ token, user: userWithoutPassword });
    } catch (err) {
      console.error('Register error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/auth/me
  router.get('/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token' });

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      const { password: _, ...u } = user;
      res.json(u);
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  return router;
}
