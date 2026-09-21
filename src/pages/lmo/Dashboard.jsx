import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { FileText, Clock, CheckCircle2, XCircle, Calendar, Award, AlertTriangle, Scale, Users, ArrowRight } from 'lucide-react';

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

export default function LMODashboard() {
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
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading officer workbench...</span>
      </div>
    );
  }

  const kpis = [
    { label: 'Assigned Applications', value: stats?.totalApplications || 0, icon: FileText, border: 'border-l-blue-700', iconBg: 'bg-blue-50 text-blue-800' },
    { label: 'Pending Scrutiny', value: stats?.pendingApplications || 0, icon: Clock, border: 'border-l-amber-600', iconBg: 'bg-amber-50 text-amber-800' },
    { label: 'Scheduled Verifications', value: stats?.scheduled || 0, icon: Calendar, border: 'border-l-cyan-700', iconBg: 'bg-cyan-50 text-cyan-800' },
    { label: 'Certified Completed', value: stats?.completed || 0, icon: CheckCircle2, border: 'border-l-emerald-700', iconBg: 'bg-emerald-50 text-emerald-800' },
    { label: 'Rejected Filings', value: stats?.rejected || 0, icon: XCircle, border: 'border-l-rose-700', iconBg: 'bg-rose-50 text-rose-800' },
    { label: 'Expiring Soon (30d)', value: stats?.expiringSoon || 0, icon: AlertTriangle, border: 'border-l-orange-600', iconBg: 'bg-orange-50 text-orange-800' },
  ];

  const pendingApps = apps.filter(a => ['submitted', 'under_scrutiny'].includes(a.status));
  const approvedOrScheduledApps = apps.filter(a => ['approved', 'scheduled'].includes(a.status));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">Legal Metrology Officer Workbench</h1>
          <p className="text-xs text-slate-500 mt-0.5">District Enforcement & Verification Jurisdiction: Delhi Central</p>
        </div>
        <Link to="/lmo/applications" className="btn btn-primary text-xs self-start sm:self-auto">
          View All Scrutiny Records →
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={`card p-3.5 border-l-4 ${k.border} shadow-sm`}>
            <div className="flex items-center justify-between gap-1 mb-1">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide truncate">{k.label}</span>
              <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${k.iconBg}`}>
                <k.icon size={14} />
              </div>
            </div>
            <p className="text-2xl font-bold font-display text-slate-900 mt-1">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Pending Scrutiny Action Queue */}
      <div className="card shadow-sm">
        <div className="card-header">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Clock size={16} className="text-amber-700" /> Pending Scrutiny Queue ({pendingApps.length})
            </h3>
            <p className="text-xs text-slate-500">Filings awaiting initial officer review or document scrutiny</p>
          </div>
          <Link to="/lmo/applications" className="text-xs text-blue-700 hover:text-blue-900 font-semibold">
            View All ({apps.length}) →
          </Link>
        </div>

        {pendingApps.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-40 text-emerald-700" />
            <p className="text-slate-700 font-medium">Scrutiny queue cleared</p>
            <p className="text-xs text-slate-400 mt-1">No applications currently awaiting inspection review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Application Ref</th>
                  <th>Commercial Applicant</th>
                  <th>Instrument Category</th>
                  <th>Current Stage</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingApps.slice(0, 6).map(app => (
                  <tr key={app.id}>
                    <td>
                      <span className="font-mono font-semibold text-blue-900">{app.application_id}</span>
                    </td>
                    <td>
                      <p className="font-medium text-slate-900">{app.applicant_name}</p>
                      <p className="text-[11px] text-slate-500">{app.applicant_org}</p>
                    </td>
                    <td>
                      <span className="font-medium text-slate-800">{app.instrument_type}</span>
                    </td>
                    <td>
                      <span className={`status-badge border ${statusBadgeClasses[app.status] || 'bg-amber-50 text-amber-800'}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="text-right">
                      <Link
                        to={`/lmo/applications/${app.id}`}
                        className="btn btn-primary py-1 px-3 text-xs"
                      >
                        Scrutinize Application →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approved / Scheduled Verification Pipeline */}
      {approvedOrScheduledApps.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar size={16} className="text-cyan-700" /> Approved & Scheduled Pipeline
              </h3>
              <p className="text-xs text-slate-500">Applications approved for physical verification or appointment booking</p>
            </div>
            <span className="text-xs font-mono text-slate-500">{approvedOrScheduledApps.length} active</span>
          </div>

          <div className="divide-y divide-slate-100">
            {approvedOrScheduledApps.map(app => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-900">{app.application_id}</span>
                    <span className={`status-badge border text-[10px] ${statusBadgeClasses[app.status] || 'bg-cyan-50 text-cyan-800'}`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="font-semibold text-slate-800 text-xs">
                    {app.instrument_type} • <span className="font-normal text-slate-600">{app.applicant_name} ({app.applicant_org})</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Testing Centre: <strong className="text-slate-700">{app.gatc_name || 'Designated Laboratory TBD'}</strong>
                  </p>
                </div>
                <Link
                  to={`/lmo/applications/${app.id}`}
                  className="btn btn-outline py-1 px-3 text-xs self-start sm:self-auto font-semibold"
                >
                  Manage Pipeline →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
