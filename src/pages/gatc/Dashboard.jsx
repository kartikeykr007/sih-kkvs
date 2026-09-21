import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { ClipboardCheck, Calendar, CheckCircle2, Clock, FileText, ArrowRight } from 'lucide-react';

export default function GATCDashboard() {
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
        <span className="sr-only">Loading GATC test bench metrics...</span>
      </div>
    );
  }

  const kpis = [
    { label: 'Assigned Verifications', value: stats?.assigned || 0, icon: FileText, border: 'border-l-blue-700', iconBg: 'bg-blue-50 text-blue-800' },
    { label: 'Pending Inspections', value: stats?.pending || 0, icon: Clock, border: 'border-l-amber-600', iconBg: 'bg-amber-50 text-amber-800' },
    { label: 'Completed Tests', value: stats?.completed || 0, icon: CheckCircle2, border: 'border-l-emerald-700', iconBg: 'bg-emerald-50 text-emerald-800' },
    { label: "Today's Appointments", value: stats?.todayAppointments || 0, icon: Calendar, border: 'border-l-cyan-700', iconBg: 'bg-cyan-50 text-cyan-800' },
  ];

  const pendingVerification = apps.filter(a => ['scheduled', 'verification_in_progress'].includes(a.status));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
            Government Approved Test Centre (GATC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accredited Metrology Verification Laboratory • NABL Calibration Bench Standard
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={`card p-4 border-l-4 ${k.border} shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">{k.label}</p>
                <p className="text-2xl font-bold font-display text-slate-900 mt-1">{k.value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${k.iconBg}`}>
                <k.icon size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Assigned Verifications Testing Queue */}
      <div className="card shadow-sm">
        <div className="card-header">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ClipboardCheck size={16} className="text-amber-700" /> Assigned Verification Testing Queue
            </h3>
            <p className="text-xs text-slate-500">Instruments scheduled for physical inspection and tolerance tests</p>
          </div>
          <span className="text-xs font-mono text-slate-500">{pendingVerification.length} queue item(s)</span>
        </div>

        {pendingVerification.length === 0 ? (
          <div className="empty-state">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-40 text-emerald-700" />
            <p className="text-slate-700 font-medium">No pending lab test appointments</p>
            <p className="text-xs text-slate-400 mt-1">All scheduled testing appointments have been completed.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingVerification.map(app => (
              <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-blue-900">{app.application_id}</span>
                    <span className={`status-badge border text-[10px] ${
                      app.status === 'verification_in_progress' ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-cyan-50 text-cyan-800 border-cyan-200'
                    }`}>
                      {app.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    {app.instrument_type} • <span className="font-mono text-xs text-slate-500">{app.inst_code}</span>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Trader: <strong className="text-slate-800">{app.applicant_name}</strong> ({app.applicant_org || 'Retail/Commercial'})
                  </p>
                </div>
                <Link
                  to={`/gatc/verify/${app.id}`}
                  className="btn btn-primary text-xs py-1.5 px-4 self-start sm:self-auto shadow-sm"
                >
                  Conduct Calibration Test →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
