import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { FileText, Search, Filter } from 'lucide-react';

const statusBadgeClasses = {
  draft: 'bg-slate-100 text-slate-700 border-slate-200',
  submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  under_scrutiny: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  documents_required: 'bg-amber-50 text-amber-700 border-amber-200',
  fee_pending: 'bg-orange-50 text-orange-700 border-orange-200',
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  scheduled: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  verification_in_progress: 'bg-purple-50 text-purple-700 border-purple-200',
  rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  certificate_issued: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function LMOApplications() {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplications()
      .then(setApps)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = apps.filter(a => {
    const matchSearch =
      a.application_id.toLowerCase().includes(search.toLowerCase()) ||
      (a.applicant_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.applicant_org || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.instrument_type || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading officer application roster...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
            Legal Metrology Applications Roster
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Jurisdictional filings under review, scheduled, or certified: <strong className="text-slate-700">{apps.length}</strong>
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
            placeholder="Search by Application ID, trader name, organization, or instrument type..."
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-input text-xs w-full sm:w-48 bg-white"
          >
            <option value="all">All Filing Statuses ({apps.length})</option>
            {Object.keys(statusBadgeClasses).map(s => (
              <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="card shadow-sm">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={36} className="mx-auto mb-2 opacity-30 text-slate-500" />
            <p className="text-slate-700 font-medium">No applications matched criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing search filters or changing the status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application Ref</th>
                  <th>Commercial Entity</th>
                  <th>Instrument Details</th>
                  <th>Category</th>
                  <th>Statutory Status</th>
                  <th>Assigned Officer</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => (
                  <tr key={app.id}>
                    <td>
                      <span className="font-mono font-semibold text-blue-900">{app.application_id}</span>
                    </td>
                    <td>
                      <p className="font-medium text-slate-900">{app.applicant_name}</p>
                      <p className="text-[11px] text-slate-500">{app.applicant_org}</p>
                    </td>
                    <td>
                      <p className="font-medium text-slate-800">{app.instrument_type}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{app.inst_code}</p>
                    </td>
                    <td>
                      <span className="capitalize text-slate-700 text-xs font-medium">{app.application_type}</span>
                    </td>
                    <td>
                      <span className={`status-badge border ${statusBadgeClasses[app.status] || 'bg-slate-100 text-slate-700'}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-slate-600">{app.officer_name || 'Central Pool'}</span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/lmo/applications/${app.id}`}
                        className="btn btn-outline py-1 px-2.5 text-xs text-blue-800 hover:text-blue-900 hover:border-blue-300 font-semibold"
                      >
                        Scrutiny Dossier →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
