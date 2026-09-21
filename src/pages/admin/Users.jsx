import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Users, Search, Shield, UserCheck, UserX, Building2, Phone, Mail } from 'lucide-react';

const roleBadgeClasses = {
  applicant: 'bg-blue-50 text-blue-800 border-blue-200',
  lmo: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  gatc: 'bg-amber-50 text-amber-800 border-amber-200',
  admin: 'bg-slate-100 text-slate-800 border-slate-300',
};

const roleLabels = {
  applicant: 'Commercial User',
  lmo: 'Legal Metrology Officer',
  gatc: 'NABL/GATC Laboratory',
  admin: 'Department Administrator',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    api.getUsers()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u => {
    const matchSearch =
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.organization || '').toLowerCase().includes(search.toLowerCase()) ||
      (u.district || '').toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggle = async (userId, currentStatus) => {
    setToggling(userId);
    try {
      await api.toggleUserStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: currentStatus ? 0 : 1 } : u));
    } catch (err) {
      console.error(err);
    }
    setToggling(null);
  };

  const counts = {
    all: users.length,
    applicant: users.filter(u => u.role === 'applicant').length,
    lmo: users.filter(u => u.role === 'lmo').length,
    gatc: users.filter(u => u.role === 'gatc').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading user registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
            Stakeholder Identity & Access Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered government personnel, accredited laboratories, and commercial trade users: <strong className="text-slate-700">{users.length}</strong>
          </p>
        </div>
      </div>

      {/* Role Filter Chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'all', label: 'All Stakeholders' },
          { key: 'applicant', label: 'Commercial Users' },
          { key: 'lmo', label: 'LMO Officers' },
          { key: 'gatc', label: 'GATC Test Centres' },
          { key: 'admin', label: 'Administrators' },
        ].map(r => (
          <button
            key={r.key}
            type="button"
            onClick={() => setRoleFilter(r.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              roleFilter === r.key
                ? 'bg-blue-900 text-white border-blue-900 shadow-sm'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
            }`}
          >
            {r.label} ({counts[r.key] || 0})
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input pl-9 text-xs"
          placeholder="Search by stakeholder name, email, establishment, or district..."
        />
      </div>

      {/* Users Table */}
      <div className="card shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Stakeholder Record</th>
                <th>Institutional Role</th>
                <th>Organization / Trade</th>
                <th>District Jurisdiction</th>
                <th>Enrolled Date</th>
                <th className="text-center">Account State</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className={!user.is_active ? 'opacity-60 bg-slate-50' : ''}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900 font-bold text-xs shrink-0">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{user.full_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge border ${roleBadgeClasses[user.role] || 'bg-slate-100'}`}>
                      {roleLabels[user.role] || user.role}
                    </span>
                    {user.designation && (
                      <p className="text-[10px] text-slate-500 mt-0.5">{user.designation}</p>
                    )}
                  </td>
                  <td>
                    <span className="text-xs text-slate-700">{user.organization || '—'}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-700">{user.district || '—'}</span>
                  </td>
                  <td>
                    <span className="text-slate-500 font-mono text-xs">
                      {new Date(user.created_at).toLocaleDateString('en-IN')}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                      user.is_active ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {user.is_active ? <UserCheck size={13} /> : <UserX size={13} />}
                      {user.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="text-right">
                    {user.role !== 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleToggle(user.id, user.is_active)}
                        disabled={toggling === user.id}
                        className={`btn py-1 px-2.5 text-xs font-semibold ${
                          user.is_active
                            ? 'btn-outline text-rose-700 border-rose-200 hover:bg-rose-50'
                            : 'btn-outline text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {toggling === user.id ? 'Updating...' : user.is_active ? 'Revoke Access' : 'Restore Access'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <p className="text-slate-700 font-medium">No users matched search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
