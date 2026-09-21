// ParimaN - Certificate & Verification Routes
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';

export default function certificateRoutes(db) {
  const router = Router();

  // GET /api/certificates/verify/:certNumber - PUBLIC endpoint
  router.get('/verify/:certNumber', (req, res) => {
    try {
      const cert = db.prepare(`
        SELECT c.certificate_number, c.issue_date, c.expiry_date, c.status, c.verification_result,
          i.instrument_type, i.instrument_id as inst_code, i.manufacturer, i.model_number, i.capacity, i.serial_number,
          u.full_name as owner_name, u.organization as owner_organization,
          o.full_name as issued_by_name, o.designation as issued_by_designation,
          g.name as verification_centre
        FROM certificates c
        JOIN instruments i ON c.instrument_id = i.id
        JOIN users u ON c.applicant_id = u.id
        LEFT JOIN users o ON c.issued_by = o.id
        LEFT JOIN gatc_centres g ON c.gatc_id = g.id
        WHERE c.certificate_number = ?
      `).get(req.params.certNumber);

      if (!cert) return res.status(404).json({ error: 'Certificate not found', valid: false });

      // Check if expired
      const isExpired = new Date(cert.expiry_date) < new Date();
      const currentStatus = isExpired ? 'expired' : cert.status;

      res.json({
        valid: currentStatus === 'active',
        certificate_number: cert.certificate_number,
        status: currentStatus,
        instrument_type: cert.instrument_type,
        instrument_id: cert.inst_code,
        manufacturer: cert.manufacturer,
        model_number: cert.model_number,
        capacity: cert.capacity,
        owner_name: cert.owner_name,
        organization: cert.owner_organization,
        verification_date: cert.issue_date,
        expiry_date: cert.expiry_date,
        issued_by: cert.issued_by_name,
        verification_centre: cert.verification_centre,
        verification_result: cert.verification_result
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Verification failed' });
    }
  });

  // GET /api/certificates - list certificates (authenticated)
  router.get('/', authMiddleware, (req, res) => {
    try {
      let certs;
      if (req.user.role === 'applicant') {
        certs = db.prepare(`
          SELECT c.*, i.instrument_type, i.instrument_id as inst_code
          FROM certificates c JOIN instruments i ON c.instrument_id = i.id
          WHERE c.applicant_id = ? ORDER BY c.created_at DESC
        `).all(req.user.id);
      } else {
        certs = db.prepare(`
          SELECT c.*, i.instrument_type, i.instrument_id as inst_code,
            u.full_name as owner_name, u.organization
          FROM certificates c
          JOIN instruments i ON c.instrument_id = i.id
          JOIN users u ON c.applicant_id = u.id
          ORDER BY c.created_at DESC
        `).all();
      }
      res.json(certs);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch certificates' });
    }
  });

  // GET /api/certificates/:id
  router.get('/:id', authMiddleware, (req, res) => {
    try {
      const cert = db.prepare(`
        SELECT c.*, i.instrument_type, i.instrument_id as inst_code, i.manufacturer, i.model_number,
          i.serial_number, i.capacity, i.accuracy_class, i.location_of_use,
          u.full_name as owner_name, u.organization, u.address as owner_address,
          o.full_name as issued_by_name, o.designation as issued_by_designation,
          g.name as verification_centre, g.address as centre_address
        FROM certificates c
        JOIN instruments i ON c.instrument_id = i.id
        JOIN users u ON c.applicant_id = u.id
        LEFT JOIN users o ON c.issued_by = o.id
        LEFT JOIN gatc_centres g ON c.gatc_id = g.id
        WHERE c.id = ?
      `).get(req.params.id);

      if (!cert) return res.status(404).json({ error: 'Certificate not found' });
      res.json(cert);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch certificate' });
    }
  });

  return router;
}
