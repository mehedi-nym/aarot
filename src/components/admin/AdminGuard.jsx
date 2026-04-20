import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { hasSupabaseEnv } from '../../lib/supabase';

function AdminGuard({ children }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (!hasSupabaseEnv) {
    return children;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="section-shell p-10 text-center text-brand-700">অ্যাডমিন লোড হচ্ছে...</div>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}

export default AdminGuard;
