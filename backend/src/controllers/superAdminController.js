import { pool } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * 1. Ambil daftar Admin Desa berdasarkan filter status_akun
 * Query params: status ('menunggu' | 'aktif' | 'ditolak' | 'all')
 */
export async function getAdminDesaList(req, res, next) {
  try {
    const { status } = req.query;
    const allowedStatuses = ['menunggu', 'aktif', 'ditolak', 'nonaktif'];

    let query = `
      SELECT
        u.id_user,
        u.id_desa,
        u.nama_lengkap,
        u.username,
        u.email,
        u.role,
        u.status_akun,
        u.disetujui_oleh,
        u.tanggal_persetujuan,
        u.created_at,
        u.updated_at,
        d.nama_desa,
        d.kode_desa,
        approver.nama_lengkap AS disetujui_oleh_nama,
        (
          SELECT SUBSTRING_INDEX(deskripsi, 'Alasan: ', -1)
          FROM audit_log
          WHERE aktivitas = 'TOLAK_ADMIN_DESA' AND id_data = u.id_user
          ORDER BY id_log DESC
          LIMIT 1
        ) AS alasan_penolakan
      FROM users u
      LEFT JOIN desa d ON u.id_desa = d.id_desa
      LEFT JOIN users approver ON u.disetujui_oleh = approver.id_user
      WHERE u.role = 'admin_desa'
    `;

    const queryParams = [];

    if (status && allowedStatuses.includes(status)) {
      query += ` AND u.status_akun = ?`;
      queryParams.push(status);
    } else if (status && status !== 'all') {
      return errorResponse(res, `Parameter status tidak valid. Gunakan: ${allowedStatuses.join(', ')}, atau all.`, null, 400);
    }

    query += ` ORDER BY u.created_at DESC`;

    const [rows] = await pool.execute(query, queryParams);

    return successResponse(res, 'Daftar permohonan Admin Desa berhasil diambil.', rows);
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Setujui Permohonan Akun Admin Desa
 * Parameter: id_user (URL params)
 */
export async function approveAdminDesa(req, res, next) {
  const { id_user } = req.params;
  const adminId = parseInt(id_user, 10);

  if (isNaN(adminId) || adminId <= 0) {
    return errorResponse(res, 'ID pengguna tidak valid.', null, 400);
  }

  const approverId = req.user.id_user;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // A. Periksa keberadaan user dan role
    const [userRows] = await connection.execute(
      `SELECT u.id_user, u.id_desa, u.nama_lengkap, u.username, u.email, u.role, u.status_akun, d.nama_desa, d.kode_desa
       FROM users u
       LEFT JOIN desa d ON u.id_desa = d.id_desa
       WHERE u.id_user = ?`,
      [adminId]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    const targetUser = userRows[0];

    // B. Pastikan HANYA role 'admin_desa' yang dapat disetujui melalui fungsi ini
    if (targetUser.role !== 'admin_desa') {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Hanya akun dengan peran Admin Desa yang dapat diproses melalui persetujuan ini.', null, 400);
    }

    // C. Cegah persetujuan ganda jika akun sudah berstatus aktif
    if (targetUser.status_akun === 'aktif') {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Akun Admin Desa ini sudah dalam status aktif.', null, 400);
    }

    // D. Dapatkan valid approver ID (menghormati foreign key fk_users_penyetuju dan fk_audit_user)
    const [approverCheck] = await connection.execute(
      `SELECT id_user FROM users WHERE id_user = ?`,
      [approverId]
    );
    const validApproverId = approverCheck.length > 0 ? approverId : null;

    // E. Update status_akun menjadi 'aktif'
    const now = new Date();
    await connection.execute(
      `UPDATE users
       SET status_akun = 'aktif', disetujui_oleh = ?, tanggal_persetujuan = ?, updated_at = NOW()
       WHERE id_user = ?`,
      [validApproverId, now, adminId]
    );

    // F. Catat ke audit_log
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    await connection.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'SETUJUI_ADMIN_DESA', 'users', ?, ?, ?)`,
      [
        validApproverId,
        targetUser.id_desa,
        adminId,
        `Super Admin menyetujui akun Admin Desa: ${targetUser.nama_lengkap} (@${targetUser.username}) untuk wilayah ${targetUser.nama_desa || 'Desa ID ' + targetUser.id_desa}`,
        ipAddress
      ]
    );

    await connection.commit();
    connection.release();

    return successResponse(
      res,
      `Akun Admin Desa ${targetUser.nama_lengkap} (@${targetUser.username}) berhasil disetujui dan kini berstatus aktif.`,
      {
        id_user: adminId,
        username: targetUser.username,
        nama_lengkap: targetUser.nama_lengkap,
        id_desa: targetUser.id_desa,
        nama_desa: targetUser.nama_desa,
        status_akun: 'aktif',
        disetujui_oleh: approverId,
        tanggal_persetujuan: now.toISOString(),
      }
    );
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

/**
 * 3. Tolak Permohonan Akun Admin Desa
 * Parameter: id_user (URL params), body: { alasan }
 */
export async function rejectAdminDesa(req, res, next) {
  const { id_user } = req.params;
  const adminId = parseInt(id_user, 10);

  if (isNaN(adminId) || adminId <= 0) {
    return errorResponse(res, 'ID pengguna tidak valid.', null, 400);
  }

  const { alasan } = req.body;
  const alasanPenolakan = alasan && typeof alasan === 'string' && alasan.trim()
    ? alasan.trim()
    : 'Dokumen kelayakan atau identitas kewenangan desa tidak memenuhi syarat.';

  const approverId = req.user.id_user;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // A. Periksa keberadaan user dan role
    const [userRows] = await connection.execute(
      `SELECT u.id_user, u.id_desa, u.nama_lengkap, u.username, u.email, u.role, u.status_akun, d.nama_desa, d.kode_desa
       FROM users u
       LEFT JOIN desa d ON u.id_desa = d.id_desa
       WHERE u.id_user = ?`,
      [adminId]
    );

    if (userRows.length === 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    const targetUser = userRows[0];

    // B. Pastikan HANYA role 'admin_desa' yang dapat diproses penolakan melalui fungsi ini
    if (targetUser.role !== 'admin_desa') {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Hanya akun dengan peran Admin Desa yang dapat diproses melalui fungsi ini.', null, 400);
    }

    // C. Cegah penolakan jika akun sudah berstatus ditolak
    if (targetUser.status_akun === 'ditolak') {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Akun Admin Desa ini sudah dalam status ditolak.', null, 400);
    }

    // D. Dapatkan valid approver ID (menghormati foreign key fk_users_penyetuju dan fk_audit_user)
    const [approverCheck] = await connection.execute(
      `SELECT id_user FROM users WHERE id_user = ?`,
      [approverId]
    );
    const validApproverId = approverCheck.length > 0 ? approverId : null;

    // E. Update status_akun menjadi 'ditolak'
    const now = new Date();
    await connection.execute(
      `UPDATE users
       SET status_akun = 'ditolak', disetujui_oleh = ?, tanggal_persetujuan = ?, updated_at = NOW()
       WHERE id_user = ?`,
      [validApproverId, now, adminId]
    );

    // F. Catat ke audit_log beserta alasan penolakan
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    await connection.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'TOLAK_ADMIN_DESA', 'users', ?, ?, ?)`,
      [
        validApproverId,
        targetUser.id_desa,
        adminId,
        `Super Admin menolak akun Admin Desa: ${targetUser.nama_lengkap} (@${targetUser.username}). Alasan: ${alasanPenolakan}`,
        ipAddress
      ]
    );

    await connection.commit();
    connection.release();

    return successResponse(
      res,
      `Permohonan Admin Desa ${targetUser.nama_lengkap} (@${targetUser.username}) telah ditolak.`,
      {
        id_user: adminId,
        username: targetUser.username,
        nama_lengkap: targetUser.nama_lengkap,
        id_desa: targetUser.id_desa,
        nama_desa: targetUser.nama_desa,
        status_akun: 'ditolak',
        alasan: alasanPenolakan,
        disetujui_oleh: approverId,
        tanggal_persetujuan: now.toISOString(),
      }
    );
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

/**
 * 4. Statistik Ringkasan Kecamatan untuk Dashboard Super Admin
 */
export async function getSuperAdminStats(req, res, next) {
  try {
    const [[desaCounts]] = await pool.execute(`
      SELECT
        COUNT(*) AS total_desa,
        SUM(CASE WHEN status = 'aktif' THEN 1 ELSE 0 END) AS desa_aktif
      FROM desa
    `);

    const [[userCounts]] = await pool.execute(`
      SELECT
        SUM(CASE WHEN role = 'admin_desa' AND status_akun = 'menunggu' THEN 1 ELSE 0 END) AS admin_menunggu,
        SUM(CASE WHEN role = 'admin_desa' AND status_akun = 'aktif' THEN 1 ELSE 0 END) AS admin_aktif,
        SUM(CASE WHEN role = 'admin_desa' AND status_akun = 'ditolak' THEN 1 ELSE 0 END) AS admin_ditolak,
        SUM(CASE WHEN role = 'warga' AND status_akun = 'aktif' THEN 1 ELSE 0 END) AS warga_aktif
      FROM users
    `);

    const [[suratCounts]] = await pool.execute(`
      SELECT
        COUNT(*) AS total_permohonan_surat
      FROM permohonan_surat
    `);

    return successResponse(res, 'Statistik Super Admin berhasil diambil.', {
      total_desa: Number(desaCounts?.total_desa || 0),
      desa_aktif: Number(desaCounts?.desa_aktif || 0),
      admin_menunggu: Number(userCounts?.admin_menunggu || 0),
      admin_aktif: Number(userCounts?.admin_aktif || 0),
      admin_ditolak: Number(userCounts?.admin_ditolak || 0),
      warga_aktif: Number(userCounts?.warga_aktif || 0),
      total_permohonan_surat: Number(suratCounts?.total_permohonan_surat || 0),
    });
  } catch (error) {
    next(error);
  }
}
