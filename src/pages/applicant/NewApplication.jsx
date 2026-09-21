import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { FileText, ArrowLeft, Send, CheckCircle2, CreditCard, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewApplication() {
  const navigate = useNavigate();
  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState('');
  const [appType, setAppType] = useState('verification');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [appId, setAppId] = useState(null);

  useEffect(() => {
    api.getInstruments().then(setInstruments).catch(() => {});
  }, []);

  const selectedInst = instruments.find(i => i.id === selectedInstrument);

  const handleCreate = async () => {
    if (!selectedInstrument) {
      toast.error('Please select an instrument to verify');
      return;
    }
    setLoading(true);
    try {
      const app = await api.createApplication({
        instrument_id: selectedInstrument,
        application_type: appType
      });
      setAppId(app.id);
      setStep(2);
      toast.success(`Application ${app.application_id} drafted`);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await api.submitApplication(appId);
      toast.success('Application formally submitted to Legal Metrology Department!');
      setStep(3);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      await api.payApplication(appId);
      toast.success('Statutory fee confirmed (Demonstration BharatKosh)');
      navigate(`/applicant/applications/${appId}`);
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Applications Roster
      </button>

      {/* Stepper Header */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 mb-8">
        {[
          { num: 1, title: 'Instrument Selection' },
          { num: 2, title: 'Review Dossier' },
          { num: 3, title: 'Statutory Fee' }
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all ${
                step > i + 1
                  ? 'bg-emerald-700 text-white'
                  : step === i + 1
                  ? 'bg-blue-900 text-white ring-2 ring-blue-300'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step > i + 1 ? '✓' : s.num}
            </div>
            <span
              className={`text-xs font-semibold hidden sm:inline ${
                step === i + 1 ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              {s.title}
            </span>
            {i < 2 && <div className={`w-8 sm:w-12 h-0.5 ${step > i + 1 ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* Main Content Card */}
      <div className="card shadow-sm border-t-4 border-t-[#002b5b] overflow-hidden">
        {step === 1 && (
          <>
            <div className="p-6 border-b border-slate-100">
              <h1 className="text-xl font-bold font-display text-slate-900">
                New Verification Filing
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Stage 1: Choose application category and designate instrument under test
              </p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="form-label">Application Filing Category</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { value: 'verification', label: 'Initial Verification', desc: 'New instrument deployment' },
                    { value: 'reverification', label: 'Periodic Re-verification', desc: 'Mandatory annual cycle' },
                    { value: 'renewal', label: 'Certificate Renewal', desc: 'Prior to expiration' },
                  ].map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setAppType(t.value)}
                      className={`p-3 rounded-lg text-left border transition-all ${
                        appType === t.value
                          ? 'border-blue-900 bg-blue-50/60 ring-1 ring-blue-900'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900 block">{t.label}</span>
                      <span className="text-[11px] text-slate-500 block mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="form-label">Designate Measuring Instrument</label>
                {instruments.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-xs text-slate-500">
                    No instruments currently registered. Please register an instrument first before initiating verification.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {instruments.map(inst => (
                      <label
                        key={inst.id}
                        className={`flex items-center gap-3.5 p-3.5 rounded-lg border cursor-pointer transition-all ${
                          selectedInstrument === inst.id
                            ? 'border-blue-900 bg-blue-50/50 ring-1 ring-blue-900'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="instrument"
                          value={inst.id}
                          checked={selectedInstrument === inst.id}
                          onChange={() => setSelectedInstrument(inst.id)}
                          className="accent-blue-900"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 text-xs">{inst.instrument_type}</span>
                            <span className="font-mono text-[11px] text-blue-900 font-semibold">{inst.instrument_id}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Make: {inst.manufacturer || 'Standard'} • Capacity: {inst.capacity || 'Standard'} • Class: {inst.accuracy_class || 'Class III'}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={!selectedInstrument || loading}
                  className="btn btn-primary text-xs font-semibold py-2 px-5 shadow-sm"
                >
                  {loading ? 'Creating Dossier...' : 'Proceed to Review →'}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="p-6 border-b border-slate-100">
              <h1 className="text-xl font-bold font-display text-slate-900">
                Stage 2: Review Application Dossier
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify asset parameters before formal transmission to Legal Metrology Officer
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Summary of Filing Particulars
                </h3>
                <dl className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <dt className="text-slate-500">Application Category:</dt>
                    <dd className="font-semibold text-slate-900 capitalize">{appType}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Instrument Category:</dt>
                    <dd className="font-semibold text-slate-900">{selectedInst?.instrument_type}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Manufacturer / Make:</dt>
                    <dd className="font-semibold text-slate-900">{selectedInst?.manufacturer || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Serial Identification:</dt>
                    <dd className="font-mono font-semibold text-slate-900">{selectedInst?.serial_number || '—'}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-900 flex items-start gap-2">
                <Shield size={16} className="text-blue-800 shrink-0 mt-0.5" />
                <div>
                  <strong>Statutory Declaration:</strong> The applicant confirms that the declared weighing/measuring equipment conforms to Legal Metrology General Rules, 2011 and is presented for authorized testing.
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-outline text-xs"
                >
                  ← Edit Selection
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="btn btn-primary text-xs font-semibold py-2 px-5 shadow-sm"
                >
                  <Send size={14} /> {loading ? 'Submitting...' : 'Formally Submit Application'}
                </button>
              </div>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="p-6 border-b border-slate-100">
              <h1 className="text-xl font-bold font-display text-slate-900">
                Stage 3: Statutory Inspection Fee
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Settle official assessment fee as prescribed under Schedule IX of Legal Metrology Rules
              </p>
            </div>

            <div className="p-6 space-y-6 text-center">
              <div className="max-w-sm mx-auto p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <CreditCard size={32} className="mx-auto text-blue-900 mb-2" />
                <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider">
                  Assessment Inspection Fee
                </span>
                <p className="text-3xl font-bold font-display text-slate-900 mt-1">
                  ₹{({
                    'Electronic Weighing Machine': 500,
                    'Platform Scale': 750,
                    'Counter Scale': 400,
                    'Weighbridge': 2500,
                    'Fuel Dispenser': 1500,
                    'Water Meter': 300,
                    'Capacity Measure': 350
                  }[selectedInst?.instrument_type]) || 500}
                </p>
                <span className="inline-block mt-2 text-[10px] uppercase font-semibold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded">
                  Demonstration BharatKosh Gateway
                </span>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => navigate('/applicant/applications')}
                  className="btn btn-outline text-xs"
                >
                  Pay Later via Dashboard
                </button>
                <button
                  type="button"
                  onClick={handlePay}
                  disabled={loading}
                  className="btn btn-success text-xs font-semibold py-2 px-6 shadow-sm"
                >
                  {loading ? 'Confirming...' : 'Settle Statutory Fee (Demo) →'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
