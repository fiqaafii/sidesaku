import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Search, Filter, Clock, Eye, User, Calendar,
  FileCheck, Check, Loader2, RefreshCw, Printer, Download, X, Send
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader, Modal, EmptyState } from '../../components/common/UIComponents';
import { StatusBadge, formatTanggal, formatTanggalWaktu } from '../../utils/statusHelpers';
import {
  getPermohonanDesa,
  getPermohonanDetail,
  updateStatusPermohonan,
  getDokumenDownloadUrl,
  downloadSuratPDF,
  terbitkanSuratSKD,
  terbitkanSurat,
} from '../../services/permohonanService';

export default function DaftarPermohonan() {
  const [permohonanList, setPermohonanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('semua');
  const [toastMsg, setToastMsg] = useState('');
  const [toastError, setToastError] = useState('');

  // Modal detail
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form update status
  const [newStatus, setNewStatus] = useState('');
  const [catatanAdmin, setCatatanAdmin] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [publishingSkd, setPublishingSkd] = useState(false);
  const [loadingPdfId, setLoadingPdfId] = useState(null);

  const showToast = (msg, isError = false) => {
    if (isError) {
      setToastError(msg);
      setTimeout(() => setToastError(''), 4000);
    } else {
      setToastMsg(msg);
      setTimeout(() => setToastMsg(''), 4000);
    }
  };

  const fetchPermohonan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPermohonanDesa({ status: filterStatus, search });
      setPermohonanList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar permohonan.');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchPermohonan(); }, 400);
    return () => clearTimeout(timer);
  }, [fetchPermohonan]);

  const openDetailModal = async (item) => {
    setSelectedItem(item);
    setNewStatus(item.status);
    setCatatanAdmin(item.catatan_admin || '');
    setDetail(null);
    setModalOpen(true);
    setLoadingDetail(true);
    try {
      const res = await getPermohonanDetail(item.id_permohonan);
      setDetail(res.data);
    } catch (err) {
      console.error('Gagal memuat detail:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    if ((newStatus === 'ditolak' || newStatus === 'perlu_perbaikan') && !catatanAdmin.trim()) {
      showToast('Catatan wajib diisi untuk status ditolak atau perlu perbaikan.', true);
      return;
    }
    setSavingStatus(true);
    try {
      await updateStatusPermohonan(selectedItem.id_permohonan, {
        status: newStatus,
        catatan_admin: catatanAdmin,
      });
      showToast(`Status ${selectedItem.nomor_permohonan} diperbarui menjadi "${newStatus}".`);
      setModalOpen(false);
      fetchPermohonan();
    } catch (err) {
      showToast(err.message || 'Gagal memperbarui status.', true);
    } finally {
      setSavingStatus(false);
    }
  };

  const handleTerbitkanSurat = async () => {
    if (!selectedItem) return;
    const namaSurat = selectedItem.nama_surat || 'Surat';
    if (!window.confirm(`Terbitkan ${namaSurat} untuk ${selectedItem.nama_warga}?\n\nNomor surat akan digenerate otomatis dan PDF akan disimpan sebagai arsip resmi.`)) return;
    setPublishingSkd(true);
    try {
      const res = await terbitkanSurat(selectedItem.id_permohonan);
      const nomorSurat = res.data?.nomor_surat || '';
      showToast(`${namaSurat} berhasil diterbitkan! Nomor: ${nomorSurat}`);
      setModalOpen(false);
      fetchPermohonan();
    } catch (err) {
      const missingFields = err.data?.missing_fields;
      if (missingFields && missingFields.length > 0) {
        showToast(`Data tidak lengkap: ${missingFields.join(', ')}. Lengkapi data di halaman Profil Desa.`, true);
      } else {
        showToast(err.message || 'Gagal menerbitkan surat.', true);
      }
    } finally {
      setPublishingSkd(false);
    }
  };

  const handleTerbitkanSKD = handleTerbitkanSurat;

  const handleDownloadPdf = async (idPermohonan, filename) => {
    setLoadingPdfId(idPermohonan);
    try {
      await downloadSuratPDF(idPermohonan, { openInNewTab: true, filename });
    } catch (err) {
      showToast(err.message || 'Gagal membuka surat PDF.', true);
    } finally {
      setLoadingPdfId(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Daftar Permohonan Surat"
        subtitle="Verifikasi berkas persyaratan dan tindak lanjuti permohonan warga desa"
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

      <div className="card mb-6 p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no. permohonan, warga, NIK..."
              className="form-input pl-9 pr-4 py-2 text-sm w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input py-2 text-sm w-full sm:w-48"
            >
              <option value="semua">Semua Status</option>
              <option value="diajukan">Diajukan</option>
              <option value="diproses">Sedang Diproses</option>
              <option value="perlu_perbaikan">Perlu Perbaikan</option>
              <option value="disetujui">Disetujui</option>
              <option value="ditolak">Ditolak</option>
              <option value="selesai">Selesai</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 whitespace-nowrap">
            Menampilkan <strong>{permohonanList.length}</strong> permohonan
          </span>
          <button onClick={fetchPermohonan} className="btn-outline btn-sm p-1.5" title="Muat ulang">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" /> Memuat permohonan...
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button onClick={fetchPermohonan} className="btn-outline btn-sm inline-flex items-center gap-1.5">
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      ) : permohonanList.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="Tidak ada permohonan yang sesuai"
            desc="Coba ubah filter status atau kata kunci pencarian Anda."
          />
        </div>
      ) : (
        <div className="table-wrapper bg-white shadow-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. Permohonan</th>
                <th>Pemohon</th>
                <th>Jenis Surat</th>
                <th>Tanggal Pengajuan</th>
                <th>Keperluan</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {permohonanList.map((item) => (
                <tr key={item.id_permohonan}>
                  <td className="font-mono text-xs font-semibold text-[#142B4A]">{item.nomor_permohonan}</td>
                  <td className="font-medium text-gray-800">{item.nama_warga}</td>
                  <td className="text-gray-700">{item.nama_surat}</td>
                  <td className="text-gray-500 text-xs">{formatTanggal(item.tanggal_pengajuan)}</td>
                  <td className="text-gray-600 text-xs max-w-xs truncate">{item.keperluan}</td>
                  <td><StatusBadge status={item.status} /></td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openDetailModal(item)}
                        className="btn-primary btn-sm flex items-center gap-1.5"
                      >
                        <Eye size={13} /> Periksa
                      </button>
                      {(item.status === 'disetujui' || item.status === 'selesai') && (
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(item.id_permohonan, `Surat-${item.nomor_permohonan}.pdf`)}
                          disabled={loadingPdfId === item.id_permohonan}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 border border-green-200 transition-colors disabled:opacity-60"
                          title="Lihat / Cetak Surat PDF"
                        >
                          {loadingPdfId === item.id_permohonan ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />} PDF
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail & Pemeriksaan Permohonan */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedItem ? `Pemeriksaan: ${selectedItem.nomor_permohonan}` : ''}
      >
        {selectedItem && (
          <div className="space-y-5 text-sm">
            {/* Info Pemohon & Data Kependudukan Terintegrasi */}
            <div className="bg-bglight p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <span className="text-xs text-gray-500 block">Pemohon:</span>
                  <span className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <User size={15} className="text-[#142B4A]" /> {selectedItem.nama_warga}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-500 block">Jenis Surat:</span>
                  <span className="badge badge-navy text-xs">{selectedItem.nama_surat}</span>
                </div>
              </div>

              {/* Data Kependudukan dari Database */}
              <div>
                <p className="text-[11px] font-bold text-[#142B4A] uppercase tracking-wider mb-1.5">
                  Data Kependudukan (Tabel Warga)
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-gray-100">
                  <div>
                    <span className="text-gray-400 block text-[10px]">NIK:</span>
                    <span className="font-mono font-bold text-gray-800">{detail?.nik || selectedItem.nik || '—'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Nomor KK:</span>
                    <span className="font-mono text-gray-700">{detail?.no_kk || <span className="text-gray-400 italic">(Belum tercatat)</span>}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Tempat, Tgl Lahir:</span>
                    <span className="text-gray-700">
                      {detail?.tempat_lahir || detail?.tanggal_lahir
                        ? `${detail?.tempat_lahir || '—'}, ${formatTanggal(detail?.tanggal_lahir)}`
                        : <span className="text-gray-400 italic">(Belum tercatat)</span>}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Jenis Kelamin:</span>
                    <span className="text-gray-700">
                      {detail?.jenis_kelamin === 'L' ? 'Laki-Laki' : detail?.jenis_kelamin === 'P' ? 'Perempuan' : <span className="text-gray-400 italic">(Belum tercatat)</span>}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Agama / Status Kawin:</span>
                    <span className="text-gray-700">
                      {detail?.agama || '—'} / {detail?.status_perkawinan || '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Pekerjaan:</span>
                    <span className="text-gray-700">{detail?.pekerjaan || <span className="text-gray-400 italic">(Belum tercatat)</span>}</span>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-gray-100">
                    <span className="text-gray-400 block text-[10px]">Alamat Domisili KTP:</span>
                    <span className="text-gray-800">{detail?.alamat || '—'} {(detail?.rt || detail?.rw) && `(RT ${detail?.rt || '—'} / RW ${detail?.rw || '—'})`}</span>
                  </div>
                </div>
              </div>

              {/* Data Khusus Surat (SKU / SKD / SP) */}
              {detail?.data_khusus_surat && Object.keys(detail.data_khusus_surat).filter(k => k !== 'catatan_perbedaan_identitas').length > 0 && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/40 space-y-1.5 text-xs">
                  <p className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                    Data Khusus Surat ({selectedItem.nama_surat})
                  </p>
                  <div className="space-y-1 bg-white p-2.5 rounded border border-amber-100">
                    {Object.entries(detail.data_khusus_surat)
                      .filter(([k]) => k !== 'catatan_perbedaan_identitas')
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between text-gray-700">
                          <span className="capitalize font-medium text-gray-500">{k.replace(/_/g, ' ')}:</span>
                          <span className="font-bold text-gray-900 text-right max-w-xs">{String(v || '—')}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Catatan Perbedaan Identitas (Jika Pemohon Mengisi) */}
              {detail?.data_khusus_surat?.catatan_perbedaan_identitas && (
                <div className="p-3 rounded-lg border border-yellow-300 bg-yellow-50 text-xs space-y-1">
                  <span className="font-bold text-yellow-900 flex items-center gap-1.5">
                    Perhatian Verifikator: Catatan Perbedaan Identitas
                  </span>
                  <p className="text-yellow-800 leading-relaxed bg-white p-2 rounded border border-yellow-200">
                    "{detail.data_khusus_surat.catatan_perbedaan_identitas}"
                  </p>
                  <p className="text-[10px] text-yellow-700 italic">
                    * Catatan ini ditujukan untuk verifikasi berkas fisik. Profil warga di database tidak berubah secara otomatis.
                  </p>
                </div>
              )}

              {/* Keperluan Surat */}
              <div className="border-t pt-2">
                <p className="text-xs text-gray-500 mb-1">Maksud / Keperluan Permohonan:</p>
                <p className="text-xs text-gray-800 bg-white p-2.5 rounded-lg border border-gray-100 font-medium">
                  {selectedItem.keperluan || '—'}
                </p>
              </div>
            </div>

            {/* Dokumen Persyaratan */}
            <div>
              <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                <FileCheck size={16} className="text-primary" /> Dokumen Persyaratan Terunggah
              </p>
              {loadingDetail ? (
                <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                  <Loader2 size={14} className="animate-spin" /> Memuat dokumen...
                </div>
              ) : (detail?.dokumen || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic">Tidak ada dokumen yang diunggah.</p>
              ) : (
                <div className="space-y-2">
                  {(detail?.dokumen || []).map((dok) => (
                    <div key={dok.id_dokumen} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 bg-white text-xs">
                      <div>
                        <span className="font-medium text-gray-700">{dok.nama_persyaratan || dok.nama_file}</span>
                        <span className="text-gray-400 block">{dok.nama_file} · {dok.tipe_file}</span>
                      </div>
                      <a
                        href={getDokumenDownloadUrl(dok.id_dokumen)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium"
                      >
                        <Download size={12} /> Unduh
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Riwayat Status */}
            {!loadingDetail && detail?.riwayat && detail.riwayat.length > 0 && (
              <div className="border-t pt-4">
                <p className="font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Clock size={15} className="text-gray-400" /> Riwayat Status
                </p>
                <div className="space-y-2 max-h-32 overflow-y-auto text-xs pr-1">
                  {detail.riwayat.map((r) => (
                    <div key={r.id_riwayat} className="p-2 rounded bg-bglight border border-gray-100 flex flex-col gap-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-[#142B4A]">{r.diubah_oleh || '—'}</span>
                        <span className="text-gray-400">{formatTanggalWaktu(r.tanggal_perubahan)}</span>
                      </div>
                      <p className="text-gray-600">{r.keterangan}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Update Status */}
            <form onSubmit={handleUpdateStatus} className="border-t pt-4 space-y-3">
              <div>
                <label className="form-label">Perbarui Status Permohonan *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-input"
                >
                  <option value="diajukan">Diajukan</option>
                  <option value="diproses">Sedang Diproses</option>
                  <option value="perlu_perbaikan">Perlu Perbaikan</option>
                  <option value="disetujui">Disetujui / Siap Diambil</option>
                  <option value="selesai">Selesai (Sudah Diterima Warga)</option>
                  <option value="ditolak">Ditolak</option>
                </select>
              </div>
              <div>
                <label className="form-label">
                  Catatan untuk Warga
                  {(newStatus === 'ditolak' || newStatus === 'perlu_perbaikan') && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <textarea
                  rows={3}
                  value={catatanAdmin}
                  onChange={(e) => setCatatanAdmin(e.target.value)}
                  placeholder="Contoh: Lampiran KTP buram, mohon unggah ulang foto yang jelas..."
                  className="form-input resize-none"
                />
              </div>
              <div className="flex justify-between items-center pt-3 border-t gap-2 flex-wrap">
                {/* Tombol Terbitkan Surat Resmi (hanya untuk surat yang disetujui, belum selesai) */}
                {selectedItem?.status === 'disetujui' && (
                  <button
                    type="button"
                    onClick={handleTerbitkanSurat}
                    disabled={publishingSkd}
                    className="btn-sm flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs transition-colors disabled:opacity-60"
                    title="Terbitkan & simpan surat sebagai arsip resmi"
                  >
                    {publishingSkd ? (
                      <><Loader2 size={13} className="animate-spin" /> Menerbitkan...</>
                    ) : (
                      <><Send size={13} /> Terbitkan {selectedItem?.kode_surat?.toUpperCase().startsWith('SKD') ? 'Surat SKD' : selectedItem?.kode_surat?.toUpperCase().startsWith('SKU') ? 'Surat SKU' : selectedItem?.kode_surat?.toUpperCase().startsWith('SKTM') ? 'Surat SKTM' : selectedItem?.kode_surat?.toUpperCase().startsWith('SP') ? 'Surat Pengantar' : 'Surat Resmi'}</>
                    )}
                  </button>
                )}
                {/* Tombol Unduh PDF Arsip (untuk yang sudah selesai) */}
                {(selectedItem?.status === 'disetujui' || selectedItem?.status === 'selesai') && (
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(selectedItem.id_permohonan, `Surat-${selectedItem.nomor_surat || selectedItem.nomor_permohonan}.pdf`)}
                    disabled={loadingPdfId === selectedItem.id_permohonan}
                    className="btn-outline btn-sm flex items-center gap-1.5 text-green-700 border-green-300 hover:bg-green-50 disabled:opacity-60"
                  >
                    {loadingPdfId === selectedItem.id_permohonan ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />} {selectedItem?.status === 'selesai' ? 'Unduh PDF Arsip' : 'Pratinjau PDF'}
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-outline btn-sm">
                    Tutup
                  </button>
                  <button
                    type="submit"
                    className="btn-primary btn-sm flex items-center gap-1.5"
                    disabled={savingStatus}
                  >
                    {savingStatus ? (
                      <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                    ) : 'Simpan Perubahan'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </AppLayout>
  );
}
