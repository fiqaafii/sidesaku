import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import {
  validateRegisterWarga,
  validateRegisterAdmin,
  validateLogin,
} from '../validators/authValidator.js';

/**
 * 1. Ambil daftar desa aktif untuk pilihan dropdown registrasi publik
 */
export async function getDesaList(req, res, next) {
  try {
    const [rows] = await pool.execute(
      `SELECT id_desa, id_kecamatan, nama_desa, kode_desa, alamat_kantor, telepon, email, status
       FROM desa
       WHERE status = 'aktif'
       ORDER BY nama_desa ASC`
    );

    return successResponse(res, 'Daftar desa aktif berhasil diambil.', rows);
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Registrasi Akun Warga
 * - Akun langsung berstatus 'aktif'
 * - Transaksi atomik ke tabel users dan warga
 */
export async function registerWarga(req, res, next) {
  const { isValid, errors, data } = validateRegisterWarga(req.body);

  if (!isValid) {
    return errorResponse(res, 'Data pendaftaran tidak valid.', errors, 422);
  }

  const {
    username, email, password,
    nama_lengkap, nik, no_telepon, alamat, id_desa
  } = data;

  const connection = await pool.getConnection();

  try {
    // A. Validasi keberadaan desa aktif
    const [desaRows] = await connection.execute(
      `SELECT id_desa, nama_desa FROM desa WHERE id_desa = ? AND status = 'aktif'`,
      [id_desa]
    );

    if (desaRows.length === 0) {
      connection.release();
      return errorResponse(res, 'Desa yang dipilih tidak ditemukan atau sedang tidak aktif.', null, 400);
    }

    // B. Periksa keunikan username
    const [userExists] = await connection.execute(
      `SELECT id_user FROM users WHERE username = ?`,
      [username]
    );
    if (userExists.length > 0) {
      connection.release();
      return errorResponse(res, 'Username tersebut sudah terdaftar. Silakan gunakan username lain.', null, 409);
    }

    // C. Periksa keunikan email
    const [emailExists] = await connection.execute(
      `SELECT id_user FROM users WHERE email = ?`,
      [email]
    );
    if (emailExists.length > 0) {
      connection.release();
      return errorResponse(res, 'Alamat email tersebut sudah digunakan oleh akun lain.', null, 409);
    }

    // D. Periksa keunikan NIK di desa terkait (UNIQUE KEY uk_warga_desa_nik)
    const [nikExists] = await connection.execute(
      `SELECT id_warga FROM warga WHERE id_desa = ? AND nik = ?`,
      [id_desa, nik]
    );
    if (nikExists.length > 0) {
      connection.release();
      return errorResponse(res, 'NIK tersebut sudah terdaftar pada desa ini.', null, 409);
    }

    // E. Hash password menggunakan bcryptjs (salt round: 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // F. Jalankan transaksi database (users + warga)
    await connection.beginTransaction();

    // 1) Simpan ke tabel users
    const [userResult] = await connection.execute(
      `INSERT INTO users (id_desa, nama_lengkap, username, email, password, role, status_akun)
       VALUES (?, ?, ?, ?, ?, 'warga', 'aktif')`,
      [id_desa, nama_lengkap, username, email, hashedPassword]
    );

    const newUserId = userResult.insertId;

    // 2) Simpan profil ke tabel warga (sesuai skema aktual: nama_lengkap ada di tabel users)
    const [wargaResult] = await connection.execute(
      `INSERT INTO warga (id_user, id_desa, nik, no_telepon, alamat)
       VALUES (?, ?, ?, ?, ?)`,
      [newUserId, id_desa, nik, no_telepon, alamat]
    );

    // 3) Catat ke audit_log jika tabel audit tersedia
    await connection.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'REGISTRASI_WARGA', 'warga', ?, 'Pendaftaran akun mandiri warga berhasil', ?)`,
      [newUserId, id_desa, wargaResult.insertId, req.ip || null]
    );

    await connection.commit();
    connection.release();

    return successResponse(
      res,
      'Pendaftaran warga berhasil. Akun Anda telah aktif dan dapat langsung digunakan untuk masuk.',
      {
        id_user: newUserId,
        username,
        nama_lengkap,
        role: 'warga',
        status_akun: 'aktif',
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
 * 3. Registrasi Calon Admin Desa
 * - Akun otomatis berstatus 'menunggu'
 * - Membutuhkan persetujuan Super Admin Kecamatan
 */
export async function registerAdminDesa(req, res, next) {
  const { isValid, errors, data } = validateRegisterAdmin(req.body);

  if (!isValid) {
    return errorResponse(res, 'Data pendaftaran Admin Desa tidak valid.', errors, 422);
  }

  const { nama_lengkap, username, email, password, id_desa } = data;

  try {
    // A. Validasi keberadaan desa aktif
    const [desaRows] = await pool.execute(
      `SELECT id_desa, nama_desa FROM desa WHERE id_desa = ? AND status = 'aktif'`,
      [id_desa]
    );

    if (desaRows.length === 0) {
      return errorResponse(res, 'Desa yang dipilih tidak ditemukan atau sedang tidak aktif.', null, 400);
    }

    // B. Periksa keunikan username
    const [userExists] = await pool.execute(
      `SELECT id_user FROM users WHERE username = ?`,
      [username]
    );
    if (userExists.length > 0) {
      return errorResponse(res, 'Username tersebut sudah terdaftar. Silakan pilih username lain.', null, 409);
    }

    // C. Periksa keunikan email
    const [emailExists] = await pool.execute(
      `SELECT id_user FROM users WHERE email = ?`,
      [email]
    );
    if (emailExists.length > 0) {
      return errorResponse(res, 'Alamat email tersebut sudah digunakan.', null, 409);
    }

    // D. Hash password dengan bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // E. Simpan akun dengan status 'menunggu'
    const [result] = await pool.execute(
      `INSERT INTO users (id_desa, nama_lengkap, username, email, password, role, status_akun)
       VALUES (?, ?, ?, ?, ?, 'admin_desa', 'menunggu')`,
      [id_desa, nama_lengkap, username, email, hashedPassword]
    );

    const newUserId = result.insertId;

    // Catat ke audit_log
    await pool.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'REGISTRASI_ADMIN_DESA', 'users', ?, 'Permohonan akun Admin Desa menunggu persetujuan', ?)`,
      [newUserId, id_desa, newUserId, req.ip || null]
    );

    return successResponse(
      res,
      'Permohonan pendaftaran Admin Desa berhasil dikirimkan. Akun Anda sedang menunggu persetujuan Super Admin Kecamatan.',
      {
        id_user: newUserId,
        username,
        nama_lengkap,
        nama_desa: desaRows[0].nama_desa,
        role: 'admin_desa',
        status_akun: 'menunggu',
      },
      201
    );
  } catch (error) {
    next(error);
  }
}

