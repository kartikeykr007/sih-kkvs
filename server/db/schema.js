// ParimaN - Database Schema
// Legal Metrology Verification System

export function initializeDatabase(db) {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    -- Users table: All system users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('applicant', 'lmo', 'gatc', 'admin')),
      full_name TEXT NOT NULL,
      phone TEXT,
      organization TEXT,
      designation TEXT,
      district TEXT,
      state TEXT DEFAULT 'Delhi',
      address TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- GATC Centres
    CREATE TABLE IF NOT EXISTS gatc_centres (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      address TEXT,
      district TEXT,
      state TEXT DEFAULT 'Delhi',
      contact_person TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      instrument_types TEXT, -- JSON array of supported types
      max_daily_slots INTEGER DEFAULT 10,
      is_active INTEGER DEFAULT 1,
      user_id TEXT REFERENCES users(id),
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Instruments
    CREATE TABLE IF NOT EXISTS instruments (
      id TEXT PRIMARY KEY,
      instrument_id TEXT UNIQUE NOT NULL, -- e.g. INS-20260921-0001
      owner_id TEXT NOT NULL REFERENCES users(id),
      instrument_type TEXT NOT NULL,
      category TEXT NOT NULL, -- weighing, measuring, etc.
      manufacturer TEXT,
      model_number TEXT,
      serial_number TEXT,
      capacity TEXT,
      least_count TEXT,
      accuracy_class TEXT,
      year_of_manufacture INTEGER,
      location_of_use TEXT,
      purpose_of_use TEXT,
      previous_certificate_number TEXT,
      last_verification_date TEXT,
      next_due_date TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'suspended', 'deregistered')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Applications
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      application_id TEXT UNIQUE NOT NULL, -- e.g. APP-20260921-0001
      applicant_id TEXT NOT NULL REFERENCES users(id),
      instrument_id TEXT NOT NULL REFERENCES instruments(id),
      application_type TEXT DEFAULT 'verification' CHECK(application_type IN ('verification', 'reverification', 'renewal')),
      status TEXT DEFAULT 'draft' CHECK(status IN (
        'draft', 'submitted', 'under_scrutiny', 'documents_required',
        'fee_pending', 'scheduled', 'verification_in_progress',
        'approved', 'rejected', 'certificate_issued', 'expired'
      )),
      assigned_officer_id TEXT REFERENCES users(id),
      assigned_gatc_id TEXT REFERENCES gatc_centres(id),
      scrutiny_remarks TEXT,
      rejection_reason TEXT,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
      submitted_at TEXT,
      reviewed_at TEXT,
      completed_at TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- Documents
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES applications(id),
      document_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT,
      file_size INTEGER,
      mime_type TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'rejected')),
      remarks TEXT,
      uploaded_at TEXT DEFAULT (datetime('now'))
    );

    -- Verification Appointments
    CREATE TABLE IF NOT EXISTS verification_appointments (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES applications(id),
      gatc_id TEXT REFERENCES gatc_centres(id),
      officer_id TEXT REFERENCES users(id),
      appointment_date TEXT NOT NULL,
      time_slot TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'rescheduled')),
      remarks TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Verification Reports
    CREATE TABLE IF NOT EXISTS verification_reports (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES applications(id),
      officer_id TEXT REFERENCES users(id),
      gatc_id TEXT REFERENCES gatc_centres(id),
      inspection_date TEXT,
      overall_result TEXT CHECK(overall_result IN ('pass', 'fail', 'conditional')),
      remarks TEXT,
      evidence_photos TEXT, -- JSON array of file paths
      officer_remarks TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Checklist Results
    CREATE TABLE IF NOT EXISTS checklist_results (
      id TEXT PRIMARY KEY,
      report_id TEXT NOT NULL REFERENCES verification_reports(id),
      checklist_item TEXT NOT NULL,
      result TEXT CHECK(result IN ('pass', 'fail', 'na')),
      measured_value TEXT,
      expected_value TEXT,
      remarks TEXT
    );

    -- Certificates
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      certificate_number TEXT UNIQUE NOT NULL, -- e.g. CERT-LM-2026-0001
      application_id TEXT NOT NULL REFERENCES applications(id),
      instrument_id TEXT NOT NULL REFERENCES instruments(id),
      applicant_id TEXT NOT NULL REFERENCES users(id),
      issued_by TEXT REFERENCES users(id),
      gatc_id TEXT REFERENCES gatc_centres(id),
      issue_date TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      qr_code_data TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'revoked', 'renewed')),
      verification_result TEXT,
      digital_signature TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Payments
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES applications(id),
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'demo',
      transaction_id TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed', 'refunded')),
      paid_at TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'error', 'action')),
      related_entity TEXT,
      related_id TEXT,
      is_read INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Audit Logs
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_instruments_owner ON instruments(owner_id);
    CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id);
    CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
    CREATE INDEX IF NOT EXISTS idx_applications_officer ON applications(assigned_officer_id);
    CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
    CREATE INDEX IF NOT EXISTS idx_certificates_instrument ON certificates(instrument_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(user_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
  `);
}
