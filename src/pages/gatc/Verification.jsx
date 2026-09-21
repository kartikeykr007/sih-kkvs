import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  ArrowLeft, ClipboardCheck, Send, Scale, CheckCircle2,
  XCircle, Minus, CheckCheck, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

const defaultChecklist = [
  { checklist_item: 'Physical Condition & Housing Integrity', expected_value: 'Good / Undamaged' },
  { checklist_item: 'Manufacturer Specification Plate', expected_value: 'Present & Legible' },
  { checklist_item: 'Model Approval Number Verification', expected_value: 'Matches Govt Gazette' },
  { checklist_item: 'Serial Number Stamp Alignment', expected_value: 'Matches Application' },
  { checklist_item: 'Zero Setting & Tare Function', expected_value: '0.000 ± 0.25e' },
  { checklist_item: 'Accuracy Test at 1/3 Maximum Capacity', expected_value: 'Within MPE Tolerance' },
  { checklist_item: 'Accuracy Test at 2/3 Maximum Capacity', expected_value: 'Within MPE Tolerance' },
  { checklist_item: 'Accuracy Test at Maximum Capacity', expected_value: 'Within MPE Tolerance' },
  { checklist_item: 'Minimum Capacity Sensitivity Test', expected_value: '≥ 20e' },
  { checklist_item: 'Digital Display & Indicator Clarity', expected_value: 'Functional & Unobscured' },
  { checklist_item: 'Repeatability Test (3 runs)', expected_value: '≤ Permissible MPE' },
  { checklist_item: 'Lead / Holographic Seal Integrity', expected_value: 'Intact / Unbroken' },
  { checklist_item: 'Calibration Weights Verification', expected_value: 'Standard Working Standards' },
  { checklist_item: 'Electronic Tampering Safeguards', expected_value: 'No Manipulation Found' },
];

