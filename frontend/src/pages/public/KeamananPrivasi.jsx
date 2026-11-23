import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Key, FileCheck, CheckCircle2,
  Building2, Users, Award, ShieldAlert, ArrowRight,
  Database, EyeOff, Server
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import useScrollReveal from '../../utils/useScrollReveal';

export default function KeamananPrivasi() {
  const containerRef = useScrollReveal();

  const securitySections = [
    {
      icon: Database,
      badge: 'Multi-Tenant Tenancy',
      title: 'Pemisahan Data Multi-Tenant Antar Desa',
      desc: 'SiDesaku menerapkan arsitektur isolasi multi-tenant yang ketat berdasarkan identitas desa (id_desa). Setiap desa memiliki partisi logis tersendiri untuk mengamankan data kependudukan.',
      points: [
        'Data permohonan, data warga, dan konfigurasi surat milik Desa Makmur terpisah dari Desa Sejahtera.',
        'Setiap query database pada backend secara otomatis menyaring data sesuai ID desa pengguna yang terotentikasi.',
        'Upaya akses dokumen atau permohonan antar-desa secara otomatis ditolak dengan respon HTTP 403 Forbidden.',
      ],
    },
    {
      icon: Users,
      badge: 'Role-Based Access Control',
      title: 'Pembagian Hak Akses Pengguna',
      desc: 'Wewenang sistem dibagi secara tegas ke dalam tiga tingkatan peran (role) untuk memastikan tidak ada penyalahgunaan akses terhadap data kependudukan warga.',
      points: [
        'Warga Desa: Hanya memiliki akses ke data profil pribadi, pengajuan surat mandiri, dan unduhan arsip milik sendiri.',
        'Admin Desa: Hanya berwenang memverifikasi data dan menerbitkan surat untuk warga di wilayah desanya.',
        'Super Admin Kecamatan: Mengawasi pengelolaan data desa dan menyetujui akun Admin Desa yang sah.',
      ],
    },
    {
      icon: Key,
      badge: 'Autentikasi Terenkripsi',
      title: 'Keamanan Autentikasi & Kata Sandi',
      desc: 'Proses masuk akun dilindungi mekanisme autentikasi terenkripsi untuk mencegah akses oleh pihak yang tidak bertanggung jawab.',
      points: [
        'Kata sandi pengguna dienkripsi satu arah menggunakan algoritma hashing bcrypt sebelum disimpan ke database.',
        'Sesi login dikelola menggunakan JSON Web Token (JWT) dengan signature secret key dan waktu kedaluwarsa berkala.',
        'Penyimpanan token pada sisi peramban membatasi akses ilegal dan memutus sesi ketika pengguna keluar (logout).',
      ],
    },
    {
      icon: FileCheck,
      badge: 'Arsip Dokumen PDF',
      title: 'Pengunduhan Dokumen PDF Terautentikasi',
      desc: 'Pengunduhan dokumen PDF surat keterangan desa tidak dapat diakses melalui tautan publik terbuka tanpa kredensial yang sah.',
      points: [
        'Frontend mengambil stream dokumen PDF menggunakan header Authorization: Bearer token terenkripsi.',
        'Token tidak dikirimkan melalui query string URL browser untuk mencegah terekspos pada log server atau riwayat browser.',
        'Backend memeriksa kecocokan kepemilikan surat sebelum mengalirkan response dengan tipe application/pdf.',
      ],
    },
    {
      icon: Award,
      badge: 'Integritas Penomoran',
      title: 'Integritas Penomoran Surat & Arsip Permanen',
      desc: 'Sistem menjamin keabsahan urutan surat keluar desa dengan pencatatan nomor resmi yang konsisten dan tidak berganti.',
      points: [
        'Nomor surat resmi dihasilkan secara berurutan dan unik per desa berdasarkan bulan dan tahun penerbitan.',
        'Snapshot data warga dan data surat dicatat permanen di tabel arsip saat pertama kali diterbitkan.',
        'Pencetakan atau pengunduhan ulang file surat akan selalu mengambil file arsip yang sama tanpa menghasilkan nomor baru.',
      ],
    },
    {
      icon: Shield,
      badge: 'Dukungan Tertib Administrasi',
      title: 'Dukungan Tertib Administrasi & Privasi Warga',
      desc: 'SiDesaku dirancang untuk membantu penyelenggaraan administrasi desa yang akuntabel dengan prinsip kehati-hatian data.',
      points: [
        'Data pribadi warga hanya dikumpulkan untuk keperluan pelayanan administrasi surat menyurat.',
        'Sistem tidak membagikan data kepada pihak ketiga tanpa otorisasi atau dasar hukum yang berlaku.',
        'Membantu pemerintah desa mendokumentasikan arsip surat keluar secara rapi dan mudah ditelusuri kembali.',
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
            <Shield size={13} className="text-accent" />
            <span>Keamanan & Privasi Data Kependudukan</span>
          </div>

          <h1
            data-reveal
            className="reveal-init reveal-fade-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5"
          >
            Keamanan Sistem & Privasi Data
          </h1>

          <p
            data-reveal
            className="reveal-init reveal-fade-up delay-200 text-navy-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Penjelasan transparan mengenai arsitektur keamanan, isolasi data multi-tenant, dan perlindungan arsip surat keterangan desa pada platform SiDesaku.
          </p>

        </div>
      </section>

      {/* ── Security Architecture Sections Grid ── */}
      <section className="py-20 bg-bglight">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securitySections.map((sec, idx) => (
              <div
                key={sec.title}
                data-reveal
                className={`card-hover p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 flex flex-col justify-between shadow-xs reveal-init reveal-fade-up delay-${((idx % 3) + 1) * 100}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-navy-50 text-primary flex items-center justify-center shadow-xs">
                      <sec.icon size={22} className="text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider px-2.5 py-1 rounded bg-accent/30">
                      {sec.badge}
                    </span>
                  </div>

                  <h3 className="font-heading text-lg font-bold text-gray-800 mb-2.5 leading-snug">
                    {sec.title}
                  </h3>

                  <p className="text-xs text-gray-500 leading-relaxed mb-5">
                    {sec.desc}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mekanisme:</p>
                  <ul className="space-y-2 text-xs text-gray-600">
                    {sec.points.map((pt, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-success flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Privacy Statement Card */}
          <div
            data-reveal
            className="reveal-init reveal-fade-up mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-gray-200/80 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-accent flex items-center justify-center font-bold">
                <Lock size={18} />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-primary">Komitmen Privasi & Keamanan Informasi</h3>
                <p className="text-xs text-gray-400">Pernyataan keterbukaan implementasi sistem SiDesaku</p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Platform SiDesaku dikembangkan untuk mendukung ketertiban administrasi desa secara digital. Seluruh data kependudukan (NIK, nama, alamat, nomor KK, dan berkas foto) hanya diproses untuk pemenuhan verifikasi permohonan surat administrasi yang diajukan oleh pemohon yang bersangkutan dan diverifikasi oleh admin desa yang berwenang.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-primary">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-success" /> Enkripsi Sandi Bcrypt</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-success" /> Autentikasi JWT Bearer</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-success" /> Isolasi Antar-Desa 100%</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-success" /> Arsip Digital Terpadu</span>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
