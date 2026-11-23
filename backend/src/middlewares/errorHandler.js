import { errorResponse } from '../utils/response.js';

export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[SERVER ERROR]:', err.message);

  // Penanganan error Multer (upload berkas)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return errorResponse(res, 'Ukuran salah satu berkas melebihi batas maksimal 5 MB. Silakan kompres atau pilih berkas yang lebih kecil.', null, 413);
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return errorResponse(res, 'Jumlah berkas yang diunggah melebihi batas maksimal yang diizinkan (maksimal 10 berkas).', null, 400);
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return errorResponse(res, 'Field berkas yang diunggah tidak dikenali oleh sistem.', null, 400);
    }
    return errorResponse(res, `Gagal memproses berkas yang diunggah: ${err.message}`, null, 400);
  }

  // Penanganan error Body Parser (payload too large)
  if (err.type === 'entity.too.large' || err.status === 413) {
    return errorResponse(res, 'Ukuran total data request terlalu besar. Pastikan setiap berkas tidak melebihi batas 5 MB.', null, 413);
  }

  // Jangan membocorkan detail database internal ke publik
  if (err.code === 'ER_DUP_ENTRY') {
    return errorResponse(res, 'Data dengan identitas tersebut sudah terdaftar.', null, 409);
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return errorResponse(res, 'Relasi data tidak ditemukan atau tidak valid.', null, 400);
  }

  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server.';

  return errorResponse(res, message, null, statusCode);
}
