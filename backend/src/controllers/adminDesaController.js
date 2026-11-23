import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

/**
 * 1. Ambil daftar warga di desa kewenangan Admin Desa
 */
export async function getWargaList(req, res, next) {
  try {
    const id_desa = req.user.id_desa;
    const { search } = req.query;

    let query = `
      SELECT
        w.id_warga,
        w.id_user,
        w.id_desa,
        w.nik,
        w.no_kk,
        w.tempat_lahir,
        w.tanggal_lahir,
        w.jenis_kelamin,
        w.alamat,
        w.rt,
        w.rw,
        w.agama,
        w.status_perkawinan,
        w.pekerjaan,
        w.no_telepon,
        w.created_at,
        u.nama_lengkap,
        u.username,
        u.email,
        u.status_akun
      FROM warga w
      JOIN users u ON w.id_user = u.id_user
      WHERE w.id_desa = ?
    `;

    const params = [id_desa];

    if (search && search.trim()) {
      query += ` AND (u.nama_lengkap LIKE ? OR w.nik LIKE ? OR u.username LIKE ?)`;
      const s = `%${search.trim()}%`;
      params.push(s, s, s);
    }

    query += ` ORDER BY u.nama_lengkap ASC`;

    const [rows] = await pool.execute(query, params);

    return successResponse(res, 'Daftar data warga desa berhasil diambil.', rows);
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Tambah data warga baru oleh Admin Desa (dengan pencegahan duplikasi NIK, username, dan email)
 */
export async function createWarga(req, res, next) {
  const id_desa = req.user.id_desa;
  const adminId = req.user.id_user;

  const {
    nama_lengkap,
    nik,
    username,
    email,
    password,
    no_telepon,
    alamat,
    no_kk,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    rt,
    rw,
    agama,
    status_perkawinan,
    pekerjaan,
  } = req.body;

  // Validasi kolom wajib
  if (!nama_lengkap || !nik || !username || !email) {
    return errorResponse(res, 'Nama lengkap, NIK, username, dan email wajib diisi.', null, 400);
  }

  if (nik.length !== 16 || !/^\d+$/.test(nik)) {
    return errorResponse(res, 'NIK harus tepat 16 digit angka.', null, 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // A. Pencegahan Duplikasi NIK pada desa yang sama
    const [nikCheck] = await connection.execute(
      `SELECT id_warga FROM warga WHERE nik = ? AND id_desa = ?`,
      [nik, id_desa]
    );
    if (nikCheck.length > 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'NIK tersebut sudah terdaftar di desa ini.', null, 409);
    }

    // B. Pencegahan Duplikasi Username
    const [userCheck] = await connection.execute(
      `SELECT id_user FROM users WHERE username = ?`,
      [username.trim()]
    );
    if (userCheck.length > 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Username tersebut sudah digunakan oleh akun lain.', null, 409);
    }

    // C. Pencegahan Duplikasi Email
    const [emailCheck] = await connection.execute(
      `SELECT id_user FROM users WHERE email = ?`,
      [email.trim().toLowerCase()]
    );
    if (emailCheck.length > 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Alamat email tersebut sudah digunakan oleh akun lain.', null, 409);
    }

    // D. Validasi dan hash kata sandi warga
if (typeof password !== 'string' || password.trim().length < 8) {
  await connection.rollback();
  connection.release();
  return errorResponse(
    res,
    'Password wajib diisi dan minimal 8 karakter.',
    null,
    400
  );
}

const hashedPassword = await bcrypt.hash(password, 10);

    // E. Simpan ke tabel users
    const [userResult] = await connection.execute(
      `INSERT INTO users (id_desa, nama_lengkap, username, email, password, role, status_akun)
       VALUES (?, ?, ?, ?, ?, 'warga', 'aktif')`,
      [id_desa, nama_lengkap.trim(), username.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    const newUserId = userResult.insertId;

    // F. Simpan ke tabel warga
    const [wargaResult] = await connection.execute(
      `INSERT INTO warga (
        id_user, id_desa, nik, no_kk, tempat_lahir, tanggal_lahir,
        jenis_kelamin, alamat, rt, rw, agama, status_perkawinan,
        pekerjaan, no_telepon
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newUserId,
        id_desa,
        nik.trim(),
        no_kk || null,
        tempat_lahir || null,
        tanggal_lahir || null,
        jenis_kelamin || null,
        alamat || null,
        rt || null,
        rw || null,
        agama || null,
        status_perkawinan || null,
        pekerjaan || null,
        no_telepon || null,
      ]
    );

    const newWargaId = wargaResult.insertId;

    // G. Catat ke audit_log
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    await connection.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'TAMBAH_DATA_WARGA', 'warga', ?, ?, ?)`,
      [
        adminId,
        id_desa,
        newWargaId,
        `Admin Desa mendaftarkan data warga baru: ${nama_lengkap} (NIK: ${nik})`,
        ipAddress,
      ]
    );

    await connection.commit();
    connection.release();

    return successResponse(
      res,
      'Data warga baru berhasil ditambahkan.',
      {
        id_warga: newWargaId,
        id_user: newUserId,
        nama_lengkap,
        nik,
        username,
      },
      201
    );
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

/**
 * 3. Ubah data warga oleh Admin Desa
 */
export async function updateWarga(req, res, next) {
  const { id } = req.params;
  const wargaId = parseInt(id, 10);
  const id_desa = req.user.id_desa;
  const adminId = req.user.id_user;

  if (isNaN(wargaId)) {
    return errorResponse(res, 'ID warga tidak valid.', null, 400);
  }

  const {
    nama_lengkap,
    nik,
    no_telepon,
    alamat,
    no_kk,
    tempat_lahir,
    tanggal_lahir,
    jenis_kelamin,
    rt,
    rw,
    agama,
    status_perkawinan,
    pekerjaan,
  } = req.body;

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [wargaRows] = await connection.execute(
      `SELECT w.id_warga, w.id_user, w.id_desa, w.nik, u.nama_lengkap
       FROM warga w
       JOIN users u ON w.id_user = u.id_user
       WHERE w.id_warga = ? AND w.id_desa = ?`,
      [wargaId, id_desa]
    );

    if (wargaRows.length === 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Data warga tidak ditemukan di desa Anda.', null, 404);
    }

    const currentWarga = wargaRows[0];

    // Jika NIK diubah, pastikan tidak duplikat dengan warga lain di desa yang sama
    if (nik && nik !== currentWarga.nik) {
      const [nikDupCheck] = await connection.execute(
        `SELECT id_warga FROM warga WHERE nik = ? AND id_desa = ? AND id_warga != ?`,
        [nik, id_desa, wargaId]
      );
      if (nikDupCheck.length > 0) {
        await connection.rollback();
        connection.release();
        return errorResponse(res, 'NIK baru tersebut sudah terdaftar untuk warga lain.', null, 409);
      }
    }

    // Update users (nama_lengkap)
    if (nama_lengkap) {
      await connection.execute(
        `UPDATE users SET nama_lengkap = ?, updated_at = NOW() WHERE id_user = ?`,
        [nama_lengkap.trim(), currentWarga.id_user]
      );
    }

    // Update tabel warga
    await connection.execute(
      `UPDATE warga SET
        nik = COALESCE(?, nik),
        no_kk = ?,
        tempat_lahir = ?,
        tanggal_lahir = ?,
        jenis_kelamin = ?,
        alamat = COALESCE(?, alamat),
        rt = ?,
        rw = ?,
        agama = ?,
        status_perkawinan = ?,
        pekerjaan = ?,
        no_telepon = COALESCE(?, no_telepon),
        updated_at = NOW()
       WHERE id_warga = ? AND id_desa = ?`,
      [
        nik || null,
        no_kk || null,
        tempat_lahir || null,
        tanggal_lahir || null,
        jenis_kelamin || null,
        alamat || null,
        rt || null,
        rw || null,
        agama || null,
        status_perkawinan || null,
        pekerjaan || null,
        no_telepon || null,
        wargaId,
        id_desa,
      ]
    );

    // Audit log
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    await connection.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'UBAH_DATA_WARGA', 'warga', ?, ?, ?)`,
      [
        adminId,
        id_desa,
        wargaId,
        `Admin Desa memperbarui data kependudukan warga: ${nama_lengkap || currentWarga.nama_lengkap}`,
        ipAddress,
      ]
    );

    await connection.commit();
    connection.release();

    return successResponse(res, 'Data kependudukan warga berhasil diperbarui.');
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

/**
 * 4. Ambil seluruh Jenis Surat untuk Admin Desa (termasuk status aktif/nonaktif)
 */
export async function getAdminJenisSuratList(req, res, next) {
  try {
    const id_desa = req.user.id_desa;

    const [rows] = await pool.execute(
      `SELECT
        js.id_jenis_surat,
        js.id_desa,
        js.nama_surat,
        js.kode_surat,
        js.deskripsi,
        js.status,
        js.created_at,
        (SELECT COUNT(*) FROM persyaratan_surat WHERE id_jenis_surat = js.id_jenis_surat) AS jumlah_persyaratan
       FROM jenis_surat js
       WHERE js.id_desa = ?
       ORDER BY js.nama_surat ASC`,
      [id_desa]
    );

    // Ambil persyaratan untuk setiap jenis surat
    for (const item of rows) {
      const [reqs] = await pool.execute(
        `SELECT id_persyaratan, id_jenis_surat, nama_persyaratan, deskripsi, wajib, format_file
         FROM persyaratan_surat
         WHERE id_jenis_surat = ?
         ORDER BY wajib DESC, id_persyaratan ASC`,
        [item.id_jenis_surat]
      );
      item.persyaratan = reqs;
    }

    return successResponse(res, 'Daftar jenis surat desa berhasil diambil.', rows);
  } catch (error) {
    next(error);
  }
}

/**
 * 5. Tambah Jenis Surat Baru oleh Admin Desa
 */
export async function createJenisSurat(req, res, next) {
  const id_desa = req.user.id_desa;
  const adminId = req.user.id_user;
  const { nama_surat, kode_surat, deskripsi, status, persyaratan } = req.body;

  if (!nama_surat || !kode_surat) {
    return errorResponse(res, 'Nama surat dan kode surat wajib diisi.', null, 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Cek keunikan kode_surat di desa yang sama
    const [dup] = await connection.execute(
      `SELECT id_jenis_surat FROM jenis_surat WHERE kode_surat = ? AND id_desa = ?`,
      [kode_surat.trim(), id_desa]
    );
    if (dup.length > 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Kode surat tersebut sudah ada di desa Anda.', null, 409);
    }

    const [result] = await connection.execute(
      `INSERT INTO jenis_surat (id_desa, nama_surat, kode_surat, deskripsi, status)
       VALUES (?, ?, ?, ?, ?)`,
      [id_desa, nama_surat.trim(), kode_surat.trim(), deskripsi || null, status || 'aktif']
    );

    const newSuratId = result.insertId;

    // Masukkan persyaratan jika ada
    if (Array.isArray(persyaratan)) {
      for (const p of persyaratan) {
        if (p.nama_persyaratan && p.nama_persyaratan.trim()) {
          await connection.execute(
            `INSERT INTO persyaratan_surat (id_jenis_surat, nama_persyaratan, deskripsi, wajib, format_file)
             VALUES (?, ?, ?, ?, ?)`,
            [
              newSuratId,
              p.nama_persyaratan.trim(),
              p.deskripsi || null,
              p.wajib ? 1 : 0,
              p.format_file || 'PDF, JPG, PNG',
            ]
          );
        }
      }
    }

    // Catat ke audit_log
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    await connection.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'TAMBAH_JENIS_SURAT', 'jenis_surat', ?, ?, ?)`,
      [adminId, id_desa, newSuratId, `Admin Desa menambahkan jenis surat: ${nama_surat}`, ipAddress]
    );

    await connection.commit();
    connection.release();

    return successResponse(res, 'Jenis surat baru berhasil dibuat.', { id_jenis_surat: newSuratId }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

/**
 * 6. Ubah Jenis Surat oleh Admin Desa
 */
export async function updateJenisSurat(req, res, next) {
  const { id } = req.params;
  const suratId = parseInt(id, 10);
  const id_desa = req.user.id_desa;
  const adminId = req.user.id_user;

  if (isNaN(suratId)) {
    return errorResponse(res, 'ID jenis surat tidak valid.', null, 400);
  }

  const { nama_surat, kode_surat, deskripsi, status } = req.body;

  try {
    const [check] = await pool.execute(
      `SELECT id_jenis_surat, nama_surat FROM jenis_surat WHERE id_jenis_surat = ? AND id_desa = ?`,
      [suratId, id_desa]
    );

    if (check.length === 0) {
      return errorResponse(res, 'Jenis surat tidak ditemukan di desa Anda.', null, 404);
    }

    await pool.execute(
      `UPDATE jenis_surat
       SET nama_surat = COALESCE(?, nama_surat),
           kode_surat = COALESCE(?, kode_surat),
           deskripsi = COALESCE(?, deskripsi),
           status = COALESCE(?, status),
           updated_at = NOW()
       WHERE id_jenis_surat = ? AND id_desa = ?`,
      [nama_surat || null, kode_surat || null, deskripsi !== undefined ? deskripsi : null, status || null, suratId, id_desa]
    );

    // Audit log
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    await pool.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'UBAH_JENIS_SURAT', 'jenis_surat', ?, ?, ?)`,
      [adminId, id_desa, suratId, `Admin Desa memperbarui jenis surat: ${nama_surat || check[0].nama_surat}`, ipAddress]
    );

    return successResponse(res, 'Jenis surat berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

/**
 * 7. Tambah Persyaratan pada Jenis Surat
 */
export async function addPersyaratan(req, res, next) {
  const { id_jenis_surat } = req.params;
  const suratId = parseInt(id_jenis_surat, 10);
  const id_desa = req.user.id_desa;
  const { nama_persyaratan, deskripsi, wajib, format_file } = req.body;

  if (isNaN(suratId) || !nama_persyaratan || !nama_persyaratan.trim()) {
    return errorResponse(res, 'Nama persyaratan wajib diisi.', null, 400);
  }

  try {
    const [check] = await pool.execute(
      `SELECT id_jenis_surat FROM jenis_surat WHERE id_jenis_surat = ? AND id_desa = ?`,
      [suratId, id_desa]
    );
    if (check.length === 0) {
      return errorResponse(res, 'Jenis surat tidak ditemukan di desa Anda.', null, 404);
    }

    const [resInsert] = await pool.execute(
      `INSERT INTO persyaratan_surat (id_jenis_surat, nama_persyaratan, deskripsi, wajib, format_file)
       VALUES (?, ?, ?, ?, ?)`,
      [suratId, nama_persyaratan.trim(), deskripsi || null, wajib ? 1 : 0, format_file || 'PDF, JPG, PNG']
    );

    return successResponse(res, 'Persyaratan surat berhasil ditambahkan.', { id_persyaratan: resInsert.insertId }, 201);
  } catch (error) {
    next(error);
  }
}

/**
 * 8. Hapus Persyaratan Surat
 */
export async function deletePersyaratan(req, res, next) {
  const { id } = req.params;
  const reqId = parseInt(id, 10);
  const id_desa = req.user.id_desa;

  if (isNaN(reqId)) {
    return errorResponse(res, 'ID persyaratan tidak valid.', null, 400);
  }

  try {
    const [check] = await pool.execute(
      `SELECT ps.id_persyaratan
       FROM persyaratan_surat ps
       JOIN jenis_surat js ON ps.id_jenis_surat = js.id_jenis_surat
       WHERE ps.id_persyaratan = ? AND js.id_desa = ?`,
      [reqId, id_desa]
    );

    if (check.length === 0) {
      return errorResponse(res, 'Persyaratan surat tidak ditemukan di desa Anda.', null, 404);
    }

    await pool.execute(`DELETE FROM persyaratan_surat WHERE id_persyaratan = ?`, [reqId]);

    return successResponse(res, 'Persyaratan surat berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

/**
 * 9. Statistik untuk Dashboard Admin Desa
 */
export async function getAdminDesaStats(req, res, next) {
  try {
    const id_desa = req.user.id_desa;

    const [[wargaCount]] = await pool.execute(
      `SELECT COUNT(*) AS total_warga FROM warga WHERE id_desa = ?`,
      [id_desa]
    );

    const [[suratStats]] = await pool.execute(
      `SELECT
        COUNT(*) AS total_permohonan,
        SUM(CASE WHEN status = 'diajukan' THEN 1 ELSE 0 END) AS permohonan_diajukan,
        SUM(CASE WHEN status = 'diproses' THEN 1 ELSE 0 END) AS permohonan_diproses,
        SUM(CASE WHEN status = 'perlu_perbaikan' THEN 1 ELSE 0 END) AS permohonan_perlu_perbaikan,
        SUM(CASE WHEN status = 'disetujui' THEN 1 ELSE 0 END) AS permohonan_disetujui,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS permohonan_selesai,
        SUM(CASE WHEN status = 'ditolak' THEN 1 ELSE 0 END) AS permohonan_ditolak
       FROM permohonan_surat
       WHERE id_desa = ?`,
      [id_desa]
    );

    const [[jenisCount]] = await pool.execute(
      `SELECT COUNT(*) AS total_jenis_surat FROM jenis_surat WHERE id_desa = ? AND status = 'aktif'`,
      [id_desa]
    );

    return successResponse(res, 'Statistik Admin Desa berhasil diambil.', {
      total_warga: Number(wargaCount?.total_warga || 0),
      total_permohonan: Number(suratStats?.total_permohonan || 0),
      permohonan_diajukan: Number(suratStats?.permohonan_diajukan || 0),
      permohonan_diproses: Number(suratStats?.permohonan_diproses || 0),
      permohonan_perlu_perbaikan: Number(suratStats?.permohonan_perlu_perbaikan || 0),
      permohonan_disetujui: Number(suratStats?.permohonan_disetujui || 0),
      permohonan_selesai: Number(suratStats?.permohonan_selesai || 0),
      permohonan_ditolak: Number(suratStats?.permohonan_ditolak || 0),
      total_jenis_surat: Number(jenisCount?.total_jenis_surat || 0),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin-desa/profil-desa — Ambil data profil desa milik Admin Desa
 */
export async function getProfilDesa(req, res, next) {
  try {
    const id_desa = req.user.id_desa;
    const [[desa]] = await pool.execute(
      `SELECT d.id_desa, d.nama_desa, d.kode_desa, d.alamat_kantor,
              d.telepon, d.email, d.nama_kabupaten, d.nama_kepala_desa,
              d.jabatan_pejabat, d.logo_desa,
              k.nama_kecamatan
       FROM desa d
       JOIN kecamatan k ON d.id_kecamatan = k.id_kecamatan
       WHERE d.id_desa = ?`,
      [id_desa]
    );
    if (!desa) return errorResponse(res, 'Data desa tidak ditemukan.', null, 404);
    return successResponse(res, 'Profil desa berhasil diambil.', desa);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin-desa/profil-desa — Update profil desa (hanya field yang diizinkan)
 */
export async function updateProfilDesa(req, res, next) {
  try {
    const id_desa = req.user.id_desa;
    const { nama_kabupaten, nama_kepala_desa, jabatan_pejabat, alamat_kantor, telepon, email } = req.body;

    const updates = [];
    const values = [];

    if (nama_kabupaten !== undefined) { updates.push('nama_kabupaten = ?'); values.push(nama_kabupaten.trim()); }
    if (nama_kepala_desa !== undefined) { updates.push('nama_kepala_desa = ?'); values.push(nama_kepala_desa.trim()); }
    if (jabatan_pejabat !== undefined) { updates.push('jabatan_pejabat = ?'); values.push(jabatan_pejabat.trim()); }
    if (alamat_kantor !== undefined) { updates.push('alamat_kantor = ?'); values.push(alamat_kantor.trim()); }
    if (telepon !== undefined) { updates.push('telepon = ?'); values.push(telepon.trim()); }
    if (email !== undefined) { updates.push('email = ?'); values.push(email.trim()); }

    if (updates.length === 0) {
      return errorResponse(res, 'Tidak ada field yang diperbarui.', null, 400);
    }

    values.push(id_desa);
    await pool.execute(
      `UPDATE desa SET ${updates.join(', ')} WHERE id_desa = ?`,
      values
    );

    return successResponse(res, 'Profil desa berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}
