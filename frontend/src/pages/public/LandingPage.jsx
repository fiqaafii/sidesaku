import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin, FileText, Clock, CheckCircle2, ArrowRight,
  Shield, Smartphone, Users, Building2, Download,
  CheckCircle, Sparkles, ChevronRight, Lock, Award
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import useScrollReveal from '../../utils/useScrollReveal';

export default function LandingPage() {
  const containerRef = useScrollReveal();

  const steps = [
    {
      no: '01',
      title: 'Pendaftaran Akun',
      desc: 'Daftar menggunakan NIK dan data diri Anda, pilih desa domisili, lalu masuk ke portal warga.',
      icon: Users,
    },
    {
      no: '02',
      title: 'Pilih Jenis Surat',
      desc: 'Tentukan kebutuhan surat keterangan dan periksa kelengkapan berkas wajib yang harus dilampirkan.',
      icon: FileText,
    },
    {
      no: '03',
      title: 'Unggah Berkas Persyaratan',
      desc: 'Unggah dokumen langsung dari smartphone atau komputer dalam format PDF, JPG, atau PNG tanpa fotokopi fisik.',
      icon: Smartphone,
    },
    {
      no: '04',
      title: 'Verifikasi & Unduh PDF',
      desc: 'Admin desa memverifikasi permohonan. Setelah disetujui, dokumen berarsip PDF dapat langsung diunduh.',
      icon: Download,
    },
  ];

  const features = [
    {
      icon: FileText,
      badge: 'Layanan 24/7',
      title: 'Pengajuan Mandiri Online',
      desc: 'Warga dapat mengajukan berbagai permohonan surat administrasi kapan saja tanpa perlu antre di loket kantor desa.',
    },
    {
      icon: Clock,
      badge: 'Transparan',
      title: 'Pemantauan Status Real-Time',
      desc: 'Lacak tahapan proses permohonan mulai dari diajukan, verifikasi berkas, persetujuan admin, hingga penerbitan surat.',
    },
    {
      icon: Shield,
      badge: 'Terisolasi Aman',
      title: 'Keamanan Multi-Tenant',
      desc: 'Setiap desa memiliki data dan arsip yang terisolasi ketat. Hak akses dilindungi autentikasi token berstandar industri.',
    },
    {
      icon: Award,
      badge: 'Tertib Berkas',
      title: 'Arsip Dokumen Otomatis',
      desc: 'Penomoran surat dialokasikan otomatis sesuai urutan per desa dan file PDF tersimpan permanen di arsip digital.',
    },
  ];

  const jenisSurat = [
    {
      kode: 'SKD',
      nama: 'Surat Keterangan Domisili',
      desc: 'Keterangan tempat tinggal warga untuk keperluan perbankan, pekerjaan, atau domisili kependudukan.',
      persyaratan: ['Foto KTP Asli', 'Foto Kartu Keluarga (KK)'],
      estimasi: '1 Hari Kerja',
    },
    {
      kode: 'SKU',
      nama: 'Surat Keterangan Usaha',
      desc: 'Keterangan keberadaan usaha warga di wilayah desa untuk pengajuan KUR, izin usaha, atau kemitraan.',
      persyaratan: ['Foto KTP', 'Foto KK', 'Surat Pengantar RT', 'Foto Tempat Usaha (Opsional)'],
      estimasi: '1 Hari Kerja',
    },
    {
      kode: 'SKTM',
      nama: 'Surat Keterangan Tidak Mampu',
      desc: 'Keterangan kondisi ekonomi keluarga untuk beasiswa KIP Kuliah, bantuan sosial, atau keringanan biaya.',
      persyaratan: ['Foto KTP', 'Foto KK', 'Surat Pengantar RT'],
      estimasi: '1 Hari Kerja',
    },
    {
      kode: 'SP',
      nama: 'Surat Pengantar RT / RW',
      desc: 'Pengantar administratif permohonan kependudukan (KTP baru, pindah, atau keperluan dinas luar).',
      persyaratan: ['Foto KTP', 'Foto Kartu Keluarga'],
      estimasi: '1 Hari Kerja',
    },
  ];

  const securityPillars = [
    {
      icon: Lock,
      title: 'Pemisahan Data Multi-Tenant',
      desc: 'Data permohonan, data penduduk, dan arsip dokumen setiap desa (seperti Desa Makmur dan Desa Sejahtera) terisolasi penuh tanpa risiko kebocoran data silang.',
    },
    {
      icon: Shield,
      title: 'Isolasi Hak Akses Bertingkat',
      desc: 'Pembagian wewenang yang tegas antara Super Admin Kecamatan, Admin Desa, dan Warga. Admin desa hanya berwenang memeriksa dan menerbitkan surat desanya sendiri.',
    },
    {
      icon: FileText,
      title: 'Unduh PDF Terautentikasi',
      desc: 'Pengunduhan dokumen PDF surat diamankan dengan validasi Bearer Token tanpa mengekspos token pada query URL, mencegah akses dokumen tanpa izin.',
    },
    {
      icon: Award,
      title: 'Integritas Penomoran & Arsip',
      desc: 'Penomoran surat diterbitkan secara otomatis dan berurutan per desa. Dokumen yang sudah terbit diarsipkan permanen tanpa berubah saat dicetak ulang.',
    },
  ];

  return (
    <div ref={containerRef} className="min-h-screen flex flex-col bg-white font-sans text-gray-800">
      {/* ── Reusable Modern Navbar ── */}
      <PublicNavbar />

      {/* ── Hero Section (Bersih, Sederhana, dan Berfokus pada Identitas SiDesaku) ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0c1d32] via-[#142B4A] to-[#1a375d] text-white pt-20 pb-28 md:pt-28 md:pb-36">
        {/* Ambient Glow Accents */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5C542_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-accent/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl lg:max-w-4xl space-y-6">

            {/* Opening Badge */}
            <div
              data-reveal
              className="reveal-init reveal-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm text-xs font-semibold text-accent"
            >
              <MapPin size={13} className="text-accent" />
              <span>Platform Digital Administrasi Desa</span>
            </div>

            {/* Main Headline */}
            <h1
              data-reveal
              className="reveal-init reveal-fade-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.18] text-white"
            >
              Layanan Administrasi Desa{' '}
              <span className="text-accent underline decoration-accent/40 decoration-wavy decoration-2">
                Lebih Mudah
              </span>{' '}
              dan Cepat.
            </h1>

            {/* Description */}
            <p
              data-reveal
              className="reveal-init reveal-fade-up delay-200 text-navy-200 text-base md:text-lg lg:text-xl leading-relaxed font-normal max-w-2xl"
            >
              Ajukan surat keterangan domisili, usaha, tidak mampu, dan surat pengantar secara mandiri. Pantau status permohonan secara real-time dan unduh arsip dokumen PDF langsung dari perangkat Anda — tanpa harus datang ke kantor desa.
            </p>

            {/* CTA Action Buttons */}
            <div
              data-reveal
              className="reveal-init reveal-fade-up delay-300 flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                to="/daftar"
                className="btn-accent px-7 py-3.5 text-base font-semibold shadow-lg shadow-accent/20 hover:shadow-accent/30 flex items-center gap-2"
              >
                Mulai Sekarang <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-lg border-2 border-white/20 text-white text-base font-semibold hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm"
              >
                Sudah punya akun? Masuk
              </Link>
            </div>

            {/* Trust Indicators Bar */}
            <div
              data-reveal
              className="reveal-init reveal-fade-up delay-400 pt-8 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-white/10 text-xs sm:text-sm text-navy-200"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                <span>Pelayanan Mandiri Online 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                <span>Verifikasi oleh Admin Desa</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                <span>Arsip Dokumen PDF</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Statistics / Impact Section ── */}
      <section className="relative z-20 -mt-10 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div
          data-reveal
          className="reveal-init reveal-fade-up bg-white rounded-2xl shadow-xl shadow-navy-900/5 border border-gray-100 p-6 md:p-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center"
        >
          <div className="border-r border-gray-100 last:border-none px-2">
            <p className="font-heading text-3xl md:text-4xl font-extrabold text-primary">100%</p>
            <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Digital & Mandiri</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Pengajuan berkas secara online</p>
          </div>
          <div className="border-r border-gray-100 last:border-none px-2">
            <p className="font-heading text-3xl md:text-4xl font-extrabold text-accent">4</p>
            <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Jenis Layanan Surat</p>
            <p className="text-[11px] text-gray-400 mt-0.5">SKD, SKU, SKTM, & Surat Pengantar</p>
          </div>
          <div className="border-r border-gray-100 last:border-none px-2">
            <p className="font-heading text-3xl md:text-4xl font-extrabold text-primary">24 Jam</p>
            <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Akses Sistem</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Kapan saja dari mana saja</p>
          </div>
          <div className="px-2">
            <p className="font-heading text-3xl md:text-4xl font-extrabold text-success">Tertib</p>
            <p className="text-xs md:text-sm font-semibold text-gray-700 mt-1">Standar Administrasi Desa</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Kop, nomor urut, & arsip permanen</p>
          </div>
        </div>
      </section>

      {/* ── Section 1: Layanan Surat Digital (Katalog Layanan Surat) ── */}
      <section id="layanan" className="py-20 md:py-28 bg-bglight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Text Description Left */}
            <div
              data-reveal
              className="lg:col-span-5 space-y-5 reveal-init reveal-slide-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-100 text-primary text-xs font-bold">
                <FileText size={14} className="text-primary" />
                <span>Katalog Layanan Surat</span>
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary leading-tight">
                Semua Kebutuhan Surat Keterangan Warga dalam Satu Pintu
              </h2>

              <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                Aplikasi SiDesaku memfasilitasi pengajuan surat keterangan yang dibutuhkan masyarakat sehari-hari. Mulai dari urusan domisili perbankan, permodalan usaha UMKM, beasiswa pendidikan, hingga kepengurusan dokumen kependudukan.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Penomoran Otomatis & Unik</h4>
                    <p className="text-[11px] text-gray-500">Format penomoran standar pemerintah desa berbasis bulan romawi dan tahun berjalan.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/20 text-success flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 size={13} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-800">Unduh Dokumen PDF Langsung</h4>
                    <p className="text-[11px] text-gray-500">File PDF siap cetak dengan tata letak kop surat, identitas pemohon, pejabat, dan tanda tangan.</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <Link to="/layanan" className="btn-primary text-xs font-semibold">
                  Lihat Katalog Lengkap <ChevronRight size={14} />
                </Link>
                <Link to="/daftar" className="text-xs font-bold text-primary hover:underline">
                  Ajukan Surat Sekarang →
                </Link>
              </div>
            </div>

            {/* Visual Showcase Right: 4 Official Letters Cards */}
            <div
              data-reveal
              className="lg:col-span-7 reveal-init reveal-slide-right"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jenisSurat.map((surat) => (
                  <div
                    key={surat.kode}
                    className="card-hover p-5 border border-gray-200/80 bg-white rounded-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-primary text-white tracking-wider">
                          {surat.kode}
                        </span>
                        <span className="text-[10px] font-semibold text-gray-400 flex items-center gap-1">
                          <Clock size={11} /> {surat.estimasi}
                        </span>
                      </div>
                      <h3 className="font-heading text-sm font-bold text-primary mb-1.5 leading-snug">
                        {surat.nama}
                      </h3>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">
                        {surat.desc}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div className="text-[11px] text-gray-500">
                        {surat.persyaratan.length} Berkas Persyaratan
                      </div>
                      <Link to="/layanan" className="text-[11px] font-bold text-primary hover:text-navy-700 flex items-center gap-1">
                        Detail <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 2: Fitur Unggulan ── */}
      <section id="fitur" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="reveal-init reveal-fade-up text-center max-w-3xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-navy-900 text-xs font-bold mb-3">
              <Sparkles size={13} className="text-primary" />
              Kemudahan Administrasi Modern
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-4 leading-tight">
              Mengapa SiDesaku Menjadi Solusi Terbaik Pemerintahan Desa?
            </h2>
            <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
              Dirancang untuk memangkas birokrasi berbelit, mempercepat penanganan berkas warga, dan memastikan ketertiban pelaporan pemerintah desa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feat, i) => (
              <div
                key={feat.title}
                data-reveal
                className={`card-hover p-6 rounded-2xl border border-gray-200/80 bg-white flex flex-col justify-between reveal-init reveal-fade-up delay-${(i + 1) * 100}`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-navy-50 text-primary flex items-center justify-center mb-5">
                    <feat.icon size={22} className="text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2 py-0.5 rounded bg-accent/30 inline-block mb-2">
                    {feat.badge}
                  </span>
                  <h3 className="font-heading text-base font-bold text-gray-800 mb-2 leading-snug">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-10">
            <Link to="/fitur" className="btn-outline text-xs font-semibold">
              Pelajari Seluruh Fitur Unggulan <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section 3: Keamanan & Privasi (Layout Bersih & Proporsional) ── */}
      <section id="keamanan" className="py-20 md:py-28 bg-bglight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div
            data-reveal
            className="reveal-init reveal-fade-up text-center max-w-3xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 text-navy-900 text-xs font-bold mb-3.5">
              <Shield size={14} className="text-primary" />
              <span>Privasi & Integritas Data</span>
            </div>

            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-4 leading-tight">
              Keamanan Teruji untuk Perlindungan Data Kependudukan
            </h2>

            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Kami memahami pentingnya kerahasiaan identitas dan data kependudukan warga. Setiap berkas yang diunggah disimpan di direktori yang terproteksi, dengan isolasi wilayah desa yang ketat dan otorisasi berstandar industri.
            </p>
          </div>

          {/* 4 Security Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityPillars.map((pillar, i) => (
              <div
                key={pillar.title}
                data-reveal
                className={`card-hover p-6 rounded-2xl border border-gray-200/80 bg-white flex flex-col justify-between reveal-init reveal-fade-up delay-${(i + 1) * 100}`}
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-primary text-accent flex items-center justify-center mb-5 shadow-sm">
                    <pillar.icon size={22} />
                  </div>
                  <h3 className="font-heading text-base font-bold text-gray-800 mb-2.5 leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust Guarantee Note */}
          <div
            data-reveal
            className="reveal-init reveal-fade-up delay-300 mt-12 max-w-4xl mx-auto p-5 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-success/10 text-success flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} />
              </div>
              <div className="space-y-0.5 text-center sm:text-left">
                <p className="font-bold text-gray-800 text-xs sm:text-sm">Dukungan Tertib Administrasi Desa</p>
                <p className="text-gray-500 text-[11px] sm:text-xs leading-relaxed">
                  Akses dokumen dan penerbitan nomor surat dilindungi mekanisme otentikasi sesi multi-tenant.
                </p>
              </div>
            </div>
            <Link to="/keamanan" className="text-xs font-bold text-primary hover:underline whitespace-nowrap">
              Pelajari Arsitektur Keamanan →
            </Link>
          </div>

        </div>
      </section>

      {/* ── Section 4: Alur Pengajuan ── */}
      <section id="alur" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            data-reveal
            className="reveal-init reveal-fade-up text-center max-w-2xl mx-auto mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-navy-100 text-primary text-xs font-bold mb-3">
              <Clock size={13} className="text-primary" />
              Langkah Sederhana
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-primary mb-4 leading-tight">
              Cara Mudah Mengajukan Surat Keterangan
            </h2>
            <p className="text-gray-500 text-sm sm:text-base">
              Hanya perlu empat langkah praktis dari pendaftaran hingga dokumen surat permohonan Anda siap digunakan.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => (
              <div
                key={step.no}
                data-reveal
                className={`reveal-init reveal-fade-up delay-${(idx + 1) * 100} relative flex flex-col items-center text-center group`}
              >
                {/* Number Badge */}
                <div className="w-14 h-14 rounded-2xl bg-primary text-accent font-heading font-extrabold text-lg flex items-center justify-center shadow-md shadow-navy-900/10 mb-5 group-hover:scale-105 transition-transform">
                  {step.no}
                </div>

                <h3 className="font-heading text-base font-bold text-gray-800 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed max-w-xs">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center pt-10">
            <Link to="/cara-pengajuan" className="btn-outline text-xs font-semibold">
              Lihat Panduan Lengkap 7 Langkah Alur Surat <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Reusable Modern Footer (Mengadopsi Struktur & Desain DigitalDesa) ── */}
      <div className="pt-10">
        <PublicFooter showCta={true} />
      </div>
    </div>
  );
}
