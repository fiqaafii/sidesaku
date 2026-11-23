import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { RequireAuth, RequireRole, RequireApproved } from './routes/ProtectedRoute';

// Halaman Public
import LandingPage from './pages/public/LandingPage';
import FiturUnggulan from './pages/public/FiturUnggulan';
import LayananSurat from './pages/public/LayananSurat';
import KeamananPrivasi from './pages/public/KeamananPrivasi';
import CaraPengajuan from './pages/public/CaraPengajuan';
import NotFound from './pages/public/NotFound';
import AccessDenied from './pages/public/AccessDenied';
import ScrollToTop from './components/common/ScrollToTop';

// Halaman Auth
import Login from './pages/auth/Login';
import RegisterWarga from './pages/auth/RegisterWarga';
import RegisterAdmin from './pages/auth/RegisterAdmin';
import WaitingApproval from './pages/auth/WaitingApproval';

// Halaman Super Admin
import SuperAdminDashboard from './pages/super-admin/Dashboard';
import ManajemenDesa from './pages/super-admin/ManajemenDesa';
import PersetujuanAkun from './pages/super-admin/PersetujuanAkun';

// Halaman Admin Desa
import AdminDesaDashboard from './pages/admin-desa/Dashboard';
import DaftarPermohonan from './pages/admin-desa/DaftarPermohonan';
import ManajemenSurat from './pages/admin-desa/ManajemenSurat';
import ManajemenWarga from './pages/admin-desa/ManajemenWarga';
import ProfilDesa from './pages/admin-desa/ProfilDesa';

// Halaman Warga
import WargaDashboard from './pages/warga/Dashboard';
import AjukanSurat from './pages/warga/AjukanSurat';
import RiwayatPermohonan from './pages/warga/RiwayatPermohonan';
import ProfilWarga from './pages/warga/ProfilWarga';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/fitur" element={<FiturUnggulan />} />
          <Route path="/layanan" element={<LayananSurat />} />
          <Route path="/keamanan" element={<KeamananPrivasi />} />
          <Route path="/cara-pengajuan" element={<CaraPengajuan />} />
          <Route path="/alur" element={<CaraPengajuan />} />
          <Route path="/login" element={<Login />} />
          <Route path="/daftar" element={<RegisterWarga />} />
          <Route path="/daftar-admin" element={<RegisterAdmin />} />
          <Route path="/menunggu-persetujuan" element={<WaitingApproval />} />
          <Route path="/akses-ditolak" element={<AccessDenied />} />

          {/* ── Super Admin Kecamatan Routes ── */}
          <Route
            path="/super-admin/dashboard"
            element={
              <RequireAuth>
                <RequireRole roles={['super_admin']}>
                  <SuperAdminDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/super-admin/desa"
            element={
              <RequireAuth>
                <RequireRole roles={['super_admin']}>
                  <ManajemenDesa />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/super-admin/akun"
            element={
              <RequireAuth>
                <RequireRole roles={['super_admin']}>
                  <PersetujuanAkun />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* ── Admin Desa Routes ── */}
          <Route
            path="/admin/dashboard"
            element={
              <RequireAuth>
                <RequireApproved>
                  <RequireRole roles={['admin_desa']}>
                    <AdminDesaDashboard />
                  </RequireRole>
                </RequireApproved>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/profil-desa"
            element={
              <RequireAuth>
                <RequireApproved>
                  <RequireRole roles={['admin_desa']}>
                    <ProfilDesa />
                  </RequireRole>
                </RequireApproved>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/permohonan"
            element={
              <RequireAuth>
                <RequireApproved>
                  <RequireRole roles={['admin_desa']}>
                    <DaftarPermohonan />
                  </RequireRole>
                </RequireApproved>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/jenis-surat"
            element={
              <RequireAuth>
                <RequireApproved>
                  <RequireRole roles={['admin_desa']}>
                    <ManajemenSurat />
                  </RequireRole>
                </RequireApproved>
              </RequireAuth>
            }
          />
          <Route
            path="/admin/warga"
            element={
              <RequireAuth>
                <RequireApproved>
                  <RequireRole roles={['admin_desa']}>
                    <ManajemenWarga />
                  </RequireRole>
                </RequireApproved>
              </RequireAuth>
            }
          />

          {/* ── Warga Routes ── */}
          <Route
            path="/warga/dashboard"
            element={
              <RequireAuth>
                <RequireRole roles={['warga']}>
                  <WargaDashboard />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/warga/profil"
            element={
              <RequireAuth>
                <RequireRole roles={['warga']}>
                  <ProfilWarga />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/warga/ajukan"
            element={
              <RequireAuth>
                <RequireRole roles={['warga']}>
                  <AjukanSurat />
                </RequireRole>
              </RequireAuth>
            }
          />
          <Route
            path="/warga/permohonan"
            element={
              <RequireAuth>
                <RequireRole roles={['warga']}>
                  <RiwayatPermohonan />
                </RequireRole>
              </RequireAuth>
            }
          />

          {/* ── Fallback 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
