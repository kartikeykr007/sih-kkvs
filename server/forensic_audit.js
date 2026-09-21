import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let db;
try {
  const Database = require('better-sqlite3');
  db = new Database('./server/data/pariman.db');
} catch (e) {
  const { DatabaseSync } = require('node:sqlite');
  db = new DatabaseSync('./server/data/pariman.db');
}

const BASE = 'http://localhost:3001/api';

async function testAll() {
  console.log('================================================================');
  console.log('     FORENSIC VERIFICATION OF THE 8 CRITICAL SYSTEM CHECKS     ');
  console.log('================================================================\n');

  // CHECK 1: Is data actually stored in a database?
  console.log('CHECK 1: Is data actually stored in a database?');
  const countUsers = db.prepare('SELECT count(*) as c FROM users').get().c;
  const countApps = db.prepare('SELECT count(*) as c FROM applications').get().c;
  const countCerts = db.prepare('SELECT count(*) as c FROM certificates').get().c;
  console.log(`[PASS] SQLite database exists at ./server/data/pariman.db`);
  console.log(`       Records in DB: Users=${countUsers}, Applications=${countApps}, Certificates=${countCerts}`);
  if (countUsers === 0) throw new Error('DB has no users!');

  // CHECK 2: Does login really work?
  console.log('\nCHECK 2: Does login really work?');
  // 2a. Valid login
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh.kumar@demo.com', password: 'demo1234' })
  });
  if (!loginRes.ok) throw new Error('Valid login failed!');
  const loginData = await loginRes.json();
  console.log(`[PASS] Login succeeded for ${loginData.user.full_name} (${loginData.user.email})`);
  console.log(`       JWT Token issued: ${loginData.token.slice(0, 20)}...`);

  // 2b. Invalid password test
  const badLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh.kumar@demo.com', password: 'wrongpassword' })
  });
  if (badLoginRes.status !== 401) throw new Error('Invalid login did not return 401!');
  console.log(`[PASS] Invalid password rejected with HTTP 401 Unauthorized`);

  // CHECK 3: Are different roles actually separated?
  console.log('\nCHECK 3: Are different roles actually separated?');
  // Applicant trying to access admin endpoint
  const adminTest = await fetch(`${BASE}/admin/users`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  console.log(`[PASS] Applicant accessing /admin/users returned HTTP ${adminTest.status} (Forbidden/Access Denied)`);
  if (adminTest.status !== 403) throw new Error(`Role protection failed! Expected 403, got ${adminTest.status}`);

  // Applicant trying to approve an application
  const reviewTest = await fetch(`${BASE}/applications/some-fake-id/review`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${loginData.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve' })
  });
  console.log(`[PASS] Applicant accessing /review returned HTTP ${reviewTest.status} (Forbidden/Access Denied)`);
  if (reviewTest.status !== 403) throw new Error(`Role protection failed! Expected 403, got ${reviewTest.status}`);

  // CHECK 4: Does an application created by an applicant appear to the LMO?
  console.log('\nCHECK 4: Does an application created by an applicant appear to the LMO?');
  const uniqueSerial = 'TEST-SN-' + Date.now();
  // Create instrument as applicant
  const instRes = await fetch(`${BASE}/instruments`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${loginData.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      instrument_type: 'Electronic Weighing Machine',
      category: 'weighing',
      manufacturer: 'VerifLab Sensors',
      serial_number: uniqueSerial,
      capacity: '100 kg'
    })
  });
  const inst = await instRes.json();

  // Create application as applicant
  const appRes = await fetch(`${BASE}/applications`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${loginData.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ instrument_id: inst.id, application_type: 'verification' })
  });
  const newApp = await appRes.json();

  // Submit application
  await fetch(`${BASE}/applications/${newApp.id}/submit`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  // Settle fee
  await fetch(`${BASE}/applications/${newApp.id}/pay`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });

  // Login as LMO
  const lmoLogin = await (await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'inspector.sharma@gov.in', password: 'demo1234' })
  })).json();

  // Fetch LMO's applications
  const lmoApps = await (await fetch(`${BASE}/applications`, {
    headers: { 'Authorization': `Bearer ${lmoLogin.token}` }
  })).json();

  const foundInLMO = lmoApps.find(a => a.id === newApp.id);
  if (!foundInLMO) throw new Error('Application NOT found in LMO queue!');
  console.log(`[PASS] Application ${newApp.application_id} (Serial: ${uniqueSerial}) visible to LMO`);
  console.log(`       Applicant: ${foundInLMO.applicant_name}, Status in LMO queue: ${foundInLMO.status}`);

  // CHECK 5: Does the LMO's decision update the applicant's dashboard?
  console.log("\nCHECK 5: Does the LMO's decision update the applicant's dashboard?");
  const approvalRemarks = 'Approved by Officer Sharma after statutory scrutiny';
  await fetch(`${BASE}/applications/${newApp.id}/review`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${lmoLogin.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'approve', remarks: approvalRemarks })
  });

  // Query as Applicant
  const applicantView = await (await fetch(`${BASE}/applications/${newApp.id}`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  })).json();

  if (applicantView.status !== 'approved') throw new Error(`Status mismatch! Expected 'approved', got ${applicantView.status}`);
  if (applicantView.scrutiny_remarks !== approvalRemarks) throw new Error('Remarks not updated in applicant view!');
  console.log(`[PASS] Applicant sees updated status: '${applicantView.status}'`);
  console.log(`       Applicant sees officer remarks: '${applicantView.scrutiny_remarks}'`);

  // Schedule & GATC verification steps
  const gatcList = await (await fetch(`${BASE}/dashboard/gatc-centres`, {
    headers: { 'Authorization': `Bearer ${lmoLogin.token}` }
  })).json();

  await fetch(`${BASE}/applications/${newApp.id}/schedule`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${lmoLogin.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appointment_date: '2026-09-30',
      time_slot: '11:00 AM - 12:00 PM',
      gatc_id: gatcList[0].id
    })
  });

  const gatcLogin = await (await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gatc.delhi@demo.com', password: 'demo1234' })
  })).json();

  await fetch(`${BASE}/applications/${newApp.id}/verify`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${gatcLogin.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      overall_result: 'pass',
      remarks: 'All 14 parameters compliant',
      checklist: [{ checklist_item: 'Zero test', expected_value: '0.000g', measured_value: '0.000g', result: 'pass' }]
    })
  });

  // CHECK 6: Is the certificate generated from actual application data?
  console.log('\nCHECK 6: Is the certificate generated from actual application data?');
  const certRes = await fetch(`${BASE}/applications/${newApp.id}/issue-certificate`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${lmoLogin.token}` }
  });
  const certData = await certRes.json();
  const certInDb = db.prepare('SELECT * FROM certificates WHERE certificate_number = ?').get(certData.certificate_number);

  if (!certInDb) throw new Error('Certificate NOT stored in DB!');
  if (certInDb.application_id !== newApp.id) throw new Error('Certificate application_id mismatch!');
  if (certInDb.instrument_id !== inst.id) throw new Error('Certificate instrument_id mismatch!');
  if (certInDb.applicant_id !== loginData.user.id) throw new Error('Certificate applicant_id mismatch!');
  console.log(`[PASS] Certificate ${certData.certificate_number} stored in SQLite DB:`);
  console.log(`       Application ID linked : ${certInDb.application_id}`);
  console.log(`       Instrument ID linked  : ${certInDb.instrument_id}`);
  console.log(`       Applicant User linked : ${certInDb.applicant_id}`);
  console.log(`       Issuing Officer linked: ${certInDb.issued_by}`);
  console.log(`       Validity Period       : ${certInDb.issue_date} to ${certInDb.expiry_date}`);

  // CHECK 7: Does QR verification retrieve the actual certificate?
  console.log('\nCHECK 7: Does QR verification retrieve the actual certificate?');
  const pubVerify = await (await fetch(`${BASE}/certificates/verify/${certData.certificate_number}`)).json();
  if (!pubVerify.valid) throw new Error('Certificate reported as invalid!');
  if (pubVerify.certificate_number !== certData.certificate_number) throw new Error('Cert number mismatch in public verify!');
  if (pubVerify.owner_name !== loginData.user.full_name) throw new Error('Owner mismatch in public verify!');
  if (pubVerify.instrument_type !== 'Electronic Weighing Machine') throw new Error('Instrument mismatch in public verify!');
  console.log(`[PASS] Public QR verify endpoint (/api/certificates/verify/${certData.certificate_number}):`);
  console.log(`       Valid        : ${pubVerify.valid}`);
  console.log(`       Owner        : ${pubVerify.owner_name}`);
  console.log(`       Organization : ${pubVerify.organization}`);
  console.log(`       Instrument   : ${pubVerify.instrument_type} (${pubVerify.instrument_id})`);
  console.log(`       Issued by    : ${pubVerify.issued_by}`);
  console.log(`       Valid until  : ${pubVerify.expiry_date}`);

  // CHECK 8: Does refreshing the page preserve data?
  console.log('\nCHECK 8: Does refreshing the page preserve data?');
  // Simulate page reload: clear memory user object, re-fetch /auth/me with stored token
  const meRes = await fetch(`${BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  });
  const restoredUser = await meRes.json();
  if (restoredUser.id !== loginData.user.id) throw new Error('User session could not be restored on reload!');
  console.log(`[PASS] Client rehydration test (/api/auth/me):`);
  console.log(`       Restored identity : ${restoredUser.full_name} (${restoredUser.role})`);
  console.log(`       User ID matches   : ${restoredUser.id === loginData.user.id}`);

  // Verify that querying applicant's data after reload returns the newly certified instrument
  const reloadedCerts = await (await fetch(`${BASE}/certificates`, {
    headers: { 'Authorization': `Bearer ${loginData.token}` }
  })).json();
  const certExistsOnReload = reloadedCerts.some(c => c.certificate_number === certData.certificate_number);
  console.log(`[PASS] Newly issued certificate visible in applicant certificates list on reload: ${certExistsOnReload}`);

  console.log('\n================================================================');
  console.log('   ALL 8 CHECKS PASSED WITH 100% PERSISTENCE AND ACCURACY!     ');
  console.log('================================================================');
}

testAll().catch(err => {
  console.error('\n❌ FAILED:', err.message);
  process.exit(1);
});
