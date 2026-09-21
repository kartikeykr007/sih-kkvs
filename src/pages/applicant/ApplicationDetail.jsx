import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  ArrowLeft, FileText, Scale, Calendar, CheckCircle2, XCircle,
  Clock, CreditCard, Award, QrCode, Shield, MapPin, Building, Phone, Mail, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const timelineSteps = [
  { key: 'submitted', label: '1. Submission', desc: 'Application Filed' },
  { key: 'under_scrutiny', label: '2. Scrutiny', desc: 'LMO Document Check' },
  { key: 'approved', label: '3. Approved', desc: 'LMO Approval' },
  { key: 'scheduled', label: '4. Scheduled', desc: 'Appointment Fixed' },
  { key: 'verification_in_progress', label: '5. Testing', desc: 'GATC Verification' },
  { key: 'certificate_issued', label: '6. Certified', desc: 'QR Certificate Active' },
];

const statusOrder = [
  'draft', 'submitted', 'under_scrutiny', 'documents_required',
  'fee_pending', 'approved', 'scheduled', 'verification_in_progress', 'certificate_issued'
];

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

export default function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getApplication(id)
      .then(setApp)
      .catch(() => toast.error('Failed to load application dossier'))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async () => {
    try {
      await api.payApplication(id);
      toast.success('Statutory fee payment verified (DEMO Transaction)');
      const updated = await api.getApplication(id);
      setApp(updated);
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading application details...</span>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="card empty-state my-8">
        <p className="font-semibold text-slate-800">Application dossier not found</p>
        <button onClick={() => navigate('/applicant/applications')} className="btn btn-outline text-xs mt-3">
          ← Return to Applications List
        </button>
      </div>
    );
  }

  const currentStepIdx = statusOrder.indexOf(app.status);
  const isRejected = app.status === 'rejected';

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Back link */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Application Roster
        </button>
      </div>

      {/* Header Banner */}
      <div className="card p-6 shadow-sm border-t-4 border-t-[#002b5b]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-xs uppercase font-mono tracking-wider text-slate-500 font-semibold">Government Dossier</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-sm font-bold text-blue-900">{app.application_id}</span>
              <span className={`status-badge border ${statusBadgeClasses[app.status] || 'bg-slate-100 text-slate-700'}`}>
                {app.status.replace(/_/g, ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              {app.instrument_type} Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Asset Code: <span className="font-mono font-medium text-slate-700">{app.inst_code}</span> •
              Filing Mode: <span className="capitalize font-medium text-slate-700">{app.application_type}</span> •
              Submitted: <span className="font-medium text-slate-700">{app.submitted_at ? new Date(app.submitted_at).toLocaleDateString('en-IN') : '—'}</span>
            </p>
          </div>

          {app.certificate && (
            <Link
              to={`/verify?cert=${app.certificate.certificate_number}`}
              target="_blank"
              className="btn btn-success text-xs self-start md:self-auto shadow-sm"
            >
              <QrCode size={16} /> View Digital Certificate
            </Link>
          )}
        </div>

        {/* ─── Application Progress Timeline ─── */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">
            Statutory Processing Timeline
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {timelineSteps.map((step, idx) => {
              const stepIdx = statusOrder.indexOf(step.key);
              const isCompleted = currentStepIdx >= stepIdx && !isRejected;
              const isCurrent = app.status === step.key;

              let nodeClass = 'border-slate-200 bg-slate-50 text-slate-400';
              let badgeText = 'Upcoming';
              let badgeClass = 'text-slate-400 bg-slate-100';

              if (isRejected) {
                nodeClass = 'border-rose-200 bg-rose-50 text-rose-600';
                badgeText = 'Halted';
                badgeClass = 'text-rose-700 bg-rose-100';
              } else if (isCompleted && !isCurrent) {
                nodeClass = 'border-emerald-300 bg-emerald-50 text-emerald-800';
                badgeText = 'Completed';
                badgeClass = 'text-emerald-700 bg-emerald-100';
              } else if (isCurrent) {
                nodeClass = 'border-blue-500 bg-blue-50 text-blue-900 ring-2 ring-blue-500/20';
                badgeText = 'In Progress';
                badgeClass = 'text-blue-800 bg-blue-200 font-bold';
              }

              return (
                <div
                  key={step.key}
                  className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${nodeClass}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider font-mono">{step.label}</span>
                      {isCompleted && !isCurrent && <Check size={13} className="text-emerald-700 shrink-0" />}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{step.desc}</p>
                  </div>
                  <div className="mt-2.5">
                    <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-medium ${badgeClass}`}>
                      {badgeText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rejection Notice Banner */}
      {app.status === 'rejected' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <XCircle size={20} className="text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-rose-900 text-sm">Application Rejected by Legal Metrology Officer</h3>
            <p className="text-xs text-rose-800 mt-1">
              <strong>Grounds for Rejection:</strong> {app.rejection_reason || 'Discrepancy in documentation or failed statutory tolerances.'}
            </p>
            <p className="text-[11px] text-rose-700 mt-1">
              You may address the specified deficiencies and re-apply through the applicant portal.
            </p>
          </div>
        </div>
      )}

      {/* Fee Settlement Prompt */}
      {app.payment && app.payment.status === 'pending' && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
              <CreditCard size={20} />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Statutory Inspection Fee Pending</h3>
              <p className="text-xs text-amber-800">
                Statutory Assessment Amount: <strong className="text-slate-900 font-mono">₹{app.payment.amount}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={handlePay}
            className="btn bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs px-4 py-2 shadow-sm"
          >
            Settle Fee Online (Demo BharatKosh)
          </button>
        </div>
      )}

      {/* Detailed Technical Dossier: Instrument & Applicant */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Instrument Dossier */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale size={16} className="text-blue-900" /> Instrument Technical Record
            </h2>
            <span className="font-mono text-xs text-slate-500">{app.inst_code}</span>
          </div>
          <div className="card-body">
            <dl className="divide-y divide-slate-100 text-xs">
              {[
                ['Instrument Category', app.instrument_type],
                ['Manufacturer', app.manufacturer],
                ['Model Number', app.model_number],
                ['Serial Number', app.serial_number],
                ['Maximum Capacity', app.capacity],
                ['Accuracy Class', app.accuracy_class],
                ['Location of Commercial Use', app.location_of_use],
              ].map(([label, val]) => (
                <div key={label} className="py-2 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">{label}</dt>
                  <dd className="font-semibold text-slate-900 text-right font-mono">{val || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Applicant Details */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building size={16} className="text-emerald-800" /> Commercial Entity Record
            </h2>
            <span className="text-xs text-slate-500">Aadhaar/PAN Linked</span>
          </div>
          <div className="card-body">
            <dl className="divide-y divide-slate-100 text-xs">
              {[
                ['Authorized Signatory', app.applicant_name],
                ['Organization / Trade Name', app.applicant_org],
                ['Official Email ID', app.applicant_email],
                ['Contact Mobile', app.applicant_phone],
                ['Jurisdiction District', app.district],
                ['Registered Premises Address', app.applicant_address],
              ].map(([label, val]) => (
                <div key={label} className="py-2 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">{label}</dt>
                  <dd className="font-semibold text-slate-900 text-right">{val || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Appointment & GATC Details */}
      {app.appointment && (
        <div className="card shadow-sm border-l-4 border-l-cyan-600">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-cyan-700" /> GATC Appointment Schedule
            </h2>
            <span className="status-badge bg-cyan-50 text-cyan-800 border border-cyan-200 capitalize">
              {app.appointment.status}
            </span>
          </div>
          <div className="card-body grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-1">Scheduled Date:</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{app.appointment.appointment_date}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-1">Time Window:</span>
              <span className="font-bold text-slate-900 text-sm font-mono">{app.appointment.time_slot}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="text-slate-500 block mb-1">Test Center:</span>
              <span className="font-bold text-slate-900 text-sm">{app.gatc_name || 'Designated GATC Laboratory'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Checklist Results */}
      {app.checklistResults && app.checklistResults.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-purple-800" /> Statutory Verification Test Results
            </h2>
            <span className="text-xs text-slate-500">Legal Metrology General Rules, 2011</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Inspection Parameter</th>
                  <th>Test Verdict</th>
                  <th>Measured Calibration</th>
                  <th>Permissible Standard</th>
                </tr>
              </thead>
              <tbody>
                {app.checklistResults.map((item, i) => (
                  <tr key={i}>
                    <td className="font-medium text-slate-800">{item.checklist_item}</td>
                    <td>
                      <span className={`status-badge border ${
                        item.result === 'pass' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        item.result === 'fail' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                        'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {item.result}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-slate-700">{item.measured_value || '—'}</td>
                    <td className="font-mono text-xs text-slate-500">{item.expected_value || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Certificate Certificate Card */}
      {app.certificate && (
        <div className="card border-2 border-emerald-500 bg-gradient-to-r from-emerald-50/50 to-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                <Award size={24} />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Government Verification Certificate
                </span>
                <h3 className="font-bold text-slate-900 text-lg font-display">
                  Certificate of Verification Granted
                </h3>
                <p className="font-mono text-xs font-bold text-emerald-900">{app.certificate.certificate_number}</p>
              </div>
            </div>

            <Link
              to={`/verify?cert=${app.certificate.certificate_number}`}
              target="_blank"
              className="btn btn-success text-xs font-semibold self-start sm:self-auto shadow-sm"
            >
              <QrCode size={15} /> Verify Public QR Code
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block">Date of Verification:</span>
              <span className="font-bold text-slate-900 font-mono">{app.certificate.issue_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Valid Until:</span>
              <span className="font-bold text-emerald-800 font-mono">{app.certificate.expiry_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Certification Status:</span>
              <span className="font-bold uppercase text-emerald-700">{app.certificate.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Verification Finding:</span>
              <span className="font-bold uppercase text-slate-900">{app.certificate.verification_result}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
