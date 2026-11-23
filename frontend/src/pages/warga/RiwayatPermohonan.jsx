import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ScrollText, Clock, AlertTriangle, Calendar, ChevronDown,
  ChevronUp, FileText, ArrowRight, Loader2, RefreshCw, Printer
} from 'lucide-react';
import AppLayout from '../../components/layout/AppLayout';
import { PageHeader, Modal, EmptyState } from '../../components/common/UIComponents';
import { StatusBadge, formatTanggal, formatTanggalWaktu } from '../../utils/statusHelpers';
import { getPermohonanWarga, getPermohonanDetail, downloadSuratPDF } from '../../services/permohonanService';

export default function RiwayatPermohonan() {
  const [filterTab, setFilterTab] = useState('semua');
  const [permohonanList, setPermohonanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [detailData, setDetailData] = useState({});
  const [loadingDetail, setLoadingDetail] = useState(null);
  const [loadingPdfId, setLoadingPdfId] = useState(null);
  const [pdfError, setPdfError] = useState('');

  const handleDownloadPdf = async (idPermohonan, filename) => {
    setLoadingPdfId(idPermohonan);
    setPdfError('');
    try {
      await downloadSuratPDF(idPermohonan, { openInNewTab: true, filename });
    } catch (err) {
      setPdfError(err.message || 'Gagal mengunduh dokumen surat resmi.');
      setTimeout(() => setPdfError(''), 5000);
    } finally {
      setLoadingPdfId(null);
    }
  };

  const fetchPermohonan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getPermohonanWarga();
      setPermohonanList(res.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat riwayat permohonan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPermohonan(); }, [fetchPermohonan]);

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!detailData[id]) {
      setLoadingDetail(id);
      try {
        const res = await getPermohonanDetail(id);
        setDetailData((prev) => ({ ...prev, [id]: res.data }));
      } catch (err) {
        console.error('Gagal memuat detail:', err);
      } finally {
        setLoadingDetail(null);
      }
    }
  };

  const filteredList = permohonanList.filter((item) => {
    if (filterTab === 'semua') return true;
    if (filterTab === 'aktif') return ['diajukan', 'diproses', 'perlu_perbaikan'].includes(item.status);
    if (filterTab === 'selesai') return ['disetujui', 'selesai'].includes(item.status);
    if (filterTab === 'ditolak') return item.status === 'ditolak';
    return true;
  });

  const tabs = [
    { key: 'semua', label: 'Semua Pengajuan' },
    { key: 'aktif', label: 'Sedang Aktif' },
    { key: 'selesai', label: 'Selesai / Disetujui' },
    { key: 'ditolak', label: 'Ditolak' },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20 gap-3 text-gray-500">
          <Loader2 size={28} className="animate-spin" /> Memuat riwayat permohonan...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Riwayat Permohonan Saya"
        subtitle="Pantau proses pemeriksaan dan tindak lanjuti catatan dari petugas desa"
        action={
          <Link to="/warga/ajukan" className="btn-primary flex items-center gap-2">
            Ajukan Surat Baru <ArrowRight size={16} />
          </Link>
        }
      />

      {error && (
        <div className="mb-6 card p-4 text-center">
          <p className="text-red-600 font-medium mb-3">{error}</p>
          <button onClick={fetchPermohonan} className="btn-outline btn-sm inline-flex items-center gap-1.5">
            <RefreshCw size={14} /> Muat Ulang
          </button>
        </div>
      )}

      {pdfError && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-sm flex items-center justify-between">
          <span>{pdfError}</span>
          <button onClick={() => setPdfError('')} className="text-red-500 hover:text-red-700 text-xs font-bold ml-2">✕</button>
        </div>
      )}

      <div className="flex border-b border-gray-200 mb-6 gap-0 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterTab(tab.key)}
            className={`pb-3 px-4 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors ${
              filterTab === tab.key ? 'border-[#142B4A] text-[#142B4A]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredList.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={ScrollText}
            title="Tidak ada permohonan dalam kategori ini"
            desc="Anda belum memiliki pengajuan surat pada kategori ini."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item) => {
            const isExpanded = expandedId === item.id_permohonan;
            const detail = detailData[item.id_permohonan];
            const canPrint = item.status === 'disetujui' || item.status === 'selesai';

            return (
              <div key={item.id_permohonan} className="card border border-gray-100 hover:shadow-card-hover transition-shadow p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#142B4A] flex items-center justify-center flex-shrink-0">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 text-base">{item.nama_surat}</h3>
                      <p className="font-mono text-xs text-gray-400">No: <strong className="text-gray-600">{item.nomor_permohonan}</strong></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <StatusBadge status={item.status} />
                    {canPrint && (
                      <button
                        type="button"
                        onClick={() => handleDownloadPdf(item.id_permohonan, `Surat-${item.nomor_surat || item.nomor_permohonan}.pdf`)}
                        disabled={loadingPdfId === item.id_permohonan}
                        title="Unduh / Cetak Surat PDF"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors disabled:opacity-60"
                      >
                        {loadingPdfId === item.id_permohonan ? <Loader2 size={13} className="animate-spin" /> : <Printer size={13} />} PDF
                      </button>
                    )}
                    <button
                      onClick={() => toggleExpand(item.id_permohonan)}
                      className="p-1 text-gray-400 hover:text-[#142B4A] transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                <div className="text-xs text-gray-600 mb-3 bg-bglight p-3 rounded-lg">
                  <span className="text-gray-400 block mb-0.5">Keperluan:</span>
                  <span className="font-medium text-gray-700">{item.keperluan}</span>
                </div>

                {item.status === 'perlu_perbaikan' && item.catatan_admin && (
                  <div className="mb-3 p-3.5 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-950 flex gap-2">
                    <AlertTriangle size={18} className="text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-orange-900">Catatan Petugas Desa:</span>
                      <p className="text-orange-800 mt-0.5">{item.catatan_admin}</p>
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="border-t pt-4 mt-3 space-y-3">
                    {loadingDetail === item.id_permohonan ? (
                      <div className="flex items-center gap-2 text-xs text-gray-400 py-2">
                        <Loader2 size={14} className="animate-spin" /> Memuat detail...
                      </div>
                    ) : detail ? (
                      <>
                        {detail.riwayat && detail.riwayat.length > 0 && (
                          <div>
                            <p className="font-semibold text-xs text-[#142B4A] flex items-center gap-1.5 mb-2">
                              <Clock size={14} /> Riwayat Perkembangan Status
                            </p>
                            <div className="space-y-2 border-l-2 border-gray-200 ml-2 pl-4 py-1 text-xs">
                              {detail.riwayat.map((r) => (
                                <div key={r.id_riwayat} className="relative mb-3 last:mb-0">
                                  <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#142B4A]" />
                                  <div className="flex justify-between items-center text-gray-500">
                                    <span className="font-bold text-gray-800 capitalize">Status: {r.status_baru?.replace('_', ' ')}</span>
                                    <span className="text-[10px] text-gray-400">{formatTanggalWaktu(r.tanggal_perubahan)}</span>
                                  </div>
                                  <p className="text-gray-600 mt-0.5">{r.keterangan}</p>
                                  {r.diubah_oleh && <span className="text-[10px] text-gray-400 block mt-0.5">Oleh: {r.diubah_oleh}</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                )}

                <div className="flex justify-between items-center text-[11px] text-gray-400 pt-2">
                  <span className="flex items-center gap-1"><Calendar size={12} /> Diajukan: {formatTanggal(item.tanggal_pengajuan)}</span>
                  <button onClick={() => toggleExpand(item.id_permohonan)} className="text-[#142B4A] font-semibold hover:underline">
                    {isExpanded ? 'Tutup Detail' : 'Lihat Jejak Status'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}
