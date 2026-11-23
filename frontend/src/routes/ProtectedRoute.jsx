import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/common/UIComponents';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col items-center justify-center">
      <Spinner size="lg" />
      <p className="text-xs text-gray-500 mt-3 font-medium">Memverifikasi sesi...</p>
    </div>
  );
}

// Guard berdasarkan status login
export function RequireAuth({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Guard berdasarkan role
export function RequireRole({ roles, children }) {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/akses-ditolak" replace />;
  return children;
}

// Guard: Admin Desa yang belum disetujui diarahkan ke halaman tunggu
export function RequireApproved({ children }) {
  const { user, initializing } = useAuth();

  if (initializing) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin_desa' && user.status_akun === 'menunggu') {
    return <Navigate to="/menunggu-persetujuan" replace />;
  }
  if (user.status_akun === 'ditolak' || user.status_akun === 'nonaktif') {
    return <Navigate to="/akses-ditolak" replace />;
  }
  return children;
}
