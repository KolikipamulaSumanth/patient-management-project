import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthContext from './contexts/AuthContext';
import NavBar from './components/NavBar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientsPage from './pages/PatientsPage';
import PatientForm from './pages/PatientForm';
import AppointmentsPage from './pages/AppointmentsPage';
import AppointmentForm from './pages/AppointmentForm';
import MyAppointmentsPage from './pages/MyAppointmentsPage';
import DoctorsPage from './pages/DoctorsPage';
import AdminDoctorsPage from './pages/AdminDoctorsPage';
import HospitalManagementPage from './pages/HospitalManagementPage';

/**
 * A wrapper that restricts access to authenticated users. If no user is
 * present in the authentication context the component will redirect
 * to the login page instead.
 */
function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

/**
 * Determines an appropriate landing page for the logged‑in user. Patients
 * are directed to the doctor list while administrators and doctors
 * are sent to the patient list.
 */
function HomeRedirect() {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (user.roles.includes('ROLE_PLATFORM_ADMIN')) {
    return <Navigate to="/admin/hospitals" />;
  }
  if (user.roles.includes('ROLE_ADMIN')) {
    return <Navigate to="/admin/doctors" />;
  }
  if (user.roles.includes('ROLE_PATIENT')) {
    return <Navigate to="/doctors" />;
  }
  return <Navigate to="/patients" />;
}

function App() {
  return (
    <AuthProvider>
      <div className="app-frame">
        <NavBar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<PrivateRoute><HomeRedirect /></PrivateRoute>} />
          <Route path="/doctors" element={<PrivateRoute><DoctorsPage /></PrivateRoute>} />
          <Route path="/patients" element={<PrivateRoute><PatientsPage /></PrivateRoute>} />
          <Route path="/patients/new" element={<PrivateRoute><PatientForm /></PrivateRoute>} />
          <Route path="/patients/:id/edit" element={<PrivateRoute><PatientForm /></PrivateRoute>} />
          <Route path="/appointments" element={<PrivateRoute><AppointmentsPage /></PrivateRoute>} />
          <Route path="/appointments/new" element={<PrivateRoute><AppointmentForm /></PrivateRoute>} />
          <Route path="/appointments/my" element={<PrivateRoute><MyAppointmentsPage /></PrivateRoute>} />
          <Route path="/admin/doctors" element={<PrivateRoute><AdminDoctorsPage /></PrivateRoute>} />
          <Route path="/admin/hospitals" element={<PrivateRoute><HospitalManagementPage /></PrivateRoute>} />
          {/* Fallback: redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
