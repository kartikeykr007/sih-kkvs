import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Shield, Search, User, FileText, Award, Scale, LogIn, Filter } from 'lucide-react';

const actionBadgeClasses = {
  USER_LOGIN: 'bg-blue-50 text-blue-800 border-blue-200',
  INSTRUMENT_REGISTERED: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  APPLICATION_SUBMITTED: 'bg-amber-50 text-amber-800 border-amber-200',
  APPLICATION_REVIEWED: 'bg-purple-50 text-purple-800 border-purple-200',
  CERTIFICATE_ISSUED: 'bg-emerald-50 text-emerald-800 border-emerald-200',
};

const actionIcons = {
  USER_LOGIN: LogIn,
  INSTRUMENT_REGISTERED: Scale,
  APPLICATION_SUBMITTED: FileText,
  APPLICATION_REVIEWED: FileText,
  CERTIFICATE_ISSUED: Award,
};

export default function AdminAuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    api.getAuditLogs()
      .then(setLogs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const actions = ['all', ...new Set(logs.map(l => l.action))];

  const filtered = logs.filter(l => {
    const matchSearch =
      (l.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.entity_id || '').toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || l.action === actionFilter;
    return matchSearch && matchAction;
  });

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading immutable system audit logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            <Shield size={20} className="text-blue-900" /> Statutory System Audit Log & Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tamper-evident chronological transaction record of stakeholder actions: <strong className="text-slate-700">{logs.length}</strong> events
          </p>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input pl-9 text-xs"
            placeholder="Search audit trail by actor, action key, entity ID, or remarks..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="form-input text-xs w-full sm:w-56 bg-white"
          >
            {actions.map(a => (
              <option key={a} value={a}>
                {a === 'all' ? `All Audit Event Types (${logs.length})` : a.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow-sm">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp (IST)</th>
                <th>Stakeholder Principal</th>
                <th>System Action Event</th>
                <th>Target Resource</th>
                <th>Audit Detail & Telemetry</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => {
                const Icon = actionIcons[log.action] || Shield;
                const badgeStyle = actionBadgeClasses[log.action] || 'bg-slate-50 text-slate-700 border-slate-200';
                return (
                  <tr key={log.id}>
                    <td>
                      <span className="font-mono text-xs text-slate-600 block">
                        {new Date(log.created_at).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-[10px] shrink-0">
                          {(log.user_name || 'S').charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{log.user_name || 'System Daemon'}</p>
                          <p className="text-[10px] text-slate-500 uppercase">{log.user_role || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge border text-[10px] ${badgeStyle}`}>
                        <Icon size={12} className="shrink-0" />
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="capitalize text-slate-700 text-xs block">{log.entity_type || '—'}</span>
                      {log.entity_id && (
                        <span className="font-mono text-[10px] text-slate-400 block truncate max-w-[130px]">
                          {log.entity_id}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-slate-600 line-clamp-2">{log.details}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="empty-state">
            <p className="text-slate-700 font-medium">No matching audit events recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}
