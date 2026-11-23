import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Clock, CheckCircle2, ArrowRight, Sparkles,
  HelpCircle, AlertCircle, FileCheck, Info
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import useScrollReveal from '../../utils/useScrollReveal';
import { useAuth } from '../../context/AuthContext';

export default function LayananSurat() {
  const containerRef = useScrollReveal();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleAjukan = (kode) => {
    if (user?.role === 'warga') {
      navigate('/warga/ajukan', { state: { selectedKode: kode } });
    } else {
      navigate('/login', { state: { returnUrl: '/warga/ajukan', message: 'Silakan masuk dengan akun warga untuk mengajukan permohonan surat.' } });
    }
  };

  const katalogSurat = [
    {
      id: 'skd',
      kode: 'SKD',
      nama: 'Surat Keterangan Domisili',
      deskripsi: 'Surat keterangan resmi dari pemerintah desa yang menyatakan bahwa pemohon benar merupakan warga yang berdomisili atau bertempat tinggal di wilayah desa setempat.',
      keperluanUmum: [
        'Pembukaan rekening bank & administrasi perbankan',
        'Persyaratan melamar pekerjaan',
        'Keterangan domisili tinggal sementara atau permanen',
        'Pengurusan dokumen kependudukan lanjutan',
      ],
      persyaratan: [
        { nama: 'Foto KTP Asli', wajib: true },
        { nama: 'Foto Kartu Keluarga (KK)', wajib: true },
      ],
      formatNomor: '.../SKD/{Bulan Romawi}/{Tahun}',
      estimasiWaktu: '1 Hari Kerja',
    },
    {
      id: 'sku',
      kode: 'SKU',
      nama: 'Surat Keterangan Usaha',
      deskripsi: 'Surat keterangan yang menerangkan bahwa warga yang bersangkutan benar memiliki dan mengelola usaha produktif di lingkungan wilayah desa.',
      keperluanUmum: [
        'Pengajuan Kredit Usaha Rakyat (KUR) & pinjaman modal bank',
        'Persyaratan perizinan usaha mikro dan kecil (UMKM)',
        'Kemitraan bisnis atau penyaluran bantuan pemerintah',
        'Bukti legalitas lokasi operasional usaha',
      ],
      persyaratan: [
        { nama: 'Foto KTP Pemilik Usaha', wajib: true },
        { nama: 'Foto Kartu Keluarga (KK)', wajib: true },
        { nama: 'Surat Pengantar RT / RW', wajib: true },
        { nama: 'Foto Tempat Usaha', wajib: false },
      ],
      formatNomor: '.../SKU/{Bulan Romawi}/{Tahun}',
      estimasiWaktu: '1 Hari Kerja',
    },
    {
      id: 'sktm',
      kode: 'SKTM',
      nama: 'Surat Keterangan Tidak Mampu',
      deskripsi: 'Surat keterangan yang diberikan kepada warga berdasarkan data permohonan dan catatan administrasi desa untuk menerangkan keadaan ekonomi keluarga kurang mampu.',
      keperluanUmum: [
        'Pendaftaran beasiswa pendidikan (seperti KIP Kuliah)',
        'Keringanan biaya rumah sakit atau jaminan kesehatan',
        'Pengajuan bantuan sosial dan program pemerintah',
        'Keringanan biaya administrasi pendidikan anak',
      ],
      persyaratan: [
        { nama: 'Foto KTP Pemohon', wajib: true },
        { nama: 'Foto Kartu Keluarga (KK)', wajib: true },
        { nama: 'Surat Pengantar RT', wajib: true },
      ],
      formatNomor: '.../SKTM/{Bulan Romawi}/{Tahun}',
      estimasiWaktu: '1 Hari Kerja',
    },
    {
      id: 'sp',
      kode: 'SP',
      nama: 'Surat Pengantar RT / RW',
      deskripsi: 'Surat pengantar resmi dari desa untuk keperluan administratif kependudukan yang membutuhkan rujukan ke tingkat kecamatan atau instansi terkait.',
      keperluanUmum: [
        'Permohonan penerbitan KTP baru atau penggantian KTP rusak',
        'Pengurusan surat pindah datang atau pindah keluar',
        'Keperluan pengantar nikah ke KUA',
        'Pengantar pengurusan berkas ke dinas kependudukan luar daerah',
      ],
      persyaratan: [
        { nama: 'Foto KTP Pemohon', wajib: true },
        { nama: 'Foto Kartu Keluarga (KK)', wajib: true },
      ],
      formatNomor: '.../SP/{Bulan Romawi}/{Tahun}',
      estimasiWaktu: '1 Hari Kerja',
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white font-sans text-gray-800">
      <PublicNavbar />

      {/* ── Page Header / Hero ── */}
      <section className="bg-gradient-to-b from-[#0c1d32] via-[#142B4A] to-[#1a375d] text-white py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5C542_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          <div
            data-reveal
            className="reveal-init reveal-fade-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-semibold text-accent mb-4"
          >
            <Sparkles size={13} className="text-accent" />
            <span>Katalog Layanan Administrasi Desa</span>
          </div>

          <h1
            data-reveal
            className="reveal-init reveal-fade-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5"
          >
            Layanan Surat Keterangan Desa
          </h1>

          <p
            data-reveal
            className="reveal-init reveal-fade-up delay-200 text-navy-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Pilih jenis surat keterangan yang Anda butuhkan, periksa kelengkapan berkas yang dipersyaratkan, dan ajukan secara online langsung melalui SiDesaku.
          </p>

        </div>
      </section>

      {/* ── Catalog Cards Section ── */}
      <section className="py-20 bg-bglight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {katalogSurat.map((surat, idx) => (
              <div
                key={surat.id}
                id={surat.id}
                data-reveal
                className={`card-hover p-6 sm:p-8 rounded-2xl bg-white border border-gray-200/80 flex flex-col justify-between shadow-xs reveal-init reveal-fade-up delay-${((idx % 2) + 1) * 150}`}
              >
                <div className="space-y-4">

                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-extrabold tracking-wider uppercase px-3 py-1 rounded bg-primary text-white">
                      {surat.kode}
                    </span>
                    <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
                      <Clock size={13} className="text-primary" />
                      Estimasi: {surat.estimasiWaktu}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary mb-2">
                      {surat.nama}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                      {surat.deskripsi}
                    </p>
                  </div>

                  {/* Keperluan Umum */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Umum Digunakan Untuk:
                    </p>
                    <ul className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                      {surat.keperluanUmum.map((k, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 size={13} className="text-primary flex-shrink-0 mt-0.5" />
                          <span>{k}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Persyaratan Dokumen */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Berkas Persyaratan yang Diunggah:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {surat.persyaratan.map((syarat, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-navy-50 text-navy-800 border border-navy-100/60"
                        >
                          <FileText size={12} className="text-primary" />
                          <span>{syarat.nama}</span>
                          {syarat.wajib && <span className="text-red-500 font-bold">*</span>}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Format Nomor Surat */}
                  <div className="p-2.5 rounded-lg bg-bglight border border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
                    <span>Format Penomoran:</span>
                    <span className="font-mono font-semibold text-primary">{surat.formatNomor}</span>
                  </div>

                </div>

                {/* Card Action */}
                <div className="pt-6 border-t border-gray-100 mt-6">
                  <button
                    onClick={() => handleAjukan(surat.kode)}
                    className="btn-accent w-full justify-center text-sm font-bold shadow-xs hover:shadow transition-all"
                  >
                    Ajukan {surat.nama} <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Panduan Upload Berkas */}
          <div
            data-reveal
            className="reveal-init reveal-fade-up p-6 rounded-2xl bg-white border border-gray-200/80 shadow-xs space-y-3"
          >
            <div className="flex items-center gap-2.5 text-primary font-bold text-sm">
              <Info size={18} className="text-primary" />
              <span>Ketentuan Berkas Persyaratan Digital</span>
            </div>
            <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-5 leading-relaxed">
              <li>Pastikan dokumen hasil scan atau foto terlihat jelas, tidak buram, dan seluruh tulisan terbaca sempurna.</li>
              <li>Format file yang didukung sistem: <strong>PDF, JPG, JPEG, atau PNG</strong> dengan ukuran file yang proporsional.</li>
              <li>Dokumen bertanda bintang merah (<span className="text-red-500 font-bold">*</span>) merupakan berkas wajib yang harus dilampirkan sebelum formulir dapat dikirim.</li>
              <li>Setiap permohonan akan diverifikasi secara teliti oleh Admin Desa sebelum diterbitkan.</li>
            </ul>
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
