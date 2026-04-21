import { Navigate } from 'react-router-dom';

function AdminProtectedRoute({ children }) {
  const admin = localStorage.getItem('admin_auth');

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminProtectedRoute;