import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Scale, Eye, EyeOff, LogIn, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const demoAccounts = [
  { role: 'Applicant', title: 'Commercial Trader / User', email: 'rajesh.kumar@demo.com', color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 text-blue-900' },
  { role: 'LMO', title: 'Legal Metrology Officer', email: 'inspector.sharma@gov.in', color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 text-emerald-900' },
  { role: 'GATC', title: 'Govt Approved Test Centre', email: 'gatc.delhi@demo.com', color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 text-amber-900' },
  { role: 'Admin', title: 'Dept Central Administration', email: 'admin@legalmetrology.gov.in', color: 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-900' },
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`Authenticated as ${user.full_name}`);
      navigate(user.role === 'applicant' ? '/applicant' : `/${user.role}`);
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('demo1234');
    setLoading(true);
    try {
      const user = await login(demoEmail, 'demo1234');
      toast.success(`Demonstration access: Logged in as ${user.full_name}`);
      navigate(user.role === 'applicant' ? '/applicant' : `/${user.role}`);
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    }
    setLoading(false);
  };

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
              <span className="text-blue-100">Ministry of Consumer Affairs, Food & Public Distribution</span>
            </div>
            <Link to="/" className="text-blue-200 hover:text-white transition-colors">
              ← Back to Portal Home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="py-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-2">
              <div className="w-10 h-10 bg-[#002b5b] text-amber-300 rounded-lg flex items-center justify-center shadow-sm">
                <Scale size={22} />
              </div>
              <div className="text-left">
                <span className="text-2xl font-bold font-display text-slate-900 tracking-tight block leading-tight">ParimaN</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-500 block">Department Single Sign-On</span>
              </div>
            </Link>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="border-b border-slate-100 pb-3 mb-5">
              <h2 className="text-base font-bold text-slate-900">Portal Authentication</h2>
              <p className="text-xs text-slate-500 mt-0.5">Enter statutory credentials or select demo profile below</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Official / Registered Email ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="name@domain.gov.in"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="form-label mb-0">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="form-input pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-2.5 font-semibold text-sm shadow-sm"
              >
                <LogIn size={16} /> {loading ? 'Validating Credentials...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-500">
                New commercial applicant?{' '}
                <Link to="/register" className="text-blue-700 font-semibold hover:underline">
                  Register Business
                </Link>
              </p>
            </div>
          </div>

          {/* Quick Demo Accounts for SIH Evaluator */}
          <div className="mt-4 bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-blue-700" /> SIH Evaluation Role Profiles
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-medium px-2 py-0.5 rounded">1-Click Login</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">Click any profile below to instantly simulate the verified portal experience:</p>

            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map(d => (
                <button
                  key={d.role}
                  type="button"
                  onClick={() => handleDemoLogin(d.email)}
                  disabled={loading}
                  className={`flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${d.color}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono uppercase tracking-wider">{d.role}</span>
                      <span className="text-xs font-medium text-slate-700">— {d.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono block mt-0.5">{d.email}</span>
                  </div>
                  <ArrowRight size={14} className="opacity-60" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-3 text-center text-[11px] border-t border-slate-800">
        Smart India Hackathon 2026 • Legal Metrology Digital System (ParimaN) • Government of India
      </footer>
    </div>
  );
}
