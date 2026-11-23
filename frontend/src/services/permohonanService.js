import { apiRequest } from './api.js';

/**
 * Ambil daftar jenis surat aktif beserta persyaratannya (untuk warga)
 */
export async function getJenisSurat() {
  return apiRequest('/permohonan/jenis-surat');
}

/**
 * Ajukan permohonan surat dengan upload berkas (FormData)
 * @param {FormData} formData - berisi id_jenis_surat, keperluan, file_{id_persyaratan}
 */
export async function submitPermohonan(formData) {
  return apiRequest('/permohonan', {
    method: 'POST',
    body: formData,
    // Jangan set Content-Type — biarkan browser set multipart/form-data boundary
    headers: {},
  });
}

/**
 * Ambil daftar permohonan milik warga yang login
 */
export async function getPermohonanWarga() {
  return apiRequest('/permohonan/warga');
}

/**
 * Ambil daftar permohonan untuk Admin Desa
 * @param {object} params - { status, search }
 */
export async function getPermohonanDesa(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'semua') query.append('status', params.status);
  if (params.search && params.search.trim()) query.append('search', params.search.trim());
  const qs = query.toString();
  return apiRequest(`/permohonan/desa${qs ? `?${qs}` : ''}`);
}

/**
 * Ambil detail permohonan lengkap termasuk dokumen dan riwayat
 */
export async function getPermohonanDetail(id) {
  return apiRequest(`/permohonan/${id}`);
}

/**
 * Perbarui status permohonan oleh Admin Desa
 * @param {number} id - id_permohonan
 * @param {object} payload - { status, catatan_admin }
 */
export async function updateStatusPermohonan(id, payload) {
  return apiRequest(`/permohonan/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * URL untuk download dokumen persyaratan (untuk tag <a href> atau window.open)
 */
export function getDokumenDownloadUrl(idDokumen) {
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  return `${base}/permohonan/dokumen/${idDokumen}/download`;
}

/**
 * Unduh atau Buka Dokumen PDF Resmi menggunakan fetch berotentikasi (Authorization: Bearer token).
 * Membuat Blob URL di sisi browser sehingga token tidak pernah dikirim via query string.
 *
 * @param {number} idPermohonan
 * @param {object} options
 * @param {boolean} options.openInNewTab - Jika true, membuka PDF di tab baru; jika false, mentrigger unduhan file.
 * @param {string} options.filename - Nama file untuk unduhan (opsional)
 */
export async function downloadSuratPDF(idPermohonan, { openInNewTab = true, filename } = {}) {
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  const token = sessionStorage.getItem('auth_token');

  if (!token) {
    throw new Error('Sesi autentikasi tidak ditemukan. Silakan login kembali.');
  }

  const response = await fetch(`${base}/permohonan/${idPermohonan}/cetak-pdf`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Gagal mengunduh surat resmi (Status ${response.status})`);
  }

  const blob = await response.blob();
  const pdfBlob = new Blob([blob], { type: 'application/pdf' });
  const blobUrl = window.URL.createObjectURL(pdfBlob);

  if (openInNewTab) {
    const newWindow = window.open(blobUrl, '_blank');
    if (!newWindow) {
      // Fallback jika popup blocker browser memblokir tab baru
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || `Surat-${idPermohonan}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  } else {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename || `Surat-${idPermohonan}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  // Bersihkan Blob URL setelah jeda 60 detik
  setTimeout(() => {
    window.URL.revokeObjectURL(blobUrl);
  }, 60000);

  return blobUrl;
}

/**
 * URL endpoint cetak surat PDF resmi
 */
export function getCetakPdfUrl(idPermohonan) {
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  return `${base}/permohonan/${idPermohonan}/cetak-pdf`;
}

/**
 * Terbitkan Surat Keterangan Domisili (SKD) — hanya Admin Desa
 * @param {number} idPermohonan
 */
export async function terbitkanSuratSKD(idPermohonan) {
  return apiRequest(`/permohonan/${idPermohonan}/terbitkan-skd`, { method: 'POST' });
}

/**
 * Terbitkan Surat Keterangan Usaha (SKU) — hanya Admin Desa
 * @param {number} idPermohonan
 */
export async function terbitkanSuratSKU(idPermohonan) {
  return apiRequest(`/permohonan/${idPermohonan}/terbitkan-sku`, { method: 'POST' });
}

/**
 * Terbitkan Surat Pengantar RT/RW (SP / SPKTP) — hanya Admin Desa
 * @param {number} idPermohonan
 */
export async function terbitkanSuratSP(idPermohonan) {
  return apiRequest(`/permohonan/${idPermohonan}/terbitkan-sp`, { method: 'POST' });
}

/**
 * Terbitkan Surat Keterangan Tidak Mampu (SKTM) — hanya Admin Desa
 * @param {number} idPermohonan
 */
export async function terbitkanSuratSKTM(idPermohonan) {
  return apiRequest(`/permohonan/${idPermohonan}/terbitkan-sktm`, { method: 'POST' });
}

/**
 * Terbitkan Surat Resmi Umum (Auto-detect tipe surat) — hanya Admin Desa
 * @param {number} idPermohonan
 */
export async function terbitkanSurat(idPermohonan) {
  return apiRequest(`/permohonan/${idPermohonan}/terbitkan`, { method: 'POST' });
}
