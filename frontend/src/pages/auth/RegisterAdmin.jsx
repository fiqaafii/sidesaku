import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, MapPin, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterAdmin() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama_lengkap: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    id_desa: '',
  });

  const [errors, setErrors]             = useState({});
  const [apiError, setApiError]         = useState('');
  const [desaList, setDesaList]         = useState([]);
  const [loadingDesa, setLoadingDesa]   = useState(true);
  const [desaError, setDesaError]       = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);

  // Ambil daftar desa aktif dari database riil
  const fetchDesa = async () => {
    setLoadingDesa(true);
    setDesaError('');
    try {
      const res = await authService.getDesaList();
      if (res?.success && Array.isArray(res.data)) {
        setDesaList(res.data);
        if (res.data.length === 0) {
          setDesaError('Belum ada desa aktif yang terdaftar di database.');
        }
      } else {
        throw new Error(res?.message || 'Format respons daftar desa tidak sesuai.');
      }
    } catch (err) {
      console.error('Gagal memuat desa:', err.message);
      setDesaError(err.message || 'Gagal memuat daftar desa dari server backend.');
    } finally {
      setLoadingDesa(false);
    }
  };

  useEffect(() => {
    fetchDesa();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setApiError('');
    if (name === 'username' && /\s/.test(value)) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.nama_lengkap.trim()) e.nama_lengkap = 'Nama lengkap wajib diisi.';
    if (!form.username.trim()) e.username = 'Username wajib diisi.';
    else if (!/^[a-zA-Z0-9._]+$/.test(form.username)) e.username = 'Username hanya boleh huruf, angka, titik, dan garis bawah.';
    if (!form.email.trim()) e.email = 'Email wajib diisi.';
    else if (!emailRegex.test(form.email)) e.email = 'Format email tidak valid.';
    if (!form.password) e.password = 'Password wajib diisi.';
    else if (form.password.length < 8) e.password = 'Password minimal 8 karakter.';
    if (!form.confirmPassword) e.confirmPassword = 'Ulangi password Anda.';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Password tidak cocok.';
    if (!form.id_desa) e.id_desa = 'Pilih desa yang akan dikelola.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nama_lengkap: form.nama_lengkap.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        id_desa: parseInt(form.id_desa, 10),
      };

      const res = await authService.registerAdminDesa(payload);

      if (res.success) {
        const selectedDesaObj = desaList.find((d) => String(d.id_desa) === String(form.id_desa));
        navigate('/menunggu-persetujuan', {
          state: {
            registeredDesa: selectedDesaObj?.nama_desa || 'Desa Terkait',
            username: form.username.trim(),
          },
        });
      }
    } catch (err) {
      setApiError(err.message || 'Pendaftaran Admin Desa gagal. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] px-4 py-10">
      <div className="max-w-xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#142B4A] hover:underline mb-5">
          <ArrowLeft size={15} /> Kembali ke Beranda
        </Link>

        <div className="flex items-center gap-3 mb-6 mt-4">
          <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center">
            <MapPin size={22} className="text-[#F5C542]" />
          </div>
          <div>
            <h1 className="page-title text-[#142B4A]">Pendaftaran Admin Desa</h1>
            <p className="text-sm text-gray-500">
              Pengajuan akun pengelola pelayanan administrasi desa
            </p>
          </div>
        </div>

        {/* Informasi Alur Persetujuan */}
        <div className="mb-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-yellow-900 text-sm flex gap-3 items-start">
          <AlertCircle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Perhatian: Verifikasi Super Admin Kecamatan Diperlukan</p>
            <p className="text-xs text-yellow-800 leading-relaxed">
              Setelah mendaftar, akun Admin Desa Anda akan berada dalam status <strong>Menunggu Persetujuan</strong>.
              Super Admin Kecamatan akan memverifikasi permohonan Anda sebelum akses ke dashboard desa diaktifkan.
            </p>
          </div>
        </div>

        {/* Error banner dari API */}
        {apiError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-300 px-5 py-4 text-red-700 text-sm">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <div className="card bg-white rounded-2xl shadow-md p-7">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Nama Lengkap */}
            <div>
              <label htmlFor="nama_lengkap" className="form-label">
                Nama Lengkap Petugas <span className="text-red-500">*</span>
              </label>
              <input
                id="nama_lengkap"
                name="nama_lengkap"
                type="text"
                value={form.nama_lengkap}
                onChange={handleChange}
                placeholder="Contoh: Ahmad Fauzi, S.Sos"
                className={`form-input mt-1 w-full ${errors.nama_lengkap ? 'border-red-400' : ''}`}
                disabled={loading}
              />
              {errors.nama_lengkap && <p className="form-error">{errors.nama_lengkap}</p>}
            </div>

            {/* Username & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="username" className="form-label">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="admin.makmur"
                  className={`form-input mt-1 w-full ${errors.username ? 'border-red-400' : ''}`}
                  disabled={loading}
                />
                {errors.username && <p className="form-error">{errors.username}</p>}
              </div>

              <div>
                <label htmlFor="email" className="form-label">
                  Email Resmi <span className="text-red-500">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@makmur.desa.id"
                  className={`form-input mt-1 w-full ${errors.email ? 'border-red-400' : ''}`}
                  disabled={loading}
                />
                {errors.email && <p className="form-error">{errors.email}</p>}
              </div>
            </div>

            {/* Pilihan Desa */}
            <div>
              <label htmlFor="id_desa" className="form-label">
                Pilih Desa Kewenangan <span className="text-red-500">*</span>
              </label>
              <select
                id="id_desa"
                name="id_desa"
                value={form.id_desa}
                onChange={handleChange}
                className={`form-input mt-1 w-full ${errors.id_desa || desaError ? 'border-red-400' : ''}`}
                disabled={loading || loadingDesa}
              >
                {loadingDesa ? (
                  <option value="">⏳ Sedang memuat daftar desa dari server...</option>
                ) : desaError ? (
                  <option value="">⚠️ Gagal memuat data desa (klik Muat Ulang)</option>
                ) : desaList.length === 0 ? (
                  <option value="">-- Belum ada desa aktif terdaftar --</option>
                ) : (
                  <option value="">-- Pilih Desa --</option>
                )}
                {desaList.map((desa) => (
                  <option key={desa.id_desa} value={desa.id_desa}>
                    {desa.nama_desa} ({desa.kode_desa})
                  </option>
                ))}
              </select>
              {errors.id_desa && <p className="form-error">{errors.id_desa}</p>}

              {/* Indikator dan tombol Muat Ulang jika fetch gagal */}
              {desaError && (
                <div className="mt-2.5 flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                    <span>{desaError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchDesa}
                    disabled={loadingDesa}
                    className="ml-3 px-2.5 py-1 rounded-lg bg-[#142B4A] hover:bg-[#1E3E6B] text-white font-medium flex items-center gap-1.5 transition-colors flex-shrink-0"
                  >
                    <RefreshCw size={13} className={loadingDesa ? 'animate-spin' : ''} />
                    Muat Ulang
                  </button>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-1">
                Akun Admin Desa hanya memiliki hak akses pada desa kewenangan yang disetujui.
              </p>
            </div>

            {/* Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="form-label">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Min. 8 karakter"
                    className={`form-input w-full pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="form-error">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="form-label">
                  Ulangi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Konfirmasi password"
                    className={`form-input w-full pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-8"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Mengirim Permohonan…
                  </>
                ) : (
                  'Kirim Permohonan'
                )}
              </button>
              <p className="text-sm text-gray-500">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-[#142B4A] font-semibold hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
