import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, FileText, ClipboardList,
  LogOut, Menu, X, ChevronRight, Bell, MapPin,
  UserCheck, ScrollText, FileCheck, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// ── Konfigurasi navigasi per role ─────────────────────────
const navConfig = {
  super_admin: [
    { label: 'Dashboard',         to: '/super-admin/dashboard',  icon: LayoutDashboard },
    { label: 'Kelola Desa',       to: '/super-admin/desa',       icon: Building2 },
    { label: 'Persetujuan Admin', to: '/super-admin/akun',       icon: UserCheck },
  ],
  admin_desa: [
    { label: 'Dashboard',         to: '/admin/dashboard',        icon: LayoutDashboard },
    { label: 'Profil Desa',       to: '/admin/profil-desa',      icon: Building2 },
    { label: 'Data Warga',        to: '/admin/warga',            icon: Users },
    { label: 'Jenis Surat',       to: '/admin/jenis-surat',      icon: FileText },
    { label: 'Permohonan',        to: '/admin/permohonan',       icon: ClipboardList },
  ],
  warga: [
    { label: 'Beranda',           to: '/warga/dashboard',        icon: LayoutDashboard },
    { label: 'Profil Saya',       to: '/warga/profil',           icon: User },
    { label: 'Ajukan Surat',      to: '/warga/ajukan',           icon: FileCheck },
    { label: 'Permohonan Saya',   to: '/warga/permohonan',       icon: ScrollText },
  ],
};

function SidebarContent({ onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = navConfig[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = {
    super_admin: 'Super Admin Kecamatan',
    admin_desa: 'Admin Desa',
    warga: 'Warga',
  };

  return (
    <div className="flex flex-col h-full bg-primary text-white">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <MapPin size={16} className="text-primary" />
          </div>
          <div>
            <p className="font-heading text-sm font-extrabold leading-tight tracking-tight">SiDesaku</p>
            <p className="text-[10px] text-navy-200 leading-tight">Administrasi Desa</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-navy-200 hover:text-white lg:hidden">
            <X size={20} />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
            <span className="text-accent text-sm font-bold">
              {user?.nama_lengkap?.charAt(0) || '?'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user?.nama_lengkap}</p>
            <p className="text-[11px] text-navy-200 truncate">{roleLabel[user?.role]}</p>
            {user?.nama_desa && (
              <p className="text-[10px] text-accent/80 truncate">{user.nama_desa}</p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ label, to, icon: Icon }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={active ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="sidebar-link w-full text-left text-red-300 hover:text-red-200 hover:bg-red-900/20"
        >
          <LogOut size={18} />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
}

// ── Layout utama dengan sidebar ───────────────────────────
export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();

  const pageTitle = {
    super_admin: 'Kecamatan Sukamaju',
    admin_desa:  user?.nama_desa || 'Admin Desa',
    warga:       'Portal Warga',
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bglight">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col h-full shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 z-50">
            <SidebarContent onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-bglight"
          >
            <Menu size={20} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="font-heading text-sm font-bold text-primary truncate">
              {pageTitle[user?.role]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg text-gray-400 hover:bg-bglight hover:text-primary transition-colors">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
