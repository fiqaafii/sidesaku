import { Router } from 'express';
import {
  getJenisSuratList,
  submitPermohonan,
  getPermohonanWarga,
  getPermohonanDesa,
  getPermohonanDetail,
  updatePermohonanStatus,
  downloadDokumen,
  cetakSuratPDF,
  terbitkanSuratSKD,
  terbitkanSuratSKU,
  terbitkanSuratSP,
  terbitkanSuratSKTM,
  terbitkanSurat,
} from '../controllers/permohonanController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';
import { uploadDokumen } from '../middlewares/upload.js';

const router = Router();

// Seluruh rute memerlukan token valid
router.use(authenticateToken);

// 1. Ambil daftar jenis surat aktif dan persyaratannya
router.get('/jenis-surat', getJenisSuratList);

// 2. Pengajuan permohonan surat oleh Warga (dengan upload berkas via multer)
router.post('/', requireRole('warga'), uploadDokumen.any(), submitPermohonan);

// 3. Daftar permohonan warga yang sedang login
router.get('/warga', requireRole('warga'), getPermohonanWarga);

// 4. Daftar permohonan desa untuk Admin Desa (berdasarkan id_desa)
router.get('/desa', requireRole('admin_desa'), getPermohonanDesa);

// 5. Detail permohonan lengkap
router.get('/:id', getPermohonanDetail);

// 6. Update status permohonan oleh Admin Desa
router.patch('/:id/status', requireRole('admin_desa'), updatePermohonanStatus);

// 7. Cetak surat PDF resmi
router.get('/:id/cetak-pdf', cetakSuratPDF);

// 8. Unduh berkas fisik persyaratan
router.get('/dokumen/:id_dokumen/download', downloadDokumen);

// 9. Terbitkan Surat Keterangan Domisili (SKD) — hanya Admin Desa
router.post('/:id/terbitkan-skd', requireRole('admin_desa'), terbitkanSuratSKD);

// 10. Terbitkan Surat Keterangan Usaha (SKU) — hanya Admin Desa
router.post('/:id/terbitkan-sku', requireRole('admin_desa'), terbitkanSuratSKU);

// 11. Terbitkan Surat Pengantar RT/RW (SP / SPKTP) — hanya Admin Desa
router.post('/:id/terbitkan-sp', requireRole('admin_desa'), terbitkanSuratSP);

// 12. Terbitkan Surat Keterangan Tidak Mampu (SKTM) — hanya Admin Desa
router.post('/:id/terbitkan-sktm', requireRole('admin_desa'), terbitkanSuratSKTM);

// 13. Terbitkan Surat Resmi Umum (Auto-detect tipe surat) — hanya Admin Desa
router.post('/:id/terbitkan', requireRole('admin_desa'), terbitkanSurat);

export default router;
