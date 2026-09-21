// ParimaN - Dashboard/Stats & Notification Routes
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

export default function dashboardRoutes(db) {
  const router = Router();
  router.use(authMiddleware);

  // GET /api/dashboard/stats
  router.get('/stats', (req, res) => {
    try {
      if (req.user.role === 'applicant') {
        const instruments = db.prepare('SELECT COUNT(*) as c FROM instruments WHERE owner_id = ?').get(req.user.id).c;
        const applications = db.prepare('SELECT COUNT(*) as c FROM applications WHERE applicant_id = ?').get(req.user.id).c;
        const pending = db.prepare("SELECT COUNT(*) as c FROM applications WHERE applicant_id = ? AND status NOT IN ('certificate_issued', 'rejected', 'expired', 'draft')").get(req.user.id).c;
        const certificates = db.prepare('SELECT COUNT(*) as c FROM certificates WHERE applicant_id = ?').get(req.user.id).c;
        const expiringSoon = db.prepare("SELECT COUNT(*) as c FROM certificates WHERE applicant_id = ? AND status = 'active' AND expiry_date <= date('now', '+30 days')").get(req.user.id).c;

        res.json({ instruments, applications, pending, certificates, expiringSoon });
      } else if (req.user.role === 'lmo' || req.user.role === 'admin') {
        const totalApplications = db.prepare('SELECT COUNT(*) as c FROM applications').get().c;
        const pendingApplications = db.prepare("SELECT COUNT(*) as c FROM applications WHERE status IN ('submitted', 'under_scrutiny')").get().c;
        const scheduled = db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'scheduled'").get().c;
        const completed = db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'certificate_issued'").get().c;
        const rejected = db.prepare("SELECT COUNT(*) as c FROM applications WHERE status = 'rejected'").get().c;
        const totalInstruments = db.prepare('SELECT COUNT(*) as c FROM instruments').get().c;
        const totalCertificates = db.prepare('SELECT COUNT(*) as c FROM certificates').get().c;
        const expiringSoon = db.prepare("SELECT COUNT(*) as c FROM certificates WHERE status = 'active' AND expiry_date <= date('now', '+30 days')").get().c;
        const todayAppointments = db.prepare("SELECT COUNT(*) as c FROM verification_appointments WHERE appointment_date = date('now') AND status != 'cancelled'").get().c;

        // District stats
        const districtStats = db.prepare(`
          SELECT u.district, COUNT(*) as count FROM applications a
          JOIN users u ON a.applicant_id = u.id
          GROUP BY u.district
        `).all();

        // Instrument type stats
        const instrumentStats = db.prepare(`
          SELECT i.instrument_type, COUNT(*) as count FROM applications a
          JOIN instruments i ON a.instrument_id = i.id
          GROUP BY i.instrument_type
        `).all();

        // Status distribution
        const statusStats = db.prepare('SELECT status, COUNT(*) as count FROM applications GROUP BY status').all();

        // Monthly trend (last 6 months)
        const monthlyStats = db.prepare(`
          SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
          FROM applications
          GROUP BY strftime('%Y-%m', created_at)
          ORDER BY month DESC LIMIT 6
        `).all().reverse();

        res.json({
          totalApplications, pendingApplications, scheduled, completed, rejected,
          totalInstruments, totalCertificates, expiringSoon, todayAppointments,
          districtStats, instrumentStats, statusStats, monthlyStats
        });
      } else if (req.user.role === 'gatc') {
        const gatc = db.prepare('SELECT id FROM gatc_centres WHERE user_id = ?').get(req.user.id);
        const gatcId = gatc?.id;
        const assigned = db.prepare("SELECT COUNT(*) as c FROM applications WHERE assigned_gatc_id = ?").get(gatcId).c;
        const pending = db.prepare("SELECT COUNT(*) as c FROM applications WHERE assigned_gatc_id = ? AND status = 'scheduled'").get(gatcId).c;
        const completed = db.prepare("SELECT COUNT(*) as c FROM applications WHERE assigned_gatc_id = ? AND status IN ('certificate_issued', 'approved', 'verification_in_progress')").get(gatcId).c;
        const todayAppointments = db.prepare("SELECT COUNT(*) as c FROM verification_appointments WHERE gatc_id = ? AND appointment_date = date('now')").get(gatcId).c;

        res.json({ assigned, pending, completed, todayAppointments });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // GET /api/dashboard/notifications
  router.get('/notifications', (req, res) => {
    try {
      const notifications = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50')
        .all(req.user.id);
      const unread = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(req.user.id).c;
      res.json({ notifications, unread });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  });

  // PUT /api/dashboard/notifications/read
  router.put('/notifications/read', (req, res) => {
    try {
      db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user.id);
      res.json({ message: 'All notifications marked as read' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update notifications' });
    }
  });

  // GET /api/dashboard/gatc-centres
  router.get('/gatc-centres', (req, res) => {
    try {
      const centres = db.prepare('SELECT * FROM gatc_centres WHERE is_active = 1').all();
      res.json(centres);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch GATC centres' });
    }
  });

  // GET /api/dashboard/officers
  router.get('/officers', roleMiddleware('admin', 'lmo'), (req, res) => {
    try {
      const officers = db.prepare("SELECT id, full_name, email, designation, district FROM users WHERE role = 'lmo' AND is_active = 1").all();
      res.json(officers);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch officers' });
    }
  });

  return router;
}
