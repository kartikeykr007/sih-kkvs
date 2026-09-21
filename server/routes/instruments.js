// ParimaN - Instrument Routes
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

export default function instrumentRoutes(db) {
  const router = Router();
  router.use(authMiddleware);

  // Generate unique instrument ID
  function generateInstrumentId() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = db.prepare("SELECT COUNT(*) as c FROM instruments WHERE instrument_id LIKE ?").get(`INS-${date}%`).c;
    return `INS-${date}-${String(count + 1).padStart(4, '0')}`;
  }

  // GET /api/instruments - list instruments for current user (or all for admin/lmo)
  router.get('/', (req, res) => {
    try {
      let instruments;
      if (req.user.role === 'admin' || req.user.role === 'lmo') {
        instruments = db.prepare(`
          SELECT i.*, u.full_name as owner_name, u.organization as owner_organization
          FROM instruments i
          JOIN users u ON i.owner_id = u.id
          ORDER BY i.created_at DESC
        `).all();
      } else {
        instruments = db.prepare('SELECT * FROM instruments WHERE owner_id = ? ORDER BY created_at DESC').all(req.user.id);
      }
      res.json(instruments);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch instruments' });
    }
  });

  // GET /api/instruments/:id
  router.get('/:id', (req, res) => {
    try {
      const instrument = db.prepare(`
        SELECT i.*, u.full_name as owner_name, u.organization as owner_organization
        FROM instruments i JOIN users u ON i.owner_id = u.id
        WHERE i.id = ?
      `).get(req.params.id);

      if (!instrument) return res.status(404).json({ error: 'Instrument not found' });

      // Check access
      if (req.user.role === 'applicant' && instrument.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(instrument);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch instrument' });
    }
  });

  // POST /api/instruments - register new instrument
  router.post('/', roleMiddleware('applicant', 'admin'), (req, res) => {
    try {
      const {
        instrument_type, category, manufacturer, model_number, serial_number,
        capacity, least_count, accuracy_class, year_of_manufacture,
        location_of_use, purpose_of_use, previous_certificate_number,
        last_verification_date, next_due_date
      } = req.body;

      if (!instrument_type || !category) {
        return res.status(400).json({ error: 'Instrument type and category are required' });
      }

      // Check for duplicate serial number
      if (serial_number) {
        const dup = db.prepare('SELECT id FROM instruments WHERE serial_number = ?').get(serial_number);
        if (dup) return res.status(409).json({ error: 'An instrument with this serial number already exists' });
      }

      const id = uuidv4();
      const instrument_id = generateInstrumentId();

      db.prepare(`
        INSERT INTO instruments (id, instrument_id, owner_id, instrument_type, category, manufacturer, model_number,
          serial_number, capacity, least_count, accuracy_class, year_of_manufacture, location_of_use, purpose_of_use,
          previous_certificate_number, last_verification_date, next_due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, instrument_id, req.user.id, instrument_type, category, manufacturer || null,
        model_number || null, serial_number || null, capacity || null, least_count || null,
        accuracy_class || null, year_of_manufacture || null, location_of_use || null,
        purpose_of_use || null, previous_certificate_number || null,
        last_verification_date || null, next_due_date || null);

      const instrument = db.prepare('SELECT * FROM instruments WHERE id = ?').get(id);

      db.prepare('INSERT INTO notifications (id, user_id, title, message, type, related_entity, related_id) VALUES (?,?,?,?,?,?,?)')
        .run(uuidv4(), req.user.id, 'Instrument Registered', `Your ${instrument_type} has been registered with ID ${instrument_id}.`, 'success', 'instrument', id);

      db.prepare('INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)')
        .run(uuidv4(), req.user.id, 'INSTRUMENT_REGISTERED', 'instrument', id, `${instrument_type} - ${serial_number || 'N/A'}`);

      res.status(201).json(instrument);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to register instrument' });
    }
  });

  return router;
}
