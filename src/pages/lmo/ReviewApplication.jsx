import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../lib/api';
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, Calendar, Award,
  FileText, Scale, Send, Building, ShieldCheck, QrCode
} from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function LMOReviewApplication() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gatcCentres, setGatcCentres] = useState([]);
  const [reviewAction, setReviewAction] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedGatc, setSelectedGatc] = useState('');
  const [apptDate, setApptDate] = useState('');
  const [apptTime, setApptTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    Promise.all([api.getApplication(id), api.getGATCCentres()])
      .then(([a, g]) => {
        setApp(a);
        setGatcCentres(g);
      })
      .catch(() => toast.error('Failed to load application dossier'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReview = async () => {
    setActionLoading(true);
    try {
      await api.reviewApplication(id, {
        action: reviewAction,
        remarks,
        assigned_gatc_id: selectedGatc || undefined
      });
      toast.success(
        `Application ${
          reviewAction === 'approve' ? 'approved for verification' :
          reviewAction === 'reject' ? 'rejected' : 'updated'
        }!`
      );
      const updated = await api.getApplication(id);
      setApp(updated);
      setReviewAction('');
    } catch (err) {
      toast.error(err.message);
    }
    setActionLoading(false);
  };

  const handleSchedule = async () => {
    if (!apptDate || !apptTime) {
      toast.error('Select appointment date and time slot');
      return;
    }
    setActionLoading(true);
    try {
      await api.scheduleVerification(id, {
        appointment_date: apptDate,
        time_slot: apptTime,
        gatc_id: selectedGatc || app.assigned_gatc_id
      });
      toast.success('Verification appointment booked successfully!');
      const updated = await api.getApplication(id);
      setApp(updated);
    } catch (err) {
      toast.error(err.message);
    }
    setActionLoading(false);
  };

  const handleIssueCert = async () => {
    setActionLoading(true);
    try {
      const result = await api.issueCertificate(id);
      toast.success(`Verification Certificate ${result.certificate_number} issued!`);
      const updated = await api.getApplication(id);
      setApp(updated);
    } catch (err) {
      toast.error(err.message);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-spinner" aria-busy="true">
        <span className="sr-only">Loading scrutiny dossier...</span>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="card empty-state my-8">
        <p className="font-semibold text-slate-800">Application record not found</p>
        <button onClick={() => navigate('/lmo/applications')} className="btn btn-outline text-xs mt-3">
          ← Return to Roster
        </button>
      </div>
    );
  }

  const canReview = ['submitted', 'under_scrutiny'].includes(app.status);
  const canSchedule = ['approved', 'scheduled'].includes(app.status) && !app.appointment;
  const canIssueCert = app.report && ['verification_in_progress'].includes(app.status) && !app.certificate;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Officer Roster
        </button>
      </div>

      {/* Header Card */}
      <div className="card p-6 shadow-sm border-t-4 border-t-[#002b5b]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-500">
                Official Scrutiny Dossier
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-sm font-bold text-blue-900">{app.application_id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-display text-slate-900">
              {app.applicant_name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Establishment: <strong className="text-slate-700">{app.applicant_org}</strong> •
              Jurisdiction District: <strong className="text-slate-700">{app.district || 'Central'}</strong>
            </p>
          </div>
          <span className={`status-badge border text-xs ${statusBadgeClasses[app.status] || 'bg-slate-100 text-slate-700'}`}>
            {app.status.replace(/_/g, ' ')}
          </span>
        </div>
      </div>

      {/* Two Column Technical Dossier */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Instrument Specifications */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Scale size={16} className="text-blue-900" /> Instrument Specifications
            </h2>
            <span className="font-mono text-xs text-slate-500">{app.inst_code}</span>
          </div>
          <div className="card-body">
            <dl className="divide-y divide-slate-100 text-xs">
              {[
                ['Category', app.instrument_type],
                ['Manufacturer', app.manufacturer],
                ['Model No', app.model_number],
                ['Serial No', app.serial_number],
                ['Capacity', app.capacity],
                ['Accuracy Class', app.accuracy_class],
                ['Premises Location', app.location_of_use],
              ].map(([l, v]) => (
                <div key={l} className="py-2 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">{l}</dt>
                  <dd className="font-semibold text-slate-900 font-mono text-right">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Commercial Applicant Details */}
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building size={16} className="text-emerald-800" /> Applicant Particulars
            </h2>
            <span className="text-xs text-slate-500">Verified Business</span>
          </div>
          <div className="card-body">
            <dl className="divide-y divide-slate-100 text-xs">
              {[
                ['Signatory Name', app.applicant_name],
                ['Organization', app.applicant_org],
                ['Email ID', app.applicant_email],
                ['Contact Mobile', app.applicant_phone],
                ['Registered Address', app.applicant_address],
              ].map(([l, v]) => (
                <div key={l} className="py-2 flex justify-between gap-4">
                  <dt className="text-slate-500 font-medium">{l}</dt>
                  <dd className="font-semibold text-slate-900 text-right">{v || '—'}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Uploaded Verification Documents */}
      {app.documents && app.documents.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <FileText size={16} className="text-blue-900" /> Submitted Documentation
            </h2>
            <span className="text-xs text-slate-500">{app.documents.length} Attachment(s)</span>
          </div>
          <div className="p-4 grid sm:grid-cols-2 gap-3">
            {app.documents.map(doc => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-blue-800" />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{doc.document_type}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{doc.file_name}</p>
                  </div>
                </div>
                <span className={`status-badge border text-[10px] ${
                  doc.status === 'verified' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  doc.status === 'rejected' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                  'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Scrutiny Review Actions Panel */}
      {canReview && (
        <div className="card border-2 border-blue-300 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
            <ShieldCheck size={18} className="text-blue-900" /> Officer Scrutiny Determination
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Evaluate submitted documents against statutory specifications under Legal Metrology Rules, 2011:
          </p>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2.5">
              {[
                { value: 'approve', label: 'Approve Application', color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
                { value: 'request_documents', label: 'Request Additional Documents', color: 'border-amber-300 bg-amber-50 text-amber-900' },
                { value: 'reject', label: 'Reject Application', color: 'border-rose-300 bg-rose-50 text-rose-900' },
              ].map(a => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setReviewAction(a.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    reviewAction === a.value ? a.color + ' ring-2 ring-blue-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>

            {reviewAction && (
              <div className="space-y-3 pt-2 animate-fade-in">
                <div>
                  <label className="form-label">Official Scrutiny Remarks *</label>
                  <textarea
                    value={remarks}
                    onChange={e => setRemarks(e.target.value)}
                    rows={3}
                    className="form-input text-xs"
                    placeholder="Enter formal statutory observations, checklist verification notes, or deficiency rationale..."
                  />
                </div>

                {reviewAction === 'approve' && (
                  <div>
                    <label className="form-label">Designate GATC Test Centre (Optional)</label>
                    <select
                      value={selectedGatc}
                      onChange={e => setSelectedGatc(e.target.value)}
                      className="form-input text-xs bg-white"
                    >
                      <option value="">Auto-Assign GATC Based on District Jurisdiction</option>
                      {gatcCentres.map(g => (
                        <option key={g.id} value={g.id}>{g.name} — {g.district}</option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReview}
                  disabled={actionLoading}
                  className="btn btn-primary text-xs font-semibold py-2 px-5 shadow-sm"
                >
                  <Send size={14} /> {actionLoading ? 'Recording Decision...' : 'Commit Scrutiny Decision'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Appointment Scheduling Panel */}
      {canSchedule && (
        <div className="card border-2 border-cyan-400 p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
            <Calendar size={18} className="text-cyan-800" /> Schedule GATC Laboratory Appointment
          </h2>
          <p className="text-xs text-slate-500 mb-4">
            Application is approved. Designate an authorized test facility and booking slot for physical instrument testing.
          </p>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Verification Date *</label>
              <input
                type="date"
                value={apptDate}
                onChange={e => setApptDate(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="form-label">Time Slot *</label>
              <select
                value={apptTime}
                onChange={e => setApptTime(e.target.value)}
                className="form-input text-xs bg-white"
              >
                <option value="">Select Time Slot</option>
                {[
                  '09:00 AM - 10:00 AM',
                  '10:00 AM - 11:00 AM',
                  '11:00 AM - 12:00 PM',
                  '02:00 PM - 03:00 PM',
                  '03:00 PM - 04:00 PM',
                ].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Designated Test Centre *</label>
              <select
                value={selectedGatc}
                onChange={e => setSelectedGatc(e.target.value)}
                className="form-input text-xs bg-white"
              >
                <option value="">Select GATC Centre</option>
                {gatcCentres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSchedule}
            disabled={actionLoading}
            className="btn bg-cyan-700 hover:bg-cyan-800 text-white text-xs font-semibold py-2 px-5 mt-4 shadow-sm"
          >
            <Calendar size={14} /> {actionLoading ? 'Confirming Slot...' : 'Confirm Appointment'}
          </button>
        </div>
      )}

      {/* Issue Certificate Action Panel */}
      {canIssueCert && (
        <div className="card border-2 border-emerald-500 bg-emerald-50/50 p-6 text-center shadow-sm">
          <Award size={36} className="text-emerald-800 mx-auto mb-2" />
          <h2 className="font-bold text-emerald-950 text-base mb-1">
            GATC Verification Report Cleared
          </h2>
          <p className="text-xs text-emerald-800 max-w-lg mx-auto mb-4">
            Instrument has successfully passed physical inspection and tolerance tests. You may now issue the statutory digital certificate with cryptographic QR code.
          </p>
          <button
            type="button"
            onClick={handleIssueCert}
            disabled={actionLoading}
            className="btn btn-success text-xs font-semibold px-6 py-2.5 shadow-sm mx-auto"
          >
            <Award size={16} /> {actionLoading ? 'Issuing Digital Certificate...' : 'Generate & Issue Certificate'}
          </button>
        </div>
      )}

      {/* Certificate Issued Banner */}
      {app.certificate && (
        <div className="card border-2 border-emerald-400 bg-gradient-to-r from-emerald-50/70 to-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
            <div className="flex items-center gap-3">
              <Award size={26} className="text-emerald-800" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                  Verification Certificate Active
                </span>
                <h3 className="font-bold text-slate-900 font-mono text-sm">{app.certificate.certificate_number}</h3>
              </div>
            </div>
            <Link
              to={`/verify?cert=${app.certificate.certificate_number}`}
              target="_blank"
              className="btn btn-success text-xs shadow-sm"
            >
              <QrCode size={14} /> Verify QR Code
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs mt-3">
            <div>
              <span className="text-slate-500 block">Issue Date:</span>
              <span className="font-bold text-slate-900 font-mono">{app.certificate.issue_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Valid Upto:</span>
              <span className="font-bold text-emerald-800 font-mono">{app.certificate.expiry_date}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Inspection Verdict:</span>
              <span className="font-bold uppercase text-slate-900">{app.certificate.verification_result}</span>
            </div>
          </div>
        </div>
      )}

      {/* Verification Checklist Results Inspection Table */}
      {app.checklistResults?.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-header">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-purple-800" /> GATC Testing Checklist Results
            </h2>
            <span className="text-xs text-slate-500">Standard Calibration Verified</span>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Test Parameter</th>
                  <th>Test Verdict</th>
                  <th>Observed Reading</th>
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
    </div>
  );
}
