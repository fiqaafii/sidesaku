import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getPasswordStrength(pwd) {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  if (score <= 1) return { level: 1, label: 'Lemah',   color: 'bg-red-400'    };
  if (score === 2) return { level: 2, label: 'Cukup',  color: 'bg-yellow-400' };
  if (score === 3) return { level: 3, label: 'Kuat',   color: 'bg-blue-400'   };
  return             { level: 4, label: 'Sangat Kuat', color: 'bg-green-500'  };
}

const INITIAL = {
  username:        '',
  email:           '',
  password:        '',
  confirmPassword: '',
  nama_lengkap:    '',
  nik:             '',
  no_telepon:      '',
  alamat:          '',
  desa_id:         '',
};

export default function RegisterWarga() {
  const navigate = useNavigate();

  const [form, setForm]                 = useState(INITIAL);
  const [errors, setErrors]             = useState({});
  const [apiError, setApiError]         = useState('');
  const [desaList, setDesaList]         = useState([]);
  const [loadingDesa, setLoadingDesa]   = useState(true);
  const [desaError, setDesaError]       = useState('');
  const [showPass, setShowPass]         = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [success, setSuccess]           = useState(false);

  const pwdStrength = getPasswordStrength(form.password);

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
      console.error('Gagal mengambil daftar desa:', err.message);
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

    if (name === 'nik' && !/^\d*$/.test(value)) return;
    if (name === 'nik' && value.length > 16)     return;
    if (name === 'username' && /\s/.test(value)) return;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.username.trim())                         e.username        = 'Username wajib diisi.';
    else if (!/^[a-zA-Z0-9._]+$/.test(form.username)) e.username        = 'Username hanya boleh huruf, angka, titik, dan garis bawah.';
    if (!form.email.trim())                            e.email           = 'Email wajib diisi.';
    else if (!emailRegex.test(form.email))             e.email           = 'Format email tidak valid.';
    if (!form.password)                                e.password        = 'Password wajib diisi.';
    else if (form.password.length < 8)                 e.password        = 'Password minimal 8 karakter.';
    if (!form.confirmPassword)                         e.confirmPassword = 'Konfirmasi password wajib diisi.';
    else if (form.password !== form.confirmPassword)   e.confirmPassword = 'Password tidak cocok.';
    if (!form.nama_lengkap.trim())                     e.nama_lengkap    = 'Nama lengkap wajib diisi.';
    if (!form.nik.trim())                              e.nik             = 'NIK wajib diisi.';
    else if (form.nik.length !== 16)                   e.nik             = 'NIK harus tepat 16 digit.';
    if (!form.no_telepon.trim())                       e.no_telepon      = 'Nomor telepon wajib diisi.';
    if (!form.alamat.trim())                           e.alamat          = 'Alamat lengkap wajib diisi.';
    if (!form.desa_id)                                 e.desa_id         = 'Pilih desa tempat tinggal Anda.';
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
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        nama_lengkap: form.nama_lengkap.trim(),
        nik: form.nik.trim(),
        no_telepon: form.no_telepon.trim(),
        alamat: form.alamat.trim(),
        id_desa: parseInt(form.desa_id, 10),
      };

      const res = await authService.registerWarga(payload);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Pendaftaran berhasil. Silakan masuk menggunakan akun baru Anda.' },
          });
        }, 2000);
      }
    } catch (err) {
      setApiError(err.message || 'Pendaftaran gagal. Silakan periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F6FA] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-[#142B4A] hover:underline mb-5">
          <ArrowLeft size={15} /> Kembali ke Beranda
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 mt-4">
          <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center">
            <MapPin size={22} className="text-[#F5C542]" />
          </div>
          <div>
            <h1 className="page-title text-[#142B4A]">Pendaftaran Akun Warga</h1>
            <p className="text-sm text-gray-500">Akun warga langsung aktif setelah data tervalidasi di sistem.</p>
          </div>
        </div>

        {/* Success banner */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-300 px-5 py-4 text-green-700">
            <CheckCircle2 size={22} />
            <span className="font-medium">
              Pendaftaran berhasil! Akun Anda aktif dan sedang dialihkan ke halaman login...
            </span>
          </div>
        )}

        {/* Error banner dari API */}
        {apiError && (
          <div className="mb-6 flex items-center gap-3 rounded-xl bg-red-50 border border-red-300 px-5 py-4 text-red-700 text-sm">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="card bg-white rounded-2xl shadow-md p-7 space-y-8">

            {/* ── Section 1: Data Akun ──────────────────────────────────── */}
            <section>
              <h2 className="section-title text-[#142B4A] border-b pb-2 mb-5">Data Akun</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Username */}
                <div>
                  <label htmlFor="username" className="form-label">Username <span className="text-red-500">*</span></label>
                  <input id="username" name="username" type="text" value={form.username}
                    onChange={handleChange} placeholder="contoh: budi_santoso"
                    className={`form-input mt-1 w-full ${errors.username ? 'border-red-400' : ''}`}
                    disabled={loading || success} />
                  {errors.username && <p className="form-error">{errors.username}</p>}
                  <p className="text-xs text-gray-400 mt-1">3-50 karakter (huruf, angka, titik, garis bawah).</p>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="form-label">Email <span className="text-red-500">*</span></label>
                  <input id="email" name="email" type="email" value={form.email}
                    onChange={handleChange} placeholder="contoh@email.com"
                    className={`form-input mt-1 w-full ${errors.email ? 'border-red-400' : ''}`}
                    disabled={loading || success} />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="form-label">Password <span className="text-red-500">*</span></label>
                  <div className="relative mt-1">
                    <input id="password" name="password" type={showPass ? 'text' : 'password'}
                      value={form.password} onChange={handleChange} placeholder="Min. 8 karakter"
                      className={`form-input w-full pr-10 ${errors.password ? 'border-red-400' : ''}`}
                      disabled={loading || success} />
                    <button type="button" onClick={() => setShowPass((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 h-1.5">
                        {[1, 2, 3, 4].map((n) => (
                          <div key={n}
                            className={`flex-1 rounded-full transition-colors ${n <= pwdStrength.level ? pwdStrength.color : 'bg-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Kekuatan: <span className="font-medium">{pwdStrength.label}</span></p>
                    </div>
                  )}
                  {errors.password && <p className="form-error">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="form-label">Konfirmasi Password <span className="text-red-500">*</span></label>
                  <div className="relative mt-1">
                    <input id="confirmPassword" name="confirmPassword"
                      type={showConfirm ? 'text' : 'password'} value={form.confirmPassword}
                      onChange={handleChange} placeholder="Ulangi password"
                      className={`form-input w-full pr-10 ${errors.confirmPassword ? 'border-red-400' : ''}`}
                      disabled={loading || success} />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600" tabIndex={-1}>
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                </div>
              </div>
            </section>

            {/* ── Section 2: Data Diri ──────────────────────────────────── */}
            <section>
              <h2 className="section-title text-[#142B4A] border-b pb-2 mb-5">Data Diri</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Nama Lengkap */}
                <div className="sm:col-span-2">
                  <label htmlFor="nama_lengkap" className="form-label">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input id="nama_lengkap" name="nama_lengkap" type="text" value={form.nama_lengkap}
                    onChange={handleChange} placeholder="Sesuai KTP"
                    className={`form-input mt-1 w-full ${errors.nama_lengkap ? 'border-red-400' : ''}`}
                    disabled={loading || success} />
                  {errors.nama_lengkap && <p className="form-error">{errors.nama_lengkap}</p>}
                </div>

                {/* NIK */}
                <div>
                  <label htmlFor="nik" className="form-label">NIK (16 Digit) <span className="text-red-500">*</span></label>
                  <input id="nik" name="nik" type="text" inputMode="numeric"
                    value={form.nik} onChange={handleChange} placeholder="3271xxxxxxxxxxxxxx"
                    maxLength={16}
                    className={`form-input mt-1 w-full font-mono tracking-widest ${errors.nik ? 'border-red-400' : ''}`}
                    disabled={loading || success} />
                  <p className="text-xs text-gray-400 mt-1">{form.nik.length}/16 digit</p>
                  {errors.nik && <p className="form-error">{errors.nik}</p>}
                </div>

                {/* No. Telepon */}
                <div>
                  <label htmlFor="no_telepon" className="form-label">Nomor Telepon <span className="text-red-500">*</span></label>
                  <input id="no_telepon" name="no_telepon" type="tel" value={form.no_telepon}
                    onChange={handleChange} placeholder="08xxxxxxxxxx"
                    className={`form-input mt-1 w-full ${errors.no_telepon ? 'border-red-400' : ''}`}
                    disabled={loading || success} />
                  {errors.no_telepon && <p className="form-error">{errors.no_telepon}</p>}
                </div>

                {/* Alamat */}
                <div className="sm:col-span-2">
                  <label htmlFor="alamat" className="form-label">Alamat Lengkap <span className="text-red-500">*</span></label>
                  <textarea id="alamat" name="alamat" rows={3} value={form.alamat}
                    onChange={handleChange} placeholder="Jl. …, RT/RW …, Desa …"
                    className={`form-input mt-1 w-full resize-none ${errors.alamat ? 'border-red-400' : ''}`}
                    disabled={loading || success} />
                  {errors.alamat && <p className="form-error">{errors.alamat}</p>}
                </div>
              </div>
            </section>

            {/* ── Section 3: Pilih Desa ─────────────────────────────────── */}
            <section>
              <h2 className="section-title text-[#142B4A] border-b pb-2 mb-5">Pilih Desa</h2>
              <div>
                <label htmlFor="desa_id" className="form-label">
                  Desa Tempat Tinggal <span className="text-red-500">*</span>
                </label>
                <select id="desa_id" name="desa_id" value={form.desa_id}
                  onChange={handleChange}
                  className={`form-input mt-1 w-full ${errors.desa_id || desaError ? 'border-red-400' : ''}`}
                  disabled={loading || success || loadingDesa}>
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
                {errors.desa_id && <p className="form-error">{errors.desa_id}</p>}

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
                  Data desa diambil langsung dari database kecamatan.
                </p>
              </div>
            </section>

            {/* ── Actions ───────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button type="submit"
                className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 px-8"
                disabled={loading || success}>
                {loading ? (
                  <><Loader2 size={17} className="animate-spin" /> Mendaftarkan…</>
                ) : (
                  'Daftar Sekarang'
                )}
              </button>
              <p className="text-sm text-gray-500">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-[#142B4A] font-semibold hover:underline">Masuk di sini</Link>
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
