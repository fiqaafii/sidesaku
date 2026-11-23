import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { MapPin, Menu, X, ArrowRight } from 'lucide-react';

export default function PublicNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', to: '/' },
    { label: 'Fitur Unggulan', to: '/fitur' },
    { label: 'Layanan Surat', to: '/layanan' },
    { label: 'Keamanan & Privasi', to: '/keamanan' },
    { label: 'Cara Pengajuan', to: '/cara-pengajuan' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-navy-900/10 transition-transform group-hover:scale-105">
            <MapPin size={20} className="text-accent" />
          </div>
          <div>
            <span className="font-heading text-lg font-extrabold text-primary tracking-tight leading-none block">
              SiDesaku
            </span>
            <span className="text-[11px] font-medium text-gray-400 tracking-wide leading-none mt-1 block">
              Platform Digital Administrasi Desa
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `transition-colors py-1 ${
                  isActive
                    ? 'text-primary font-bold border-b-2 border-accent'
                    : 'text-gray-600 hover:text-primary'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop Quick Auth Buttons */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm font-semibold text-primary hover:text-navy-700 hover:bg-navy-50 rounded-lg transition-all"
          >
            Masuk
          </Link>
          <Link
            to="/daftar"
            className="btn-accent btn-sm shadow-sm hover:shadow"
          >
            Daftar Warga
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link to="/login" className="px-3 py-1.5 text-xs font-semibold text-primary hover:bg-navy-50 rounded-lg">
            Masuk
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-navy-50 text-primary font-bold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <Link
              to="/daftar"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-accent w-full justify-center text-sm"
            >
              Daftar Sebagai Warga <ArrowRight size={15} />
            </Link>
            <Link
              to="/daftar-admin"
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-primary border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              Daftar Admin Desa
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
