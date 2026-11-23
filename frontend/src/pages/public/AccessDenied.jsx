import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AccessDenied() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="card bg-white rounded-2xl shadow-md p-8 md:p-10 max-w-md w-full flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-5">
          <ShieldAlert size={36} />
        </div>

        <h1 className="text-2xl font-bold text-[#142B4A] mb-2">Akses Ditolak</h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {user ? (
            <>
              Akun Anda (<span className="font-semibold text-gray-700">@{user.username}</span>) dengan peran{' '}
              <span className="font-semibold text-[#142B4A]">{user.role}</span> tidak memiliki izin untuk membuka halaman ini.
            </>
          ) : (
            'Anda tidak memiliki hak akses untuk membuka halaman ini. Silakan masuk terlebih dahulu dengan akun yang sesuai.'
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
          {user ? (
            <>
              <button
                onClick={() => {
                  if (user.role === 'super_admin') navigate('/super-admin/dashboard');
                  else if (user.role === 'admin_desa') navigate('/admin/dashboard');
                  else navigate('/warga/dashboard');
                }}
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
              >
                Dashboard Saya
              </button>
              <button
                onClick={handleLogout}
                className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut size={16} /> Keluar
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
              Masuk Sekarang
            </Link>
          )}

          <Link to="/" className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
