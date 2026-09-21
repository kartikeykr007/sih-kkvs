import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api';
import { Scale, Plus, Search, Calendar, Tag, ShieldCheck } from 'lucide-react';

export default function ApplicantInstruments() {
  const [instruments, setInstruments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getInstruments()
      .then(setInstruments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = instruments.filter(i =>
    (i.instrument_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.instrument_id || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.manufacturer || '').toLowerCase().includes(search.toLowerCase()) ||
    (i.serial_number || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading instruments repository...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">Registered Instruments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered commercial measuring instruments: <strong className="text-slate-700">{instruments.length}</strong> units
          </p>
        </div>
        <Link to="/applicant/instruments/new" className="btn btn-primary text-xs self-start sm:self-auto">
          <Plus size={15} /> Register New Instrument
        </Link>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input pl-9 text-xs"
          placeholder="Filter by instrument category, ID, manufacturer, or serial number..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <Scale size={40} className="mx-auto mb-2 opacity-30 text-slate-500" />
          <p className="text-slate-700 font-medium">No registered instruments found</p>
          <p className="text-xs text-slate-400 mt-1 mb-4">Register your weighing or measuring device to enable verification applications.</p>
          <Link to="/applicant/instruments/new" className="btn btn-primary text-xs">
            <Plus size={14} /> Register Instrument
          </Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(inst => {
            const isDue = inst.next_due_date && new Date(inst.next_due_date) < new Date();
            return (
              <div key={inst.id} className="card p-5 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                      <Scale size={20} />
                    </div>
                    <span className={`status-badge border ${
                      inst.status === 'active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {inst.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{inst.instrument_type}</h3>
                  <p className="text-xs font-mono font-semibold text-blue-900 mt-0.5">{inst.instrument_id}</p>

                  <div className="mt-4 space-y-1.5 text-xs">
                    {inst.manufacturer && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Manufacturer:</span>
                        <span className="font-medium text-slate-800">{inst.manufacturer}</span>
                      </div>
                    )}
                    {inst.serial_number && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Serial No:</span>
                        <span className="font-mono text-slate-800">{inst.serial_number}</span>
                      </div>
                    )}
                    {inst.capacity && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Capacity:</span>
                        <span className="font-medium text-slate-800">{inst.capacity}</span>
                      </div>
                    )}
                    {inst.accuracy_class && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Accuracy Class:</span>
                        <span className="font-mono font-semibold text-slate-800">{inst.accuracy_class}</span>
                      </div>
                    )}
                  </div>
                </div>

                {inst.next_due_date && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar size={13} /> Re-verification Due:
                    </span>
                    <span className={`font-mono font-bold ${isDue ? 'text-rose-700' : 'text-slate-800'}`}>
                      {new Date(inst.next_due_date).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
