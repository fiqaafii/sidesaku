import { errorResponse } from '../utils/response.js';

/**
 * Middleware untuk memeriksa peran (role) pengguna
 * Contoh penggunaan: requireRole('super_admin', 'admin_desa')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return errorResponse(res, 'Identitas pengguna belum terautentikasi.', null, 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        'Akses ditolak. Anda tidak memiliki wewenang untuk membuka atau menjalankan aksi ini.',
        null,
        403
      );
    }

    next();
  };
}
