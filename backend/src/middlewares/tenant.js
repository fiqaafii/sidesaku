import { errorResponse } from '../utils/response.js';

/**
 * Middleware dan utilitas untuk menegakkan isolasi data multi-tenant (Shared Database, Shared Schema)
 */

export function enforceTenantIsolation(req, res, next) {
  if (!req.user) {
    return errorResponse(res, 'Sesi belum terautentikasi.', null, 401);
  }

  // Super Admin memiliki wewenang kecamatan (akses ke semua desa)
  if (req.user.role === 'super_admin') {
    return next();
  }

  // Admin Desa dan Warga WAJIB memiliki id_desa terverifikasi
  if (!req.user.id_desa) {
    return errorResponse(res, 'Konteks desa tidak terikat pada akun Anda.', null, 403);
  }

  // Jika frontend mengirimkan id_desa di query/body/params, pastikan tidak melintasi tenant lain
  const targetDesa = req.params.id_desa || req.query.id_desa || req.body.id_desa;
  if (targetDesa && parseInt(targetDesa, 10) !== parseInt(req.user.id_desa, 10)) {
    return errorResponse(
      res,
      'Pelanggaran batas tenant: Anda tidak diperkenankan mengakses atau mengubah data desa lain.',
      null,
      403
    );
  }

  // Timpa konteks id_desa di request agar selalu menggunakan identitas terverifikasi dari token
  req.tenantId = parseInt(req.user.id_desa, 10);

  next();
}

/**
 * Helper untuk query SQL yang membutuhkan filter tenant otomatis
 */
export function getTenantCondition(req, tableAlias = '') {
  const prefix = tableAlias ? `${tableAlias}.` : '';
  if (req.user.role === 'super_admin') {
    // Super Admin dapat memfilter jika menentukan desa tertentu, jika tidak melihat semua
    return {
      sql: '1=1',
      params: [],
    };
  }

  return {
    sql: `${prefix}id_desa = ?`,
    params: [req.user.id_desa],
  };
}