export default function GATCVerification() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checklist, setChecklist] = useState(
    defaultChecklist.map(c => ({ ...c, result: '', measured_value: '', remarks: '' }))
  );
  const [overallResult, setOverallResult] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.getApplication(id)
      .then(setApp)
      .catch(() => toast.error('Failed to load application'))
      .finally(() => setLoading(false));
  }, [id]);

  const updateChecklist = (idx, field, value) => {
    setChecklist(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleQuickFillPass = () => {
    setChecklist(prev => prev.map(c => ({
      ...c,
      result: 'pass',
      measured_value: c.measured_value || 'Conforms',
      remarks: c.remarks || 'Standard verified'
    })));
    setOverallResult('pass');
    setRemarks('All physical inspections and tolerance tests meet Legal Metrology General Rules, 2011 criteria.');
    toast.success('Checklist pre-filled with compliant calibration readings');
  };

  const handleSubmit = async () => {
    const incomplete = checklist.filter(c => !c.result);
    if (incomplete.length > 0) {
      toast.error(`${incomplete.length} test parameters have not been evaluated.`);
      return;
    }
    if (!overallResult) {
      toast.error('Please declare the overall verification verdict.');
      return;
    }

    setSubmitting(true);
    try {
      await api.submitVerification(id, {
        overall_result: overallResult,
        remarks,
        officer_remarks: remarks,
        checklist
      });
      toast.success('Laboratory test report officially filed!');
      navigate('/gatc');
    } catch (err) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading calibration bench...</span>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="card empty-state my-8">
        <p className="font-semibold text-slate-800">Application not found</p>
        <button onClick={() => navigate('/gatc')} className="btn btn-outline text-xs mt-3">
          ← Return to Laboratory Queue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Testing Workbench
        </button>
      </div>

      {/* Header Banner */}
      <div className="card p-6 shadow-sm border-t-4 border-t-[#002b5b]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 font-bold">
                Calibration Laboratory Test Protocol
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-sm font-bold text-blue-900">{app.application_id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              {app.instrument_type} Verification Test
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Commercial User: <strong className="text-slate-700">{app.applicant_name} ({app.applicant_org})</strong> •
              Serial No: <span className="font-mono font-bold text-slate-800">{app.serial_number || app.inst_code}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleQuickFillPass}
            className="btn btn-outline text-xs text-emerald-800 border-emerald-300 hover:bg-emerald-50 self-start sm:self-auto shadow-sm flex items-center gap-1.5"
          >
            <CheckCheck size={15} className="text-emerald-700" /> Pre-fill Compliant Standard (Demo)
          </button>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="card shadow-sm">
        <div className="card-header">
          <div>
            <h2 className="font-bold text-slate-900 text-sm">Standard Verification Protocol Checklist</h2>
            <p className="text-xs text-slate-500">Record measured parameters and determine conformance</p>
          </div>
          <span className="text-xs font-mono text-slate-500">14 Parameters</span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-[30%]">Inspection Parameter</th>
                <th className="w-[18%]">Statutory Standard</th>
                <th className="w-[18%]">Observed Reading</th>
                <th className="w-[18%] text-center">Verdict</th>
                <th className="w-[16%]">Inspector Notes</th>
              </tr>
            </thead>
            <tbody>
              {checklist.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="font-medium text-slate-900 text-xs">{item.checklist_item}</span>
                  </td>
                  <td>
                    <span className="text-xs text-slate-500 font-mono">{item.expected_value}</span>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.measured_value}
                      onChange={e => updateChecklist(idx, 'measured_value', e.target.value)}
                      className="form-input text-xs py-1 px-2 font-mono"
                      placeholder="e.g. 0.000g"
                    />
                  </td>
                  <td>
                    <div className="flex justify-center items-center gap-1.5">
                      {[
                        { val: 'pass', label: 'PASS', active: 'bg-emerald-700 text-white border-emerald-700', inactive: 'bg-white text-emerald-700 border-emerald-300 hover:bg-emerald-50' },
                        { val: 'fail', label: 'FAIL', active: 'bg-rose-700 text-white border-rose-700', inactive: 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50' },
                        { val: 'na', label: 'N/A', active: 'bg-slate-700 text-white border-slate-700', inactive: 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          type="button"
                          onClick={() => updateChecklist(idx, 'result', opt.val)}
                          className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${
                            item.result === opt.val ? opt.active : opt.inactive
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      value={item.remarks}
                      onChange={e => updateChecklist(idx, 'remarks', e.target.value)}
                      className="form-input text-xs py-1 px-2"
                      placeholder="Optional"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overall Assessment Verdict */}
      <div className="card p-6 shadow-sm border-2 border-slate-200">
        <h2 className="font-bold text-slate-900 text-sm mb-2">Final Laboratory Verdict</h2>
        <p className="text-xs text-slate-500 mb-4">
          Determine overall statutory conformity of the instrument for commercial stamping:
        </p>

        <div className="flex flex-wrap gap-3 mb-4">
          {[
            { value: 'pass', label: 'PASS — Instrument Conforms to Statutory Tolerances', active: 'bg-emerald-50 border-emerald-400 text-emerald-900 ring-2 ring-emerald-500' },
            { value: 'fail', label: 'FAIL — Instrument Non-Compliant / Rejected', active: 'bg-rose-50 border-rose-400 text-rose-900 ring-2 ring-rose-500' },
            { value: 'conditional', label: 'CONDITIONAL — Rectification Required', active: 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-500' },
          ].map(r => (
            <button
              key={r.value}
              type="button"
              onClick={() => setOverallResult(r.value)}
              className={`px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                overallResult === r.value ? r.active : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <div>
          <label className="form-label">Calibration Bench Observations & Remarks</label>
          <textarea
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            className="form-input text-xs"
            placeholder="Document standard weights used, environmental temperature/humidity conditions, and seal numbers applied..."
          />
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn btn-primary text-xs font-semibold py-2.5 px-6 shadow-sm"
          >
            <Send size={15} /> {submitting ? 'Transmitting Report...' : 'Submit Official Laboratory Report'}
          </button>
        </div>
      </div>
    </div>
  );
}
