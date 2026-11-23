import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="w-full max-w-md">
        <p className="text-8xl font-black text-[#142B4A]/20 tracking-widest mb-2">404</p>
        <h1 className="text-2xl font-bold text-[#142B4A] mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto leading-relaxed">
          Mohon maaf, halaman yang Anda cari tidak dapat ditemukan atau alamat URL yang Anda masukkan salah.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2">
            <Home size={16} /> Ke Halaman Utama
          </Link>
          <Link to="/login" className="btn-outline w-full sm:w-auto flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Masuk ke Akun
          </Link>
        </div>
      </div>
    </div>
  );
}
