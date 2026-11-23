import rateLimit from 'express-rate-limit';
import { errorResponse } from '../utils/response.js';

/**
 * Pembatasan percobaan login untuk mencegah serangan brute force
 * Batas: 10 percobaan per 15 menit per alamat IP
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return errorResponse(
      res,
      'Terlalu banyak percobaan masuk yang gagal. Silakan tunggu 15 menit sebelum mencoba kembali.',
      null,
      429
    );
  },
});
