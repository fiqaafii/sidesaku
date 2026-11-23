import { apiRequest } from './api.js';

// ── Statistik Dashboard ──
export async function getAdminDesaStats() {
  return apiRequest('/admin-desa/stats');
}

// ── Manajemen Warga ──
export async function getWargaList(search = '') {
  const qs = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
  return apiRequest(`/admin-desa/warga${qs}`);
}

export async function createWarga(data) {
  return apiRequest('/admin-desa/warga', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateWarga(id, data) {
  return apiRequest(`/admin-desa/warga/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Manajemen Jenis Surat ──
export async function getJenisSuratAdmin() {
  return apiRequest('/admin-desa/jenis-surat');
}

export async function createJenisSurat(data) {
  return apiRequest('/admin-desa/jenis-surat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateJenisSurat(id, data) {
  return apiRequest(`/admin-desa/jenis-surat/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ── Manajemen Persyaratan ──
export async function addPersyaratan(idJenisSurat, data) {
  return apiRequest(`/admin-desa/jenis-surat/${idJenisSurat}/persyaratan`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePersyaratan(id) {
  return apiRequest(`/admin-desa/persyaratan/${id}`, {
    method: 'DELETE',
  });
}
