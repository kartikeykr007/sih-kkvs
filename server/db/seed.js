// ParimaN - Demo Data Seeder
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export function seedDatabase(db) {
  const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existingUsers.count > 0) {
    console.log('Database already seeded.');
    return;
  }

  console.log('Seeding database with demo data...');

  const hash = bcrypt.hashSync('demo1234', 10);

  // --- USERS ---
  const users = [
    {
      id: uuidv4(), email: 'rajesh.kumar@demo.com', password: hash, role: 'applicant',
      full_name: 'Rajesh Kumar', phone: '9876543210', organization: 'Kumar Traders Pvt Ltd',
      designation: 'Proprietor', district: 'Central Delhi', state: 'Delhi',
      address: '45, Chandni Chowk, Old Delhi, Delhi - 110006'
    },
    {
      id: uuidv4(), email: 'priya.singh@demo.com', password: hash, role: 'applicant',
      full_name: 'Priya Singh', phone: '9876543211', organization: 'Singh Grocery Mart',
      designation: 'Owner', district: 'South Delhi', state: 'Delhi',
      address: '12, Saket Market, New Delhi, Delhi - 110017'
    },
    {
      id: uuidv4(), email: 'inspector.sharma@gov.in', password: hash, role: 'lmo',
      full_name: 'Arvind Sharma', phone: '9876543212', organization: 'Dept. of Legal Metrology, Delhi',
      designation: 'Inspector of Legal Metrology', district: 'Central Delhi', state: 'Delhi',
      address: 'Legal Metrology Office, Kashmere Gate, Delhi - 110006'
    },
    {
      id: uuidv4(), email: 'meera.patel@gov.in', password: hash, role: 'lmo',
      full_name: 'Meera Patel', phone: '9876543215', organization: 'Dept. of Legal Metrology, Delhi',
      designation: 'Assistant Controller', district: 'South Delhi', state: 'Delhi',
      address: 'Legal Metrology Office, Nehru Place, Delhi - 110019'
    },
    {
      id: uuidv4(), email: 'gatc.delhi@demo.com', password: hash, role: 'gatc',
      full_name: 'GATC Delhi Central', phone: '9876543213', organization: 'Delhi Central Test Centre',
      designation: 'Centre Manager', district: 'Central Delhi', state: 'Delhi',
      address: 'Industrial Area, Wazirpur, Delhi - 110052'
    },
    {
      id: uuidv4(), email: 'admin@legalmetrology.gov.in', password: hash, role: 'admin',
      full_name: 'Dr. Suresh Mehta', phone: '9876543214', organization: 'Dept. of Legal Metrology, Govt. of Delhi',
      designation: 'Controller of Legal Metrology', district: 'New Delhi', state: 'Delhi',
      address: 'Secretariat, IP Estate, New Delhi - 110002'
    }
  ];

  const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, role, full_name, phone, organization, designation, district, state, address)
    VALUES (@id, @email, @password, @role, @full_name, @phone, @organization, @designation, @district, @state, @address)
  `);

  const userMap = {};
  for (const user of users) {
    insertUser.run(user);
    userMap[user.email] = user.id;
  }

  // --- GATC CENTRES ---
  const gatcs = [
    {
      id: uuidv4(), name: 'Delhi Central Test Centre', code: 'GATC-DEL-001',
      address: 'Plot 23, Industrial Area, Wazirpur, Delhi - 110052',
      district: 'Central Delhi', state: 'Delhi',
      contact_person: 'GATC Delhi Central', contact_phone: '9876543213', contact_email: 'gatc.delhi@demo.com',
      instrument_types: JSON.stringify(['Electronic Weighing Machine', 'Platform Scale', 'Counter Scale', 'Weighbridge']),
      max_daily_slots: 12, user_id: userMap['gatc.delhi@demo.com']
    },
    {
      id: uuidv4(), name: 'South Delhi Calibration Lab', code: 'GATC-DEL-002',
      address: 'B-14, Okhla Industrial Area, Phase II, Delhi - 110020',
      district: 'South Delhi', state: 'Delhi',
      contact_person: 'Vikram Joshi', contact_phone: '9876543216', contact_email: 'gatc.south@demo.com',
      instrument_types: JSON.stringify(['Electronic Weighing Machine', 'Fuel Dispenser', 'Water Meter', 'Capacity Measure']),
      max_daily_slots: 8, user_id: null
    }
  ];

  const insertGatc = db.prepare(`
    INSERT INTO gatc_centres (id, name, code, address, district, state, contact_person, contact_phone, contact_email, instrument_types, max_daily_slots, user_id)
    VALUES (@id, @name, @code, @address, @district, @state, @contact_person, @contact_phone, @contact_email, @instrument_types, @max_daily_slots, @user_id)
  `);

  const gatcMap = {};
  for (const g of gatcs) {
    insertGatc.run(g);
    gatcMap[g.code] = g.id;
  }

  // --- INSTRUMENTS ---
  const applicant1 = userMap['rajesh.kumar@demo.com'];
  const applicant2 = userMap['priya.singh@demo.com'];

  const instruments = [
    {
      id: uuidv4(), instrument_id: 'INS-20260115-0001', owner_id: applicant1,
      instrument_type: 'Electronic Weighing Machine', category: 'weighing',
      manufacturer: 'Essae Digitronics', model_number: 'DS-252',
      serial_number: 'ED-2024-78451', capacity: '30 kg', least_count: '5 g',
      accuracy_class: 'Class III', year_of_manufacture: 2024,
      location_of_use: '45, Chandni Chowk, Old Delhi', purpose_of_use: 'Retail Trade',
      previous_certificate_number: null, last_verification_date: null, next_due_date: null,
      status: 'active'
    },
    {
      id: uuidv4(), instrument_id: 'INS-20260115-0002', owner_id: applicant1,
      instrument_type: 'Platform Scale', category: 'weighing',
      manufacturer: 'Avery India Ltd', model_number: 'PS-500',
      serial_number: 'AV-2023-12098', capacity: '500 kg', least_count: '100 g',
      accuracy_class: 'Class III', year_of_manufacture: 2023,
      location_of_use: 'Warehouse, Sadar Bazaar, Delhi', purpose_of_use: 'Wholesale Trade',
      previous_certificate_number: 'CERT-LM-2025-0892', last_verification_date: '2025-03-15',
      next_due_date: '2026-03-15', status: 'active'
    },
    {
      id: uuidv4(), instrument_id: 'INS-20260220-0003', owner_id: applicant2,
      instrument_type: 'Electronic Weighing Machine', category: 'weighing',
      manufacturer: 'CAS India', model_number: 'CI-200SC',
      serial_number: 'CAS-2025-45632', capacity: '15 kg', least_count: '2 g',
      accuracy_class: 'Class III', year_of_manufacture: 2025,
      location_of_use: '12, Saket Market, New Delhi', purpose_of_use: 'Retail Trade',
      previous_certificate_number: null, last_verification_date: null, next_due_date: null,
      status: 'active'
    },
    {
      id: uuidv4(), instrument_id: 'INS-20260301-0004', owner_id: applicant1,
      instrument_type: 'Counter Scale', category: 'weighing',
      manufacturer: 'Goldtech', model_number: 'GT-JW',
      serial_number: 'GT-2024-88201', capacity: '5 kg', least_count: '0.5 g',
      accuracy_class: 'Class II', year_of_manufacture: 2024,
      location_of_use: '45, Chandni Chowk, Old Delhi', purpose_of_use: 'Jewellery Trade',
      previous_certificate_number: null, last_verification_date: null, next_due_date: null,
      status: 'active'
    }
  ];

  const insertInstrument = db.prepare(`
    INSERT INTO instruments (id, instrument_id, owner_id, instrument_type, category, manufacturer, model_number, serial_number, capacity, least_count, accuracy_class, year_of_manufacture, location_of_use, purpose_of_use, previous_certificate_number, last_verification_date, next_due_date, status)
    VALUES (@id, @instrument_id, @owner_id, @instrument_type, @category, @manufacturer, @model_number, @serial_number, @capacity, @least_count, @accuracy_class, @year_of_manufacture, @location_of_use, @purpose_of_use, @previous_certificate_number, @last_verification_date, @next_due_date, @status)
  `);

  const instrumentMap = {};
  for (const inst of instruments) {
    insertInstrument.run(inst);
    instrumentMap[inst.instrument_id] = inst.id;
  }

  // --- APPLICATIONS (various statuses for demo) ---
  const lmo1 = userMap['inspector.sharma@gov.in'];
  const gatc1 = gatcMap['GATC-DEL-001'];

  const applications = [
    {
      id: uuidv4(), application_id: 'APP-20260901-0001', applicant_id: applicant1,
      instrument_id: instrumentMap['INS-20260115-0001'], application_type: 'verification',
      status: 'certificate_issued', assigned_officer_id: lmo1, assigned_gatc_id: gatc1,
      submitted_at: '2026-09-01 10:30:00', reviewed_at: '2026-09-02 14:00:00',
      completed_at: '2026-09-05 16:00:00'
    },
    {
      id: uuidv4(), application_id: 'APP-20260910-0002', applicant_id: applicant1,
      instrument_id: instrumentMap['INS-20260115-0002'], application_type: 'reverification',
      status: 'scheduled', assigned_officer_id: lmo1, assigned_gatc_id: gatc1,
      submitted_at: '2026-09-10 09:00:00', reviewed_at: '2026-09-11 11:00:00',
      completed_at: null
    },
    {
      id: uuidv4(), application_id: 'APP-20260915-0003', applicant_id: applicant2,
      instrument_id: instrumentMap['INS-20260220-0003'], application_type: 'verification',
      status: 'under_scrutiny', assigned_officer_id: lmo1, assigned_gatc_id: null,
      submitted_at: '2026-09-15 13:00:00', reviewed_at: null, completed_at: null
    },
    {
      id: uuidv4(), application_id: 'APP-20260918-0004', applicant_id: applicant1,
      instrument_id: instrumentMap['INS-20260301-0004'], application_type: 'verification',
      status: 'submitted', assigned_officer_id: null, assigned_gatc_id: null,
      submitted_at: '2026-09-18 08:00:00', reviewed_at: null, completed_at: null
    }
  ];

  const insertApp = db.prepare(`
    INSERT INTO applications (id, application_id, applicant_id, instrument_id, application_type, status, assigned_officer_id, assigned_gatc_id, submitted_at, reviewed_at, completed_at)
    VALUES (@id, @application_id, @applicant_id, @instrument_id, @application_type, @status, @assigned_officer_id, @assigned_gatc_id, @submitted_at, @reviewed_at, @completed_at)
  `);

  const appMap = {};
  for (const app of applications) {
    insertApp.run(app);
    appMap[app.application_id] = app.id;
  }

  // --- DOCUMENTS ---
  const docs = [
    { id: uuidv4(), application_id: appMap['APP-20260901-0001'], document_type: 'Identity Proof', file_name: 'aadhaar_rajesh.pdf', file_path: '/uploads/demo/', file_size: 245000, mime_type: 'application/pdf', status: 'verified' },
    { id: uuidv4(), application_id: appMap['APP-20260901-0001'], document_type: 'Business Registration', file_name: 'trade_license.pdf', file_path: '/uploads/demo/', file_size: 180000, mime_type: 'application/pdf', status: 'verified' },
    { id: uuidv4(), application_id: appMap['APP-20260901-0001'], document_type: 'Instrument Purchase Invoice', file_name: 'invoice_essae.pdf', file_path: '/uploads/demo/', file_size: 320000, mime_type: 'application/pdf', status: 'verified' },
    { id: uuidv4(), application_id: appMap['APP-20260910-0002'], document_type: 'Previous Certificate', file_name: 'prev_certificate.pdf', file_path: '/uploads/demo/', file_size: 410000, mime_type: 'application/pdf', status: 'verified' },
    { id: uuidv4(), application_id: appMap['APP-20260915-0003'], document_type: 'Identity Proof', file_name: 'aadhaar_priya.pdf', file_path: '/uploads/demo/', file_size: 230000, mime_type: 'application/pdf', status: 'pending' },
    { id: uuidv4(), application_id: appMap['APP-20260915-0003'], document_type: 'Shop License', file_name: 'shop_license_saket.pdf', file_path: '/uploads/demo/', file_size: 190000, mime_type: 'application/pdf', status: 'pending' },
  ];

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, application_id, document_type, file_name, file_path, file_size, mime_type, status)
    VALUES (@id, @application_id, @document_type, @file_name, @file_path, @file_size, @mime_type, @status)
  `);

  for (const doc of docs) insertDoc.run(doc);

  // --- VERIFICATION APPOINTMENTS ---
  const appointments = [
    {
      id: uuidv4(), application_id: appMap['APP-20260901-0001'], gatc_id: gatc1, officer_id: lmo1,
      appointment_date: '2026-09-05', time_slot: '10:00 AM - 11:00 AM', status: 'completed'
    },
    {
      id: uuidv4(), application_id: appMap['APP-20260910-0002'], gatc_id: gatc1, officer_id: lmo1,
      appointment_date: '2026-09-25', time_slot: '02:00 PM - 03:00 PM', status: 'scheduled'
    }
  ];

  const insertAppt = db.prepare(`
    INSERT INTO verification_appointments (id, application_id, gatc_id, officer_id, appointment_date, time_slot, status)
    VALUES (@id, @application_id, @gatc_id, @officer_id, @appointment_date, @time_slot, @status)
  `);

  for (const appt of appointments) insertAppt.run(appt);

  // --- VERIFICATION REPORT for completed app ---
  const reportId = uuidv4();
  db.prepare(`
    INSERT INTO verification_reports (id, application_id, officer_id, gatc_id, inspection_date, overall_result, remarks, officer_remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    reportId, appMap['APP-20260901-0001'], lmo1, gatc1,
    '2026-09-05', 'pass',
    'All parameters within permissible limits. Instrument in good working condition.',
    'Verified and approved for certification.'
  );

  // --- CHECKLIST RESULTS ---
  const checklistItems = [
    { item: 'Physical Condition', result: 'pass', measured: 'Good', expected: 'Good/Acceptable', remarks: 'No visible damage' },
    { item: 'Manufacturer Details Plate', result: 'pass', measured: 'Present & Legible', expected: 'Present & Legible', remarks: '' },
    { item: 'Model Number Verification', result: 'pass', measured: 'DS-252', expected: 'DS-252', remarks: 'Matches records' },
    { item: 'Serial Number Verification', result: 'pass', measured: 'ED-2024-78451', expected: 'ED-2024-78451', remarks: 'Matches records' },
    { item: 'Zero Error Test', result: 'pass', measured: '0.000 kg', expected: '0.000 kg', remarks: 'Within tolerance' },
    { item: 'Accuracy Test (1/3 Max)', result: 'pass', measured: '10.002 kg', expected: '10.000 kg ±0.005', remarks: 'Within MPE' },
    { item: 'Accuracy Test (2/3 Max)', result: 'pass', measured: '20.003 kg', expected: '20.000 kg ±0.010', remarks: 'Within MPE' },
    { item: 'Accuracy Test (Max)', result: 'pass', measured: '29.998 kg', expected: '30.000 kg ±0.015', remarks: 'Within MPE' },
    { item: 'Minimum Capacity Test', result: 'pass', measured: '0.100 kg', expected: '≥ 20e', remarks: 'OK' },
    { item: 'Display Functionality', result: 'pass', measured: 'Clear & Readable', expected: 'Functional', remarks: '' },
    { item: 'Repeatability Test', result: 'pass', measured: '±0.002 kg', expected: '≤ MPE', remarks: '5 consecutive weighings' },
    { item: 'Seal Condition', result: 'pass', measured: 'Intact', expected: 'Intact', remarks: 'No tampering detected' },
    { item: 'Calibration Condition', result: 'pass', measured: 'Calibrated', expected: 'Calibrated', remarks: '' },
    { item: 'Tampering Indicators', result: 'pass', measured: 'None Detected', expected: 'None', remarks: '' },
  ];

  const insertChecklist = db.prepare(`
    INSERT INTO checklist_results (id, report_id, checklist_item, result, measured_value, expected_value, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of checklistItems) {
    insertChecklist.run(uuidv4(), reportId, item.item, item.result, item.measured, item.expected, item.remarks);
  }

  // --- CERTIFICATE ---
  const certNumber = 'CERT-LM-2026-0001';
  db.prepare(`
    INSERT INTO certificates (id, certificate_number, application_id, instrument_id, applicant_id, issued_by, gatc_id, issue_date, expiry_date, qr_code_data, status, verification_result)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    uuidv4(), certNumber, appMap['APP-20260901-0001'],
    instrumentMap['INS-20260115-0001'], applicant1, lmo1, gatc1,
    '2026-09-05', '2027-09-05',
    JSON.stringify({ cert: certNumber, verify: `/verify?cert=${certNumber}` }),
    'active', 'pass'
  );

  // Update instrument with cert details
  db.prepare(`
    UPDATE instruments SET last_verification_date = '2026-09-05', next_due_date = '2027-09-05',
    previous_certificate_number = ? WHERE id = ?
  `).run(certNumber, instrumentMap['INS-20260115-0001']);

  // --- PAYMENTS ---
  const payments = [
    { id: uuidv4(), application_id: appMap['APP-20260901-0001'], amount: 500, payment_method: 'demo', transaction_id: 'TXN-DEMO-001', status: 'completed', paid_at: '2026-09-01 11:00:00' },
    { id: uuidv4(), application_id: appMap['APP-20260910-0002'], amount: 350, payment_method: 'demo', transaction_id: 'TXN-DEMO-002', status: 'completed', paid_at: '2026-09-10 09:30:00' },
    { id: uuidv4(), application_id: appMap['APP-20260915-0003'], amount: 500, payment_method: 'demo', transaction_id: null, status: 'pending', paid_at: null },
  ];

  const insertPayment = db.prepare(`
    INSERT INTO payments (id, application_id, amount, payment_method, transaction_id, status, paid_at)
    VALUES (@id, @application_id, @amount, @payment_method, @transaction_id, @status, @paid_at)
  `);

  for (const p of payments) insertPayment.run(p);

  // --- NOTIFICATIONS ---
  const notifications = [
    { id: uuidv4(), user_id: applicant1, title: 'Certificate Issued', message: 'Your verification certificate CERT-LM-2026-0001 has been issued for Electronic Weighing Machine (INS-20260115-0001).', type: 'success', related_entity: 'certificate', related_id: certNumber },
    { id: uuidv4(), user_id: applicant1, title: 'Verification Scheduled', message: 'Your verification for Platform Scale (INS-20260115-0002) has been scheduled for 25 Sep 2026 at 02:00 PM.', type: 'info', related_entity: 'appointment', related_id: appMap['APP-20260910-0002'] },
    { id: uuidv4(), user_id: applicant1, title: 'Certificate Expiring Soon', message: 'Certificate CERT-LM-2025-0892 for Platform Scale is expiring on 15 Mar 2026. Please apply for re-verification.', type: 'warning', related_entity: 'instrument', related_id: instrumentMap['INS-20260115-0002'] },
    { id: uuidv4(), user_id: lmo1, title: 'New Application Received', message: 'New verification application APP-20260918-0004 from Rajesh Kumar for Counter Scale requires your review.', type: 'action', related_entity: 'application', related_id: appMap['APP-20260918-0004'] },
    { id: uuidv4(), user_id: lmo1, title: 'Application Under Review', message: 'Application APP-20260915-0003 from Priya Singh is pending document verification.', type: 'action', related_entity: 'application', related_id: appMap['APP-20260915-0003'] },
    { id: uuidv4(), user_id: applicant2, title: 'Application Submitted', message: 'Your verification application APP-20260915-0003 has been submitted and is under scrutiny.', type: 'info', related_entity: 'application', related_id: appMap['APP-20260915-0003'] },
  ];

  const insertNotif = db.prepare(`
    INSERT INTO notifications (id, user_id, title, message, type, related_entity, related_id)
    VALUES (@id, @user_id, @title, @message, @type, @related_entity, @related_id)
  `);

  for (const n of notifications) insertNotif.run(n);

  // --- AUDIT LOGS ---
  const auditLogs = [
    { id: uuidv4(), user_id: applicant1, action: 'INSTRUMENT_REGISTERED', entity_type: 'instrument', entity_id: instrumentMap['INS-20260115-0001'], details: 'Electronic Weighing Machine registered' },
    { id: uuidv4(), user_id: applicant1, action: 'APPLICATION_SUBMITTED', entity_type: 'application', entity_id: appMap['APP-20260901-0001'], details: 'Verification application submitted' },
    { id: uuidv4(), user_id: lmo1, action: 'APPLICATION_REVIEWED', entity_type: 'application', entity_id: appMap['APP-20260901-0001'], details: 'Application reviewed and approved' },
    { id: uuidv4(), user_id: lmo1, action: 'CERTIFICATE_ISSUED', entity_type: 'certificate', entity_id: certNumber, details: 'Verification certificate issued' },
  ];

  const insertLog = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, details)
    VALUES (@id, @user_id, @action, @entity_type, @entity_id, @details)
  `);

  for (const log of auditLogs) insertLog.run(log);

  console.log('✅ Database seeded successfully with demo data!');
  console.log(`   - ${users.length} users`);
  console.log(`   - ${gatcs.length} GATC centres`);
  console.log(`   - ${instruments.length} instruments`);
  console.log(`   - ${applications.length} applications`);
  console.log(`   - ${docs.length} documents`);
  console.log(`   - ${appointments.length} appointments`);
  console.log(`   - 1 verification report with ${checklistItems.length} checklist items`);
  console.log(`   - 1 certificate`);
  console.log(`   - ${payments.length} payments`);
  console.log(`   - ${notifications.length} notifications`);
}
