import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { BarChart3, FileText, Scale, Award, Clock, AlertTriangle, Users, Building2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';

const COLORS = ['#1e3a8a', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#4f46e5'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading departmental executive analytics...</span>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Applications', value: stats?.totalApplications || 0, icon: FileText, border: 'border-l-blue-700', iconBg: 'bg-blue-50 text-blue-800' },
    { label: 'Registered Instruments', value: stats?.totalInstruments || 0, icon: Scale, border: 'border-l-indigo-700', iconBg: 'bg-indigo-50 text-indigo-800' },
    { label: 'Certificates Granted', value: stats?.totalCertificates || 0, icon: Award, border: 'border-l-emerald-700', iconBg: 'bg-emerald-50 text-emerald-800' },
    { label: 'Pending Scrutiny', value: stats?.pendingApplications || 0, icon: Clock, border: 'border-l-amber-600', iconBg: 'bg-amber-50 text-amber-800' },
    { label: 'Scheduled Verifications', value: stats?.scheduled || 0, icon: Users, border: 'border-l-cyan-700', iconBg: 'bg-cyan-50 text-cyan-800' },
    { label: 'Expiring In 30 Days', value: stats?.expiringSoon || 0, icon: AlertTriangle, border: 'border-l-rose-700', iconBg: 'bg-rose-50 text-rose-800' },
  ];

  const statusData = (stats?.statusStats || []).map(s => ({
    name: s.status.replace(/_/g, ' '),
    value: s.count
  }));

  const instrumentData = (stats?.instrumentStats || []).map(s => ({
    name: s.instrument_type.replace('Electronic ', 'E-'),
    count: s.count
  }));

  const districtData = (stats?.districtStats || []).map(s => ({
    name: s.district || 'Unassigned',
    count: s.count
  }));

  const monthlyData = (stats?.monthlyStats || []).map(s => ({
    month: s.month,
    applications: s.count
  }));

  const rejectionRate = stats?.totalApplications
    ? ((stats?.rejected || 0) / stats.totalApplications * 100).toFixed(1)
    : 0;

  const completionRate = stats?.totalApplications
    ? (((stats?.completed || 0) / stats.totalApplications) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
            Department Executive Analytics & Oversight
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pan-jurisdiction surveillance of legal metrology operations, verification throughput, and compliance SLAs
          </p>
        </div>
      </div>

      {/* KPI Cards Strip */}
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

      {/* SLA Metric Badges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-l-rose-600 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Statutory Rejection Rate</p>
            <p className="text-2xl font-bold font-display text-rose-700 mt-0.5">{rejectionRate}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Non-compliant or documentation flaws</p>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-emerald-600 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Citizen Charter Completion Rate</p>
            <p className="text-2xl font-bold font-display text-emerald-700 mt-0.5">{completionRate}%</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Resolved within statutory charter SLA</p>
          </div>
        </div>

        <div className="card p-4 border-l-4 border-l-cyan-600 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Scheduled Lab Tests Active</p>
            <p className="text-2xl font-bold font-display text-cyan-800 mt-0.5">{stats?.todayAppointments || 0}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Appointments across NABL/GATC centres</p>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-blue-900" /> Statutory Pipeline Distribution
            </h2>
            <span className="text-[11px] text-slate-500">By Lifecycle Stage</span>
          </div>
          <div className="p-4">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {statusData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state py-12">No pipeline telemetry available</div>
            )}
          </div>
        </div>

        {/* Instrument Type Distribution */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale size={16} className="text-indigo-800" /> Equipment Category Volume
            </h2>
            <span className="text-[11px] text-slate-500">By Instrument Classification</span>
          </div>
          <div className="p-4">
            {instrumentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={instrumentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state py-12">No equipment telemetry available</div>
            )}
          </div>
        </div>

        {/* District-wise Workload */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 size={16} className="text-amber-800" /> District Geographical Throughput
            </h2>
            <span className="text-[11px] text-slate-500">Jurisdictional Workload</span>
          </div>
          <div className="p-4">
            {districtData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={districtData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#d97706" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state py-12">No geographical data available</div>
            )}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <BarChart3 size={16} className="text-emerald-800" /> Historical Application Trajectory
            </h2>
            <span className="text-[11px] text-slate-500">Monthly Volume</span>
          </div>
          <div className="p-4">
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state py-12">No trend telemetry available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
