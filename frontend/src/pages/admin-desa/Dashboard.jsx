import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, AlertTriangle, CheckCircle,
  XCircle, CheckCheck, ArrowRight, Eye, Loader2
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { StatCard, PageHeader } from '../../components/common/UIComponents';
import { StatusBadge, formatTanggal } from '../../utils/statusHelpers';
import { useAuth } from '../../context/AuthContext';
import { getAdminDesaStats } from '../../services/adminDesaService';
import { getPermohonanDesa } from '../../services/permohonanService';

export default function AdminDesaDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPermohonan, setRecentPermohonan] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminDesaStats(),
      getPermohonanDesa({}),
    ])
      .then(([statsRes, permohonanRes]) => {
        setStats(statsRes.data || {});
        setRecentPermohonan((permohonanRes.data || []).slice(0, 5));
      })
      .catch(() => {
        setStats({});
        setRecentPermohonan([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppLayout>
      <PageHeader
        title={`Dashboard Pelayanan — ${user?.nama_desa || 'Desa'}`}
        subtitle="Kelola pengajuan surat dan dokumen administrasi warga desa Anda"
        action={
          <Link to="/admin/permohonan" className="btn-primary flex items-center gap-2">
            Kelola Semua Permohonan <ArrowRight size={16} />
          </Link>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={28} className="animate-spin" /> Memuat data dashboard...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={FileText} label="Total Masuk" value={stats?.total_permohonan ?? 0} colorClass="text-blue-600" bgClass="bg-blue-50" />
            <StatCard icon={Clock} label="Baru Diajukan" value={stats?.permohonan_diajukan ?? 0} colorClass="text-blue-600" bgClass="bg-blue-50" />
            <StatCard icon={Clock} label="Sedang Diproses" value={stats?.permohonan_diproses ?? 0} colorClass="text-yellow-600" bgClass="bg-yellow-50" />
            <StatCard icon={AlertTriangle} label="Perlu Perbaikan" value={stats?.permohonan_perlu_perbaikan ?? 0} colorClass="text-orange-600" bgClass="bg-orange-50" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="card flex items-center gap-4 bg-green-50/50 border border-green-100">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 text-green-700"><CheckCircle size={24} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.permohonan_disetujui ?? 0}</p>
                <p className="text-xs text-gray-500 font-medium">Disetujui / Siap Ambil</p>
              </div>
            </div>
            <div className="card flex items-center gap-4 bg-gray-50/70 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-700"><CheckCheck size={24} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.permohonan_selesai ?? 0}</p>
                <p className="text-xs text-gray-500 font-medium">Selesai Diambil</p>
              </div>
            </div>
            <div className="card flex items-center gap-4 bg-red-50/50 border border-red-100">
              <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 text-red-700"><XCircle size={24} /></div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats?.permohonan_ditolak ?? 0}</p>
                <p className="text-xs text-gray-500 font-medium">Ditolak</p>
              </div>
            </div>
          </div>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Permohonan Surat Terbaru</h2>
              <Link to="/admin/permohonan" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                Lihat Semua <ArrowRight size={13} />
              </Link>
            </div>
            {recentPermohonan.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <FileText size={40} className="mx-auto mb-3 opacity-30" />
                <p>Belum ada permohonan masuk.</p>
              </div>
            ) : (
              <div className="table-wrapper bg-white shadow-card">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>No. Permohonan</th>
                      <th>Nama Warga</th>
                      <th>Jenis Surat</th>
                      <th>Tanggal Pengajuan</th>
                      <th>Status</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPermohonan.map((item) => (
                      <tr key={item.id_permohonan}>
                        <td className="font-mono text-xs font-semibold text-[#142B4A]">{item.nomor_permohonan}</td>
                        <td className="font-medium text-gray-800">{item.nama_warga}</td>
                        <td className="text-gray-700">{item.nama_surat}</td>
                        <td className="text-gray-500 text-xs">{formatTanggal(item.tanggal_pengajuan)}</td>
                        <td><StatusBadge status={item.status} /></td>
                        <td>
                          <Link to="/admin/permohonan" className="btn-outline btn-sm flex items-center gap-1.5 inline-flex">
                            <Eye size={13} /> Periksa
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}
