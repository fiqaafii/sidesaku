import React from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, MapPin, CheckCircle2, Smartphone,
  ChevronRight, ArrowRight, FileText, Users,
  Building2, Clock
} from 'lucide-react';

export default function PublicFooter({ showCta = true }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#EDF3F8] text-[#142B4A] pt-8 pb-6 border-t border-slate-200">

      {/* ── 1. Floating CTA Banner (Mengacu pada Banner DigitalDesa) ── */}
      {showCta && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 mb-14 relative z-20">
          <div className="bg-gradient-to-r from-[#0C1D32] via-[#142B4A] to-[#0C1D32] text-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-navy-900/15 border border-white/10 text-center relative overflow-hidden">
            {/* Ambient Background Blur */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-3">
              <h3 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Tertarik Menggunakan SiDesaku?
              </h3>
              <p className="text-navy-100 text-sm sm:text-base leading-relaxed">
                Tingkatkan efisiensi pelayanan surat desa Anda dan berikan kemudahan akses mandiri bagi seluruh warga desa!
              </p>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/daftar"
                  className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-accent text-[#0C1D32] font-heading font-extrabold text-sm shadow-md hover:bg-yellow-400 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Mulai Gunakan Sekarang
                </Link>
                <Link
                  to="/layanan"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm border border-white/20 transition-all"
                >
                  Pelajari Layanan Surat <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── 2. Struktur Footer 4 Kolom: IDENTITAS | JELAJAHI | LAYANAN SURAT | AKSES PORTAL ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-300/80">

          {/* Kolom 1 – Identitas SiDesaku & Informasi Layanan (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-[#142B4A] flex items-center justify-center text-accent shadow-sm font-bold transition-transform group-hover:scale-105">
                <MapPin size={20} />
              </div>
              <div>
                <span className="font-heading font-extrabold text-xl text-[#142B4A] tracking-tight block leading-none">
                  SiDesaku
                </span>
                <span className="text-[11px] text-slate-500 font-semibold tracking-wide block mt-1">
                  Platform Digital Administrasi Desa
                </span>
              </div>
            </Link>

            <p className="text-xs text-slate-600 leading-relaxed pr-2">
              Platform pelayanan administrasi dan penerbitan surat keterangan kependudukan terpadu. Mempermudah warga dalam pengajuan berkas secara mandiri, transparan, dan terhubung langsung dengan admin desa.
            </p>

            <div className="space-y-2 pt-1">
              {/* Kontak Email Resmi */}
              <a
                href="mailto:layanan@sidesaku.desa.id"
                className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-300 shadow-xs hover:border-[#142B4A] text-xs font-semibold text-[#142B4A] transition-all group"
              >
                <div className="w-6 h-6 rounded-lg bg-navy-50 flex items-center justify-center text-[#142B4A] group-hover:bg-[#142B4A] group-hover:text-white transition-colors">
                  <Mail size={13} />
                </div>
                <span>layanan@sidesaku.desa.id</span>
              </a>

              {/* Status Jam Layanan */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium pt-1">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span>Pelayanan Desa: Senin – Jumat (08.00 – 16.00 WIB)</span>
              </div>
            </div>
          </div>

          {/* Kolom 2 – Jelajahi (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-sm font-extrabold uppercase tracking-widest text-[#142B4A] pb-1 border-b border-slate-300/60">
              Jelajahi
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              <li>
                <Link to="/fitur" className="hover:text-primary transition-colors flex items-center gap-1.5 py-0.5">
                  <ChevronRight size={13} className="text-slate-400" />
                  <span>Fitur Unggulan</span>
                </Link>
              </li>
              <li>
                <Link to="/layanan" className="hover:text-primary transition-colors flex items-center gap-1.5 py-0.5">
                  <ChevronRight size={13} className="text-slate-400" />
                  <span>Layanan Surat</span>
                </Link>
              </li>
              <li>
                <Link to="/keamanan" className="hover:text-primary transition-colors flex items-center gap-1.5 py-0.5">
                  <ChevronRight size={13} className="text-slate-400" />
                  <span>Keamanan & Privasi</span>
                </Link>
              </li>
              <li>
                <Link to="/cara-pengajuan" className="hover:text-primary transition-colors flex items-center gap-1.5 py-0.5">
                  <ChevronRight size={13} className="text-slate-400" />
                  <span>Tata Cara Pengajuan</span>
                </Link>
              </li>
              <li>
                <Link to="/keamanan" className="hover:text-primary transition-colors flex items-center gap-1.5 py-0.5">
                  <ChevronRight size={13} className="text-slate-400" />
                  <span>Kebijakan Privasi Data</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 3 – Layanan Surat (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-heading text-sm font-extrabold uppercase tracking-widest text-[#142B4A] pb-1 border-b border-slate-300/60">
              Layanan Surat
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              <li>
                <Link to="/layanan" className="hover:text-primary transition-colors flex items-center gap-2 py-0.5">
                  <FileText size={13} className="text-primary/70 shrink-0" />
                  <span>Surat Keterangan Domisili (SKD)</span>
                </Link>
              </li>
              <li>
                <Link to="/layanan" className="hover:text-primary transition-colors flex items-center gap-2 py-0.5">
                  <FileText size={13} className="text-primary/70 shrink-0" />
                  <span>Surat Keterangan Usaha (SKU)</span>
                </Link>
              </li>
              <li>
                <Link to="/layanan" className="hover:text-primary transition-colors flex items-center gap-2 py-0.5">
                  <FileText size={13} className="text-primary/70 shrink-0" />
                  <span>Surat Keterangan Tidak Mampu (SKTM)</span>
                </Link>
              </li>
              <li>
                <Link to="/layanan" className="hover:text-primary transition-colors flex items-center gap-2 py-0.5">
                  <FileText size={13} className="text-primary/70 shrink-0" />
                  <span>Surat Pengantar RT / RW</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Kolom 4 – Akses Portal & Bantuan (lg:col-span-2) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-heading text-sm font-extrabold uppercase tracking-widest text-[#142B4A] pb-1 border-b border-slate-300/60">
              Akses Portal
            </h4>
            <ul className="space-y-2 text-xs font-medium text-slate-700">
              <li>
                <Link to="/login" className="hover:text-primary transition-colors flex items-center gap-2 py-0.5">
                  <Users size={13} className="text-primary/70 shrink-0" />
                  <span>Masuk Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/daftar" className="text-primary font-bold hover:underline flex items-center gap-2 py-0.5">
                  <CheckCircle2 size={13} className="text-primary shrink-0" />
                  <span>Daftar Warga</span>
                </Link>
              </li>
              <li>
                <Link to="/daftar-admin" className="hover:text-primary transition-colors flex items-center gap-2 py-0.5">
                  <Building2 size={13} className="text-primary/70 shrink-0" />
                  <span>Daftar Admin Desa</span>
                </Link>
              </li>
            </ul>

            {/* Akses Cepat Web & Mobile Portal Badge */}
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2.5 p-2.5 rounded-xl bg-white border border-slate-300 hover:border-[#142B4A] shadow-xs transition-all group w-full"
              >
                <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center text-[#142B4A] group-hover:bg-[#142B4A] group-hover:text-accent transition-colors shrink-0">
                  <Smartphone size={16} />
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-500 uppercase tracking-wider block font-semibold leading-none">
                    Portal Mandiri
                  </span>
                  <span className="text-[11px] font-bold text-[#142B4A] block truncate mt-0.5">
                    Web & Mobile
                  </span>
                </div>
              </Link>
            </div>
          </div>

        </div>

        {/* ── 3. Middle Section: ALAMAT OPERASIONAL & SEKRETARIAT ── */}
        <div className="py-6 border-b border-slate-300/80">
          <div className="max-w-4xl mx-auto space-y-3">
            <h5 className="font-heading text-xs font-extrabold uppercase tracking-widest text-[#142B4A] text-center">
              Alamat Sekretariat & Layanan
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
              {/* Alamat 1 */}
              <div className="flex items-start gap-2.5 bg-white/70 p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <MapPin size={16} className="text-[#142B4A] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[#142B4A] block font-semibold">Kantor Layanan Desa</strong>
                  Jl. Praja Mandiri No. 01, Wilayah Administrasi Terpadu
                </p>
              </div>

              {/* Alamat 2 */}
              <div className="flex items-start gap-2.5 bg-white/70 p-3 rounded-xl border border-slate-200/80 shadow-xs">
                <MapPin size={16} className="text-[#142B4A] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-[#142B4A] block font-semibold">Pusat Layanan Kependudukan</strong>
                  Gedung Sentra Administrasi Digital Desa Terintegrasi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. Bottom Dark Pill / Copyright Bar (Sesuai Desain DigitalDesa) ── */}
        <div className="pt-6">
          <div className="bg-[#0C1D32] text-white py-3.5 px-6 rounded-2xl sm:rounded-full text-center shadow-sm">
            <p className="text-xs text-navy-100 font-medium tracking-wide">
              © {currentYear} Powered by <strong className="text-white font-bold">SiDesaku</strong> — Platform Digital Pelayanan Administrasi Desa
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}