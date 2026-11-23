import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin, Eye, EyeOff, Loader2, ArrowLeft, LogIn,
  User, Building2, ShieldCheck, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Pilihan mode jenis akses di halaman login
const ACCESS_ROLES = [
  {
    id: 'warga',
    label: 'Warga Desa',
    icon: User,
    desc: 'Layanan mandiri permohonan surat keterangan & pantau berkas.',
  },
  {
    id: 'admin_desa',
    label: 'Admin Desa',
    icon: Building2,
    desc: 'Verifikasi permohonan, data warga, dan administrasi surat desa.',
  },
  {
    id: 'super_admin',
    label: 'Admin Kecamatan',
    icon: ShieldCheck,
    desc: 'Pengawasan wilayah desa, data desa, dan verifikasi admin desa.',
  },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeRole, setActiveRole] = useState('warga'); // 'warga' | 'admin_desa' | 'super_admin'
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const currentRoleConfig = ACCESS_ROLES.find((r) => r.id === activeRole) || ACCESS_ROLES[0];

  const handleSelectRole = (roleId) => {
    setActiveRole(roleId);
    setError('');
  };

  const handleChange = (e) => {
    setError('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.username.trim() || !form.password) {
      setError('Username dan password tidak boleh kosong.');
      return;
    }

    setLoading(true);
    try {
      // Menggunakan satu sistem autentikasi backend yang ada
      const res = await login(form.username.trim(), form.password);

      if (!res.success) {
        // Jika akun Admin Desa berstatus menunggu persetujuan
        if (res.status_akun === 'menunggu') {
          navigate('/menunggu-persetujuan', {
            state: {
              username: form.username.trim(),
              registeredDesa: res.data?.nama_desa || 'Desa Terkait',
            },
          });
          return;
        }

        setError(res.message || 'Username atau password yang Anda masukkan salah.');
        return;
      }

      // Backend memeriksa role akun aktual dari database
      const loggedUser = res.user;

      // Pengalihan otomatis ke dashboard sesuai hak akses role di database
      if (loggedUser.role === 'super_admin') {
        navigate('/super-admin/dashboard', { replace: true });
      } else if (loggedUser.role === 'admin_desa' && loggedUser.status_akun === 'menunggu') {
        navigate('/menunggu-persetujuan', { replace: true });
      } else if (loggedUser.role === 'admin_desa') {
        navigate('/admin/dashboard', { replace: true });
      } else if (loggedUser.role === 'warga') {
        navigate('/warga/dashboard', { replace: true });
      } else {
        navigate('/akses-ditolak', { replace: true });
      }
    } catch (err) {
      setError(err?.message || 'Terjadi kesalahan sistem. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] flex flex-col items-center justify-center px-4 py-8">
      {/* Tombol Kembali ke Landing */}
      <Link
        to="/"
        className="self-center md:self-start md:ml-12 mb-6 flex items-center gap-1.5 text-sm text-[#142B4A] hover:underline"
      >
        <ArrowLeft size={15} />
        Kembali ke Beranda
      </Link>

      <div className="w-full max-w-lg">
        {/* Identitas Brand */}
        <div className="flex flex-col items-center mb-6 gap-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center shadow-md shadow-navy-900/10">
              <MapPin size={22} className="text-[#F5C542]" />
            </div>
            <span className="font-heading text-3xl font-extrabold text-[#142B4A] tracking-tight">SiDesaku</span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            Satu Pintu Layanan Pelayanan Administrasi Desa Terpadu
          </p>
        </div>

        {/* ── Selector Pilihan Jenis Akses ── */}
        <div className="card bg-white rounded-2xl shadow-sm p-2 mb-4 border border-gray-100">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-3 pt-2 pb-1.5">
            Pilih Jenis Akses Portal
          </p>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-50 rounded-xl">
            {ACCESS_ROLES.map((role) => {
              const Icon = role.icon;
              const isActive = activeRole === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleSelectRole(role.id)}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#142B4A] text-white shadow-sm'
                      : 'text-gray-600 hover:text-[#142B4A] hover:bg-white'
                  }`}
                >
                  <Icon size={15} className={isActive ? 'text-[#F5C542]' : 'text-gray-400'} />
                  <span className="text-center sm:text-left leading-tight">{role.label}</span>
                </button>
              );
            })}
          </div>

          <div className="px-3 py-2 mt-1.5 flex items-center gap-2 text-xs text-gray-500 bg-blue-50/50 rounded-lg">
            <Info size={14} className="text-[#142B4A] flex-shrink-0" />
            <span>{currentRoleConfig.desc}</span>
          </div>
        </div>

        {/* ── Card Form Autentikasi ── */}
        <div className="card bg-white rounded-2xl shadow-md p-6 sm:p-8">
          <div className="mb-5">
            <span className="badge badge-navy text-[11px] mb-1">
              Portal Akses: {currentRoleConfig.label}
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-[#142B4A]">
              Masuk ke Akun Anda
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Sistem akan memverifikasi peran Anda dan mengarahkan ke dashboard yang berwenang.
            </p>
          </div>

          {/* Pesan Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-600 flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Kolom Username */}
            <div>
              <label htmlFor="username" className="form-label text-xs">
                Username Akun
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder={
                  activeRole === 'warga'
                    ? 'cth: ujicoba.warga1'
                    : activeRole === 'admin_desa'
                    ? 'cth: ujicoba.admin2'
                    : 'Username Admin Kecamatan'
                }
                className="form-input mt-1 w-full text-sm"
                disabled={loading}
              />
            </div>

            {/* Kolom Password */}
            <div>
              <label htmlFor="password" className="form-label text-xs">
                Kata Sandi (Password)
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan kata sandi Anda"
                  className="form-input w-full pr-10 text-sm"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Tombol Submit Masuk */}
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Memverifikasi Kredensial...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Masuk sebagai {currentRoleConfig.label}
                </>
              )}
            </button>
          </form>

          {/* ── Footer Registrasi Berdasarkan Jenis Akses ── */}
          <div className="mt-6 border-t pt-4 text-center text-xs text-gray-500 space-y-1.5">
            {activeRole === 'warga' && (
              <p>
                Belum memiliki akun warga?{' '}
                <Link to="/daftar" className="text-[#142B4A] font-bold hover:underline">
                  Daftar Warga Mandiri
                </Link>
              </p>
            )}

            {activeRole === 'admin_desa' && (
              <p>
                Petugas desa baru?{' '}
                <Link to="/daftar-admin" className="text-[#142B4A] font-bold hover:underline">
                  Daftar sebagai Admin Desa
                </Link>
                <span className="block text-[10px] text-gray-400 mt-0.5">
                  (Pendaftaran admin desa memerlukan persetujuan Super Admin Kecamatan)
                </span>
              </p>
            )}

            {activeRole === 'super_admin' && (
              <p className="text-gray-400 text-[11px]">
                Administrator Kecamatan tidak memiliki registrasi publik. Akses diberikan secara resmi oleh pihak Kecamatan.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
