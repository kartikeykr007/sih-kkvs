import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Shield, Clock, FileCheck, QrCode, BarChart3, ChevronDown, ChevronUp, CheckCircle2, ArrowRight, Search, Building2, Users, Zap, ClipboardCheck, Phone, Mail, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';

const faqs = [
  { q: 'What is Legal Metrology verification under Indian Law?', a: 'Under the Legal Metrology Act, 2009 and the Legal Metrology (General) Rules, 2011, all weighing and measuring instruments used in commercial transactions, industrial trade, or public safety must be verified and stamped by authorized Legal Metrology Officers before use.' },
  { q: 'Who is required to register and obtain verification?', a: 'Any manufacturer, repairer, dealer, or commercial user (retail stores, manufacturing plants, logistics hubs, petroleum retail outlets, mandis) operating weighing and measuring equipment is legally mandated to hold valid verification.' },
  { q: 'What is the processing timeline under ParimaN?', a: 'Under the digitized ParimaN portal, end-to-end processing—from application filing, online fee payment, scrutiny, and GATC testing to certificate issuance—is streamlined within a Citizen Charter timeline of 5–7 working days.' },
  { q: 'Which documents are required for application submission?', a: 'Applicants must provide: Certificate of Incorporation or Trade License, Proof of Identity, Instrument Technical Specifications / Manufacturer Invoice, and the Previous Verification Certificate (in case of periodic re-verification).' },
  { q: 'How does digital QR certificate verification work?', a: 'Every verification certificate issued via ParimaN features a cryptographically signed QR code. Any consumer, enforcement official, or buyer can scan the code or search the certificate number to instantly verify legitimacy.' },
  { q: 'What is the validity period of verification certificates?', a: 'Verification certificates are generally valid for 12 months as per Rule 27 of the Legal Metrology Rules. ParimaN automatically dispatches 30-day automated alerts before expiry.' },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [certNumber, setCertNumber] = useState('');
  const [certResult, setCertResult] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setVerifying(true);
    setCertResult(null);
    try {
      const result = await api.verifyCertificate(certNumber.trim());
      setCertResult(result);
    } catch (err) {
      setCertResult({ valid: false, error: err.message });
    }
    setVerifying(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Top Gov Header Ribbon */}
      <div className="bg-slate-100 border-b border-slate-200 text-[11px] text-slate-700 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">भारत सरकार</span>
            <span className="text-slate-400">|</span>
            <span>Government of India</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-600">Department of Consumer Affairs</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span className="hidden md:inline">National Consumer Helpline: <strong className="text-slate-900">1915</strong></span>
            <span className="text-slate-400 hidden md:inline">|</span>
            <span className="font-medium">English</span>
          </div>
        </div>
      </div>

      {/* Indian Tricolor Stripe */}
      <div className="govt-stripe" />

      {/* Main Navigation Header */}
      <header className="bg-[#002b5b] text-white border-b border-blue-900 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-amber-300">
              <Scale size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-display tracking-tight text-white">ParimaN</span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                  National Portal
                </span>
              </div>
              <p className="text-[11px] text-blue-200">Legal Metrology Electronic Verification & Certification System</p>
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-3">
            <a href="#verify" className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-blue-100 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-2 rounded-md transition-colors border border-white/10">
              <QrCode size={15} /> Verify Certificate
            </a>
            <Link to="/login" className="text-xs font-semibold bg-white text-[#002b5b] hover:bg-blue-50 px-4 py-2 rounded-md transition-colors shadow-sm">
              Sign In
            </Link>
            <Link to="/register" className="hidden sm:inline-flex text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-md transition-colors shadow-sm">
              Register Business
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#002b5b] via-[#003875] to-[#004b99] text-white py-16 px-4 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-900/60 border border-blue-400/30 rounded-md px-3 py-1 mb-5 text-xs font-medium text-blue-100 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
              Legal Metrology Act, 2009 Digital Governance Initiative
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display leading-tight tracking-tight mb-4 text-white">
              National Digital Verification & Certification Portal for Weights and Measures
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-8 leading-relaxed font-normal">
              A unified government portal automating instrument registration, online fee payments, automated officer scrutiny, GATC test verification, and tamper-evident QR verification certificates.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold px-5 py-2.5 rounded-lg text-sm transition-all shadow-sm">
                Apply for Verification <ArrowRight size={16} />
              </Link>
              <a href="#verify" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all border border-white/20">
                <Search size={16} /> Verify Public Certificate
              </a>
              <Link to="/login" className="inline-flex items-center gap-2 bg-transparent hover:bg-white/10 text-blue-100 font-medium px-4 py-2.5 rounded-lg text-sm transition-all">
                Official / GATC Login →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics Strip */}
      <section className="bg-slate-900 text-white border-b border-slate-800 py-4 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="border-r border-slate-800 last:border-0 py-2">
            <div className="text-2xl font-bold text-amber-400 font-display">100%</div>
            <div className="text-xs text-slate-400 mt-0.5">Paperless Processing</div>
          </div>
          <div className="border-r border-slate-800 last:border-0 py-2">
            <div className="text-2xl font-bold text-emerald-400 font-display">5–7 Days</div>
            <div className="text-xs text-slate-400 mt-0.5">Citizen Charter SLA</div>
          </div>
          <div className="border-r border-slate-800 last:border-0 py-2">
            <div className="text-2xl font-bold text-blue-400 font-display">Tamper-Proof</div>
            <div className="text-xs text-slate-400 mt-0.5">QR Verification Standard</div>
          </div>
          <div className="py-2">
            <div className="text-2xl font-bold text-purple-400 font-display">Pan-India</div>
            <div className="text-xs text-slate-400 mt-0.5">Standardized GATC Checklists</div>
          </div>
        </div>
      </section>

      {/* Comparative System Analysis */}
      <section className="py-14 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold font-display text-slate-900">Institutional Transformation</h2>
            <p className="text-sm text-slate-600 mt-1.5">Modernizing Legal Metrology compliance under Digital India guidelines</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Legacy Model */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <h3 className="text-base font-bold text-slate-900">Legacy Manual Process</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Physical visits to district Legal Metrology offices for filing</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Manual paperwork, paper challans, and fragmented physical registers</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Opaque scheduling leading to inspector bottlenecks and delays</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Paper certificates vulnerable to counterfeiting and tampering</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>No public repository for citizens to verify commercial scale stamps</span>
                </li>
              </ul>
            </div>

            {/* ParimaN Model */}
            <div className="bg-white border border-blue-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <h3 className="text-base font-bold text-slate-900">ParimaN Digital Architecture</h3>
              </div>
              <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>Single-window digital application submission with Aadhaar/PAN validation</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>Transparent online fee settlement and instant transaction receipt</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>Automated allocation to authorized LMOs and NABL/GATC testing centres</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>Standardized digital inspection checklist ensuring zero discretion</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-emerald-600 mt-0.5 shrink-0" />
                  <span>Cryptographically signed QR certificate accessible for public audit 24x7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Standard Operating Procedure */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl font-bold font-display text-slate-900">Standard Operating Procedure</h2>
            <p className="text-sm text-slate-600 mt-1.5">Standardized 4-stage verification lifecycle</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'Registration & Asset Catalog', desc: 'Declare business credentials and register weighing and measuring equipment.', icon: Users },
              { step: '02', title: 'Application & Fee Settlement', desc: 'Submit application with model certificates and settle statutory fee securely.', icon: FileCheck },
              { step: '03', title: 'Inspection & GATC Testing', desc: 'Officer reviews scrutiny and GATC tests instrument against tolerance standards.', icon: ClipboardCheck },
              { step: '04', title: 'Digital QR Certification', desc: 'System generates digital verification certificate with public QR verification tag.', icon: QrCode },
            ].map((item) => (
              <div key={item.step} className="bg-slate-50 border border-slate-200 rounded-xl p-5 hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-900 font-mono bg-blue-100 px-2 py-0.5 rounded">STEP {item.step}</span>
                  <item.icon size={20} className="text-blue-900" />
                </div>
                <h3 className="font-semibold text-slate-900 text-base mb-1.5">{item.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certificate Verification Section */}
      <section className="py-14 bg-slate-900 text-white" id="verify">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-900/60 border border-blue-400/30 text-amber-300 mb-4">
            <QrCode size={24} />
          </div>
          <h2 className="text-2xl font-bold font-display text-white mb-2">Public Certificate Verification Portal</h2>
          <p className="text-sm text-slate-300 mb-6">
            Verify the authenticity and validity of any Legal Metrology certificate issued under the ParimaN framework.
          </p>

          <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={certNumber}
              onChange={(e) => setCertNumber(e.target.value)}
              placeholder="Enter Certificate Number (e.g. CERT-LM-2026-0001)"
              className="flex-1 px-4 py-2.5 rounded-lg text-slate-900 bg-white border border-slate-300 focus:ring-2 focus:ring-amber-400 outline-none text-sm font-mono placeholder:font-sans"
              required
            />
            <button
              type="submit"
              disabled={verifying}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold px-5 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm disabled:opacity-50"
            >
              <Search size={16} /> {verifying ? 'Verifying...' : 'Verify Now'}
            </button>
          </form>

          {certResult && (
            <div className={`mt-6 p-5 rounded-xl text-left border ${certResult.valid ? 'bg-white text-slate-900 border-emerald-500' : 'bg-rose-50 text-slate-900 border-rose-300'}`}>
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                {certResult.valid ? (
                  <>
                    <CheckCircle2 className="text-emerald-600" size={20} />
                    <span className="font-bold text-emerald-800 text-sm">Authenticated Government Record — Active</span>
                  </>
                ) : (
                  <>
                    <Shield className="text-rose-600" size={20} />
                    <span className="font-bold text-rose-800 text-sm">Verification Failed: {certResult.error || 'Record Not Found or Invalid'}</span>
                  </>
                )}
              </div>
              {certResult.valid && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div><span className="text-slate-500 block">Certificate No:</span><span className="font-mono font-bold text-slate-900">{certResult.certificate_number}</span></div>
                  <div><span className="text-slate-500 block">Instrument Type:</span><span className="font-medium text-slate-900">{certResult.instrument_type}</span></div>
                  <div><span className="text-slate-500 block">Owner / Trade Name:</span><span className="font-medium text-slate-900">{certResult.owner_name}</span></div>
                  <div><span className="text-slate-500 block">Organization:</span><span className="font-medium text-slate-900">{certResult.organization}</span></div>
                  <div><span className="text-slate-500 block">Verification Date:</span><span className="font-medium text-slate-900">{certResult.verification_date}</span></div>
                  <div><span className="text-slate-500 block">Valid Upto:</span><span className="font-medium text-emerald-700 font-semibold">{certResult.expiry_date}</span></div>
                </div>
              )}
            </div>
          )}
          <p className="text-xs text-slate-400 mt-3">Sample verification key for demonstration: <span className="font-mono text-amber-300">CERT-LM-2026-0001</span></p>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-14 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display text-slate-900">Legal & Regulatory Guidance</h2>
            <p className="text-xs text-slate-500 mt-1">Frequently asked questions concerning statutory weights & measures rules</p>
          </div>
          <div className="space-y-2.5">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-3.5 text-left bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="font-medium text-slate-800 text-sm">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} className="text-slate-400 shrink-0" /> : <ChevronDown size={16} className="text-slate-400 shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Footer */}
      <footer className="bg-slate-950 text-slate-400 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-2 text-white font-bold font-display text-sm">
                <Scale size={16} className="text-amber-400" />
                ParimaN Legal Metrology
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                National portal for digital verification, standardization, and monitoring of weighing and measuring instruments under the Legal Metrology Act, 2009.
              </p>
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold mb-2 uppercase text-[10px] tracking-wider">Stakeholder Portals</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li><Link to="/login" className="hover:text-white">Commercial Applicants</Link></li>
                <li><Link to="/login" className="hover:text-white">Legal Metrology Officers (LMO)</Link></li>
                <li><Link to="/login" className="hover:text-white">Govt Approved Test Centres (GATC)</Link></li>
                <li><Link to="/login" className="hover:text-white">Department Administration</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold mb-2 uppercase text-[10px] tracking-wider">Acts & Guidelines</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li className="text-slate-400">Legal Metrology Act, 2009</li>
                <li className="text-slate-400">Legal Metrology (General) Rules, 2011</li>
                <li className="text-slate-400">Citizen Charter Timelines</li>
                <li className="text-slate-400">NABL / GATC Accreditation Criteria</li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-200 font-semibold mb-2 uppercase text-[10px] tracking-wider">National Helpdesk</h4>
              <p className="text-[11px] text-slate-300">Toll-Free National Helpline:</p>
              <p className="text-amber-400 font-bold text-sm">1915 / 1800-11-4000</p>
              <p className="text-[10px] text-slate-500 mt-1">Working hours: 09:30 AM to 05:30 PM (Mon–Fri)</p>
            </div>
          </div>
          <div className="pt-4 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
            <div>
              Designed & Developed for Smart India Hackathon 2026 • Ministry of Consumer Affairs, Food and Public Distribution
            </div>
            <div>
              Official Demonstration Platform • Government of India
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
