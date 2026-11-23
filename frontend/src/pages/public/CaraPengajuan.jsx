import React from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, ClipboardList, Smartphone, FileCheck,
  CheckCircle2, Download, ArrowRight, Sparkles, HelpCircle,
  Clock, ShieldCheck
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import useScrollReveal from '../../utils/useScrollReveal';

export default function CaraPengajuan() {
  const containerRef = useScrollReveal();

  const flowSteps = [
    {
      step: '01',
      title: 'Pendaftaran Akun atau Masuk Portal',
      actor: 'Warga Desa',
      desc: 'Bagi warga yang baru pertama kali menggunakan SiDesaku, lakukan pendaftaran akun menggunakan data NIK, nama lengkap, alamat, dan nomor telepon, serta pilih desa domisili Anda. Jika sudah memiliki akun, langsung masuk ke portal.',
      icon: Users,
      tips: 'Pastikan NIK 16 digit sesuai dengan Kartu Tanda Penduduk (KTP) asli.',
    },
    {
      step: '02',
      title: 'Pilih Jenis Surat Keterangan',
      actor: 'Warga Desa',
      desc: 'Masuk ke menu "Ajukan Surat" pada dashboard warga, lalu pilih jenis surat yang Anda butuhkan (Surat Keterangan Domisili, Usaha, Tidak Mampu, atau Surat Pengantar RT/RW).',
      icon: FileText,
      tips: 'Baca rincian berkas persyaratan yang ditentukan sebelum mengisi formulir.',
    },
    {
      step: '03',
      title: 'Isi Formulir & Keperluan Surat',
      actor: 'Warga Desa',
      desc: 'Identitas diri dasar (nama, NIK, alamat, RT/RW, pekerjaan) akan otomatis terisi dari profil akun Anda. Warga hanya perlu mengisi keperluan surat secara jelas serta data khusus tambahan jika diperlukan.',
      icon: ClipboardList,
      tips: 'Contoh keperluan: "Untuk persyaratan pembukaan rekening bank" atau "Pengajuan beasiswa KIP Kuliah".',
    },
    {
      step: '04',
      title: 'Unggah Berkas Persyaratan Digital',
      actor: 'Warga Desa',
      desc: 'Lampirkan foto atau dokumen persyaratan wajib yang diminta (seperti Foto KTP, Kartu Keluarga, atau Surat Pengantar RT). Berkas dapat diunggah dalam format PDF, JPG, JPEG, atau PNG langsung dari perangkat.',
      icon: Smartphone,
      tips: 'Pastikan foto dokumen tidak terpotong, tidak silau, dan seluruh tulisan terbaca jelas.',
    },
    {
      step: '05',
      title: 'Pemeriksaan & Verifikasi oleh Admin Desa',
      actor: 'Admin Desa',
      desc: 'Permohonan yang masuk akan muncul pada daftar verifikasi Admin Desa. Petugas akan mencocokkan identitas pemohon dan memeriksa keabsahan berkas fisik digital yang diunggah.',
      icon: FileCheck,
      tips: 'Status permohonan dapat dipantau secara real-time: "Diajukan" -> "Pemeriksaan Berkas".',
    },
    {
      step: '06',
      title: 'Persetujuan & Penerbitan Surat',
      actor: 'Admin Desa',
      desc: 'Setelah berkas dinyatakan lengkap dan valid, Admin Desa memberikan persetujuan status. Sistem secara otomatis mengalokasikan nomor urut surat resmi desa dan menghasilkan dokumen PDF siap cetak.',
      icon: CheckCircle2,
      tips: 'Nomor surat resmi dibuat unik per desa dan tercatat permanen di riwayat arsip.',
    },
    {
      step: '07',
      title: 'Unduh Dokumen Surat Berarsip PDF',
      actor: 'Warga Desa',
      desc: 'Status permohonan berubah menjadi "Selesai". Warga dapat langsung mengunduh file PDF surat keterangan dari menu "Permohonan Saya" untuk dicetak atau digunakan sesuai keperluan administrasi.',
      icon: Download,
      tips: 'Pengunduhan dilindungi autentikasi token pengguna sehingga dokumen Anda aman dari pihak lain.',
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
            <span>Alur Pelayanan Administrasi Desa</span>
          </div>

          <h1
            data-reveal
            className="reveal-init reveal-fade-up delay-100 font-heading text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5"
          >
            Tata Cara Pengajuan Surat Online
          </h1>

          <p
            data-reveal
            className="reveal-init reveal-fade-up delay-200 text-navy-200 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed"
          >
            Panduan lengkap langkah demi langkah pengurusan surat keterangan desa melalui platform digital SiDesaku, dari pendaftaran hingga dokumen PDF siap diunduh.
          </p>

        </div>
      </section>

      {/* ── Steps Timeline Section ── */}
      <section className="py-20 bg-bglight">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

          <div className="space-y-6">
            {flowSteps.map((item, idx) => (
              <div
                key={item.step}
                data-reveal
                className={`card-hover p-6 sm:p-7 rounded-2xl bg-white border border-gray-200/80 shadow-xs flex flex-col sm:flex-row gap-6 items-start reveal-init reveal-fade-up delay-${((idx % 3) + 1) * 100}`}
              >
                {/* Step Number + Icon Badge */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-2 flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-accent font-heading font-extrabold text-xl flex items-center justify-center shadow-sm">
                    {item.step}
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                    {item.actor}
                  </span>
                </div>

                {/* Step Description */}
                <div className="space-y-2.5 flex-1 min-w-0">
                  <h3 className="font-heading text-lg sm:text-xl font-bold text-gray-800 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>

                  {/* Tips Note */}
                  <div className="p-3 rounded-xl bg-navy-50/70 border border-navy-100/60 text-xs text-navy-900 flex items-start gap-2 pt-2.5">
                    <CheckCircle2 size={15} className="text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] sm:text-xs text-gray-600">
                      <strong>Tips:</strong> {item.tips}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick CTA Box */}
          <div
            data-reveal
            className="reveal-init reveal-fade-up p-8 rounded-3xl bg-primary text-white text-center space-y-4 shadow-xl"
          >
            <h3 className="font-heading text-xl sm:text-2xl font-bold text-white">
              Siap Mengajukan Permohonan Surat?
            </h3>
            <p className="text-xs sm:text-sm text-navy-200 max-w-xl mx-auto leading-relaxed">
              Daftar sekarang atau masuk ke akun Anda untuk memulai proses pengajuan surat secara cepat dan terorganisir.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link to="/daftar" className="btn-accent px-6 py-3 text-sm font-bold shadow-md">
                Daftar Akun Warga <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="inline-flex items-center px-5 py-3 rounded-lg border border-white/20 text-white text-sm font-semibold hover:bg-white/10 transition-colors">
                Masuk ke Portal
              </Link>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
