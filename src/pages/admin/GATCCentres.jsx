import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Building2, MapPin, Phone, Mail, CheckCircle2, XCircle, Layers, Calendar, Activity } from 'lucide-react';

export default function AdminGATCCentres() {
  const [centres, setCentres] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGATCCentresAdmin()
      .then(setCentres)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading accredited test centres directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">
            Accredited Testing & Calibration Laboratories (GATC)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Government Approved Test Centres authorized for statutory verification under Section 24: <strong className="text-slate-700">{centres.length}</strong> facilities
          </p>
        </div>
      </div>

      {/* Grid of Centre Cards */}
      <div className="grid md:grid-cols-2 gap-5">
        {centres.map(centre => {
          let types = [];
          try {
            types = JSON.parse(centre.instrument_types || '[]');
          } catch {}

          return (
            <div
              key={centre.id}
              className={`card p-6 shadow-sm border ${centre.is_active ? 'border-slate-200' : 'border-rose-200 opacity-75'}`}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center text-amber-800 shrink-0">
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{centre.name}</h3>
                    <p className="text-[11px] text-blue-900 font-mono font-bold mt-0.5">{centre.code}</p>
                  </div>
                </div>
                <span className={`status-badge border text-[10px] ${
                  centre.is_active
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  {centre.is_active ? 'NABL Active' : 'De-accredited'}
                </span>
              </div>

              <div className="space-y-2 text-xs text-slate-600 mb-4 divide-y divide-slate-50">
                <div className="flex items-start gap-2 pt-1">
                  <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>{centre.address}</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Building2 size={14} className="text-slate-400 shrink-0" />
                  <span>{centre.district}, {centre.state}</span>
                </div>
                {centre.contact_person && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Nodal Officer:</span>
                    <span className="font-semibold text-slate-800">{centre.contact_person}</span>
                  </div>
                )}
                {centre.contact_phone && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Phone:</span>
                    <span className="font-mono text-slate-800">{centre.contact_phone}</span>
                  </div>
                )}
                {centre.contact_email && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500">Official Email:</span>
                    <span className="font-mono text-slate-800">{centre.contact_email}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Daily Testing Calibration Throughput:</span>
                  <span className="font-bold text-slate-900 font-mono">{centre.max_daily_slots} slots / day</span>
                </div>

                {types.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                      <Layers size={12} /> Accredited Instrument Classes:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {types.map(t => (
                        <span
                          key={t}
                          className="bg-slate-100 text-slate-700 text-[10px] font-medium px-2 py-0.5 rounded border border-slate-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {centre.total_applications !== undefined && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Cumulative Verifications Performed:</span>
                    <span className="font-mono font-bold text-blue-900">{centre.total_applications}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
