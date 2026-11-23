import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, Plus, Edit2, Search, Loader2, RefreshCw, Check, X
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader, Modal, EmptyState } from '../../components/common/UIComponents';
import { getDesaList, createDesa, updateDesa } from '../../services/superAdminDesaService';

export default function ManajemenDesa() {
  const [desaList, setDesaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDesa, setEditingDesa] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nama_desa: '', kode_desa: '', alamat_kantor: '', telepon: '', email: '', status: 'aktif',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const fetchDesa = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getDesaList();
      setDesaList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar desa.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDesa(); }, [fetchDesa]);

  const filteredDesa = desaList.filter(
    (d) =>
      d.nama_desa.toLowerCase().includes(search.toLowerCase()) ||
      d.kode_desa.toLowerCase().includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingDesa(null);
    setForm({ nama_desa: '', kode_desa: '', alamat_kantor: '', telepon: '', email: '', status: 'aktif' });
    setModalOpen(true);
  };

  const openEditModal = (desa) => {
    setEditingDesa(desa);
    setForm({
      nama_desa: desa.nama_desa,
      kode_desa: desa.kode_desa,
      alamat_kantor: desa.alamat_kantor || '',
      telepon: desa.telepon || '',
      email: desa.email || '',
      status: desa.status || 'aktif',
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nama_desa.trim() || !form.kode_desa.trim()) return;
    setSaving(true);
    try {
      if (editingDesa) {
        await updateDesa(editingDesa.id_desa, form);
        showToast('Data desa berhasil diperbarui.');
      } else {
        await createDesa(form);
        showToast('Desa baru berhasil ditambahkan.');
      }
      setModalOpen(false);
      fetchDesa();
    } catch (err) {
      showToast(err.message || 'Gagal menyimpan data desa.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Kelola Data Desa"
        subtitle="Daftar wilayah desa dalam naungan Kecamatan Sukamaju"
        action={
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Tambah Desa Baru
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
            placeholder="Cari nama atau kode desa..."
            className="form-input pl-9 pr-4 py-2 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Menampilkan <strong>{filteredDesa.length}</strong> dari <strong>{desaList.length}</strong> desa
          </span>
          <button onClick={fetchDesa} className="btn-outline btn-sm p-1.5" title="Muat ulang">
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
          <button onClick={fetchDesa} className="btn-outline btn-sm inline-flex items-center gap-1.5">
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      ) : filteredDesa.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Building2}
            title="Tidak ada desa ditemukan"
            desc="Coba ubah kata kunci pencarian atau tambahkan data desa baru."
          />
        </div>
      ) : (
        <div className="table-wrapper bg-white shadow-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Desa</th>
                <th>Kode Wilayah</th>
                <th>Alamat Kantor</th>
                <th>Kontak &amp; Email</th>
                <th>Warga / Admin</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredDesa.map((desa, idx) => (
                <tr key={desa.id_desa}>
                  <td className="text-center text-gray-400">{idx + 1}</td>
                  <td className="font-semibold text-gray-800">{desa.nama_desa}</td>
                  <td className="font-mono text-xs text-gray-600">{desa.kode_desa}</td>
                  <td className="text-gray-600 max-w-xs truncate">{desa.alamat_kantor || '—'}</td>
                  <td className="text-xs text-gray-600 space-y-0.5">
                    <div>{desa.telepon || '—'}</div>
                    <div className="text-gray-400">{desa.email || '—'}</div>
                  </td>
                  <td className="text-xs text-gray-600">
                    {desa.total_warga ?? 0} warga / {desa.total_admin ?? 0} admin
                  </td>
                  <td>
                    <span className={desa.status === 'aktif' ? 'badge badge-green' : 'badge badge-gray'}>
                      {desa.status === 'aktif' ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openEditModal(desa)}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDesa ? `Edit Data ${editingDesa.nama_desa}` : 'Tambah Desa Baru'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="form-label">Nama Desa *</label>
            <input
              type="text"
              required
              value={form.nama_desa}
              onChange={(e) => setForm({ ...form, nama_desa: e.target.value })}
              placeholder="Contoh: Desa Makmur"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Kode Desa *</label>
            <input
              type="text"
              required
              value={form.kode_desa}
              onChange={(e) => setForm({ ...form, kode_desa: e.target.value })}
              placeholder="Contoh: DSA-004"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Alamat Kantor Desa</label>
            <textarea
              rows={2}
              value={form.alamat_kantor}
              onChange={(e) => setForm({ ...form, alamat_kantor: e.target.value })}
              placeholder="Jl. Raya..."
              className="form-input resize-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Nomor Telepon</label>
              <input
                type="text"
                value={form.telepon}
                onChange={(e) => setForm({ ...form, telepon: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Email Resmi</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="desa@sukamaju.go.id"
                className="form-input"
              />
            </div>
          </div>
          <div>
            <label className="form-label">Status Operasional</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="form-input"
            >
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Nonaktif</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" className="btn-primary btn-sm flex items-center gap-1.5" disabled={saving}>
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                : (editingDesa ? 'Simpan Perubahan' : 'Tambah Desa')}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
