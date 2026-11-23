import { apiRequest } from './api';

export const authService = {
  // Ambil daftar desa aktif dari database riil
  getDesaList: async () => {
    return apiRequest('/auth/desa-list');
  },

  // Masuk pengguna dengan verifikasi backend
  login: async (username, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  // Pendaftaran warga mandiri
  registerWarga: async (dataWarga) => {
    return apiRequest('/auth/register-warga', {
      method: 'POST',
      body: JSON.stringify(dataWarga),
    });
  },

  // Pendaftaran Admin Desa
  registerAdminDesa: async (dataAdmin) => {
    return apiRequest('/auth/register-admin-desa', {
      method: 'POST',
      body: JSON.stringify(dataAdmin),
    });
  },

  // Ambil profil pengguna berdasarkan JWT terverifikasi
  getMe: async () => {
    return apiRequest('/auth/me');
  },

  // Perbarui profil kependudukan mandiri oleh warga
  updateProfile: async (dataProfile) => {
    return apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(dataProfile),
    });
  },
};
