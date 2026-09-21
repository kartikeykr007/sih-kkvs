// ParimaN - Admin Routes
import { Router } from 'express';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

export default function adminRoutes(db) {
  const router = Router();
  router.use(authMiddleware, roleMiddleware('admin'));

  // GET /api/admin/users - list all users
  router.get('/users', (req, res) => {
    try {
      const users = db.prepare(`
        SELECT id, email, role, full_name, phone, organization, designation, district, state, address, is_active, created_at
        FROM users ORDER BY role, full_name
      `).all();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  // PUT /api/admin/users/:id/toggle - activate/deactivate user
  router.put('/users/:id/toggle', (req, res) => {
    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
      if (!user) return res.status(404).json({ error: 'User not found' });
      if (user.role === 'admin') return res.status(403).json({ error: 'Cannot modify admin users' });

      const newStatus = user.is_active ? 0 : 1;
      db.prepare("UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?").run(newStatus, req.params.id);
      res.json({ message: `User ${newStatus ? 'activated' : 'deactivated'}`, is_active: newStatus });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to toggle user status' });
    }
  });

  // GET /api/admin/gatc-centres - all GATC centres with stats
  router.get('/gatc-centres', (req, res) => {
    try {
      const centres = db.prepare(`
        SELECT g.*,
          (SELECT COUNT(*) FROM applications WHERE assigned_gatc_id = g.id) as total_applications,
          (SELECT COUNT(*) FROM applications WHERE assigned_gatc_id = g.id AND status = 'certificate_issued') as completed_applications
        FROM gatc_centres g
        ORDER BY g.name
      `).all();
      res.json(centres);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch GATC centres' });
    }
  });

  // GET /api/admin/audit-logs - system audit logs
  router.get('/audit-logs', (req, res) => {
    try {
      const logs = db.prepare(`
        SELECT a.*, u.full_name as user_name, u.role as user_role
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT 500
      `).all();
      res.json(logs);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  });

  return router;
}
