import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader, Modal, EmptyState } from '../../components/common/UIComponents';
import { StatusAkunBadge, formatTanggal } from '../../utils/statusHelpers';
import { superAdminService } from '../../services/superAdminService';

export default function PersetujuanAkun() {
  const [activeTab, setActiveTab] = useState('menunggu'); // 'menunggu' | 'aktif' | 'ditolak'
  const [adminList, setAdminList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');
  const [toastMsg, setToastMsg] = useState({ text: '', type: 'success' });

  const triggerToast = (text, type = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg({ text: '', type: 'success' }), 4000);
  };

  const fetchAdmins = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await superAdminService.getAdminDesaList('all');
      if (res?.success && Array.isArray(res.data)) {
        setAdminList(res.data);
      } else {
        throw new Error(res?.message || 'Gagal memuat data Admin Desa.');
      }
    } catch (err) {
      console.error('Error fetching admin desa list:', err);
      setError(err.message || 'Gagal terhubung ke server untuk memuat permohonan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Filter list per tab
  const pendingList = adminList.filter((a) => a.status_akun === 'menunggu');
  const activeList = adminList.filter((a) => a.status_akun === 'aktif');
  const rejectedList = adminList.filter((a) => a.status_akun === 'ditolak');

  const openApproveModal = (user) => {
    setSelectedUser(user);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedUser) return;
    setActionLoadingId(selectedUser.id_user);

    try {
      const res = await superAdminService.approveAdminDesa(selectedUser.id_user);
      if (res?.success) {
        triggerToast(`Akun ${selectedUser.nama_lengkap} (@${selectedUser.username}) berhasil disetujui.`, 'success');
        setApproveModalOpen(false);
        setSelectedUser(null);
        await fetchAdmins();
      } else {
        throw new Error(res?.message || 'Gagal memproses persetujuan.');
      }
    } catch (err) {
      triggerToast(err.message || 'Gagal menyetujui akun.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (user) => {
    setSelectedUser(user);
    setAlasanPenolakan('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoadingId(selectedUser.id_user);

    try {
      const res = await superAdminService.rejectAdminDesa(
        selectedUser.id_user,
        alasanPenolakan.trim() || 'Dokumen identitas atau kewenangan desa tidak memenuhi syarat.'
      );
      if (res?.success) {
        triggerToast(`Permohonan akun ${selectedUser.nama_lengkap} telah ditolak.`, 'error');
        setRejectModalOpen(false);
        setSelectedUser(null);
        await fetchAdmins();
      } else {
        throw new Error(res?.message || 'Gagal memproses penolakan.');
      }
    } catch (err) {
      triggerToast(err.message || 'Gagal menolak permohonan akun.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Persetujuan Akun Admin Desa"
        subtitle="Verifikasi dan berikan hak akses pengelola administrasi per desa secara riil"
      />

      {/* Toast Notifikasi */}
      {toastMsg.text && (
        <div
          className={`mb-4 border px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 ${
            toastMsg.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {toastMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchAdmins}
            className="px-3 py-1.5 rounded-lg bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-xs font-medium flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Muat Ulang
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('menunggu')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'menunggu'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Menunggu Persetujuan
          <span className="badge badge-yellow text-xs">{pendingList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('aktif')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'aktif'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Akun Aktif
          <span className="badge badge-green text-xs">{activeList.length}</span>
        </button>

        <button
          onClick={() => setActiveTab('ditolak')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ditolak'
              ? 'border-[#142B4A] text-[#142B4A]'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Ditolak
          <span className="badge badge-red text-xs">{rejectedList.length}</span>
        </button>
      </div>

      {/* Loading Skeleton / Spinner */}
      {loading ? (
        <div className="card p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
          <Loader2 size={32} className="animate-spin text-[#142B4A]" />
          <p className="text-sm font-medium">Memuat data permohonan Admin Desa dari database...</p>
        </div>
      ) : (
        <>
          {/* Tab 1: Menunggu Persetujuan */}
          {activeTab === 'menunggu' && (
            <>
              {pendingList.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={UserCheck}
                    title="Tidak ada permohonan tertunda"
                    desc="Semua permohonan pendaftaran Admin Desa telah selesai diproses."
                  />
                </div>
              ) : (
                <div className="table-wrapper bg-white shadow-card">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Petugas</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Desa Kewenangan</th>
                        <th>Waktu Registrasi</th>
                        <th>Status</th>
                        <th>Aksi Verifikasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingList.map((admin, idx) => (
                        <tr key={admin.id_user}>
                          <td className="text-center text-gray-400">{idx + 1}</td>
                          <td className="font-semibold text-gray-800">{admin.nama_lengkap}</td>
                          <td className="font-mono text-xs text-blue-900">@{admin.username}</td>
                          <td className="text-gray-600 text-xs">{admin.email}</td>
                          <td className="font-medium text-[#142B4A]">
                            {admin.nama_desa || 'Belum ditugaskan'}
                            {admin.kode_desa && (
                              <span className="text-xs text-gray-400 block font-mono">{admin.kode_desa}</span>
                            )}
                          </td>
                          <td className="text-gray-500 text-xs">{formatTanggal(admin.created_at)}</td>
                          <td>
                            <StatusAkunBadge status={admin.status_akun} />
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openApproveModal(admin)}
                                disabled={actionLoadingId === admin.id_user}
                                className="btn-success btn-sm flex items-center gap-1"
                              >
                                {actionLoadingId === admin.id_user ? (
                                  <Loader2 size={13} className="animate-spin" />
                                ) : (
                                  <CheckCircle2 size={13} />
                                )}
                                Setujui
                              </button>
                              <button
                                onClick={() => openRejectModal(admin)}
                                disabled={actionLoadingId === admin.id_user}
                                className="btn-danger btn-sm flex items-center gap-1"
                              >
                                <XCircle size={13} /> Tolak
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Tab 2: Akun Aktif */}
          {activeTab === 'aktif' && (
            <>
              {activeList.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={UserCheck}
                    title="Belum ada Admin Desa aktif"
                    desc="Admin Desa yang disetujui akan muncul di sini."
                  />
                </div>
              ) : (
                <div className="table-wrapper bg-white shadow-card">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Petugas</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Desa Kewenangan</th>
                        <th>Tanggal Disetujui</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeList.map((admin, idx) => (
                        <tr key={admin.id_user}>
                          <td className="text-center text-gray-400">{idx + 1}</td>
                          <td className="font-semibold text-gray-800">{admin.nama_lengkap}</td>
                          <td className="font-mono text-xs text-gray-700">@{admin.username}</td>
                          <td className="text-gray-600 text-xs">{admin.email}</td>
                          <td className="font-medium text-[#142B4A]">
                            {admin.nama_desa || '-'}
                            {admin.kode_desa && (
                              <span className="text-xs text-gray-400 block font-mono">{admin.kode_desa}</span>
                            )}
                          </td>
                          <td className="text-gray-500 text-xs">
                            {admin.tanggal_persetujuan ? formatTanggal(admin.tanggal_persetujuan) : '-'}
                          </td>
                          <td>
                            <StatusAkunBadge status="aktif" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Tab 3: Ditolak */}
          {activeTab === 'ditolak' && (
            <>
              {rejectedList.length === 0 ? (
                <div className="card">
                  <EmptyState
                    icon={UserCheck}
                    title="Belum ada permohonan yang ditolak"
                    desc="Data permohonan yang ditolak akan dicatat di sini."
                  />
                </div>
              ) : (
                <div className="table-wrapper bg-white shadow-card">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Petugas</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Desa</th>
                        <th>Alasan Penolakan</th>
                        <th>Tanggal Penolakan</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rejectedList.map((admin, idx) => (
                        <tr key={admin.id_user}>
                          <td className="text-center text-gray-400">{idx + 1}</td>
                          <td className="font-semibold text-gray-800">{admin.nama_lengkap}</td>
                          <td className="font-mono text-xs">@{admin.username}</td>
                          <td className="text-gray-600 text-xs">{admin.email}</td>
                          <td>{admin.nama_desa || '-'}</td>
                          <td className="text-xs text-red-600 max-w-xs break-words font-medium">
                            {admin.alasan_penolakan || 'Dokumen kelayakan atau kewenangan tidak memenuhi syarat.'}
                          </td>
                          <td className="text-gray-500 text-xs">
                            {admin.tanggal_persetujuan ? formatTanggal(admin.tanggal_persetujuan) : '-'}
                          </td>
                          <td>
                            <StatusAkunBadge status="ditolak" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Modal Konfirmasi Persetujuan */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Konfirmasi Persetujuan Admin Desa"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 leading-relaxed">
            Apakah Anda yakin ingin menyetujui akun <strong>{selectedUser?.nama_lengkap}</strong> (@{selectedUser?.username}) sebagai pengelola resmi untuk{' '}
            <strong>{selectedUser?.nama_desa}</strong>?
          </p>
          <p className="text-xs text-green-700 bg-green-50 p-2.5 rounded-lg border border-green-200">
            Setelah disetujui, akun ini akan berstatus aktif dan dapat mengakses Dashboard Admin Desa secara penuh.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setApproveModalOpen(false)}
              className="btn-outline btn-sm"
              disabled={actionLoadingId !== null}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmApprove}
              disabled={actionLoadingId !== null}
              className="btn-success btn-sm flex items-center gap-1.5"
            >
              {actionLoadingId === selectedUser?.id_user && <Loader2 size={14} className="animate-spin" />}
              Ya, Setujui Akun
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Alasan Penolakan */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Tolak Pendaftaran Admin Desa"
      >
        <form onSubmit={handleConfirmReject} className="space-y-4">
          <p className="text-sm text-gray-600">
            Anda akan menolak permohonan akun <strong>{selectedUser?.nama_lengkap}</strong> (@{selectedUser?.username}) untuk{' '}
            <strong>{selectedUser?.nama_desa}</strong>.
          </p>

          <div>
            <label className="form-label">Alasan Penolakan <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              required
              value={alasanPenolakan}
              onChange={(e) => setAlasanPenolakan(e.target.value)}
              placeholder="Contoh: Belum melampirkan Surat Keputusan (SK) penugasan resmi dari Kepala Desa."
              className="form-input resize-none w-full mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="btn-outline btn-sm"
              disabled={actionLoadingId !== null}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={actionLoadingId !== null}
              className="btn-danger btn-sm flex items-center gap-1.5"
            >
              {actionLoadingId === selectedUser?.id_user && <Loader2 size={14} className="animate-spin" />}
              Konfirmasi Tolak
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
