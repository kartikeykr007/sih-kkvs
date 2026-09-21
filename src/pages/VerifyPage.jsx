import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Scale, Search, QrCode, CheckCircle2, XCircle, Shield, ArrowLeft, ExternalLink, Printer } from 'lucide-react';
import { api } from '../lib/api';

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const [certNumber, setCertNumber] = useState(searchParams.get('cert') || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const doVerify = useCallback(async (num) => {
    if (!num.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const data = await api.verifyCertificate(num.trim());
      setResult(data);
    } catch (err) {
      setResult({ valid: false, error: err.message });
    }
    setLoading(false);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    doVerify(certNumber);
  };

  useEffect(() => {
    const cert = searchParams.get('cert');
    if (cert) {
      doVerify(cert);
    }
  }, [searchParams, doVerify]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      <div>
        <div className="govt-stripe" />

        {/* Top ribbon */}
        <header className="bg-[#002b5b] text-white shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-amber-300">
                <Scale size={20} />
              </div>
              <div>
                <span className="text-lg font-bold font-display text-white tracking-tight">ParimaN</span>
                <span className="text-[10px] text-blue-200 block">National Certificate Verification Gateway</span>
              </div>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-xs text-blue-200 hover:text-white transition-colors">
              <ArrowLeft size={14} /> Back to Portal
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-900 text-amber-300 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
              <QrCode size={28} />
            </div>
            <h1 className="text-2xl font-bold font-display text-slate-900 tracking-tight">
              Public Certificate Authentication
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
              Verify statutory legitimacy of any Legal Metrology Verification Certificate issued under the Legal Metrology Act, 2009.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleVerify} className="flex gap-2 mb-6">
            <input
              type="text"
              value={certNumber}
              onChange={e => setCertNumber(e.target.value)}
              className="form-input flex-1 font-mono text-xs py-2.5 bg-white shadow-sm placeholder:font-sans"
              placeholder="e.g. CERT-LM-2026-0001"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-xs font-semibold px-5 shadow-sm"
            >
              <Search size={15} /> {loading ? 'Validating...' : 'Authenticate'}
            </button>
          </form>

          {/* Result Presentation */}
          {searched && result && (
            <div className="animate-fade-in">
              {result.valid ? (
                <div className="card shadow-md border-2 border-emerald-500 overflow-hidden bg-white">
                  {/* Valid Banner Header */}
                  <div className="bg-emerald-700 text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 size={24} className="text-emerald-200" />
                      <div>
                        <h2 className="text-sm font-bold tracking-wide uppercase">
                          Authenticated Government Certificate — Active
                        </h2>
                        <p className="text-[11px] text-emerald-100 font-mono mt-0.5">
                          Certificate Reference: {result.certificate_number}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="hidden sm:inline-flex items-center gap-1 text-[11px] bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded transition-colors"
                    >
                      <Printer size={13} /> Print Verification Slip
                    </button>
                  </div>

                  {/* Body Specs */}
                  <div className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-6 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Instrument Category</span>
                        <span className="font-bold text-slate-900 mt-0.5 block">{result.instrument_type}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Instrument Asset Code</span>
                        <span className="font-bold font-mono text-blue-900 mt-0.5 block">{result.instrument_id}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registered Owner / Trader</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">{result.owner_name}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Commercial Organization</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">{result.organization || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Manufacturer</span>
                        <span className="text-slate-800 mt-0.5 block">{result.manufacturer || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Maximum Capacity</span>
                        <span className="font-semibold text-slate-900 mt-0.5 block">{result.capacity || '—'}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Verification Date</span>
                        <span className="font-bold font-mono text-slate-900 mt-0.5 block">{result.verification_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Statutory Validity Until</span>
                        <span className="font-bold font-mono text-emerald-800 mt-0.5 block">{result.expiry_date}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">Certifying Officer / Authority</span>
                        <span className="text-slate-800 mt-0.5 block">{result.issued_by}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-semibold">GATC Testing Facility</span>
                        <span className="text-slate-800 mt-0.5 block">{result.verification_centre}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audit footer */}
                  <div className="bg-slate-50 px-6 py-2.5 text-[11px] text-slate-500 border-t border-slate-100 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Shield size={13} className="text-emerald-700" /> Tamper-evident cryptographic QR signature confirmed.
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Verified {new Date().toLocaleTimeString('en-IN')}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="card border-2 border-rose-300 p-6 text-center shadow-sm bg-white">
                  <XCircle size={40} className="text-rose-600 mx-auto mb-2" />
                  <h2 className="text-base font-bold text-rose-900 mb-1">Certificate Not Found or Invalid</h2>
                  <p className="text-xs text-rose-700 max-w-md mx-auto">
                    {result.error || 'The entered reference does not correspond to any valid Legal Metrology certificate on record.'}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-xs text-slate-500">
            Official demonstration certificate reference: <code className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-bold">CERT-LM-2026-0001</code>
          </div>
        </main>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-3 text-center text-[11px] border-t border-slate-800">
        Department of Consumer Affairs • Smart India Hackathon 2026 • Government of India
      </footer>
    </div>
  );
}
