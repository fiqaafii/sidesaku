import { apiRequest } from './api';

export const superAdminService = {
  // Ambil daftar permohonan Admin Desa berdasarkan filter status
  getAdminDesaList: async (status = 'menunggu') => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    return apiRequest(`/super-admin/admin-desa${query}`);
  },

  // Setujui permohonan akun Admin Desa
  approveAdminDesa: async (id_user) => {
    return apiRequest(`/super-admin/admin-desa/${id_user}/approve`, {
      method: 'POST',
    });
  },

  // Tolak permohonan akun Admin Desa
  rejectAdminDesa: async (id_user, alasan = '') => {
    return apiRequest(`/super-admin/admin-desa/${id_user}/reject`, {
      method: 'POST',
      body: JSON.stringify({ alasan }),
    });
  },

  // Ambil ringkasan statistik kecamatan
  getStats: async () => {
    return apiRequest('/super-admin/stats');
  },
};
