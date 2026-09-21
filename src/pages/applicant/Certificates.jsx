import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Award, QrCode, Search, CheckCircle2, XCircle, AlertTriangle, Scale, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ApplicantCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getCertificates()
      .then(setCerts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = certs.filter(c =>
    (c.certificate_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.instrument_type || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.inst_code || '').toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (cert) => {
    const isExpired = new Date(cert.expiry_date) < new Date();
    if (isExpired || cert.status === 'expired') {
      return { label: 'Expired', cls: 'bg-rose-50 text-rose-800 border-rose-200' };
    }
    if (cert.status === 'revoked') {
      return { label: 'Revoked', cls: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
    const daysLeft = Math.ceil((new Date(cert.expiry_date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysLeft <= 30) {
      return { label: `Expiring in ${daysLeft}d`, cls: 'bg-amber-50 text-amber-800 border-amber-200' };
    }
    return { label: 'Active & Verified', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading verification certificates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900 tracking-tight">Digital Verification Certificates</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active digital certificates with cryptographic QR code validation: <strong className="text-slate-700">{certs.length}</strong>
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="form-input pl-9 text-xs"
          placeholder="Search by certificate number, instrument type, or ID..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card empty-state">
          <Award size={40} className="mx-auto mb-2 opacity-30 text-slate-500" />
          <p className="text-slate-700 font-medium">No certificates found</p>
          <p className="text-xs text-slate-400 mt-1">
            Certificates are issued automatically once verification tests are approved by the Legal Metrology Officer.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {filtered.map(cert => {
            const status = getStatusBadge(cert);
            return (
              <div key={cert.id} className="card shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between">
                {/* Certificate Header Strip */}
                <div className="bg-[#002b5b] text-white p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Award size={20} className="text-amber-300" />
                      <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider">
                        Govt of India • Legal Metrology
                      </span>
                    </div>
                    <span className={`status-badge text-[10px] border ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-base font-bold font-mono text-white mt-2 tracking-wide">{cert.certificate_number}</p>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center shrink-0">
                      <Scale size={18} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{cert.instrument_type}</h3>
                      <p className="text-xs font-mono text-slate-500">{cert.inst_code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verification Date</span>
                      <p className="font-semibold text-slate-800 font-mono mt-0.5">{cert.issue_date}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Valid Upto</span>
                      <p className="font-semibold text-slate-800 font-mono mt-0.5">{cert.expiry_date}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      to={`/verify?cert=${cert.certificate_number}`}
                      target="_blank"
                      className="btn btn-outline w-full text-xs font-semibold text-blue-900 hover:bg-blue-50/50 flex items-center justify-center gap-1.5"
                    >
                      <QrCode size={15} /> Verify Public QR Code <ExternalLink size={13} className="opacity-60" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
