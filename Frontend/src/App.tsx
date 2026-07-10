import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TechnicianDashboardPage from './pages/TechnicianDashboardPage';
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage';
import FarmerLoginPage from './pages/FarmerLoginPage';
import FarmerAppPage from './pages/FarmerAppPage';

// Simple Route Guard to protect Dashboard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard/:tab" 
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/superadmin-dashboard" 
          element={
            <ProtectedRoute>
              <SuperAdminDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/superadmin-dashboard/:tab" 
          element={
            <ProtectedRoute>
              <SuperAdminDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/technician-dashboard" 
          element={
            <ProtectedRoute>
              <TechnicianDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/technician-dashboard/:tab" 
          element={
            <ProtectedRoute>
              <TechnicianDashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/farmer-login" element={<FarmerLoginPage />} />
        <Route path="/farmer-app" element={<ProtectedRoute><FarmerAppPage /></ProtectedRoute>} />
        <Route path="/farmer-app/:tab" element={<ProtectedRoute><FarmerAppPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
