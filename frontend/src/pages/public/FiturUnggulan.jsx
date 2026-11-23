import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Clock, Shield, Award, Smartphone, Users,
  CheckCircle2, ArrowRight, Sparkles, Database, Lock,
  FileCheck, Download, Bell, HelpCircle
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import useScrollReveal from '../../utils/useScrollReveal';

export default function FiturUnggulan() {
  const containerRef = useScrollReveal();

  const mainFeatures = [
    {
      icon: Smartphone,
      badge: 'Layanan 24 Jam',
      title: 'Pengajuan Mandiri Online',
      desc: 'Warga desa dapat mengajukan permohonan surat keterangan dari rumah melalui smartphone atau komputer tanpa harus datang dan mengantre di kantor desa.',
      details: [
        'Formulir terisi otomatis dari data profil warga',
        'Unggah berkas persyaratan digital (PDF, JPG, PNG)',
        'Dapat diakses kapan saja selama 24/7',
      ],
    },
    {
      icon: Clock,
      badge: 'Transparan',
      title: 'Pelacakan Status Real-Time',
      desc: 'Setiap permohonan surat dilengkapi nomor registrasi unik yang memungkinkan pemohon memantau tahapan proses dari awal hingga selesai secara transparan.',
      details: [
        'Tahapan: Diajukan, Verifikasi, Disetujui, dan Terbit',
        'Catatan koreksi dari admin jika ada berkas yang kurang',
        'Notifikasi status pembaruan permohonan',
      ],
    },
    {
      icon: FileCheck,
      badge: 'Verifikasi Akurat',
      title: 'Verifikasi oleh Admin Desa',
      desc: 'Petugas administrasi desa memiliki portal khusus untuk memverifikasi keabsahan data pemohon dan memeriksa berkas lampiran sebelum surat diterbitkan.',
      details: [
        'Pemeriksaan berkas digital langsung di browser',
        'Persetujuan atau penolakan dengan catatan resmi',
        'Pencatatan petugas yang memproses dokumen',
      ],
    },
    {
      icon: Award,
      badge: 'Standar Desa',
      title: 'Penomoran Otomatis & Berurutan',
      desc: 'Sistem penomoran surat dibuat otomatis sesuai format baku administrasi desa dengan format nomor urut, kode surat, bulan romawi, dan tahun berjalan.',
      details: [
        'Nomor urut otomatis per jenis surat di masing-masing desa',
        'Mencegah duplikasi nomor surat keluar',
        'Tersimpan permanen pada riwayat arsip',
      ],
    },
    {
      icon: Download,
      badge: 'Arsip Digital',
      title: 'Generasi & Arsip Dokumen PDF',
      desc: 'Dokumen surat keterangan dihasilkan dalam format PDF siap cetak dengan susunan kop surat pemerintah desa, identitas pemohon, dan data pejabat terkait.',
      details: [
        'Format tata letak surat standar administrasi desa',
        'File PDF tersimpan permanen di direktori arsip',
        'Unduh ulang file yang sama tanpa perubahan nomor',
      ],
    },
    {
      icon: Lock,
      badge: 'Terisolasi Aman',
      title: 'Keamanan Multi-Tenant Desa',
      desc: 'Arsitektur sistem memisahkan data setiap desa secara ketat. Warga dan petugas hanya dapat mengakses data yang menjadi wewenang di wilayah desanya.',
      details: [
        'Isolasi data antar-desa di tingkat database query',
        'Autentikasi token JWT dengan masa berlaku aman',
        'Pengunduhan dokumen terlindungi header autentikasi',
      ],
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
            <span>Inovasi Pelayanan Publik Desa</span>
          </div>

          <h1
            data-reveal
            className="reveal-init reveal-fade-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5"
          >
            Fitur Unggulan SiDesaku
          </h1>

          <p
            data-reveal
            className="reveal-init reveal-fade-up delay-200 text-navy-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Dirancang secara komprehensif untuk mempermudah warga dalam pengajuan berkas serta membantu perangkat desa mengelola administrasi secara tertib, cepat, dan transparan.
          </p>

        </div>
      </section>

      {/* ── Main Features Grid ── */}
      <section className="py-20 md:py-28 bg-bglight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mainFeatures.map((feat, i) => (
              <div
                key={feat.title}
                data-reveal
                className={`card-hover p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 flex flex-col justify-between reveal-init reveal-fade-up delay-${((i % 3) + 1) * 100}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-navy-50 text-primary flex items-center justify-center shadow-xs">
                      <feat.icon size={22} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2.5 py-1 rounded bg-accent/30">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-gray-800 mb-2.5 leading-snug">
                    {feat.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed mb-5">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Keunggulan:</p>
                  <ul className="space-y-1.5 text-xs text-gray-600">
                    {feat.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      <div className="pt-10">
        <PublicFooter showCta={true} />
      </div>
    </div>
  );
}
