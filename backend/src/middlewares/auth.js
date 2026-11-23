import jwt from 'jsonwebtoken';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware untuk memverifikasi JWT dan mengekstrak identitas terverifikasi
 */
export function authenticateToken(req, res, next) {
  let token = null;
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Akses ditolak. Token autentikasi tidak ditemukan.', null, 401);
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    console.error('[SECURITY ERROR] JWT_SECRET belum dikonfigurasi di environment!');
    return errorResponse(res, 'Konfigurasi keamanan server bermasalah.', null, 500);
  }

  try {
    const decoded = jwt.verify(token, secret);

    // Pastikan akun berstatus aktif yang dapat menggunakan token
    if (decoded.status_akun && decoded.status_akun !== 'aktif') {
      return errorResponse(res, 'Akun Anda tidak aktif atau sedang menunggu persetujuan.', null, 403);
    }

    // Sematkan identitas terverifikasi ke request
    req.user = {
      id_user: decoded.id_user,
      role: decoded.role,
      id_desa: decoded.id_desa || null,
      username: decoded.username,
      status_akun: decoded.status_akun || 'aktif',
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Sesi masuk Anda telah berakhir. Silakan masuk kembali.', null, 401);
    }
    return errorResponse(res, 'Token autentikasi tidak valid atau telah dimanipulasi.', null, 401);
  }
}
