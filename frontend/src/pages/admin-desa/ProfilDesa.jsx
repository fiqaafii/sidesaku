import React, { useState, useEffect } from 'react';
import {
  Building2, Save, Loader2, Check, X, AlertTriangle, RefreshCw, MapPin, Phone, Mail, User, Briefcase
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/common/UIComponents';
import { getProfilDesa, updateProfilDesa } from '../../services/profilDesaService';

export default function ProfilDesa() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState('');

  // Data desa (read-only dari DB)
  const [desaInfo, setDesaInfo] = useState(null);

  // Form fields (editable)
  const [form, setForm] = useState({
    nama_kabupaten: '',
    nama_kepala_desa: '',
    jabatan_pejabat: '',
    alamat_kantor: '',
    telepon: '',
    email: '',
  });

  const showToast = (msg, isError = false) => {
    if (isError) {
      setToastError(msg);
      setTimeout(() => setToastError(''), 5000);
    } else {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const fetchProfil = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProfilDesa();
      const d = res.data;
      setDesaInfo(d);
      setForm({
        nama_kabupaten: d.nama_kabupaten || '',
        nama_kepala_desa: d.nama_kepala_desa || '',
        jabatan_pejabat: d.jabatan_pejabat || '',
        alamat_kantor: d.alamat_kantor || '',
        telepon: d.telepon || '',
        email: d.email || '',
      });
    } catch (err) {
      setError(err.message || 'Gagal memuat profil desa.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfil(); }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validasi minimal
    if (!form.nama_kabupaten.trim()) { showToast('Nama kabupaten wajib diisi.', true); return; }
    if (!form.nama_kepala_desa.trim()) { showToast('Nama kepala desa wajib diisi.', true); return; }
    if (!form.jabatan_pejabat.trim()) { showToast('Jabatan pejabat wajib diisi.', true); return; }

    setSaving(true);
    try {
      await updateProfilDesa({
        nama_kabupaten: form.nama_kabupaten.trim(),
        nama_kepala_desa: form.nama_kepala_desa.trim(),
        jabatan_pejabat: form.jabatan_pejabat.trim(),
        alamat_kantor: form.alamat_kantor.trim(),
        telepon: form.telepon.trim(),
        email: form.email.trim(),
      });
      showToast('Profil desa berhasil diperbarui.');
      fetchProfil(); // Refresh
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui profil desa.', true);
    } finally {
      setSaving(false);
    }
  };

  // Hitung kelengkapan untuk penerbitan surat
  const requiredForSurat = ['nama_kabupaten', 'nama_kepala_desa', 'jabatan_pejabat'];
  const filledForSurat = requiredForSurat.filter((k) => form[k]?.trim());
  const suratReady = filledForSurat.length === requiredForSurat.length;

  return (
    <AppLayout>
      <PageHeader
        title="Profil Desa"
        subtitle="Kelola informasi administrasi desa yang digunakan pada surat resmi"
      />

      {toastMsg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2">
          <Check size={16} /> {toastMsg}
        </div>
      )}
      {toastError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2">
          <X size={16} /> {toastError}
        </div>
      )}

      {loading ? (
        <div className="card flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" /> Memuat profil desa...
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button onClick={fetchProfil} className="btn-outline btn-sm inline-flex items-center gap-1.5">
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Informasi identitas desa (read-only) */}
          <div className="card p-5">
            <h3 className="text-sm font-bold text-[#142B4A] mb-3 flex items-center gap-2">
              <Building2 size={16} /> Identitas Desa
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-400 block">Nama Desa</span>
                <span className="font-semibold text-gray-800">{desaInfo?.nama_desa || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Kode Desa</span>
                <span className="font-mono text-gray-700">{desaInfo?.kode_desa || '—'}</span>
              </div>
              <div>
                <span className="text-xs text-gray-400 block">Kecamatan</span>
                <span className="text-gray-700">{desaInfo?.nama_kecamatan || '—'}</span>
              </div>
            </div>
          </div>

          {/* Kelengkapan data untuk surat */}
          <div className={`card p-4 border-l-4 ${suratReady ? 'border-l-green-500 bg-green-50/50' : 'border-l-amber-500 bg-amber-50/50'}`}>
            <div className="flex items-start gap-3">
              {suratReady ? (
                <Check size={18} className="text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle size={18} className="text-amber-600 mt-0.5" />
              )}
              <div>
                <p className={`text-sm font-semibold ${suratReady ? 'text-green-800' : 'text-amber-800'}`}>
                  {suratReady
                    ? 'Data desa lengkap — Siap menerbitkan surat resmi'
                    : `Data desa belum lengkap (${filledForSurat.length}/${requiredForSurat.length})`}
                </p>
                {!suratReady && (
                  <p className="text-xs text-amber-700 mt-1">
                    Lengkapi <strong>Nama Kabupaten</strong>, <strong>Nama Kepala Desa</strong>, dan <strong>Jabatan Pejabat</strong> agar surat resmi dapat diterbitkan.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form edit profil desa */}
          <form onSubmit={handleSubmit} className="card p-5 space-y-5">
            <h3 className="text-sm font-bold text-[#142B4A] mb-1">Data Administrasi Desa</h3>
            <p className="text-xs text-gray-500 -mt-3 mb-2">
              Data berikut akan digunakan pada kop surat dan tanda tangan surat resmi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nama Kabupaten */}
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  Nama Kabupaten / Kota <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_kabupaten"
                  value={form.nama_kabupaten}
                  onChange={handleChange}
                  placeholder="Contoh: Kabupaten Sukamaju"
                  className="form-input"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">Ditampilkan pada kop surat resmi.</p>
              </div>

              {/* Nama Kepala Desa */}
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <User size={13} className="text-gray-400" />
                  Nama Kepala Desa <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_kepala_desa"
                  value={form.nama_kepala_desa}
                  onChange={handleChange}
                  placeholder="Contoh: Joko Santoso"
                  className="form-input"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">Nama pejabat yang tertera pada tanda tangan surat.</p>
              </div>

              {/* Jabatan Pejabat */}
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <Briefcase size={13} className="text-gray-400" />
                  Jabatan Pejabat <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jabatan_pejabat"
                  value={form.jabatan_pejabat}
                  onChange={handleChange}
                  placeholder="Contoh: Kepala Desa"
                  className="form-input"
                  required
                />
                <p className="text-[10px] text-gray-400 mt-1">Jabatan yang ditampilkan pada blok tanda tangan.</p>
              </div>

              {/* Alamat Kantor */}
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  Alamat Kantor Desa
                </label>
                <input
                  type="text"
                  name="alamat_kantor"
                  value={form.alamat_kantor}
                  onChange={handleChange}
                  placeholder="Contoh: Jalan Raya Desa No. 1"
                  className="form-input"
                />
              </div>

              {/* Telepon */}
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <Phone size={13} className="text-gray-400" />
                  Telepon Kantor
                </label>
                <input
                  type="text"
                  name="telepon"
                  value={form.telepon}
                  onChange={handleChange}
                  placeholder="Contoh: (021) 1234567"
                  className="form-input"
                />
              </div>

              {/* Email */}
              <div>
                <label className="form-label flex items-center gap-1.5">
                  <Mail size={13} className="text-gray-400" />
                  Email Kantor
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Contoh: desa@example.go.id"
                  className="form-input"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                {saving ? (
                  <><Loader2 size={16} className="animate-spin" /> Menyimpan...</>
                ) : (
                  <><Save size={16} /> Simpan Perubahan</>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
}
