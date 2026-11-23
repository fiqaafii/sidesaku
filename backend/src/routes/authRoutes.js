import { Router } from 'express';
import {
  getDesaList,
  registerWarga,
  registerAdminDesa,
  login,
  getMe,
  updateProfileWarga,
} from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { enforceTenantIsolation } from '../middlewares/tenant.js';
import { loginRateLimiter } from '../middlewares/rateLimiter.js';
import { pool } from '../config/db.js';
import { successResponse } from '../utils/response.js';

const router = Router();

// Rute Publik
router.get('/desa-list', getDesaList);
router.post('/register-warga', registerWarga);
router.post('/register-admin-desa', registerAdminDesa);
router.post('/login', loginRateLimiter, login);

// Rute Terproteksi Token
router.get('/me', authenticateToken, getMe);
router.put('/profile', authenticateToken, updateProfileWarga);

// Endpoint Terproteksi untuk Verifikasi Isolasi Multi-Tenant
router.get('/tenant-scope/:id_desa', authenticateToken, enforceTenantIsolation, async (req, res, next) => {
  try {
    // Query data desa menggunakan ID tenant yang telah diverifikasi di backend
    const [rows] = await pool.execute(
      `SELECT id_desa, nama_desa, kode_desa, status FROM desa WHERE id_desa = ?`,
      [req.tenantId || req.user.id_desa]
    );
    return successResponse(res, 'Data tenant berhasil diakses secara sah sesuai kewenangan.', {
      authenticatedUser: req.user.username,
      tenantScopeId: req.tenantId || req.user.id_desa,
      desa: rows[0] || null,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
