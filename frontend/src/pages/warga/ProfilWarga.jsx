import React, { useState, useEffect } from 'react';
import {
  User, ShieldCheck, AlertCircle, CheckCircle2,
  Save, Loader2, RefreshCw, Home, Phone, Calendar,
  CreditCard, MapPin, Briefcase, Heart, BookOpen
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/common/UIComponents';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';

export default function ProfilWarga() {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nik: '',
    no_kk: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    rt: '',
    rw: '',
    agama: '',
    status_perkawinan: '',
    pekerjaan: '',
    alamat: '',
    no_telepon: '',
  });

  const loadProfile = async () => {
    setFetching(true);
    setErrorMsg('');
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        const u = res.data;
        const pw = u.profil_warga || {};
        setUser(u);
        setFormData({
          nama_lengkap: u.nama_lengkap || '',
          nik: pw.nik || '',
          no_kk: pw.no_kk || '',
          tempat_lahir: pw.tempat_lahir || '',
          tanggal_lahir: pw.tanggal_lahir ? pw.tanggal_lahir.slice(0, 10) : '',
          jenis_kelamin: pw.jenis_kelamin || '',
          rt: pw.rt || '',
          rw: pw.rw || '',
          agama: pw.agama || '',
          status_perkawinan: pw.status_perkawinan || '',
          pekerjaan: pw.pekerjaan || '',
          alamat: pw.alamat || '',
          no_telepon: pw.no_telepon || '',
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Gagal memuat profil kependudukan.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
    setSuccessMsg('');
  };

  // Hitung field yang wajib untuk kelengkapan surat resmi
  const requiredFields = [
    { key: 'no_kk', label: 'Nomor Kartu Keluarga (KK)' },
    { key: 'tempat_lahir', label: 'Tempat Lahir' },
    { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
    { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
    { key: 'rt', label: 'RT' },
    { key: 'rw', label: 'RW' },
    { key: 'agama', label: 'Agama' },
    { key: 'status_perkawinan', label: 'Status Perkawinan' },
    { key: 'pekerjaan', label: 'Pekerjaan' },
  ];

  const completedCount = requiredFields.filter((f) => formData[f.key] && String(formData[f.key]).trim()).length;
  const completenessPercentage = Math.round((completedCount / requiredFields.length) * 100);
  const isProfileComplete = completenessPercentage === 100;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Validasi Nomor KK jika diisi
    if (formData.no_kk && !/^\d{16}$/.test(formData.no_kk.trim())) {
      setErrorMsg('Nomor Kartu Keluarga (KK) harus berupa 16 digit angka.');
      setLoading(false);
      return;
    }

    try {
      const res = await authService.updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Data kelengkapan profil kependudukan Anda berhasil disimpan.');
        // Segarkan data pengguna
        const meRes = await authService.getMe();
        if (meRes.success && meRes.data) {
          setUser(meRes.data);
          sessionStorage.setItem('auth_user', JSON.stringify(meRes.data));
        }
      } else {
        setErrorMsg(res.message || 'Gagal memperbarui profil.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat menyimpan profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Profil Kependudukan Warga"
        subtitle="Kelola dan lengkapi data identitas diri Anda untuk kemudahan penerbitan surat resmi desa"
      />

      {fetching ? (
        <div className="card flex items-center justify-center py-16 gap-3 text-gray-500">
          <Loader2 size={24} className="animate-spin" /> Memuat data kependudukan...
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Kartu Status Kelengkapan Profil */}
          <div className={`p-5 rounded-2xl border ${isProfileComplete ? 'bg-green-50/60 border-green-200' : 'bg-amber-50/60 border-amber-200'}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                {isProfileComplete ? (
                  <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
                ) : (
                  <AlertCircle size={24} className="text-amber-600 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-sm text-gray-900">
                    {isProfileComplete ? 'Profil Kependudukan Lengkap' : 'Kelengkapan Data Kependudukan'}
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {isProfileComplete
                      ? 'Seluruh data kependudukan Anda telah lengkap dan siap digunakan untuk pembuatan surat resmi.'
                      : 'Lengkapi data identitas di bawah ini agar permohonan surat keterangan dapat diproses tanpa kendala.'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-900'}`}>
                {completenessPercentage}% Lengkap ({completedCount}/{requiredFields.length} Data)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${isProfileComplete ? 'bg-green-600' : 'bg-amber-500'}`}
                style={{ width: `${completenessPercentage}%` }}
              />
            </div>

            {!isProfileComplete && (
              <div className="mt-3 pt-3 border-t border-amber-200/60 text-xs text-amber-900 flex flex-wrap gap-2 items-center">
                <span className="font-semibold">Perlu dilengkapi:</span>
                {requiredFields
                  .filter((f) => !formData[f.key] || !String(formData[f.key]).trim())
                  .map((f) => (
                    <span key={f.key} className="bg-white/80 border border-amber-200 text-amber-950 px-2 py-0.5 rounded text-[11px]">
                      {f.label}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Notifikasi Pesan */}
          {successMsg && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulir Kelengkapan Profil */}
          <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
            {/* Bagian 1: Identitas Pokok Akun */}
            <div>
              <h4 className="font-bold text-sm text-[#142B4A] border-b pb-2 mb-4 flex items-center gap-2">
                <User size={16} /> Identitas Pokok Akun
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-xs">Nama Lengkap Sesuai KTP <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    className="form-input text-xs"
                    placeholder="Nama lengkap pemohon"
                  />
                </div>

                <div>
                  <label className="form-label text-xs">
                    Nomor Induk Kependudukan (NIK)
                    <span className="ml-1.5 text-[10px] text-green-700 bg-green-50 border border-green-200 px-1.5 py-0.2 rounded font-semibold">
                      Terverifikasi
                    </span>
                  </label>
                  <input
                    type="text"
                    disabled
                    value={formData.nik}
                    className="form-input text-xs font-mono bg-gray-100 text-gray-600 cursor-not-allowed"
                    title="NIK terverifikasi sejak pendaftaran dan tidak dapat diubah secara mandiri. Hubungi Admin Desa jika ada koreksi."
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">NIK terikat pada basis data desa. Hubungi Admin Desa jika ada kekeliruan.</p>
                </div>
              </div>
            </div>

            {/* Bagian 2: Data Kependudukan Lengkap */}
            <div>
              <h4 className="font-bold text-sm text-[#142B4A] border-b pb-2 mb-4 flex items-center gap-2">
                <CreditCard size={16} /> Data Kependudukan &amp; Keluarga
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nomor Kartu Keluarga */}
                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Nomor Kartu Keluarga (KK)</label>
                    {!formData.no_kk && (
                      <span className="badge badge-red text-[10px]">Belum Lengkap</span>
                    )}
                  </div>
                  <input
                    type="text"
                    maxLength={16}
                    name="no_kk"
                    value={formData.no_kk}
                    onChange={handleChange}
                    placeholder="16 digit nomor KK (cth: 3201020304050001)"
                    className="form-input text-xs font-mono"
                  />
                  <p className="text-[10px] text-gray-400 mt-0.5">Tercantum di bagian atas lembar Kartu Keluarga Anda.</p>
                </div>

                {/* Tempat Lahir */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Tempat Lahir</label>
                    {!formData.tempat_lahir && (
                      <span className="badge badge-red text-[10px]">Belum Lengkap</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="tempat_lahir"
                    value={formData.tempat_lahir}
                    onChange={handleChange}
                    placeholder="Contoh: Sukamaju / Bandung"
                    className="form-input text-xs"
                  />
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Tanggal Lahir</label>
                    {!formData.tanggal_lahir && (
                      <span className="badge badge-red text-[10px]">Belum Lengkap</span>
                    )}
                  </div>
                  <input
                    type="date"
                    name="tanggal_lahir"
                    value={formData.tanggal_lahir}
                    onChange={handleChange}
                    className="form-input text-xs"
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Jenis Kelamin</label>
                    {!formData.jenis_kelamin && (
                      <span className="badge badge-red text-[10px]">Belum Lengkap</span>
                    )}
                  </div>
                  <select
                    name="jenis_kelamin"
                    value={formData.jenis_kelamin}
                    onChange={handleChange}
                    className="form-input text-xs"
                  >
                    <option value="">- Pilih Jenis Kelamin -</option>
                    <option value="L">Laki-Laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                {/* Agama */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Agama</label>
                    {!formData.agama && (
                      <span className="badge badge-red text-[10px]">Belum Lengkap</span>
                    )}
                  </div>
                  <select
                    name="agama"
                    value={formData.agama}
                    onChange={handleChange}
                    className="form-input text-xs"
                  >
                    <option value="">- Pilih Agama -</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Khonghucu">Khonghucu</option>
                  </select>
                </div>

                {/* Status Perkawinan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Status Perkawinan</label>
                    {!formData.status_perkawinan && (
                      <span className="badge badge-red text-[10px]">Belum Lengkap</span>
                    )}
                  </div>
                  <select
                    name="status_perkawinan"
                    value={formData.status_perkawinan}
                    onChange={handleChange}
                    className="form-input text-xs"
                  >
                    <option value="">- Pilih Status -</option>
                    <option value="Belum Kawin">Belum Kawin</option>
                    <option value="Kawin">Kawin</option>
                    <option value="Cerai Hidup">Cerai Hidup</option>
                    <option value="Cerai Mati">Cerai Mati</option>
                  </select>
                </div>

                {/* Pekerjaan */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Pekerjaan / Mata Pencaharian</label>
                    {!formData.pekerjaan && (
                      <span className="badge badge-red text-[10px]">Belum Lengkap</span>
                    )}
                  </div>
                  <input
                    type="text"
                    name="pekerjaan"
                    value={formData.pekerjaan}
                    onChange={handleChange}
                    placeholder="Contoh: Wiraswasta / Karyawan Swasta / Petani / Pelajar"
                    className="form-input text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Bagian 3: Domisili & Kontak */}
            <div>
              <h4 className="font-bold text-sm text-[#142B4A] border-b pb-2 mb-4 flex items-center gap-2">
                <Home size={16} /> Domisili &amp; Kontak Warga
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="form-label text-xs">Alamat Tempat Tinggal (Jalan / Dusun / Kampung)</label>
                  <textarea
                    rows={2}
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    placeholder="Alamat tempat tinggal lengkap..."
                    className="form-input text-xs resize-none"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Nomor RT</label>
                    {!formData.rt && <span className="badge badge-red text-[10px]">Belum Lengkap</span>}
                  </div>
                  <input
                    type="text"
                    maxLength={5}
                    name="rt"
                    value={formData.rt}
                    onChange={handleChange}
                    placeholder="Contoh: 01"
                    className="form-input text-xs"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label text-xs mb-0">Nomor RW</label>
                    {!formData.rw && <span className="badge badge-red text-[10px]">Belum Lengkap</span>}
                  </div>
                  <input
                    type="text"
                    maxLength={5}
                    name="rw"
                    value={formData.rw}
                    onChange={handleChange}
                    placeholder="Contoh: 02"
                    className="form-input text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="form-label text-xs">Nomor Telepon / WhatsApp Aktif</label>
                  <input
                    type="text"
                    name="no_telepon"
                    value={formData.no_telepon}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className="form-input text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Tombol Simpan */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 py-2 px-5 text-xs font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Menyimpan...
                  </>
                ) : (
                  <>
                    <Save size={16} /> Simpan Perubahan Profil
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
