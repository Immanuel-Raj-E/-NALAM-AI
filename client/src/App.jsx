import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PatientsPage from './pages/PatientsPage';
import PatientDetail from './pages/PatientDetail';
import PatientPortal from './pages/PatientPortal';
import PrescriptionGeneratorPage from './pages/PrescriptionGeneratorPage';
import ReportsPage from './pages/ReportsPage';
import AppointmentsPage from './pages/AppointmentsPage';
import HospitalsPage from './pages/HospitalsPage';
import DoctorsPage from './pages/DoctorsPage';
import MedicinesPage from './pages/MedicinesPage';
import VaccinationsPage from './pages/VaccinationsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPortal from './pages/AdminPortal';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patient Management',
  '/patient-portal': 'Patient Access Portal',
  '/prescription-generator': 'Prescription Generator',
  '/reports': 'Medical Reports',
  '/appointments': 'Appointments',
  '/hospitals': 'Nearby Hospitals',
  '/doctors': 'Doctor Directory',
  '/medicines': 'Medicine Inventory',
  '/vaccinations': 'Vaccination Tracker',
  '/profile': 'My Profile',
  '/admin': 'Admin Control Center'
};

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'NALAM AI';

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <Navbar onMenuClick={() => setCollapsed(!collapsed)} title={title} />
        <div className="animate-fade-in">
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  const defaultRoute = user?.role === 'admin' ? '/admin' : user?.role === 'patient' ? '/patient-portal' : '/dashboard';

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/ashalogin" replace />} />
      <Route path="/ashalogin" element={user ? <Navigate to={defaultRoute} /> : <LoginPage role="asha_worker" />} />
      <Route path="/ASHAlogin" element={user ? <Navigate to={defaultRoute} /> : <LoginPage role="asha_worker" />} />
      <Route path="/patientlogin" element={user ? <Navigate to={defaultRoute} /> : <LoginPage role="patient" />} />
      <Route path="/adminlogin" element={user ? <Navigate to={defaultRoute} /> : <LoginPage role="admin" />} />
      <Route path="/register" element={user ? <Navigate to={defaultRoute} /> : <RegisterPage />} />
      <Route path="/" element={<Navigate to={defaultRoute} />} />

      <Route path="/admin" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
      <Route path="/patient-portal" element={<ProtectedRoute><PatientPortal /></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/patients" element={<ProtectedRoute><AppLayout><PatientsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/patients/:id" element={<ProtectedRoute><AppLayout><PatientDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/prescription-generator" element={<ProtectedRoute><AppLayout><PrescriptionGeneratorPage /></AppLayout></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute><AppLayout><ReportsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/appointments" element={<ProtectedRoute><AppLayout><AppointmentsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/hospitals" element={<ProtectedRoute><AppLayout><HospitalsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/doctors" element={<ProtectedRoute><AppLayout><DoctorsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/medicines" element={<ProtectedRoute><AppLayout><MedicinesPage /></AppLayout></ProtectedRoute>} />
      <Route path="/vaccinations" element={<ProtectedRoute><AppLayout><VaccinationsPage /></AppLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><AppLayout><ProfilePage /></AppLayout></ProtectedRoute>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
