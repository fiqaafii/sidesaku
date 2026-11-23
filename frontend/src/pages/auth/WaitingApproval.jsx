import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, ArrowLeft, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function WaitingApproval() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Ambil info dari state router (setelah registrasi) atau dari user context
  const registeredDesa = location.state?.registeredDesa || user?.nama_desa || 'Desa Terkait';
  const username = location.state?.username || user?.username || 'admin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg text-center">

        <div className="card bg-white rounded-2xl shadow-md p-8 md:p-10 flex flex-col items-center">
          {/* Icon Clock */}
          <div className="w-20 h-20 rounded-full bg-yellow-50 border-4 border-yellow-100 flex items-center justify-center mb-6">
            <Clock size={40} className="text-yellow-600 animate-pulse" />
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-[#142B4A] mb-2">
            Akun Sedang Menunggu Persetujuan
          </h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Permohonan akses administrator desa untuk akun <span className="font-semibold text-gray-800">@{username}</span> di{' '}
            <span className="font-semibold text-[#142B4A]">{registeredDesa}</span> telah tercatat dalam sistem.
          </p>

          {/* Status Box */}
          <div className="w-full bg-yellow-50/60 border border-yellow-200/80 rounded-xl p-4 text-left mb-6 text-sm">
            <p className="font-semibold text-yellow-900 mb-2">Status Pendaftaran:</p>
            <ul className="space-y-2 text-xs text-yellow-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={15} className="text-green-600 flex-shrink-0 mt-0.5" />
                <span>Formulir pendaftaran berhasil diterima sistem.</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock size={15} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>Menunggu peninjauan & verifikasi oleh <strong>Super Admin Kecamatan</strong>.</span>
              </li>
              <li className="flex items-start gap-2 text-gray-400">
                <span className="w-3.5 h-3.5 rounded-full border border-gray-300 inline-block flex-shrink-0 mt-0.5" />
                <span>Aktivasi dashboard pelayanan administrasi desa.</span>
              </li>
            </ul>
          </div>

          <p className="text-xs text-gray-400 mb-8 max-w-xs">
            Silakan hubungi pihak Kantor Kecamatan jika permohonan membutuhkan verifikasi segera.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
            <button
              onClick={() => navigate('/login')}
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <RefreshCw size={15} />
              Cek Status / Masuk
            </button>
            <button
              onClick={handleLogout}
              className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <LogOut size={15} />
              Keluar Akun
            </button>
          </div>
        </div>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-[#142B4A] hover:underline mt-6"
        >
          <ArrowLeft size={15} /> Kembali ke Halaman Utama
        </Link>
      </div>
    </div>
  );
}
