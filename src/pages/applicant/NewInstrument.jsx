import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';
import { Scale, Save, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const instrumentTypes = [
  'Electronic Weighing Machine', 'Platform Scale', 'Counter Scale', 'Weighbridge',
  'Spring Balance', 'Beam Scale', 'Fuel Dispenser', 'Water Meter',
  'LPG Cylinder Valve', 'Capacity Measure', 'Length Measure', 'Tape Measure'
];

const categories = ['weighing', 'measuring', 'volume', 'length'];
const accuracyClasses = ['Class I (Special)', 'Class II (High)', 'Class III (Medium)', 'Class IIII (Ordinary)'];
const purposes = [
  'Retail Trade', 'Wholesale Trade', 'Industrial Use',
  'Jewellery Trade', 'Medical/Pharma', 'Construction',
  'Fuel Distribution', 'Agricultural Mandi'
];

export default function NewInstrument() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    instrument_type: '',
    category: 'weighing',
    manufacturer: '',
    model_number: '',
    serial_number: '',
    capacity: '',
    least_count: '',
    accuracy_class: '',
    year_of_manufacture: '',
    location_of_use: '',
    purpose_of_use: '',
    previous_certificate_number: '',
    last_verification_date: '',
    next_due_date: ''
  });

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.instrument_type || !form.category) {
      toast.error('Instrument category and type are mandatory fields');
      return;
    }
    setLoading(true);
    try {
      const inst = await api.createInstrument(form);
      toast.success(`Measuring instrument cataloged: ${inst.instrument_id}`);
      navigate('/applicant/instruments');
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-900 mb-4 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Registered Instruments
      </button>

      <div className="card shadow-sm border-t-4 border-t-[#002b5b] overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center text-blue-900 shrink-0">
              <Scale size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-slate-900">
                Register Measuring Instrument
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory registration of commercial weighing or measuring assets under Legal Metrology Act, 2009
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Section 1: Identification */}
          <fieldset className="border-b border-slate-100 pb-6">
            <legend className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px] font-bold">1</span>
              Instrument Identity & Model Information
            </legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Instrument Type *</label>
                <select
                  value={form.instrument_type}
                  onChange={e => update('instrument_type', e.target.value)}
                  className="form-input text-xs bg-white"
                  required
                >
                  <option value="">Select Instrument Category</option>
                  {instrumentTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Measurement Domain *</label>
                <select
                  value={form.category}
                  onChange={e => update('category', e.target.value)}
                  className="form-input text-xs bg-white capitalize"
                  required
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Manufacturer / Make</label>
                <input
                  type="text"
                  value={form.manufacturer}
                  onChange={e => update('manufacturer', e.target.value)}
                  className="form-input text-xs"
                  placeholder="e.g. Avery India / Essae Digitronics"
                />
              </div>

              <div>
                <label className="form-label">Model Designation</label>
                <input
                  type="text"
                  value={form.model_number}
                  onChange={e => update('model_number', e.target.value)}
                  className="form-input text-xs"
                  placeholder="e.g. DS-252 Series"
                />
              </div>

              <div>
                <label className="form-label">Manufacturer Serial Number</label>
                <input
                  type="text"
                  value={form.serial_number}
                  onChange={e => update('serial_number', e.target.value)}
                  className="form-input text-xs font-mono"
                  placeholder="e.g. SN-2024-8849"
                />
              </div>

              <div>
                <label className="form-label">Year of Manufacture</label>
                <input
                  type="number"
                  value={form.year_of_manufacture}
                  onChange={e => update('year_of_manufacture', e.target.value)}
                  className="form-input text-xs font-mono"
                  min="2000"
                  max="2030"
                  placeholder="2025"
                />
              </div>
            </div>
          </fieldset>

          {/* Section 2: Technical Specifications */}
          <fieldset className="border-b border-slate-100 pb-6">
            <legend className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px] font-bold">2</span>
              Calibration & Metrological Standards
            </legend>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Rated Capacity</label>
                <input
                  type="text"
                  value={form.capacity}
                  onChange={e => update('capacity', e.target.value)}
                  className="form-input text-xs font-mono"
                  placeholder="e.g. 30 kg / 5000 kg"
                />
              </div>

              <div>
                <label className="form-label">Least Count (Verification Scale Interval 'e')</label>
                <input
                  type="text"
                  value={form.least_count}
                  onChange={e => update('least_count', e.target.value)}
                  className="form-input text-xs font-mono"
                  placeholder="e.g. 1 g / 5 g"
                />
              </div>

              <div>
                <label className="form-label">Accuracy Class</label>
                <select
                  value={form.accuracy_class}
                  onChange={e => update('accuracy_class', e.target.value)}
                  className="form-input text-xs bg-white"
                >
                  <option value="">Select Accuracy Class</option>
                  {accuracyClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Section 3: Premises & Commercial Purpose */}
          <fieldset className="border-b border-slate-100 pb-6">
            <legend className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px] font-bold">3</span>
              Deployment Location & Commercial Trade Purpose
            </legend>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Premises Address of Use</label>
                <input
                  type="text"
                  value={form.location_of_use}
                  onChange={e => update('location_of_use', e.target.value)}
                  className="form-input text-xs"
                  placeholder="Physical commercial trade location"
                />
              </div>

              <div>
                <label className="form-label">Commercial Purpose of Use</label>
                <select
                  value={form.purpose_of_use}
                  onChange={e => update('purpose_of_use', e.target.value)}
                  className="form-input text-xs bg-white"
                >
                  <option value="">Select Trade Type</option>
                  {purposes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
          </fieldset>

          {/* Section 4: Previous Verification (if re-verification) */}
          <fieldset>
            <legend className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center text-[10px] font-bold">4</span>
              Prior Verification History (Optional for Existing Assets)
            </legend>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="form-label">Previous Certificate Reference</label>
                <input
                  type="text"
                  value={form.previous_certificate_number}
                  onChange={e => update('previous_certificate_number', e.target.value)}
                  className="form-input text-xs font-mono"
                  placeholder="e.g. CERT-LM-2025-0912"
                />
              </div>

              <div>
                <label className="form-label">Last Stamping / Verification Date</label>
                <input
                  type="date"
                  value={form.last_verification_date}
                  onChange={e => update('last_verification_date', e.target.value)}
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="form-label">Re-verification Due Date</label>
                <input
                  type="date"
                  value={form.next_due_date}
                  onChange={e => update('next_due_date', e.target.value)}
                  className="form-input text-xs"
                />
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-xs font-semibold py-2.5 px-6 shadow-sm"
            >
              <Save size={14} /> {loading ? 'Cataloging Instrument...' : 'Register Instrument in Repository'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
