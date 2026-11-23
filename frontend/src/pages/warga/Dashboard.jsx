import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, CheckCircle2, ArrowRight,
  AlertTriangle, PlusCircle, ScrollText, Calendar, Loader2, UserCheck
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { StatCard } from '../../components/common/UIComponents';
import { StatusBadge, formatTanggal } from '../../utils/statusHelpers';
import { useAuth } from '../../context/AuthContext';
import { getPermohonanWarga } from '../../services/permohonanService';

export default function WargaDashboard() {
  const { user } = useAuth();
  const [permohonanList, setPermohonanList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPermohonanWarga()
      .then((res) => setPermohonanList(res.data || []))
      .catch(() => setPermohonanList([]))
      .finally(() => setLoading(false));
  }, []);

  const totalPermohonan = permohonanList.length;
  const aktif = permohonanList.filter((p) => ['diajukan', 'diproses', 'perlu_perbaikan'].includes(p.status)).length;
  const selesai = permohonanList.filter((p) => ['disetujui', 'selesai'].includes(p.status)).length;
  const permohonanPerluPerbaikan = permohonanList.find((p) => p.status === 'perlu_perbaikan');
  const recentList = permohonanList.slice(0, 3);

  const profil = user?.profil_warga || {};
  const isProfileIncomplete = !profil.no_kk || !profil.tempat_lahir || !profil.tanggal_lahir || !profil.jenis_kelamin || !profil.agama || !profil.pekerjaan;

  return (
    <AppLayout>
      <div className="card bg-[#142B4A] text-white mb-8 p-6 md:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#F5C542]/20 text-[#F5C542] text-xs font-semibold mb-2">Pelayanan Mandiri Warga</span>
            <h1 className="text-xl md:text-2xl font-bold">Selamat Datang, {user?.nama_lengkap || 'Warga Desa'}!</h1>
            <p className="text-sm text-navy-200 mt-1 max-w-lg">
              Anda terdaftar di <strong className="text-white">{user?.nama_desa || 'Desa'}</strong>. Ajukan surat keterangan dan pantau prosesnya di sini.
            </p>
          </div>
          <Link to="/warga/ajukan" className="btn-accent flex items-center justify-center gap-2 whitespace-nowrap self-start md:self-auto">
            <PlusCircle size={17} /> Ajukan Surat Baru
          </Link>
        </div>
      </div>

      {isProfileIncomplete && (
        <div className="mb-6 rounded-2xl bg-amber-50 border border-amber-200 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
              <UserCheck size={20} />
            </div>
            <div>
              <p className="font-bold text-amber-950 text-sm">Lengkapi Data Profil Kependudukan Anda</p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Data kependudukan Anda (No. KK, Tempat/Tgl Lahir, Agama, Pekerjaan) belum lengkap. Lengkapi sekarang agar pengajuan surat resmi otomatis terisi dan dapat langsung diverifikasi.
              </p>
            </div>
          </div>
          <Link to="/warga/profil" className="btn-primary btn-sm whitespace-nowrap self-end sm:self-auto flex items-center gap-1.5">
            Lengkapi Profil <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {permohonanPerluPerbaikan && (
        <div className="mb-8 rounded-2xl bg-orange-50 border border-orange-200 p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-3">
            <AlertTriangle size={24} className="text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-orange-900 text-sm">Perhatian: Permohonan {permohonanPerluPerbaikan.nomor_permohonan} Membutuhkan Perbaikan</p>
              <p className="text-xs text-orange-800 mt-0.5 leading-relaxed">Catatan Petugas: "{permohonanPerluPerbaikan.catatan_admin}"</p>
            </div>
          </div>
          <Link to="/warga/permohonan" className="btn-accent btn-sm whitespace-nowrap self-end sm:self-auto">Perbaiki Sekarang</Link>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10 gap-2 text-gray-400"><Loader2 size={20} className="animate-spin" /> Memuat data...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={ScrollText} label="Total Pengajuan Saya" value={totalPermohonan} colorClass="text-blue-600" bgClass="bg-blue-50" />
            <StatCard icon={Clock} label="Sedang Berlangsung" value={aktif} colorClass="text-yellow-600" bgClass="bg-yellow-50" />
            <StatCard icon={CheckCircle2} label="Selesai Diproses" value={selesai} colorClass="text-green-600" bgClass="bg-green-50" />
          </div>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Status Permohonan Terbaru Anda</h2>
              <Link to="/warga/permohonan" className="text-xs font-semibold text-[#142B4A] hover:underline flex items-center gap-1">
                Lihat Semua Riwayat <ArrowRight size={13} />
              </Link>
            </div>
            {recentList.length === 0 ? (
              <div className="card p-8 text-center text-gray-400">
                <ScrollText size={40} className="mx-auto mb-3 opacity-30" />
                <p>Belum ada permohonan. Mulai ajukan surat pertama Anda!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentList.map((item) => (
                  <div key={item.id_permohonan} className="card card-hover flex flex-col justify-between border border-gray-100">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="font-mono text-xs font-bold text-gray-500">{item.nomor_permohonan}</span>
                        <StatusBadge status={item.status} />
                      </div>
                      <h3 className="font-bold text-gray-800 text-sm mb-1">{item.nama_surat}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">Keperluan: {item.keperluan}</p>
                    </div>
                    <div className="border-t pt-3 flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatTanggal(item.tanggal_pengajuan)}</span>
                      <Link to="/warga/permohonan" className="font-semibold text-[#142B4A] hover:underline flex items-center gap-0.5">
                        Detail <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AppLayout>
  );
}
