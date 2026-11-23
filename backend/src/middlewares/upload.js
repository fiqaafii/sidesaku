import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Pastikan direktori penyimpanan uploads/dokumen/ tersedia
const uploadDir = path.join(process.cwd(), 'uploads', 'dokumen');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Konfigurasi diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `DOC-${uniqueSuffix}${ext}`);
  },
});

// Filter tipe file (hanya PDF, JPG, JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error(`Format berkas "${file.originalname}" tidak diizinkan. Hanya format PDF, JPG, dan PNG yang diperbolehkan.`);
    error.statusCode = 400;
    cb(error);
  }
};

export const uploadDokumen = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB per file
    files: 10,                 // Maksimal 10 berkas dokumen sekaligus
  },
});
