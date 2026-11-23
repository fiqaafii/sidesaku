import { apiRequest } from './api.js';

/**
 * Ambil data profil desa milik Admin Desa yang sedang login
 */
export async function getProfilDesa() {
  return apiRequest('/admin-desa/profil-desa');
}

/**
 * Update profil desa
 * @param {object} payload - { nama_kabupaten, nama_kepala_desa, jabatan_pejabat, alamat_kantor, telepon, email }
 */
export async function updateProfilDesa(payload) {
  return apiRequest('/admin-desa/profil-desa', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
