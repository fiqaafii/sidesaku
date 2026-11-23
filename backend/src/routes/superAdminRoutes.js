import { Router } from 'express';
import {
  getAdminDesaList,
  approveAdminDesa,
  rejectAdminDesa,
  getSuperAdminStats,
} from '../controllers/superAdminController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { requireRole } from '../middlewares/role.js';

const router = Router();

// Seluruh rute Super Admin wajib memiliki token valid dan ber-role 'super_admin'
router.use(authenticateToken);
router.use(requireRole('super_admin'));

// 1. Ambil daftar Admin Desa berdasarkan filter status
router.get('/admin-desa', getAdminDesaList);

// 2. Setujui permohonan Admin Desa
router.post('/admin-desa/:id_user/approve', approveAdminDesa);

// 3. Tolak permohonan Admin Desa (dengan alasan opsional/wajib)
router.post('/admin-desa/:id_user/reject', rejectAdminDesa);

// 4. Statistik ringkasan untuk dashboard Super Admin
router.get('/stats', getSuperAdminStats);

export default router;
