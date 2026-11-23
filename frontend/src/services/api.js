/**
 * Base API Client untuk Sistem Pelayanan Administrasi Desa
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = sessionStorage.getItem('auth_token');

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Jika body adalah FormData dan headers memiliki Content-Type, hapus agar browser menyetel boundary multipart otomatis
  if (isFormData && headers['Content-Type']) {
    delete headers['Content-Type'];
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      // Jika token tidak valid atau kedaluwarsa pada rute terproteksi
      if (response.status === 401 && token && !endpoint.includes('/login')) {
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }

      const fallbackMsg = response.status === 504 || response.status === 502
        ? 'Server backend belum aktif di port 5000. Silakan jalankan backend terlebih dahulu.'
        : `Terjadi kesalahan pada server (Status ${response.status}).`;

      const error = new Error(data?.message || fallbackMsg);
      error.status = response.status;
      error.data = data;
      error.errors = data?.errors || null;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      const netError = new Error('Gagal terhubung ke server backend. Pastikan server backend berjalan di port 5000.');
      netError.status = 503;
      throw netError;
    }
    throw err;
  }
}
