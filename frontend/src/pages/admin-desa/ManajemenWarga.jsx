import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, Search, Eye, Shield, Plus, Edit2, Loader2, RefreshCw, Check, X
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader, Modal, EmptyState } from '../../components/common/UIComponents';
import { formatTanggal } from '../../utils/statusHelpers';
import { getWargaList, createWarga, updateWarga } from '../../services/adminDesaService';

export default function ManajemenWarga() {
  const [wargaList, setWargaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState({ msg: '', type: '' });

  // Modal detail
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedWarga, setSelectedWarga] = useState(null);

  // Modal tambah/edit warga
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState(null);
  const [savingWarga, setSavingWarga] = useState(false);
  const [form, setForm] = useState({
    nama_lengkap: '', nik: '', username: '', email: '', password: '',
    no_telepon: '', alamat: '', no_kk: '', tempat_lahir: '', tanggal_lahir: '',
    jenis_kelamin: 'L', rt: '', rw: '', agama: '', status_perkawinan: '', pekerjaan: '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  const fetchWarga = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getWargaList(search);
      setWargaList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat daftar warga.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => fetchWarga(), 400);
    return () => clearTimeout(timer);
  }, [fetchWarga]);

  const maskNik = (nik) => {
    if (!nik || nik.length < 16) return nik;
    return `${nik.substring(0, 6)}******${nik.substring(12)}`;
  };

  const openDetail = (warga) => {
    setSelectedWarga(warga);
    setDetailModalOpen(true);
  };

  const openAddModal = () => {
    setEditingWarga(null);
    setForm({
      nama_lengkap: '', nik: '', username: '', email: '', password: '',
      no_telepon: '', alamat: '', no_kk: '', tempat_lahir: '', tanggal_lahir: '',
      jenis_kelamin: 'L', rt: '', rw: '', agama: '', status_perkawinan: '', pekerjaan: '',
    });
    setFormModalOpen(true);
  };

  const openEditModal = (warga) => {
    setEditingWarga(warga);
    setForm({
      nama_lengkap: warga.nama_lengkap || '',
      nik: warga.nik || '',
      username: warga.username || '',
      email: warga.email || '',
      password: '',
      no_telepon: warga.no_telepon || '',
      alamat: warga.alamat || '',
      no_kk: warga.no_kk || '',
      tempat_lahir: warga.tempat_lahir || '',
      tanggal_lahir: warga.tanggal_lahir ? warga.tanggal_lahir.slice(0, 10) : '',
      jenis_kelamin: warga.jenis_kelamin || 'L',
      rt: warga.rt || '',
      rw: warga.rw || '',
      agama: warga.agama || '',
      status_perkawinan: warga.status_perkawinan || '',
      pekerjaan: warga.pekerjaan || '',
    });
    setFormModalOpen(true);
  };

 const handleSaveWarga = async (e) => {
  e.preventDefault();

  if (!editingWarga) {
    if (!form.password || form.password.trim().length < 8) {
      showToast('Password wajib diisi dan minimal 8 karakter.', 'error');
      return;
    }
  }

  setSavingWarga(true);

  try {
    if (editingWarga) {
      await updateWarga(editingWarga.id_warga, form);
      showToast('Data warga berhasil diperbarui.');
    } else {
      await createWarga(form);
      showToast('Data warga baru berhasil ditambahkan.');
    }

    setFormModalOpen(false);
    fetchWarga();
  } catch (err) {
    showToast(err.message || 'Gagal menyimpan data warga.', 'error');
  } finally {
    setSavingWarga(false);
  }
};

  return (
    <AppLayout>
      <PageHeader
        title="Data Penduduk Desa"
        subtitle="Daftar warga desa yang telah memiliki akun pelayanan mandiri"
        action={
          <button onClick={openAddModal} className="btn-primary flex items-center gap-2">
            <Plus size={16} /> Tambah Data Warga
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

      <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-blue-900 text-xs flex gap-2.5 items-start">
        <Shield size={18} className="text-blue-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-sm">Prinsip Perlindungan Data Pribadi</p>
          <p className="leading-relaxed text-blue-800">
            Data NIK dan informasi kependudukan warga merupakan data sensitif. Sistem menerapkan
            penyamaran (masking) pada nomor identitas di tabel ringkasan.
          </p>
        </div>
      </div>

      <div className="card mb-6 p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau NIK..."
            className="form-input pl-9 pr-4 py-2 text-sm w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">
            Total <strong>{wargaList.length}</strong> warga terdaftar
          </span>
          <button onClick={fetchWarga} className="btn-outline btn-sm p-1.5" title="Muat ulang">
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
          <button onClick={fetchWarga} className="btn-outline btn-sm inline-flex items-center gap-1.5">
            <RefreshCw size={14} /> Coba Lagi
          </button>
        </div>
      ) : wargaList.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Users}
            title="Tidak ada warga ditemukan"
            desc="Coba periksa kata kunci pencarian atau tambahkan data warga baru."
          />
        </div>
      ) : (
        <div className="table-wrapper bg-white shadow-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Lengkap</th>
                <th>NIK (Disamarkan)</th>
                <th>Jenis Kelamin</th>
                <th>Alamat Domisili</th>
                <th>Kontak</th>
                <th>Status Data</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {wargaList.map((warga, idx) => {
                const isComplete = Boolean(
                  warga.no_kk && warga.tempat_lahir && warga.tanggal_lahir && warga.agama && warga.pekerjaan
                );
                return (
                  <tr key={warga.id_warga}>
                    <td className="text-center text-gray-400">{idx + 1}</td>
                    <td className="font-semibold text-gray-800">{warga.nama_lengkap}</td>
                    <td className="font-mono text-xs text-gray-700 tracking-wider">{maskNik(warga.nik)}</td>
                    <td>
                      <span className="badge badge-navy text-[11px]">
                        {warga.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="text-gray-600 text-xs max-w-xs truncate">{warga.alamat || '—'}</td>
                    <td className="text-xs text-gray-600">{warga.no_telepon || '—'}</td>
                    <td>
                      {isComplete ? (
                        <span className="badge badge-success text-[10px]">Lengkap</span>
                      ) : (
                        <span className="badge badge-warning text-[10px]">Belum Lengkap</span>
                      )}
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => openDetail(warga)}
                          className="btn-outline btn-sm flex items-center gap-1.5"
                        >
                          <Eye size={13} /> Detail
                        </button>
                        <button
                          onClick={() => openEditModal(warga)}
                          className="btn-outline btn-sm flex items-center gap-1.5"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Detail Profil Warga */}
      <Modal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} title="Detail Biodata Warga">
        {selectedWarga && (
          <div className="space-y-4 text-sm">
            <div className="bg-bglight p-4 rounded-xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                {selectedWarga.nama_lengkap?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-base">{selectedWarga.nama_lengkap}</p>
                <p className="font-mono text-xs text-gray-500">NIK: {selectedWarga.nik}</p>
                <p className="text-xs text-gray-400">@{selectedWarga.username}</p>
              </div>
            </div>

            {(!selectedWarga.no_kk || !selectedWarga.tempat_lahir || !selectedWarga.tanggal_lahir || !selectedWarga.agama || !selectedWarga.pekerjaan) ? (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-lg text-xs">
                <span className="font-bold">Status Data: Belum Lengkap</span>
                <p className="mt-0.5 text-amber-800">
                  Data kependudukan (KK / TTL / Agama / Pekerjaan) belum lengkap. Anda dapat membantu melengkapi atau mengoreksi data warga ini melalui tombol Edit.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 text-green-900 p-2.5 rounded-lg text-xs flex items-center gap-2">
                <Check size={14} className="text-green-700 flex-shrink-0" />
                <span className="font-semibold">Data kependudukan warga lengkap & terverifikasi</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                ['No. Kartu Keluarga (KK)', selectedWarga.no_kk],
                ['Tempat / Tgl Lahir', `${selectedWarga.tempat_lahir || '—'}, ${formatTanggal(selectedWarga.tanggal_lahir)}`],
                ['Agama', selectedWarga.agama],
                ['Status Pernikahan', selectedWarga.status_perkawinan],
                ['Pekerjaan', selectedWarga.pekerjaan],
                ['Nomor Telepon', selectedWarga.no_telepon],
              ].map(([label, value]) => (
                <div key={label} className="p-3 bg-white border border-gray-100 rounded-lg">
                  <span className="text-gray-400 block mb-0.5">{label}</span>
                  <span className="font-medium text-gray-800">{value || '—'}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-white border border-gray-100 rounded-lg text-xs">
              <span className="text-gray-400 block mb-0.5">Alamat Tempat Tinggal</span>
              <span className="font-medium text-gray-800 block">{selectedWarga.alamat}</span>
              {(selectedWarga.rt || selectedWarga.rw) && (
                <span className="text-gray-500 mt-1 block">RT {selectedWarga.rt} / RW {selectedWarga.rw}</span>
              )}
            </div>
            <div className="flex justify-end pt-3 border-t">
              <button onClick={() => setDetailModalOpen(false)} className="btn-outline btn-sm">Tutup</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Tambah/Edit Warga */}
      <Modal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        title={editingWarga ? `Edit Data: ${editingWarga.nama_lengkap}` : 'Tambah Data Warga Baru'}
      >
        <form onSubmit={handleSaveWarga} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="form-label">Nama Lengkap *</label>
              <input required value={form.nama_lengkap}
                onChange={(e) => setForm({ ...form, nama_lengkap: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">NIK (16 Digit) *</label>
              <input required maxLength={16} value={form.nik}
                onChange={(e) => setForm({ ...form, nik: e.target.value })}
                className="form-input font-mono" />
            </div>
            <div>
              <label className="form-label">No. Kartu Keluarga</label>
              <input value={form.no_kk}
                onChange={(e) => setForm({ ...form, no_kk: e.target.value })}
                className="form-input font-mono" />
            </div>
            {!editingWarga && (
              <>
                <div>
                  <label className="form-label">Password (wajib, minimal 8 karakter)</label>
                  <input required value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="form-input" />
                </div>
                <div>
                  <label className="form-label">Email *</label>
                  <input required type="email" value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="form-input" />
                </div>
                <div className="sm:col-span-2">
                  <label className="form-label">Password (wajib, minimal 8 karakter)</label>
                  <input type="password" value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="form-input" placeholder="Min. 8 karakter" />
                </div>
              </>
            )}
            <div>
              <label className="form-label">Tempat Lahir</label>
              <input value={form.tempat_lahir}
                onChange={(e) => setForm({ ...form, tempat_lahir: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Tanggal Lahir</label>
              <input type="date" value={form.tanggal_lahir}
                onChange={(e) => setForm({ ...form, tanggal_lahir: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Jenis Kelamin</label>
              <select value={form.jenis_kelamin}
                onChange={(e) => setForm({ ...form, jenis_kelamin: e.target.value })}
                className="form-input">
                <option value="L">Laki-Laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="form-label">No. Telepon</label>
              <input value={form.no_telepon}
                onChange={(e) => setForm({ ...form, no_telepon: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Agama</label>
              <input value={form.agama}
                onChange={(e) => setForm({ ...form, agama: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">Status Perkawinan</label>
              <select value={form.status_perkawinan}
                onChange={(e) => setForm({ ...form, status_perkawinan: e.target.value })}
                className="form-input">
                <option value="">- Pilih -</option>
                <option>Belum Kawin</option>
                <option>Kawin</option>
                <option>Cerai Hidup</option>
                <option>Cerai Mati</option>
              </select>
            </div>
            <div>
              <label className="form-label">Pekerjaan</label>
              <input value={form.pekerjaan}
                onChange={(e) => setForm({ ...form, pekerjaan: e.target.value })}
                className="form-input" />
            </div>
            <div className="sm:col-span-2">
              <label className="form-label">Alamat Lengkap</label>
              <textarea rows={2} value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="form-input resize-none" />
            </div>
            <div>
              <label className="form-label">RT</label>
              <input value={form.rt}
                onChange={(e) => setForm({ ...form, rt: e.target.value })}
                className="form-input" />
            </div>
            <div>
              <label className="form-label">RW</label>
              <input value={form.rw}
                onChange={(e) => setForm({ ...form, rw: e.target.value })}
                className="form-input" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button type="button" onClick={() => setFormModalOpen(false)} className="btn-outline btn-sm">
              Batal
            </button>
            <button type="submit" className="btn-primary btn-sm flex items-center gap-1.5" disabled={savingWarga}>
              {savingWarga
                ? <><Loader2 size={14} className="animate-spin" /> Menyimpan...</>
                : (editingWarga ? 'Simpan Perubahan' : 'Tambah Warga')}
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
