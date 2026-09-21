import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import ApplicantDashboard from './pages/applicant/Dashboard';
import ApplicantInstruments from './pages/applicant/Instruments';
import ApplicantApplications from './pages/applicant/Applications';
import ApplicationDetail from './pages/applicant/ApplicationDetail';
import NewInstrument from './pages/applicant/NewInstrument';
import NewApplication from './pages/applicant/NewApplication';
import ApplicantCertificates from './pages/applicant/Certificates';
import LMODashboard from './pages/lmo/Dashboard';
import LMOApplications from './pages/lmo/Applications';
import LMOReview from './pages/lmo/ReviewApplication';
import GATCDashboard from './pages/gatc/Dashboard';
import GATCVerification from './pages/gatc/Verification';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminGATCCentres from './pages/admin/GATCCentres';
import AdminAuditLog from './pages/admin/AuditLog';
import DashboardLayout from './components/DashboardLayout';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role === 'applicant' ? 'applicant' : user.role}`} /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role === 'applicant' ? 'applicant' : user.role}`} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/applicant" /> : <RegisterPage />} />
      <Route path="/verify" element={<VerifyPage />} />

      {/* Applicant Routes */}
      <Route path="/applicant" element={<ProtectedRoute roles={['applicant']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<ApplicantDashboard />} />
        <Route path="instruments" element={<ApplicantInstruments />} />
        <Route path="instruments/new" element={<NewInstrument />} />
        <Route path="applications" element={<ApplicantApplications />} />
        <Route path="applications/new" element={<NewApplication />} />
        <Route path="applications/:id" element={<ApplicationDetail />} />
        <Route path="certificates" element={<ApplicantCertificates />} />
      </Route>

      {/* LMO Routes */}
      <Route path="/lmo" element={<ProtectedRoute roles={['lmo']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<LMODashboard />} />
        <Route path="applications" element={<LMOApplications />} />
        <Route path="applications/:id" element={<LMOReview />} />
      </Route>

      {/* GATC Routes */}
      <Route path="/gatc" element={<ProtectedRoute roles={['gatc']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<GATCDashboard />} />
        <Route path="verify/:id" element={<GATCVerification />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="gatc-centres" element={<AdminGATCCentres />} />
        <Route path="audit-log" element={<AdminAuditLog />} />
      </Route>

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
