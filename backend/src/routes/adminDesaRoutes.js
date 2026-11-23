import { Router } from 'express';
import {
  getWargaList,
  createWarga,
  updateWarga,
  getAdminJenisSuratList,
  createJenisSurat,
  updateJenisSurat,
  addPersyaratan,
  deletePersyaratan,
  getAdminDesaStats,
  getProfilDesa,
  updateProfilDesa,
} from '../controllers/adminDesaController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';

const router = Router();

// Semua route harus autentikasi dan role admin_desa
router.use(authenticateToken);
router.use(requireRole('admin_desa'));

// Statistik dashboard
router.get('/stats', getAdminDesaStats);

// Profil Desa
router.get('/profil-desa', getProfilDesa);
router.put('/profil-desa', updateProfilDesa);

// Manajemen Warga
router.get('/warga', getWargaList);
router.post('/warga', createWarga);
router.put('/warga/:id', updateWarga);

// Manajemen Jenis Surat
router.get('/jenis-surat', getAdminJenisSuratList);
router.post('/jenis-surat', createJenisSurat);
router.put('/jenis-surat/:id', updateJenisSurat);

// Manajemen Persyaratan
router.post('/jenis-surat/:id_jenis_surat/persyaratan', addPersyaratan);
router.delete('/persyaratan/:id', deletePersyaratan);

export default router;
