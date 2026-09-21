import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Scale, FileText, Award, AlertTriangle, Plus, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';

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
  expired: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function ApplicantDashboard() {
  const [stats, setStats] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getStats(), api.getApplications()])
      .then(([s, a]) => { setStats(s); setApps(a); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true" aria-label="Loading dashboard">
        <span className="sr-only">Loading dashboard metrics...</span>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Registered Instruments', value: stats?.instruments || 0, icon: Scale, border: 'border-l-blue-700', iconBg: 'bg-blue-50 text-blue-800' },
    { label: 'Total Applications', value: stats?.applications || 0, icon: FileText, border: 'border-l-indigo-700', iconBg: 'bg-indigo-50 text-indigo-800' },
    { label: 'Active Certificates', value: stats?.certificates || 0, icon: Award, border: 'border-l-emerald-700', iconBg: 'bg-emerald-50 text-emerald-800' },
    { label: 'Pending Processing', value: stats?.pending || 0, icon: Clock, border: 'border-l-amber-600', iconBg: 'bg-amber-50 text-amber-800' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">Applicant Portal Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage weighing & measuring assets and track statutory verification filings</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/applicant/instruments/new" className="btn btn-outline text-xs">
            <Plus size={15} /> Register Instrument
          </Link>
          <Link to="/applicant/applications/new" className="btn btn-primary text-xs">
            <Plus size={15} /> New Application
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <div key={card.label} className={`card p-4 border-l-4 ${card.border} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{card.label}</p>
                <p className="text-2xl font-bold font-display text-slate-900 mt-1">{card.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${card.iconBg}`}>
                <card.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expiry Alert */}
      {stats?.expiringSoon > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 flex items-start gap-3 shadow-sm">
          <AlertTriangle size={18} className="text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Statutory Re-verification Notice</p>
            <p className="text-xs text-amber-800 mt-0.5">
              You have <strong>{stats.expiringSoon} certificate(s)</strong> reaching mandatory 1-year expiry within 30 days. Please initiate renewal filing to avoid statutory trade penalties.
            </p>
          </div>
          <Link to="/applicant/applications/new" className="btn bg-amber-600 hover:bg-amber-700 text-white text-xs px-3 py-1.5 shrink-0">
            Renew Now
          </Link>
        </div>
      )}

      {/* Quick Action Navigation Tiles */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/applicant/instruments/new" className="card p-4 hover:border-blue-400 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Scale size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm">Register Measuring Instrument</h3>
              <p className="text-xs text-slate-500">Record serial number, class, make, and capacity</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-700 transition-colors" />
          </div>
        </Link>

        <Link to="/applicant/applications/new" className="card p-4 hover:border-emerald-400 hover:shadow-md transition-all group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <FileText size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-sm">File Verification Application</h3>
              <p className="text-xs text-slate-500">Submit instrument details for officer scrutiny and GATC test</p>
            </div>
            <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-700 transition-colors" />
          </div>
        </Link>
      </div>

      {/* Recent Applications Table */}
      <div className="card shadow-sm">
        <div className="card-header">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Recent Verification Filings</h3>
            <p className="text-xs text-slate-500">Applications currently in process or completed</p>
          </div>
          <Link to="/applicant/applications" className="text-xs text-blue-700 hover:text-blue-900 font-semibold">
            View All Applications →
          </Link>
        </div>

        {apps.length === 0 ? (
          <div className="empty-state">
            <FileText size={32} className="mx-auto mb-2 opacity-30 text-slate-500" />
            <p className="text-slate-700 font-medium">No verification filings found</p>
            <p className="text-xs text-slate-400 mt-1">Register an instrument to initiate your first legal metrology application.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application Reference</th>
                  <th>Instrument Type</th>
                  <th>Filing Type</th>
                  <th>Status</th>
                  <th>Submission Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.slice(0, 6).map(app => (
                  <tr key={app.id}>
                    <td>
                      <span className="font-mono font-semibold text-blue-900">{app.application_id}</span>
                    </td>
                    <td>
                      <span className="font-medium text-slate-800">{app.instrument_type}</span>
                    </td>
                    <td>
                      <span className="capitalize text-slate-600 text-xs">{app.application_type}</span>
                    </td>
                    <td>
                      <span className={`status-badge border ${statusBadgeClasses[app.status] || 'bg-slate-100 text-slate-700'}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <span className="text-slate-500 font-mono text-xs">
                        {app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-IN') : '—'}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/applicant/applications/${app.id}`}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        Details →
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
