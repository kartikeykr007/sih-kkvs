const API_BASE = '/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('pariman_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me'),

  // Instruments
  getInstruments: () => request('/instruments'),
  getInstrument: (id) => request(`/instruments/${id}`),
  createInstrument: (data) => request('/instruments', { method: 'POST', body: JSON.stringify(data) }),

  // Applications
  getApplications: () => request('/applications'),
  getApplication: (id) => request(`/applications/${id}`),
  createApplication: (data) => request('/applications', { method: 'POST', body: JSON.stringify(data) }),
  submitApplication: (id) => request(`/applications/${id}/submit`, { method: 'PUT' }),
  payApplication: (id) => request(`/applications/${id}/pay`, { method: 'PUT' }),
  reviewApplication: (id, data) => request(`/applications/${id}/review`, { method: 'PUT', body: JSON.stringify(data) }),
  scheduleVerification: (id, data) => request(`/applications/${id}/schedule`, { method: 'PUT', body: JSON.stringify(data) }),
  submitVerification: (id, data) => request(`/applications/${id}/verify`, { method: 'PUT', body: JSON.stringify(data) }),
  issueCertificate: (id) => request(`/applications/${id}/issue-certificate`, { method: 'PUT' }),

  // Certificates
  getCertificates: () => request('/certificates'),
  getCertificate: (id) => request(`/certificates/${id}`),
  verifyCertificate: (certNumber) => request(`/certificates/verify/${certNumber}`),

  // Dashboard
  getStats: () => request('/dashboard/stats'),
  getNotifications: () => request('/dashboard/notifications'),
  markNotificationsRead: () => request('/dashboard/notifications/read', { method: 'PUT' }),
  getGATCCentres: () => request('/dashboard/gatc-centres'),
  getOfficers: () => request('/dashboard/officers'),

  // Admin
  getUsers: () => request('/admin/users'),
  toggleUserStatus: (id) => request(`/admin/users/${id}/toggle`, { method: 'PUT' }),
  getGATCCentresAdmin: () => request('/admin/gatc-centres'),
  getAuditLogs: () => request('/admin/audit-logs'),
};
