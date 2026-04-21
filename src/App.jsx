import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import TrackOrderPage from './pages/TrackOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

function App() {
  return (
    <AppShell>
      <Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  
  {/* Specific dynamic route first */}
  <Route path="/track/:orderCode" element={<OrderDetailsPage />} />
  
  {/* General track page second */}
  <Route path="/track" element={<TrackOrderPage />} />
  
  <Route path="/admin/login" element={<AdminLoginPage />} />
  <Route
    path="/admin"
    element={
      <AdminProtectedRoute>
        <AdminDashboardPage />
      </AdminProtectedRoute>
    }
  />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
    </AppShell>
  );
}

export default App;