/**
 * 4. Login Pengguna (Super Admin, Admin Desa, Warga)
 * - Verifikasi hash password
 * - Validasi status akun (menunggu, ditolak, nonaktif tidak boleh dapat token aktif)
 * - Menerbitkan JWT token
 */
export async function login(req, res, next) {
  const { isValid, errors, data } = validateLogin(req.body);

  if (!isValid) {
    return errorResponse(res, 'Identitas masuk tidak lengkap.', errors, 400);
  }

  const { username, password } = data;

  try {
    // A. Cari pengguna berdasarkan username
    const [rows] = await pool.execute(
      `SELECT u.id_user, u.id_desa, u.nama_lengkap, u.username, u.email, u.password,
              u.role, u.status_akun, d.nama_desa, d.kode_desa
       FROM users u
       LEFT JOIN desa d ON u.id_desa = d.id_desa
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length === 0) {
      // Cegah user enumeration dengan pesan umum
      return errorResponse(res, 'Username atau password yang Anda masukkan salah.', null, 401);
    }

    const user = rows[0];

    // B. Verifikasi hash kata sandi dengan bcrypt
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return errorResponse(res, 'Username atau password yang Anda masukkan salah.', null, 401);
    }

    // C. Periksa status akun
    if (user.status_akun === 'menunggu') {
      return errorResponse(
        res,
        'Akun Anda sedang dalam status MENUNGGU PERSETUJUAN dari Super Admin Kecamatan.',
        {
          status_akun: 'menunggu',
          nama_desa: user.nama_desa || null,
        },
        403
      );
    }

    if (user.status_akun === 'ditolak') {
      return errorResponse(
        res,
        'Permohonan pendaftaran akun Anda telah ditolak oleh administrator.',
        { status_akun: 'ditolak' },
        403
      );
    }

    if (user.status_akun === 'nonaktif') {
      return errorResponse(
        res,
        'Akun Anda telah dinonaktifkan. Silakan hubungi pihak kantor kecamatan atau desa.',
        { status_akun: 'nonaktif' },
        403
      );
    }

    if (user.status_akun !== 'aktif') {
      return errorResponse(res, 'Status akun Anda tidak memenuhi syarat untuk masuk.', null, 403);
    }

    // D. Buat token JWT yang aman
    const payload = {
      id_user: user.id_user,
      role: user.role,
      id_desa: user.id_desa || null,
      username: user.username,
      status_akun: user.status_akun,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    // E. Siapkan objek pengguna tanpa password
    const userSafe = {
      id_user: user.id_user,
      nama_lengkap: user.nama_lengkap,
      username: user.username,
      email: user.email,
      role: user.role,
      status_akun: user.status_akun,
      id_desa: user.id_desa || null,
      nama_desa: user.nama_desa || null,
      kode_desa: user.kode_desa || null,
    };

    // F. Catat audit log login berhasil
    await pool.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'LOGIN_BERHASIL', 'users', ?, 'Pengguna berhasil masuk ke sistem', ?)`,
      [user.id_user, user.id_desa || null, user.id_user, req.ip || null]
    );

    return successResponse(res, 'Berhasil masuk ke sistem.', {
      token,
      user: userSafe,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * 5. Cek Profil Pengguna Terautentikasi (GET /api/auth/me)
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user.id_user;

    const [userRows] = await pool.execute(
      `SELECT u.id_user, u.id_desa, u.nama_lengkap, u.username, u.email,
              u.role, u.status_akun, u.created_at, d.nama_desa, d.kode_desa
       FROM users u
       LEFT JOIN desa d ON u.id_desa = d.id_desa
       WHERE u.id_user = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return errorResponse(res, 'Pengguna tidak ditemukan.', null, 404);
    }

    const userData = userRows[0];

    // Jika role warga, ambil detail kependudukan dari tabel warga
    if (userData.role === 'warga') {
      const [wargaRows] = await pool.execute(
        `SELECT id_warga, nik, no_kk, tempat_lahir, tanggal_lahir,
                jenis_kelamin, alamat, rt, rw, agama, status_perkawinan,
                pekerjaan, no_telepon
         FROM warga
         WHERE id_user = ?`,
        [userId]
      );

      if (wargaRows.length > 0) {
        userData.profil_warga = wargaRows[0];
      }
    }

    return successResponse(res, 'Profil pengguna berhasil diambil.', userData);
  } catch (error) {
    next(error);
  }
}

/**
 * 6. Pembaruan Profil Mandiri Warga (PUT /api/auth/profile)
 * Warga melengkapi dan memperbarui data kependudukannya sendiri
 */
export async function updateProfileWarga(req, res, next) {
  try {
    const userId = req.user.id_user;
    const role = req.user.role;
    const id_desa = req.user.id_desa;

    if (role !== 'warga') {
      return errorResponse(res, 'Pembaruan profil mandiri ini hanya diperuntukkan bagi warga.', null, 403);
    }

    const {
      nama_lengkap,
      no_kk,
      tempat_lahir,
      tanggal_lahir,
      jenis_kelamin,
      rt,
      rw,
      agama,
      status_perkawinan,
      pekerjaan,
      alamat,
      no_telepon,
    } = req.body;

    // Validasi Nomor KK (jika diisi, harus 16 digit angka)
    if (no_kk && !/^\d{16}$/.test(no_kk.trim())) {
      return errorResponse(res, 'Nomor Kartu Keluarga (KK) harus berupa 16 digit angka.', null, 400);
    }

    // Validasi Jenis Kelamin (jika diisi, harus 'L' atau 'P')
    if (jenis_kelamin && !['L', 'P'].includes(jenis_kelamin)) {
      return errorResponse(res, 'Jenis kelamin harus L (Laki-laki) atau P (Perempuan).', null, 400);
    }

    // Validasi Tanggal Lahir (jika diisi, tidak boleh di masa depan)
    if (tanggal_lahir) {
      const d = new Date(tanggal_lahir);
      if (isNaN(d.getTime())) {
        return errorResponse(res, 'Format tanggal lahir tidak valid.', null, 400);
      }
      if (d > new Date()) {
        return errorResponse(res, 'Tanggal lahir tidak boleh di masa depan.', null, 400);
      }
    }

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Cek apakah data warga ada di desa ini
      const [wargaRows] = await connection.execute(
        `SELECT id_warga, nik FROM warga WHERE id_user = ? AND id_desa = ?`,
        [userId, id_desa]
      );

      if (wargaRows.length === 0) {
        await connection.rollback();
        connection.release();
        return errorResponse(res, 'Data kependudukan warga tidak ditemukan.', null, 404);
      }

      const id_warga = wargaRows[0].id_warga;

      // Update nama_lengkap di users jika ada
      if (nama_lengkap && nama_lengkap.trim()) {
        await connection.execute(
          `UPDATE users SET nama_lengkap = ?, updated_at = NOW() WHERE id_user = ?`,
          [nama_lengkap.trim(), userId]
        );
      }

      // Format nilai null-safe
      const safeKK = no_kk && no_kk.trim() ? no_kk.trim() : null;
      const safeTempat = tempat_lahir && tempat_lahir.trim() ? tempat_lahir.trim() : null;
      const safeTgl = tanggal_lahir ? String(tanggal_lahir).slice(0, 10) : null;
      const safeJK = jenis_kelamin || null;
      const safeRT = rt && rt.trim() ? rt.trim() : null;
      const safeRW = rw && rw.trim() ? rw.trim() : null;
      const safeAgama = agama && agama.trim() ? agama.trim() : null;
      const safeStatusKawin = status_perkawinan && status_perkawinan.trim() ? status_perkawinan.trim() : null;
      const safePekerjaan = pekerjaan && pekerjaan.trim() ? pekerjaan.trim() : null;
      const safeAlamat = alamat && alamat.trim() ? alamat.trim() : null;
      const safeTelepon = no_telepon && no_telepon.trim() ? no_telepon.trim() : null;

      // Update data di tabel warga
      await connection.execute(
        `UPDATE warga SET
          no_kk = COALESCE(?, no_kk),
          tempat_lahir = COALESCE(?, tempat_lahir),
          tanggal_lahir = COALESCE(?, tanggal_lahir),
          jenis_kelamin = COALESCE(?, jenis_kelamin),
          rt = COALESCE(?, rt),
          rw = COALESCE(?, rw),
          agama = COALESCE(?, agama),
          status_perkawinan = COALESCE(?, status_perkawinan),
          pekerjaan = COALESCE(?, pekerjaan),
          alamat = COALESCE(?, alamat),
          no_telepon = COALESCE(?, no_telepon),
          updated_at = NOW()
         WHERE id_warga = ? AND id_desa = ?`,
        [
          safeKK,
          safeTempat,
          safeTgl,
          safeJK,
          safeRT,
          safeRW,
          safeAgama,
          safeStatusKawin,
          safePekerjaan,
          safeAlamat,
          safeTelepon,
          id_warga,
          id_desa,
        ]
      );

      // Audit Log
      const ipAddress = req.ip || req.connection?.remoteAddress || null;
      await connection.execute(
        `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
         VALUES (?, ?, 'UPDATE_PROFIL_MANDIRI', 'warga', ?, 'Warga memperbarui kelengkapan profil kependudukan mandiri', ?)`,
        [userId, id_desa, id_warga, ipAddress]
      );

      await connection.commit();
      connection.release();

      // Ambil data profil terbaru untuk dikembalikan ke frontend
      const [updatedRows] = await pool.execute(
        `SELECT w.id_warga, w.nik, w.no_kk, w.tempat_lahir, w.tanggal_lahir,
                w.jenis_kelamin, w.alamat, w.rt, w.rw, w.agama, w.status_perkawinan,
                w.pekerjaan, w.no_telepon, u.nama_lengkap, u.email, u.username
         FROM warga w
         JOIN users u ON w.id_user = u.id_user
         WHERE w.id_warga = ?`,
        [id_warga]
      );

      return successResponse(res, 'Profil data kependudukan berhasil diperbarui.', updatedRows[0]);
    } catch (err) {
      await connection.rollback();
      connection.release();
      next(err);
    }
  } catch (error) {
    next(error);
  }
}
