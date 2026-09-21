import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scale, UserPlus, Building, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    phone: '',
    organization: '',
    district: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Business entity enrolled successfully!');
      navigate('/applicant');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between">
      {/* Top Stripe */}
      <div>
        <div className="govt-stripe" />
        <div className="bg-[#002b5b] text-white py-2 px-4 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold">भारत सरकार</span>
              <span className="text-blue-300">|</span>
              <span className="text-blue-100">Department of Consumer Affairs</span>
            </div>
            <Link to="/" className="text-blue-200 hover:text-white transition-colors">
              ← Portal Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="py-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-xl">
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-2">
              <div className="w-10 h-10 bg-[#002b5b] text-amber-300 rounded-lg flex items-center justify-center shadow-sm">
                <Scale size={22} />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold font-display text-slate-900 tracking-tight block leading-tight">ParimaN</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">Commercial Entity Enrollment</span>
              </div>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="border-b border-slate-100 pb-3 mb-5">
              <h2 className="text-base font-bold text-slate-900">Commercial Business Enrollment</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Register authorized establishment under the Legal Metrology Act, 2009
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label">Authorized Signatory Full Name *</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={e => update('full_name', e.target.value)}
                    className="form-input"
                    placeholder="e.g. Rajesh Kumar Sharma"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Official Email Address *</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    className="form-input"
                    placeholder="name@business.com"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Account Password *</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                    className="form-input"
                    placeholder="Min. 6 characters"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Contact Mobile No</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    className="form-input"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="form-label">Trade / Enterprise Name</label>
                  <input
                    type="text"
                    value={form.organization}
                    onChange={e => update('organization', e.target.value)}
                    className="form-input"
                    placeholder="e.g. Apex Traders Pvt Ltd"
                  />
                </div>

                <div>
                  <label className="form-label">Jurisdiction District</label>
                  <select
                    value={form.district}
                    onChange={e => update('district', e.target.value)}
                    className="form-input bg-white"
                  >
                    <option value="">Select District</option>
                    {[
                      'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi',
                      'North East Delhi', 'North West Delhi', 'South Delhi',
                      'South East Delhi', 'South West Delhi', 'West Delhi', 'Shahdara'
                    ].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Establishment Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => update('address', e.target.value)}
                    className="form-input"
                    placeholder="Shop/Plot No, Market, PIN Code"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn btn-primary py-2.5 font-semibold text-sm shadow-sm"
                >
                  <UserPlus size={16} /> {loading ? 'Submitting Registration...' : 'Complete Business Enrollment'}
                </button>
              </div>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                Already hold a registered account?{' '}
                <Link to="/login" className="text-blue-700 font-semibold hover:underline">
                  Sign In Here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-slate-900 text-slate-400 py-3 text-center text-[11px] border-t border-slate-800">
        Smart India Hackathon 2026 • Department of Consumer Affairs • Government of India
      </footer>
    </div>
  );
}
