import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, ArrowRight, ArrowLeft, CheckCircle2,
  AlertCircle, ShieldCheck, FileCheck, Loader2, RefreshCw,
  User, MapPin, Building, Info, AlertTriangle
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader } from '../../components/common/UIComponents';
import { useAuth } from '../../context/AuthContext';
import { getJenisSurat, submitPermohonan } from '../../services/permohonanService';
import { getLetterConfig } from '../../utils/letterFieldConfigs';
import { formatTanggal } from '../../utils/statusHelpers';

export default function AjukanSurat() {
  const { user } = useAuth();
  const profilWarga = user?.profil_warga || {};

  const [step, setStep] = useState(1);
  const [jenisSuratList, setJenisSuratList] = useState([]);
  const [loadingJenis, setLoadingJenis] = useState(true);
  const [errorJenis, setErrorJenis] = useState('');

  const [selectedSurat, setSelectedSurat] = useState(null);
  const [letterConfig, setLetterConfig] = useState({ fieldsKhusus: [] });

  // Data formulir
  const [keperluan, setKeperluan] = useState('');
  const [dataKhusus, setDataKhusus] = useState({});
  const [catatanPerbedaan, setCatatanPerbedaan] = useState('');
  const [files, setFiles] = useState({});
  const [fileErrors, setFileErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [createdNomor, setCreatedNomor] = useState('');

  const fetchJenisSurat = async () => {
    setLoadingJenis(true);
    setErrorJenis('');
    try {
      const res = await getJenisSurat();
      setJenisSuratList(res.data || []);
    } catch (err) {
      setErrorJenis(err.message || 'Gagal memuat daftar jenis surat.');
    } finally {
      setLoadingJenis(false);
    }
  };

  useEffect(() => { fetchJenisSurat(); }, []);

  const handleSelectSurat = (surat) => {
    setSelectedSurat(surat);
    const config = getLetterConfig(surat.kode_surat, surat.nama_surat);
    setLetterConfig(config);

    // Inisialisasi data khusus default
    const initialDataKhusus = {};
    if (config.fieldsKhusus) {
      config.fieldsKhusus.forEach((field) => {
        // Jika SKD dan field alamat_domisili, default isi dari alamat kependudukan profil
        if (field.name === 'alamat_domisili' && profilWarga.alamat) {
          initialDataKhusus[field.name] = profilWarga.alamat;
        } else {
          initialDataKhusus[field.name] = '';
        }
      });
    }

    setDataKhusus(initialDataKhusus);
    setKeperluan('');
    setCatatanPerbedaan('');
    setFiles({});
    setFileErrors({});
    setStep(2);
  };

  const handleDataKhususChange = (fieldName, val) => {
    setDataKhusus((prev) => ({ ...prev, [fieldName]: val }));
  };

  const handleFileChange = (reqId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFileErrors((prev) => ({ ...prev, [reqId]: 'Ukuran berkas melebihi batas 5 MB.' }));
      return;
    }
    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowed.includes(file.type)) {
      setFileErrors((prev) => ({ ...prev, [reqId]: 'Format berkas harus PDF, JPG, atau PNG.' }));
      return;
    }
    setFileErrors((prev) => ({ ...prev, [reqId]: '' }));
    setFiles((prev) => ({ ...prev, [reqId]: file }));
  };

  const handleNextToConfirmation = (e) => {
    e.preventDefault();

    // Validasi data khusus yang wajib
    for (const field of letterConfig.fieldsKhusus || []) {
      if (field.required && !dataKhusus[field.name]?.trim()) {
        alert(`Mohon lengkapi field data khusus: ${field.label}`);
        return;
      }
    }

    if (!keperluan.trim()) {
      alert('Mohon isi kolom tujuan / keperluan surat.');
      return;
    }

    const persyaratan = selectedSurat?.persyaratan || [];
    const missingWajib = persyaratan.filter((p) => p.wajib === 1 && !files[p.id_persyaratan]);
    if (missingWajib.length > 0) {
      alert(`Mohon lengkapi berkas persyaratan wajib: ${missingWajib.map((m) => m.nama_persyaratan).join(', ')}`);
      return;
    }

    setStep(3);
  };

  const handleSubmitFinal = async () => {
    setLoading(true);
    setSubmitError('');

    try {
      const formData = new FormData();
      formData.append('id_jenis_surat', selectedSurat.id_jenis_surat);
      formData.append('keperluan', keperluan.trim());

      // Gabungkan data khusus surat dan catatan perbedaan identitas (jika ada)
      const payloadDataKhusus = {
        ...dataKhusus,
        ...(catatanPerbedaan.trim() ? { catatan_perbedaan_identitas: catatanPerbedaan.trim() } : {}),
      };
      formData.append('data_khusus_surat', JSON.stringify(payloadDataKhusus));

      // Lampirkan berkas fisik persyaratan
      Object.entries(files).forEach(([reqId, file]) => {
        formData.append(`file_${reqId}`, file);
      });

      const res = await submitPermohonan(formData);
      setCreatedNomor(res.data?.nomor_permohonan || 'PMH-BARU');
      setStep(4);
    } catch (err) {
      setSubmitError(err.message || 'Gagal mengirim permohonan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Pengajuan Permohonan Surat"
        subtitle="Layanan pembuatan surat keterangan desa terintegrasi data kependudukan"
      />

      {step < 4 && (
        <div className="card mb-8 p-4">
          <div className="flex items-center justify-between max-w-xl mx-auto">
            {[1, 2, 3].map((n, i) => (
              <React.Fragment key={n}>
                <div className={`flex items-center gap-2 text-xs font-semibold ${step >= n ? 'text-[#142B4A]' : 'text-gray-400'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= n ? 'bg-[#142B4A] text-white' : 'bg-gray-200'}`}>{n}</span>
                  <span className="hidden sm:inline">{['Pilih Jenis Surat', 'Lengkapi Data & Berkas', 'Konfirmasi'][i]}</span>
                </div>
                {i < 2 && <div className={`h-0.5 flex-1 mx-2 sm:mx-4 ${step > n ? 'bg-[#142B4A]' : 'bg-gray-200'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* TAHAP 1: Pilih Jenis Surat */}
      {step === 1 && (
        <div>
          <h2 className="section-title mb-4">Pilih Jenis Surat Keterangan</h2>
          {loadingJenis ? (
            <div className="card flex items-center justify-center py-12 gap-3 text-gray-500">
              <Loader2 size={24} className="animate-spin" /> Memuat daftar jenis surat...
            </div>
          ) : errorJenis ? (
            <div className="card p-6 text-center">
              <p className="text-red-600 font-medium mb-3">{errorJenis}</p>
              <button onClick={fetchJenisSurat} className="btn-outline btn-sm inline-flex items-center gap-1.5">
                <RefreshCw size={14} /> Coba Lagi
              </button>
            </div>
          ) : jenisSuratList.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada jenis surat yang tersedia di desa Anda.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jenisSuratList.map((surat) => (
                <div
                  key={surat.id_jenis_surat}
                  onClick={() => handleSelectSurat(surat)}
                  className="card card-hover cursor-pointer border border-transparent hover:border-[#142B4A] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#142B4A] flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <span className="badge badge-navy font-mono text-xs">{surat.kode_surat}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-base mb-1">{surat.nama_surat}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">{surat.deskripsi}</p>
                  </div>
                  <div className="border-t pt-3 flex items-center justify-between text-xs font-semibold text-[#142B4A]">
                    <span>{surat.jumlah_persyaratan} Berkas Persyaratan</span>
                    <span className="flex items-center gap-1 text-accent font-bold">Pilih <ArrowRight size={14} /></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAHAP 2: Isi Data Tambahan, Keperluan & Unggah Berkas */}
      {step === 2 && selectedSurat && (
        <div className="max-w-3xl mx-auto space-y-6">
          <button onClick={() => setStep(1)} className="inline-flex items-center gap-1.5 text-xs text-[#142B4A] font-semibold hover:underline">
            <ArrowLeft size={14} /> Ganti Jenis Surat
          </button>

          {/* Kartu 1: Data Identitas Warga (Otomatis dari Database, Tidak Diminta Ulang) */}
          <div className="card p-5 bg-blue-50/40 border border-blue-200/80 rounded-2xl">
            <div className="flex items-center justify-between border-b border-blue-200/60 pb-3 mb-3">
              <div className="flex items-center gap-2">
                <User size={18} className="text-[#142B4A]" />
                <h3 className="font-bold text-sm text-[#142B4A]">Identitas Pemohon (Data Kependudukan Terdaftar)</h3>
              </div>
              <span className="text-[11px] bg-blue-100 text-[#142B4A] font-semibold px-2 py-0.5 rounded-full">
                Otomatis dari Akun
              </span>
            </div>

            <p className="text-[11px] text-gray-500 mb-3">
              Data identitas berikut diambil langsung dari basis data kependudukan desa dan akan dicantumkan pada surat resmi:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                <span className="text-gray-400 block text-[10px]">Nama Lengkap</span>
                <span className="font-bold text-gray-800">{user?.nama_lengkap || '—'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                <span className="text-gray-400 block text-[10px]">Nomor Induk Kependudukan (NIK)</span>
                <span className="font-mono font-bold text-[#142B4A]">{profilWarga?.nik || '—'}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                <span className="text-gray-400 block text-[10px]">Nomor Kartu Keluarga (KK)</span>
                <span className="font-mono text-gray-700">{profilWarga?.no_kk || <span className="text-gray-400 italic">(Belum tercatat di database)</span>}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                <span className="text-gray-400 block text-[10px]">Tempat & Tanggal Lahir</span>
                <span className="text-gray-700">
                  {profilWarga?.tempat_lahir || profilWarga?.tanggal_lahir
                    ? `${profilWarga?.tempat_lahir || '—'}, ${formatTanggal(profilWarga?.tanggal_lahir)}`
                    : <span className="text-gray-400 italic">(Belum tercatat di database)</span>}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                <span className="text-gray-400 block text-[10px]">Jenis Kelamin</span>
                <span className="text-gray-700">
                  {profilWarga?.jenis_kelamin === 'L' ? 'Laki-Laki' : profilWarga?.jenis_kelamin === 'P' ? 'Perempuan' : <span className="text-gray-400 italic">(Belum tercatat)</span>}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-200">
                <span className="text-gray-400 block text-[10px]">Pekerjaan</span>
                <span className="text-gray-700">{profilWarga?.pekerjaan || <span className="text-gray-400 italic">(Belum tercatat)</span>}</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-gray-200 sm:col-span-2">
                <span className="text-gray-400 block text-[10px]">Alamat Terdaftar di Desa</span>
                <span className="text-gray-700 font-medium">{profilWarga?.alamat || '—'}</span>
                {(profilWarga?.rt || profilWarga?.rw) && (
                  <span className="text-gray-500 text-[11px] block mt-0.5">RT {profilWarga?.rt || '—'} / RW {profilWarga?.rw || '—'}</span>
                )}
              </div>
            </div>
          </div>

          {/* Form Input Utama: Data Khusus & Berkas */}
          <div className="card p-6 md:p-8 space-y-6">
            <div className="border-b pb-4">
              <span className="text-xs text-gray-400 font-mono block">Formulir Pengajuan:</span>
              <h2 className="text-xl font-bold text-[#142B4A]">{selectedSurat.nama_surat}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{selectedSurat.deskripsi}</p>
            </div>

            <form onSubmit={handleNextToConfirmation} className="space-y-6">
              {/* Formulir Data Khusus Dinamis Sesuai Jenis Surat */}
              {letterConfig.fieldsKhusus && letterConfig.fieldsKhusus.length > 0 && (
                <div className="space-y-4 p-4 rounded-xl border border-amber-200/80 bg-amber-50/30">
                  <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/60 pb-2">
                    <Building size={16} />
                    <h4 className="font-bold text-xs">Informasi Khusus: {letterConfig.nama}</h4>
                  </div>

                  <div className="space-y-3">
                    {letterConfig.fieldsKhusus.map((f) => (
                      <div key={f.name}>
                        <label className="form-label text-xs">
                          {f.label} {f.required && <span className="text-red-500">*</span>}
                        </label>
                        {f.type === 'textarea' ? (
                          <textarea
                            rows={2}
                            required={f.required}
                            value={dataKhusus[f.name] || ''}
                            onChange={(e) => handleDataKhususChange(f.name, e.target.value)}
                            placeholder={f.placeholder}
                            className="form-input text-xs resize-none"
                          />
                        ) : (
                          <input
                            type={f.type || 'text'}
                            required={f.required}
                            value={dataKhusus[f.name] || ''}
                            onChange={(e) => handleDataKhususChange(f.name, e.target.value)}
                            placeholder={f.placeholder}
                            className="form-input text-xs"
                          />
                        )}
                        {f.helper && <p className="text-[10px] text-gray-400 mt-0.5">{f.helper}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Keperluan Surat */}
              <div>
                <label className="form-label">Tujuan / Keperluan Surat <span className="text-red-500">*</span></label>
                <textarea
                  rows={2}
                  required
                  value={keperluan}
                  onChange={(e) => setKeperluan(e.target.value)}
                  placeholder="Contoh: Untuk melengkapi persyaratan pendaftaran beasiswa perguruan tinggi / pengajuan kredit usaha..."
                  className="form-input text-xs resize-none"
                />
                <p className="text-[11px] text-gray-400 mt-1">Jelaskan maksud pembuatan surat dengan jelas.</p>
              </div>

              {/* Catatan Perbedaan Data dengan Berkas Fisik (Opsional untuk pemeriksaan admin) */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                <label className="form-label text-xs flex items-center gap-1.5 text-gray-700">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Catatan Perbedaan Identitas dengan Berkas Fisik (Opsional)
                </label>
                <textarea
                  rows={2}
                  value={catatanPerbedaan}
                  onChange={(e) => setCatatanPerbedaan(e.target.value)}
                  placeholder="Contoh: Alamat KTP belum diupdate karena mutasi baru, atau pekerjaan di KTP berbeda dengan saat ini..."
                  className="form-input text-xs resize-none bg-white"
                />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Informasi ini akan dicatat pada permohonan sebagai panduan verifikasi petugas desa saat mencocokkan dokumen fisik, tanpa mengubah profil kependudukan Anda secara otomatis.
                </p>
              </div>

              {/* Upload Berkas Persyaratan */}
              <div>
                <label className="form-label mb-2 block">Unggah Berkas Persyaratan <span className="text-red-500">*</span></label>
                <div className="space-y-3">
                  {(selectedSurat.persyaratan || []).map((req) => (
                    <div key={req.id_persyaratan} className="p-4 rounded-xl border border-gray-200 bg-bglight space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-gray-800">
                          {req.nama_persyaratan} {req.wajib === 1 && <span className="text-red-500">*</span>}
                        </span>
                        <span className={req.wajib === 1 ? 'badge badge-red text-[10px]' : 'badge badge-gray text-[10px]'}>
                          {req.wajib === 1 ? 'Wajib' : 'Opsional'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileChange(req.id_persyaratan, e)}
                          className="text-xs text-gray-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#142B4A] file:shadow-sm hover:file:bg-gray-100 cursor-pointer"
                        />
                        {files[req.id_persyaratan] && (
                          <span className="badge badge-green text-[10px] flex items-center gap-1">
                            <FileCheck size={12} /> {files[req.id_persyaratan].name}
                          </span>
                        )}
                      </div>
                      {fileErrors[req.id_persyaratan] && (
                        <p className="text-xs text-red-500">{fileErrors[req.id_persyaratan]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">Format berkas: <strong>PDF, JPG, PNG</strong>. Maksimal <strong>5 MB</strong> per berkas.</p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <button type="button" onClick={() => setStep(1)} className="btn-outline btn-sm">Kembali</button>
                <button type="submit" className="btn-primary btn-sm flex items-center gap-1.5">
                  Lanjut ke Konfirmasi <ArrowRight size={14} />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAHAP 3: Konfirmasi */}
      {step === 3 && selectedSurat && (
        <div className="max-w-2xl mx-auto">
          <div className="card p-6 md:p-8 space-y-6">
            <h2 className="text-xl font-bold text-[#142B4A]">Periksa Kembali Pengajuan Anda</h2>

            <div className="space-y-4 bg-bglight p-4 rounded-xl text-xs">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Jenis Surat:</span>
                <span className="font-bold text-gray-800">{selectedSurat.nama_surat}</span>
              </div>

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Pemohon (NIK):</span>
                <span className="font-semibold text-gray-800">{user?.nama_lengkap} ({profilWarga?.nik})</span>
              </div>

              {/* Ringkasan Data Khusus */}
              {Object.keys(dataKhusus).length > 0 && (
                <div className="border-b pb-2 space-y-1">
                  <span className="text-gray-500 block font-semibold">Data Khusus Surat:</span>
                  {Object.entries(dataKhusus).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-gray-700 pl-2">
                      <span className="capitalize">{k.replace(/_/g, ' ')}:</span>
                      <span className="font-medium text-gray-900 text-right max-w-xs">{v || '—'}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Keperluan Surat:</span>
                <span className="font-medium text-gray-800 max-w-xs text-right">{keperluan}</span>
              </div>

              {catatanPerbedaan && (
                <div className="border-b pb-2 text-amber-900 bg-amber-50 p-2 rounded">
                  <span className="font-semibold block mb-0.5">Catatan Perbedaan Identitas:</span>
                  <p>{catatanPerbedaan}</p>
                </div>
              )}

              <div className="pt-1">
                <span className="text-gray-500 block mb-1 font-semibold">Dokumen Persyaratan Terlampir:</span>
                <ul className="space-y-1">
                  {(selectedSurat.persyaratan || []).map((req) => (
                    <li key={req.id_persyaratan} className="flex justify-between text-gray-700">
                      <span>• {req.nama_persyaratan}</span>
                      <span className="font-mono text-gray-500">
                        {files[req.id_persyaratan] ? files[req.id_persyaratan].name : '(Tidak diunggah)'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-900 flex gap-2">
              <Info size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <span>Pastikan data dan dokumen yang Anda lampirkan sudah benar. Data akan diperiksa oleh petugas desa sebelum surat resmi diterbitkan.</span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <button type="button" onClick={() => setStep(2)} className="btn-outline btn-sm" disabled={loading}>Ubah Data</button>
              <button type="button" onClick={handleSubmitFinal} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <><Loader2 size={16} className="animate-spin" /> Mengirim Pengajuan…</> : <><ShieldCheck size={16} /> Kirim Permohonan Sekarang</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAHAP 4: Sukses */}
      {step === 4 && (
        <div className="max-w-md mx-auto text-center py-6">
          <div className="card p-8 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-4">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold text-[#142B4A] mb-2">Permohonan Berhasil Dikirim!</h2>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Surat permohonan Anda telah berhasil didaftarkan dan data kependudukan telah terhubung ke antrean verifikasi desa.
            </p>
            <div className="w-full bg-bglight p-4 rounded-xl border border-gray-100 mb-6">
              <span className="text-xs text-gray-400 block mb-0.5">Nomor Permohonan Anda:</span>
              <span className="font-mono text-xl font-extrabold text-[#142B4A] tracking-wider">{createdNomor}</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Link to="/warga/permohonan" className="btn-primary w-full justify-center">Lihat Status Permohonan</Link>
              <Link to="/warga/dashboard" className="btn-outline w-full justify-center">Kembali ke Beranda</Link>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
