import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText, Plus, Edit2, ListChecks, Search,
  Trash2, Loader2, RefreshCw, Check, X
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader, Modal, EmptyState } from '../../components/common/UIComponents';
import {
  getJenisSuratAdmin, createJenisSurat, updateJenisSurat,
  addPersyaratan, deletePersyaratan,
} from '../../services/adminDesaService';

export default function ManajemenSurat() {
  const [suratList, setSuratList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  // Modal tambah/edit surat
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSurat, setEditingSurat] = useState(null);
  const [savingSurat, setSavingSurat] = useState(false);
  const [form, setForm] = useState({
    nama_surat: '', kode_surat: '', deskripsi: '', status: 'aktif',
  });

  // Modal kelola persyaratan
  const [persyaratanModalOpen, setPersyaratanModalOpen] = useState(false);
  const [selectedSuratForReq, setSelectedSuratForReq] = useState(null);
  const [newReqName, setNewReqName] = useState('');
  const [newReqWajib, setNewReqWajib] = useState(true);
  const [savingReq, setSavingReq] = useState(false);
  const [deletingReqId, setDeletingReqId] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const fetchSurat = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getJenisSuratAdmin();
      setSuratList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar jenis surat.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSurat(); }, [fetchSurat]);

  const filteredSurat = suratList.filter(
    (s) =>
      s.nama_surat.toLowerCase().includes(search.toLowerCase()) ||
      s.kode_surat.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingSurat(null);
    setForm({ nama_surat: '', kode_surat: '', deskripsi: '', status: 'aktif' });
    setModalOpen(true);
  };

  const openEditModal = (surat) => {
    setEditingSurat(surat);
    setForm({
      nama_surat: surat.nama_surat,
      kode_surat: surat.kode_surat,
      deskripsi: surat.deskripsi || '',
      status: surat.status || 'aktif',
    });
    setModalOpen(true);
  };

  const handleSaveSurat = async (e) => {
    e.preventDefault();
    if (!form.nama_surat.trim() || !form.kode_surat.trim()) return;
    setSavingSurat(true);
    try {
      if (editingSurat) {
        await updateJenisSurat(editingSurat.id_jenis_surat, form);
        showToast('Jenis surat berhasil diperbarui.');
      } else {
        await createJenisSurat(form);
        showToast('Jenis surat baru berhasil ditambahkan.');
      }
      setModalOpen(false);
      fetchSurat();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan jenis surat.', 'error');
    } finally {
      setSavingSurat(false);
    }
  };

  const openPersyaratanModal = (surat) => {
    setSelectedSuratForReq(surat);
    setNewReqName('');
    setNewReqWajib(true);
    setPersyaratanModalOpen(true);
  };

  // Selalu baca persyaratan terbaru dari suratList
  const currentPersyaratan =
    suratList.find((s) => s.id_jenis_surat === selectedSuratForReq?.id_jenis_surat)?.persyaratan || [];

  const handleAddPersyaratan = async (e) => {
    e.preventDefault();
    if (!newReqName.trim()) return;
    setSavingReq(true);
    try {
      await addPersyaratan(selectedSuratForReq.id_jenis_surat, {
        nama_persyaratan: newReqName.trim(),
        wajib: newReqWajib,
        format_file: 'PDF, JPG, PNG',
      });
      showToast('Persyaratan berhasil ditambahkan.');
      setNewReqName('');
      setNewReqWajib(true);
      await fetchSurat();
    } catch (err) {
      showToast(err.message || 'Gagal menambah persyaratan.', 'error');
    } finally {
      setSavingReq(false);
    }
  };

  const handleDeletePersyaratan = async (id) => {
    if (!window.confirm('Hapus persyaratan ini?')) return;
    setDeletingReqId(id);
    try {
      await deletePersyaratan(id);
      showToast('Persyaratan berhasil dihapus.');
      await fetchSurat();
    } catch (err) {
      showToast(err.message || 'Gagal menghapus persyaratan.', 'error');
    } finally {
      setDeletingReqId(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Kelola Jenis Surat Desa"
        subtitle="Daftar jenis surat keterangan yang dapat dimohon oleh warga desa Anda"
        action={
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Tambah Jenis Surat
          </button>
        }
      />

      {toast.msg && (
        <div className={`mb-4 text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 ${
          toast.type === 'error'
            ? 'bg-red-50 border border-red-200 text-red-800'
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          {toast.type === 'error' ? <X size={16} /> : <Check size={16} />} {toast.msg}
        </div>
      )}

      <div className="card mb-6 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau kode surat..."
            className="form-input pl-9 pr-4 py-2 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Total <strong>{filteredSurat.length}</strong> jenis surat
          </span>
          <button onClick={fetchSurat} className="btn-outline btn-sm p-1.5" title="Muat ulang">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 size={24} className="animate-spin" /> Memuat...
        </div>
      ) : error ? (
        <div className="card p-6 text-center">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button onClick={fetchSurat} className="btn-outline btn-sm inline-flex items-center gap-1.5">
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      ) : filteredSurat.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={FileText}
            title="Tidak ada jenis surat"
            desc="Tambahkan jenis surat baru untuk desa Anda."
          />
        </div>
      ) : (
        <div className="table-wrapper bg-white shadow-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Jenis Surat</th>
                <th>Kode</th>
                <th>Deskripsi</th>
                <th>Syarat Dokumen</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSurat.map((surat, idx) => (
                <tr key={surat.id_jenis_surat}>
                  <td className="text-center text-gray-400">{idx + 1}</td>
                  <td className="font-semibold text-gray-800">{surat.nama_surat}</td>
                  <td className="font-mono text-xs text-blue-900">{surat.kode_surat}</td>
                  <td className="text-gray-600 text-xs max-w-xs truncate">{surat.deskripsi || '—'}</td>
                  <td>
                    <button
                      onClick={() => openPersyaratanModal(surat)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      <ListChecks size={13} />
                      <span>{surat.jumlah_persyaratan} Syarat</span>
                    </button>
                  </td>
                  <td>
                    <span className={surat.status === 'aktif' ? 'badge badge-green' : 'badge badge-gray'}>
                      {surat.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openEditModal(surat)}
                      className="btn-outline btn-sm flex items-center gap-1.5"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Tambah/Edit Jenis Surat */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSurat ? `Edit ${editingSurat.nama_surat}` : 'Tambah Jenis Surat'}
      >
        <form onSubmit={handleSaveSurat} className="space-y-4">
          <div>
            <label className="form-label">Nama Jenis Surat *</label>
            <input
              type="text"
              required
              value={form.nama_surat}
              onChange={(e) => setForm({ ...form, nama_surat: e.target.value })}
              placeholder="Contoh: Surat Keterangan Usaha (SKU)"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Kode Singkat Surat *</label>
            <input
              type="text"
              required
              value={form.kode_surat}
              onChange={(e) => setForm({ ...form, kode_surat: e.target.value })}
              placeholder="Contoh: SKU"
              className="form-input font-mono"
            />
          </div>
          <div>
            <label className="form-label">Deskripsi Penggunaan</label>
            <textarea
              rows={3}
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              placeholder="Keterangan peruntukan surat bagi warga desa..."
              className="form-input resize-none"
            />
          </div>
          <div>
            <label className="form-label">Status Pelayanan</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="form-input"
            >
              <option value="aktif">Aktif (Dapat Diajukan Warga)</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" className="btn-primary btn-sm flex items-center gap-1.5" disabled={savingSurat}>
              {savingSurat ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</> : 'Simpan'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Kelola Persyaratan Dokumen */}
      <Modal
        isOpen={persyaratanModalOpen}
        onClose={() => setPersyaratanModalOpen(false)}
        title={`Persyaratan Berkas — ${selectedSuratForReq?.nama_surat || ''}`}
      >
        <div className="space-y-4 text-sm">
          <p className="text-xs text-gray-500">
            Berkas yang wajib atau opsional diunggah warga saat mengajukan jenis surat ini.
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {currentPersyaratan.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-4">
                Belum ada persyaratan untuk jenis surat ini.
              </p>
            ) : (
              currentPersyaratan.map((req, idx) => (
                <div
                  key={req.id_persyaratan}
                  className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-bglight text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-semibold text-gray-800">{idx + 1}. {req.nama_persyaratan}</span>
                    <div className="flex items-center gap-2">
                      <span className={req.wajib === 1 ? 'badge badge-red text-[10px]' : 'badge badge-gray text-[10px]'}>
                        {req.wajib === 1 ? 'Wajib' : 'Opsional'}
                      </span>
                      <span className="text-gray-400 font-mono text-[10px]">
                        Maks. 5MB ({req.format_file || 'PDF, JPG, PNG'})
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePersyaratan(req.id_persyaratan)}
                    disabled={deletingReqId === req.id_persyaratan}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {deletingReqId === req.id_persyaratan
                      ? <Loader2 size={15} className="animate-spin" />
                      : <Trash2 size={15} />}
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddPersyaratan} className="border-t pt-3 space-y-3">
            <p className="font-semibold text-xs text-gray-700">Tambah Syarat Baru</p>
            <input
              type="text"
              placeholder="Nama berkas, cth: Surat Pengantar RT"
              value={newReqName}
              onChange={(e) => setNewReqName(e.target.value)}
              className="form-input text-xs"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newReqWajib}
                  onChange={(e) => setNewReqWajib(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                Berkas Wajib Diunggah
              </label>
              <button
                type="submit"
                className="btn-primary btn-sm text-xs flex items-center gap-1.5"
                disabled={savingReq}
              >
                {savingReq ? <><Loader2 size={12} className="animate-spin" /> Menyimpan...</> : 'Tambah Syarat'}
              </button>
            </div>
          </form>

          <div className="flex justify-end pt-3 border-t">
            <button onClick={() => setPersyaratanModalOpen(false)} className="btn-outline btn-sm">
              Tutup
            </button>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
}
