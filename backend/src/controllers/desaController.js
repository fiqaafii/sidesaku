import { pool } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

// GET semua desa milik kecamatan
export async function getDesaList(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT d.id_desa, d.id_kecamatan, d.nama_desa, d.kode_desa, d.alamat_kantor, d.telepon, d.email, d.status,
              k.nama_kecamatan,
              (SELECT COUNT(*) FROM users WHERE id_desa = d.id_desa AND role = 'warga' AND status_akun = 'aktif') AS total_warga,
              (SELECT COUNT(*) FROM users WHERE id_desa = d.id_desa AND role = 'admin_desa' AND status_akun = 'aktif') AS total_admin
       FROM desa d
       JOIN kecamatan k ON d.id_kecamatan = k.id_kecamatan
       ORDER BY d.nama_desa ASC`
    );
    return successResponse(res, 'Daftar desa berhasil diambil.', rows);
  } catch (error) {
    next(error);
  }
}

// POST tambah desa baru
export async function createDesa(req, res, next) {
  const { nama_desa, kode_desa, alamat_kantor, telepon, email, status, id_kecamatan } = req.body;
  const adminId = req.user.id_user;
  if (!nama_desa || !kode_desa) {
    return errorResponse(res, 'Nama desa dan kode desa wajib diisi.', null, 400);
  }
  try {
    // Cek kode_desa unik
    const [dup] = await pool.execute(`SELECT id_desa FROM desa WHERE kode_desa = ?`, [kode_desa.trim()]);
    if (dup.length > 0) return errorResponse(res, 'Kode desa sudah digunakan.', null, 409);

    // Ambil id_kecamatan default jika tidak disertakan
    let kecId = id_kecamatan;
    if (!kecId) {
      const [kecRows] = await pool.execute(`SELECT id_kecamatan FROM kecamatan LIMIT 1`);
      if (kecRows.length === 0) return errorResponse(res, 'Kecamatan tidak ditemukan.', null, 404);
      kecId = kecRows[0].id_kecamatan;
    }

    const [result] = await pool.execute(
      `INSERT INTO desa (id_kecamatan, nama_desa, kode_desa, alamat_kantor, telepon, email, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [kecId, nama_desa.trim(), kode_desa.trim(), alamat_kantor || null, telepon || null, email || null, status || 'aktif']
    );

    const ipAddress = req.ip || null;
    await pool.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'TAMBAH_DESA', 'desa', ?, ?, ?)`,
      [adminId, result.insertId, result.insertId, `Super Admin menambahkan desa baru: ${nama_desa}`, ipAddress]
    );

    return successResponse(res, 'Desa baru berhasil ditambahkan.', { id_desa: result.insertId }, 201);
  } catch (error) {
    next(error);
  }
}

// PUT update desa
export async function updateDesa(req, res, next) {
  const { id } = req.params;
  const desaId = parseInt(id, 10);
  const { nama_desa, kode_desa, alamat_kantor, telepon, email, status } = req.body;
  const adminId = req.user.id_user;

  if (isNaN(desaId)) return errorResponse(res, 'ID desa tidak valid.', null, 400);

  try {
    const [check] = await pool.execute(`SELECT id_desa, nama_desa FROM desa WHERE id_desa = ?`, [desaId]);
    if (check.length === 0) return errorResponse(res, 'Desa tidak ditemukan.', null, 404);

    await pool.execute(
      `UPDATE desa SET
         nama_desa = COALESCE(?, nama_desa),
         kode_desa = COALESCE(?, kode_desa),
         alamat_kantor = ?,
         telepon = ?,
         email = ?,
         status = COALESCE(?, status),
         updated_at = NOW()
       WHERE id_desa = ?`,
      [nama_desa || null, kode_desa || null, alamat_kantor || null, telepon || null, email || null, status || null, desaId]
    );

    const ipAddress = req.ip || null;
    await pool.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'UBAH_DESA', 'desa', ?, ?, ?)`,
      [adminId, desaId, desaId, `Super Admin memperbarui data desa: ${nama_desa || check[0].nama_desa}`, ipAddress]
    );

    return successResponse(res, 'Data desa berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}
