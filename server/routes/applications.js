// ParimaN - Application Routes
import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware, roleMiddleware } from '../middleware/auth.js';

export default function applicationRoutes(db) {
  const router = Router();
  router.use(authMiddleware);

  function generateAppId() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = db.prepare("SELECT COUNT(*) as c FROM applications WHERE application_id LIKE ?").get(`APP-${date}%`).c;
    return `APP-${date}-${String(count + 1).padStart(4, '0')}`;
  }

  function generateCertNumber() {
    const year = new Date().getFullYear();
    const count = db.prepare("SELECT COUNT(*) as c FROM certificates WHERE certificate_number LIKE ?").get(`CERT-LM-${year}%`).c;
    return `CERT-LM-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // GET /api/applications
  router.get('/', (req, res) => {
    try {
      let query, params = [];
      if (req.user.role === 'applicant') {
        query = `SELECT a.*, i.instrument_type, i.instrument_id as inst_code, i.serial_number, i.manufacturer,
          u.full_name as applicant_name
          FROM applications a
          JOIN instruments i ON a.instrument_id = i.id
          JOIN users u ON a.applicant_id = u.id
          WHERE a.applicant_id = ? ORDER BY a.created_at DESC`;
        params = [req.user.id];
      } else if (req.user.role === 'gatc') {
        const gatc = db.prepare('SELECT id FROM gatc_centres WHERE user_id = ?').get(req.user.id);
        query = `SELECT a.*, i.instrument_type, i.instrument_id as inst_code, i.serial_number, i.manufacturer,
          u.full_name as applicant_name
          FROM applications a
          JOIN instruments i ON a.instrument_id = i.id
          JOIN users u ON a.applicant_id = u.id
          WHERE a.assigned_gatc_id = ? ORDER BY a.created_at DESC`;
        params = [gatc?.id];
      } else {
        query = `SELECT a.*, i.instrument_type, i.instrument_id as inst_code, i.serial_number, i.manufacturer,
          u.full_name as applicant_name, u.organization as applicant_org,
          o.full_name as officer_name, g.name as gatc_name
          FROM applications a
          JOIN instruments i ON a.instrument_id = i.id
          JOIN users u ON a.applicant_id = u.id
          LEFT JOIN users o ON a.assigned_officer_id = o.id
          LEFT JOIN gatc_centres g ON a.assigned_gatc_id = g.id
          ORDER BY a.created_at DESC`;
      }
      const applications = db.prepare(query).all(...params);
      res.json(applications);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  });

  // GET /api/applications/:id
  router.get('/:id', (req, res) => {
    try {
      const app = db.prepare(`
        SELECT a.*, i.instrument_type, i.instrument_id as inst_code, i.serial_number, i.manufacturer,
          i.capacity, i.accuracy_class, i.model_number, i.category, i.location_of_use,
          u.full_name as applicant_name, u.organization as applicant_org, u.email as applicant_email,
          u.phone as applicant_phone, u.address as applicant_address,
          o.full_name as officer_name, g.name as gatc_name
        FROM applications a
        JOIN instruments i ON a.instrument_id = i.id
        JOIN users u ON a.applicant_id = u.id
        LEFT JOIN users o ON a.assigned_officer_id = o.id
        LEFT JOIN gatc_centres g ON a.assigned_gatc_id = g.id
        WHERE a.id = ?
      `).get(req.params.id);

      if (!app) return res.status(404).json({ error: 'Application not found' });

      // Get documents
      const documents = db.prepare('SELECT * FROM documents WHERE application_id = ?').all(app.id);

      // Get appointment
      const appointment = db.prepare('SELECT * FROM verification_appointments WHERE application_id = ?').get(app.id);

      // Get report
      const report = db.prepare('SELECT * FROM verification_reports WHERE application_id = ?').get(app.id);

      let checklistResults = [];
      if (report) {
        checklistResults = db.prepare('SELECT * FROM checklist_results WHERE report_id = ?').all(report.id);
      }

      // Get certificate
      const certificate = db.prepare('SELECT * FROM certificates WHERE application_id = ?').get(app.id);

      // Get payment
      const payment = db.prepare('SELECT * FROM payments WHERE application_id = ?').get(app.id);

      res.json({ ...app, documents, appointment, report, checklistResults, certificate, payment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  });

  // POST /api/applications - create new application
  router.post('/', roleMiddleware('applicant', 'admin'), (req, res) => {
    try {
      const { instrument_id, application_type } = req.body;
      if (!instrument_id) return res.status(400).json({ error: 'Instrument is required' });

      const instrument = db.prepare('SELECT * FROM instruments WHERE id = ?').get(instrument_id);
      if (!instrument) return res.status(404).json({ error: 'Instrument not found' });

      const id = uuidv4();
      const application_id = generateAppId();

      db.prepare(`
        INSERT INTO applications (id, application_id, applicant_id, instrument_id, application_type, status)
        VALUES (?, ?, ?, ?, ?, 'draft')
      `).run(id, application_id, req.user.id, instrument_id, application_type || 'verification');

      const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
      res.status(201).json(app);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create application' });
    }
  });

  // PUT /api/applications/:id/submit
  router.put('/:id/submit', roleMiddleware('applicant', 'admin'), (req, res) => {
    try {
      const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });

      db.prepare("UPDATE applications SET status = 'submitted', submitted_at = datetime('now'), updated_at = datetime('now') WHERE id = ?")
        .run(req.params.id);

      // Create fee payment record
      const feeAmount = calculateFee(db, app.instrument_id);
      db.prepare('INSERT INTO payments (id, application_id, amount, status) VALUES (?,?,?,?)')
        .run(uuidv4(), app.id, feeAmount, 'pending');

      // Notify LMOs
      const lmos = db.prepare("SELECT id FROM users WHERE role = 'lmo' AND is_active = 1").all();
      for (const lmo of lmos) {
        db.prepare('INSERT INTO notifications (id, user_id, title, message, type, related_entity, related_id) VALUES (?,?,?,?,?,?,?)')
          .run(uuidv4(), lmo.id, 'New Application', `New verification application ${app.application_id} submitted.`, 'action', 'application', app.id);
      }

      db.prepare('INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)')
        .run(uuidv4(), req.user.id, 'APPLICATION_SUBMITTED', 'application', app.id, `Application ${app.application_id} submitted`);

      res.json({ message: 'Application submitted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to submit application' });
    }
  });

  // PUT /api/applications/:id/pay - demo payment
  router.put('/:id/pay', roleMiddleware('applicant', 'admin'), (req, res) => {
    try {
      const txnId = `TXN-DEMO-${Date.now().toString(36).toUpperCase()}`;
      db.prepare("UPDATE payments SET status = 'completed', transaction_id = ?, paid_at = datetime('now') WHERE application_id = ?")
        .run(txnId, req.params.id);
      db.prepare("UPDATE applications SET status = 'under_scrutiny', updated_at = datetime('now') WHERE id = ? AND status = 'submitted'")
        .run(req.params.id);
      res.json({ message: 'Payment successful (DEMO)', transaction_id: txnId });
    } catch (err) {
      res.status(500).json({ error: 'Payment failed' });
    }
  });

  // PUT /api/applications/:id/review - LMO reviews application
  router.put('/:id/review', roleMiddleware('lmo', 'admin'), (req, res) => {
    try {
      const { action, remarks, assigned_gatc_id } = req.body;
      const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });

      if (action === 'approve') {
        db.prepare(`UPDATE applications SET status = 'approved', assigned_officer_id = ?, assigned_gatc_id = ?,
          scrutiny_remarks = ?, reviewed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
          .run(req.user.id, assigned_gatc_id || null, remarks || null, req.params.id);

        // Notify applicant
        db.prepare('INSERT INTO notifications (id, user_id, title, message, type, related_entity, related_id) VALUES (?,?,?,?,?,?,?)')
          .run(uuidv4(), app.applicant_id, 'Application Approved', `Your application ${app.application_id} has been approved. Verification will be scheduled.`, 'success', 'application', app.id);
      } else if (action === 'reject') {
        db.prepare(`UPDATE applications SET status = 'rejected', assigned_officer_id = ?,
          rejection_reason = ?, reviewed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`)
          .run(req.user.id, remarks || 'Application rejected', req.params.id);

        db.prepare('INSERT INTO notifications (id, user_id, title, message, type, related_entity, related_id) VALUES (?,?,?,?,?,?,?)')
          .run(uuidv4(), app.applicant_id, 'Application Rejected', `Your application ${app.application_id} has been rejected. Reason: ${remarks || 'See details'}`, 'error', 'application', app.id);
      } else if (action === 'request_documents') {
        db.prepare(`UPDATE applications SET status = 'documents_required', assigned_officer_id = ?,
          scrutiny_remarks = ?, updated_at = datetime('now') WHERE id = ?`)
          .run(req.user.id, remarks || 'Additional documents required', req.params.id);

        db.prepare('INSERT INTO notifications (id, user_id, title, message, type, related_entity, related_id) VALUES (?,?,?,?,?,?,?)')
          .run(uuidv4(), app.applicant_id, 'Documents Required', `Additional documents needed for ${app.application_id}: ${remarks}`, 'warning', 'application', app.id);
      }

      db.prepare('INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)')
        .run(uuidv4(), req.user.id, 'APPLICATION_REVIEWED', 'application', app.id, `${action}: ${remarks || ''}`);

      res.json({ message: 'Application reviewed successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to review application' });
    }
  });

  // PUT /api/applications/:id/schedule - schedule verification
  router.put('/:id/schedule', roleMiddleware('lmo', 'admin', 'gatc'), (req, res) => {
    try {
      const { appointment_date, time_slot, gatc_id } = req.body;
      const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });

      // Check for double booking
      const existing = db.prepare(
        "SELECT id FROM verification_appointments WHERE gatc_id = ? AND appointment_date = ? AND time_slot = ? AND status != 'cancelled'"
      ).get(gatc_id || app.assigned_gatc_id, appointment_date, time_slot);

      if (existing) return res.status(409).json({ error: 'This time slot is already booked' });

      const apptId = uuidv4();
      db.prepare(`INSERT INTO verification_appointments (id, application_id, gatc_id, officer_id, appointment_date, time_slot, status)
        VALUES (?,?,?,?,?,?,?)`)
        .run(apptId, app.id, gatc_id || app.assigned_gatc_id, req.user.id, appointment_date, time_slot, 'scheduled');

      db.prepare("UPDATE applications SET status = 'scheduled', assigned_gatc_id = COALESCE(?, assigned_gatc_id), updated_at = datetime('now') WHERE id = ?")
        .run(gatc_id || null, app.id);

      db.prepare('INSERT INTO notifications (id, user_id, title, message, type, related_entity, related_id) VALUES (?,?,?,?,?,?,?)')
        .run(uuidv4(), app.applicant_id, 'Verification Scheduled', `Verification for ${app.application_id} scheduled on ${appointment_date} at ${time_slot}.`, 'info', 'appointment', apptId);

      res.json({ message: 'Appointment scheduled', appointment_id: apptId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to schedule appointment' });
    }
  });

  // PUT /api/applications/:id/verify - submit verification report
  router.put('/:id/verify', roleMiddleware('lmo', 'gatc', 'admin'), (req, res) => {
    try {
      const { overall_result, remarks, officer_remarks, checklist } = req.body;
      const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });

      const reportId = uuidv4();
      db.prepare(`INSERT INTO verification_reports (id, application_id, officer_id, gatc_id, inspection_date, overall_result, remarks, officer_remarks)
        VALUES (?,?,?,?,datetime('now'),?,?,?)`)
        .run(reportId, app.id, req.user.id, app.assigned_gatc_id, overall_result, remarks || null, officer_remarks || null);

      // Save checklist
      if (checklist && Array.isArray(checklist)) {
        const stmt = db.prepare('INSERT INTO checklist_results (id, report_id, checklist_item, result, measured_value, expected_value, remarks) VALUES (?,?,?,?,?,?,?)');
        for (const item of checklist) {
          stmt.run(uuidv4(), reportId, item.checklist_item, item.result, item.measured_value || null, item.expected_value || null, item.remarks || null);
        }
      }

      db.prepare("UPDATE applications SET status = 'verification_in_progress', updated_at = datetime('now') WHERE id = ?").run(app.id);

      // Update appointment status
      db.prepare("UPDATE verification_appointments SET status = 'completed' WHERE application_id = ?").run(app.id);

      res.json({ message: 'Verification report submitted', report_id: reportId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to submit verification report' });
    }
  });

  // PUT /api/applications/:id/issue-certificate
  router.put('/:id/issue-certificate', roleMiddleware('lmo', 'admin'), (req, res) => {
    try {
      const app = db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id);
      if (!app) return res.status(404).json({ error: 'Application not found' });

      const certNumber = generateCertNumber();
      const issueDate = new Date().toISOString().slice(0, 10);
      const expiryDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

      const certId = uuidv4();
      const qrData = JSON.stringify({ cert: certNumber, verify: `/verify?cert=${certNumber}` });

      db.prepare(`INSERT INTO certificates (id, certificate_number, application_id, instrument_id, applicant_id, issued_by, gatc_id, issue_date, expiry_date, qr_code_data, status, verification_result)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
        .run(certId, certNumber, app.id, app.instrument_id, app.applicant_id, req.user.id, app.assigned_gatc_id, issueDate, expiryDate, qrData, 'active', 'pass');

      db.prepare("UPDATE applications SET status = 'certificate_issued', completed_at = datetime('now'), updated_at = datetime('now') WHERE id = ?").run(app.id);

      // Update instrument
      db.prepare("UPDATE instruments SET last_verification_date = ?, next_due_date = ?, previous_certificate_number = ?, updated_at = datetime('now') WHERE id = ?")
        .run(issueDate, expiryDate, certNumber, app.instrument_id);

      db.prepare('INSERT INTO notifications (id, user_id, title, message, type, related_entity, related_id) VALUES (?,?,?,?,?,?,?)')
        .run(uuidv4(), app.applicant_id, 'Certificate Issued! 🎉', `Verification certificate ${certNumber} has been issued. You can download it from your dashboard.`, 'success', 'certificate', certId);

      db.prepare('INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details) VALUES (?,?,?,?,?,?)')
        .run(uuidv4(), req.user.id, 'CERTIFICATE_ISSUED', 'certificate', certId, `Certificate ${certNumber} issued for application ${app.application_id}`);

      res.json({ message: 'Certificate issued', certificate_number: certNumber, certificate_id: certId });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to issue certificate' });
    }
  });

  return router;
}

function calculateFee(db, instrumentId) {
  const inst = db.prepare('SELECT * FROM instruments WHERE id = ?').get(instrumentId);
  if (!inst) return 500;
  const feeMap = {
    'Electronic Weighing Machine': 500,
    'Platform Scale': 750,
    'Counter Scale': 400,
    'Weighbridge': 2500,
    'Fuel Dispenser': 1500,
    'Water Meter': 300,
    'Capacity Measure': 350,
  };
  return feeMap[inst.instrument_type] || 500;
}
