import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  CheckCheck,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  FileText,
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { StatCard, PageHeader, EmptyState, Modal } from '../../components/common/UIComponents';
import { StatusAkunBadge, formatTanggal } from '../../utils/statusHelpers';
import { superAdminService } from '../../services/superAdminService';
import { authService } from '../../services/authService';

// ── Inline Toast ──────────────────────────────────────────
function InlineToast({ message, type }) {
  if (!message) return null;
  const base =
    type === 'success'
      ? 'bg-green-50 border border-green-200 text-green-800'
      : 'bg-red-50 border border-red-200 text-red-800';
  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${base} mb-4`}>
      {type === 'success' ? <CheckCheck size={16} /> : <X size={16} />}
      {message}
    </div>
  );
}

// ── Desa Status Badge ─────────────────────────────────────
function DesaStatusBadge({ status }) {
  return (
    <span className={status === 'aktif' ? 'badge badge-green' : 'badge badge-gray'}>
      {status === 'aktif' ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    total_desa: 0,
    desa_aktif: 0,
    admin_menunggu: 0,
    admin_aktif: 0,
    admin_ditolak: 0,
    warga_aktif: 0,
    total_permohonan_surat: 0,
  });
  const [pendingList, setPendingList] = useState([]);
  const [desaList, setDesaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  // Modal actions
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [alasanPenolakan, setAlasanPenolakan] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: '' }), 4000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, pendingRes, desaRes] = await Promise.all([
        superAdminService.getStats(),
        superAdminService.getAdminDesaList('menunggu'),
        authService.getDesaList(),
      ]);

      if (statsRes?.success && statsRes.data) {
        setStats(statsRes.data);
      }
      if (pendingRes?.success && Array.isArray(pendingRes.data)) {
        setPendingList(pendingRes.data);
      }
      if (desaRes?.success && Array.isArray(desaRes.data)) {
        setDesaList(desaRes.data);
      }
    } catch (err) {
      console.error('Gagal memuat dashboard Super Admin:', err);
      setError(err.message || 'Gagal terhubung ke backend untuk memuat data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const openApproveModal = (admin) => {
    setSelectedAdmin(admin);
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedAdmin) return;
    setActionLoadingId(selectedAdmin.id_user);

    try {
      const res = await superAdminService.approveAdminDesa(selectedAdmin.id_user);
      if (res?.success) {
        showToast(`Akun "${selectedAdmin.nama_lengkap}" berhasil disetujui.`, 'success');
        setApproveModalOpen(false);
        setSelectedAdmin(null);
        await loadDashboardData();
      } else {
        throw new Error(res?.message || 'Gagal memproses persetujuan.');
      }
    } catch (err) {
      showToast(err.message || 'Gagal menyetujui akun.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectModal = (admin) => {
    setSelectedAdmin(admin);
    setAlasanPenolakan('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    setActionLoadingId(selectedAdmin.id_user);

    try {
      const res = await superAdminService.rejectAdminDesa(
        selectedAdmin.id_user,
        alasanPenolakan.trim() || 'Dokumen kelayakan atau kewenangan tidak memenuhi syarat.'
      );
      if (res?.success) {
        showToast(`Akun "${selectedAdmin.nama_lengkap}" telah ditolak.`, 'error');
        setRejectModalOpen(false);
        setSelectedAdmin(null);
        await loadDashboardData();
      } else {
        throw new Error(res?.message || 'Gagal menolak akun.');
      }
    } catch (err) {
      showToast(err.message || 'Gagal menolak akun.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Dashboard Kecamatan"
        subtitle="Ringkasan sistem administrasi dan permohonan akun di Kecamatan Sukamaju"
      />

      <InlineToast message={toast.message} type={toast.type} />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboardData}
            className="px-3 py-1.5 rounded-lg bg-[#142B4A] hover:bg-[#1E3E6B] text-white text-xs font-medium flex items-center gap-1.5"
          >
            <RefreshCw size={13} /> Muat Ulang
          </button>
        </div>
      )}

      {loading ? (
        <div className="card p-12 flex flex-col items-center justify-center text-gray-500 gap-3">
          <Loader2 size={32} className="animate-spin text-[#142B4A]" />
          <p className="text-sm font-medium">Memuat ringkasan sistem dari database riil...</p>
        </div>
      ) : (
        <>
          {/* ── Stat Cards ─────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Building2}
              label="Total Desa"
              value={stats.total_desa}
              colorClass="text-blue-600"
              bgClass="bg-blue-50"
            />
            <StatCard
              icon={CheckCircle}
              label="Desa Aktif"
              value={stats.desa_aktif}
              colorClass="text-green-600"
              bgClass="bg-green-50"
            />
            <StatCard
              icon={Clock}
              label="Admin Menunggu"
              value={
                <span className="flex items-center gap-2">
                  {stats.admin_menunggu}
                  {stats.admin_menunggu > 0 && (
                    <span className="badge badge-yellow text-xs">{stats.admin_menunggu} Baru</span>
                  )}
                </span>
              }
              colorClass="text-yellow-600"
              bgClass="bg-yellow-50"
            />
            <StatCard
              icon={Users}
              label="Admin Aktif"
              value={stats.admin_aktif}
              colorClass="text-green-600"
              bgClass="bg-green-50"
            />
          </div>

          {/* ── Ringkasan Pelayanan Warga ───────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Users size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Warga Terdaftar</p>
                <p className="text-2xl font-bold text-gray-800">{stats.warga_aktif}</p>
                <p className="text-xs text-gray-400 mt-0.5">Warga aktif terdata di seluruh desa</p>
              </div>
            </div>

            <div className="card flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Permohonan Surat Pelayanan</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total_permohonan_surat}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total pengajuan surat masuk di sistem</p>
              </div>
            </div>
          </div>

          {/* ── Permohonan Admin Menunggu ───────────────────────── */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">
                Permohonan Admin Desa Menunggu Persetujuan
                {pendingList.length > 0 && (
                  <span className="ml-2 badge badge-yellow">{pendingList.length}</span>
                )}
              </h2>
              <button
                onClick={loadDashboardData}
                className="text-xs text-gray-500 hover:text-[#142B4A] flex items-center gap-1"
              >
                <RefreshCw size={12} /> Segarkan
              </button>
            </div>

            {pendingList.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={CheckCircle}
                  title="Tidak ada permohonan menunggu"
                  desc="Semua permohonan pendaftaran akun Admin Desa telah diproses."
                />
              </div>
            ) : (
              <div className="table-wrapper bg-white shadow-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No</th>
                      <th>Nama Lengkap</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Desa</th>
                      <th>Tanggal Daftar</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingList.map((admin, idx) => (
                      <tr key={admin.id_user}>
                        <td className="text-center text-gray-400">{idx + 1}</td>
                        <td className="font-semibold text-gray-800">{admin.nama_lengkap}</td>
                        <td className="text-blue-900 font-mono text-xs">@{admin.username}</td>
                        <td className="text-gray-600 text-xs">{admin.email}</td>
                        <td className="font-medium text-[#142B4A]">
                          {admin.nama_desa || '-'}
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
                              className="btn-success btn-sm flex items-center gap-1"
                              disabled={actionLoadingId === admin.id_user}
                              onClick={() => openApproveModal(admin)}
                            >
                              {actionLoadingId === admin.id_user ? (
                                <Loader2 size={13} className="animate-spin" />
                              ) : (
                                <CheckCheck size={13} />
                              )}
                              Setujui
                            </button>
                            <button
                              className="btn-danger btn-sm flex items-center gap-1"
                              disabled={actionLoadingId === admin.id_user}
                              onClick={() => openRejectModal(admin)}
                            >
                              <X size={13} />
                              Tolak
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* ── Daftar Desa Riil ────────────────────────────────── */}
          <section>
            <h2 className="section-title mb-4">Daftar Desa Terdaftar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {desaList.map((desa) => (
                <div key={desa.id_desa} className="card card-hover flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-800">{desa.nama_desa}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{desa.kode_desa}</p>
                    </div>
                    <DesaStatusBadge status={desa.status} />
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{desa.alamat_kantor || 'Alamat kantor belum diatur'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-gray-400 flex-shrink-0" />
                      <span>{desa.telepon || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-gray-400 flex-shrink-0" />
                      <span className="truncate">{desa.email || '-'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Modal Konfirmasi Persetujuan */}
      <Modal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        title="Konfirmasi Persetujuan Akun"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Apakah Anda yakin ingin menyetujui akun <strong>{selectedAdmin?.nama_lengkap}</strong> (@{selectedAdmin?.username}) sebagai Admin Desa untuk{' '}
            <strong>{selectedAdmin?.nama_desa}</strong>?
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
              {actionLoadingId === selectedAdmin?.id_user && <Loader2 size={14} className="animate-spin" />}
              Setujui Akun
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
            Anda akan menolak permohonan <strong>{selectedAdmin?.nama_lengkap}</strong> (@{selectedAdmin?.username}).
          </p>
          <div>
            <label className="form-label">Alasan Penolakan <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              required
              value={alasanPenolakan}
              onChange={(e) => setAlasanPenolakan(e.target.value)}
              placeholder="Contoh: Belum melampirkan Surat Keputusan (SK) penugasan resmi."
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
              {actionLoadingId === selectedAdmin?.id_user && <Loader2 size={14} className="animate-spin" />}
              Konfirmasi Tolak
            </button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
