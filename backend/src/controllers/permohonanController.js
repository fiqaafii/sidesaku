import path from 'path';
import fs from 'fs';
import { pool } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateOfficialSuratPDF, generateSKDPDF, generateSKUPDF, generateSPPDF, generateSKTMPDF } from '../utils/pdfGenerator.js';

/**
 * 1. Ambil daftar jenis surat aktif dan persyaratannya
 */
export async function getJenisSuratList(req, res, next) {
  try {
    const id_desa = req.user.id_desa;
    if (!id_desa) {
      return errorResponse(res, 'Desa pengguna tidak terdefinisi.', null, 400);
    }

    const [jenisList] = await pool.execute(
      `SELECT id_jenis_surat, id_desa, nama_surat, kode_surat, deskripsi, status
       FROM jenis_surat
       WHERE id_desa = ? AND status = 'aktif'
       ORDER BY nama_surat ASC`,
      [id_desa]
    );

    // Ambil seluruh persyaratan untuk jenis surat tersebut
    for (const jenis of jenisList) {
      const [persyaratan] = await pool.execute(
        `SELECT id_persyaratan, id_jenis_surat, nama_persyaratan, deskripsi, wajib, format_file
         FROM persyaratan_surat
         WHERE id_jenis_surat = ?
         ORDER BY wajib DESC, id_persyaratan ASC`,
        [jenis.id_jenis_surat]
      );
      jenis.persyaratan = persyaratan;
      jenis.jumlah_persyaratan = persyaratan.length;
    }

    return successResponse(res, 'Daftar jenis surat berhasil diambil.', jenisList);
  } catch (error) {
    next(error);
  }
}

/**
 * 2. Ajukan Permohonan Surat oleh Warga (dengan upload berkas fisik)
 */
export async function submitPermohonan(req, res, next) {
  const userId = req.user.id_user;
  const id_desa = req.user.id_desa;

  const { id_jenis_surat, keperluan, data_khusus_surat } = req.body;
  const suratId = parseInt(id_jenis_surat, 10);

  if (isNaN(suratId) || !keperluan || !keperluan.trim()) {
    return errorResponse(res, 'Jenis surat dan keperluan permohonan wajib diisi.', null, 400);
  }

  // Format data_khusus_surat menjadi JSON yang valid
  let dataKhususJson = null;
  if (data_khusus_surat) {
    if (typeof data_khusus_surat === 'string') {
      try {
        dataKhususJson = JSON.parse(data_khusus_surat);
      } catch {
        dataKhususJson = { keterangan_tambahan: data_khusus_surat };
      }
    } else if (typeof data_khusus_surat === 'object') {
      dataKhususJson = data_khusus_surat;
    }
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // A. Cari id_warga dari users.id_user
    const [wargaRows] = await connection.execute(
      `SELECT id_warga, id_desa, nik FROM warga WHERE id_user = ?`,
      [userId]
    );

    if (wargaRows.length === 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Profil data kependudukan warga tidak ditemukan.', null, 404);
    }

    const id_warga = wargaRows[0].id_warga;

    // B. Verifikasi jenis surat aktif di desa warga
    const [jenisRows] = await connection.execute(
      `SELECT id_jenis_surat, nama_surat, kode_surat FROM jenis_surat WHERE id_jenis_surat = ? AND id_desa = ? AND status = 'aktif'`,
      [suratId, id_desa]
    );

    if (jenisRows.length === 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Jenis surat tidak valid atau tidak tersedia di desa Anda.', null, 404);
    }

    // C. Ambil persyaratan surat
    const [persyaratanRows] = await connection.execute(
      `SELECT id_persyaratan, nama_persyaratan, wajib FROM persyaratan_surat WHERE id_jenis_surat = ?`,
      [suratId]
    );

    // D. Validasi berkas yang diunggah
    // req.files disediakan oleh multer (array of files)
    const uploadedFiles = req.files || [];

    // Periksa kelengkapan berkas wajib
    for (const reqItem of persyaratanRows) {
      if (reqItem.wajib === 1) {
        const fileAttached = uploadedFiles.find(
          (f) => f.fieldname === `file_${reqItem.id_persyaratan}` || f.fieldname === String(reqItem.id_persyaratan)
        );
        if (!fileAttached) {
          await connection.rollback();
          connection.release();
          return errorResponse(res, `Berkas wajib belum diunggah: ${reqItem.nama_persyaratan}`, null, 422);
        }
      }
    }

    // E. Buat nomor permohonan unik (PMH-YYYYMMDD-XXXX)
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const nomorPermohonan = `PMH-${todayStr}-${randomSuffix}`;

    // F. Simpan ke tabel permohonan_surat beserta data_khusus_surat
    const [permohonanResult] = await connection.execute(
      `INSERT INTO permohonan_surat (id_desa, id_warga, id_jenis_surat, nomor_permohonan, tanggal_pengajuan, keperluan, data_khusus_surat, status)
       VALUES (?, ?, ?, ?, NOW(), ?, ?, 'diajukan')`,
      [id_desa, id_warga, suratId, nomorPermohonan, keperluan.trim(), dataKhususJson ? JSON.stringify(dataKhususJson) : null]
    );

    const newPermohonanId = permohonanResult.insertId;

    // G. Simpan setiap berkas ke dokumen_persyaratan
    for (const file of uploadedFiles) {
      // Ambil id_persyaratan dari fieldname ("file_12" atau "12")
      const reqIdMatch = file.fieldname.replace('file_', '');
      const reqId = parseInt(reqIdMatch, 10);

      const relPath = path.join('uploads', 'dokumen', file.filename).replace(/\\/g, '/');

      await connection.execute(
        `INSERT INTO dokumen_persyaratan (id_permohonan, id_persyaratan, nama_file, path_file, tipe_file, ukuran_file, status_verifikasi, tanggal_upload)
         VALUES (?, ?, ?, ?, ?, ?, 'menunggu', NOW())`,
        [
          newPermohonanId,
          isNaN(reqId) ? null : reqId,
          file.originalname,
          relPath,
          file.mimetype,
          file.size,
        ]
      );
    }

    // H. Catat ke riwayat_permohonan
    await connection.execute(
      `INSERT INTO riwayat_permohonan (id_permohonan, id_user, status_sebelumnya, status_baru, keterangan, tanggal_perubahan)
       VALUES (?, ?, NULL, 'diajukan', 'Permohonan surat berhasil diajukan oleh warga.', NOW())`,
      [newPermohonanId, userId]
    );

    // I. Catat ke audit_log
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    await connection.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'PENGAJUAN_PERMOHONAN_SURAT', 'permohonan_surat', ?, ?, ?)`,
      [
        userId,
        id_desa,
        newPermohonanId,
        `Warga mengajukan permohonan ${jenisRows[0].nama_surat} (${nomorPermohonan}) dengan ${uploadedFiles.length} berkas`,
        ipAddress,
      ]
    );

    await connection.commit();
    connection.release();

    return successResponse(
      res,
      'Permohonan surat dan berkas persyaratan berhasil diajukan.',
      {
        id_permohonan: newPermohonanId,
        nomor_permohonan: nomorPermohonan,
        nama_surat: jenisRows[0].nama_surat,
        status: 'diajukan',
        jumlah_berkas: uploadedFiles.length,
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
 * 3. Ambil daftar permohonan milik warga yang sedang login
 */
export async function getPermohonanWarga(req, res, next) {
  try {
    const userId = req.user.id_user;

    const [rows] = await pool.execute(
      `SELECT
        p.id_permohonan,
        p.id_desa,
        p.id_warga,
        p.id_jenis_surat,
        p.nomor_permohonan,
        p.tanggal_pengajuan,
        p.keperluan,
        p.data_khusus_surat,
        p.status,
        p.catatan_admin,
        p.tanggal_selesai,
        js.nama_surat,
        js.kode_surat,
        d.nama_desa,
        (SELECT COUNT(*) FROM dokumen_persyaratan WHERE id_permohonan = p.id_permohonan) AS jumlah_dokumen
       FROM permohonan_surat p
       JOIN warga w ON p.id_warga = w.id_warga
       JOIN jenis_surat js ON p.id_jenis_surat = js.id_jenis_surat
       JOIN desa d ON p.id_desa = d.id_desa
       WHERE w.id_user = ?
       ORDER BY p.tanggal_pengajuan DESC`,
      [userId]
    );

    return successResponse(res, 'Daftar permohonan warga berhasil diambil.', rows);
  } catch (error) {
    next(error);
  }
}

/**
 * 4. Ambil daftar permohonan untuk Admin Desa (Isolasi Tenant Berdasarkan id_desa)
 */
export async function getPermohonanDesa(req, res, next) {
  try {
    const id_desa = req.user.id_desa;
    const { status, search } = req.query;

    let query = `
      SELECT
        p.id_permohonan,
        p.id_desa,
        p.id_warga,
        p.id_jenis_surat,
        p.nomor_permohonan,
        p.tanggal_pengajuan,
        p.keperluan,
        p.data_khusus_surat,
        p.status,
        p.catatan_admin,
        p.tanggal_selesai,
        u.nama_lengkap AS nama_warga,
        w.nik,
        w.no_telepon,
        js.nama_surat,
        js.kode_surat,
        (SELECT COUNT(*) FROM dokumen_persyaratan WHERE id_permohonan = p.id_permohonan) AS jumlah_dokumen
      FROM permohonan_surat p
      JOIN warga w ON p.id_warga = w.id_warga
      JOIN users u ON w.id_user = u.id_user
      JOIN jenis_surat js ON p.id_jenis_surat = js.id_jenis_surat
      WHERE p.id_desa = ?
    `;

    const params = [id_desa];

    if (status && status !== 'all') {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (search && search.trim()) {
      query += ` AND (p.nomor_permohonan LIKE ? OR u.nama_lengkap LIKE ? OR w.nik LIKE ?)`;
      const searchParam = `%${search.trim()}%`;
      params.push(searchParam, searchParam, searchParam);
    }

    query += ` ORDER BY p.tanggal_pengajuan DESC`;

    const [rows] = await pool.execute(query, params);

    return successResponse(res, 'Daftar permohonan desa berhasil diambil.', rows);
  } catch (error) {
    next(error);
  }
}

/**
 * 5. Ambil detail permohonan beserta berkas dan riwayat perubahan status
 */
export async function getPermohonanDetail(req, res, next) {
  try {
    const { id } = req.params;
    const permohonanId = parseInt(id, 10);

    if (isNaN(permohonanId)) {
      return errorResponse(res, 'ID permohonan tidak valid.', null, 400);
    }

    // Ambil permohonan utama lengkap dengan identitas kependudukan warga
    const [rows] = await pool.execute(
      `SELECT
        p.id_permohonan,
        p.id_desa,
        p.id_warga,
        p.id_jenis_surat,
        p.nomor_permohonan,
        p.tanggal_pengajuan,
        p.keperluan,
        p.data_khusus_surat,
        p.status,
        p.catatan_admin,
        p.diproses_oleh,
        p.tanggal_selesai,
        u.nama_lengkap AS nama_warga,
        u.email AS email_warga,
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
        w.id_user AS warga_user_id,
        js.nama_surat,
        js.kode_surat,
        d.nama_desa,
        d.kode_desa,
        d.alamat_kantor AS alamat_desa,
        d.telepon AS telepon_desa,
        d.email AS email_desa,
        k.nama_kecamatan
       FROM permohonan_surat p
       JOIN warga w ON p.id_warga = w.id_warga
       JOIN users u ON w.id_user = u.id_user
       JOIN jenis_surat js ON p.id_jenis_surat = js.id_jenis_surat
       JOIN desa d ON p.id_desa = d.id_desa
       JOIN kecamatan k ON d.id_kecamatan = k.id_kecamatan
       WHERE p.id_permohonan = ?`,
      [permohonanId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Permohonan surat tidak ditemukan.', null, 404);
    }

    const permohonan = rows[0];

    // Parse data_khusus_surat jika tersimpan sebagai string JSON
    if (permohonan.data_khusus_surat && typeof permohonan.data_khusus_surat === 'string') {
      try {
        permohonan.data_khusus_surat = JSON.parse(permohonan.data_khusus_surat);
      } catch {
        // Biarkan tetap nilai aslinya jika tidak valid JSON
      }
    }

    // Pemeriksaan Hak Akses (Multi-tenant):
    // Jika Warga -> wajib miliknya sendiri
    // Jika Admin Desa -> wajib desanya sendiri
    // Jika Super Admin -> diizinkan
    if (req.user.role === 'warga' && req.user.id_user !== permohonan.warga_user_id) {
      return errorResponse(res, 'Akses ditolak. Anda tidak berhak melihat permohonan ini.', null, 403);
    }
    if (req.user.role === 'admin_desa' && req.user.id_desa !== permohonan.id_desa) {
      return errorResponse(res, 'Akses ditolak. Permohonan ini berada di luar desa kewenangan Anda.', null, 403);
    }

    // Ambil dokumen persyaratan yang diunggah
    const [dokumenList] = await pool.execute(
      `SELECT
        dp.id_dokumen,
        dp.id_persyaratan,
        dp.nama_file,
        dp.tipe_file,
        dp.ukuran_file,
        dp.status_verifikasi,
        dp.catatan_verifikasi,
        dp.tanggal_upload,
        ps.nama_persyaratan,
        ps.wajib
       FROM dokumen_persyaratan dp
       LEFT JOIN persyaratan_surat ps ON dp.id_persyaratan = ps.id_persyaratan
       WHERE dp.id_permohonan = ?`,
      [permohonanId]
    );

    // Ambil riwayat status
    const [riwayatList] = await pool.execute(
      `SELECT
        rp.id_riwayat,
        rp.status_sebelumnya,
        rp.status_baru,
        rp.keterangan,
        rp.tanggal_perubahan,
        u.nama_lengkap AS diubah_oleh
       FROM riwayat_permohonan rp
       LEFT JOIN users u ON rp.id_user = u.id_user
       WHERE rp.id_permohonan = ?
       ORDER BY rp.tanggal_perubahan ASC`,
      [permohonanId]
    );

    permohonan.dokumen = dokumenList;
    permohonan.riwayat = riwayatList;

    return successResponse(res, 'Detail permohonan berhasil diambil.', permohonan);
  } catch (error) {
    next(error);
  }
}

/**
 * 6. Update Status Permohonan oleh Admin Desa
 */
export async function updatePermohonanStatus(req, res, next) {
  const { id } = req.params;
  const permohonanId = parseInt(id, 10);
  const { status, catatan_admin } = req.body;
  const adminId = req.user.id_user;
  const adminDesaId = req.user.id_desa;

  const validStatuses = ['diproses', 'perlu_perbaikan', 'disetujui', 'ditolak', 'selesai'];

  if (isNaN(permohonanId) || !validStatuses.includes(status)) {
    return errorResponse(res, 'Status baru tidak valid.', null, 400);
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.execute(
      `SELECT id_permohonan, id_desa, status, nomor_permohonan FROM permohonan_surat WHERE id_permohonan = ?`,
      [permohonanId]
    );

    if (rows.length === 0) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Permohonan surat tidak ditemukan.', null, 404);
    }

    const currentPermohonan = rows[0];

    // Isolasi tenant
    if (req.user.role === 'admin_desa' && currentPermohonan.id_desa !== adminDesaId) {
      await connection.rollback();
      connection.release();
      return errorResponse(res, 'Akses ditolak. Anda tidak berwenang mengelola permohonan desa lain.', null, 403);
    }

    const prevStatus = currentPermohonan.status;
    const isFinished = status === 'disetujui' || status === 'selesai' || status === 'ditolak';

    // Update permohonan_surat
    await connection.execute(
      `UPDATE permohonan_surat
       SET status = ?, catatan_admin = ?, diproses_oleh = ?, tanggal_selesai = ${isFinished ? 'NOW()' : 'tanggal_selesai'}, updated_at = NOW()
       WHERE id_permohonan = ?`,
      [status, catatan_admin || null, adminId, permohonanId]
    );

    // Catat ke riwayat_permohonan
    const keteranganText = catatan_admin && catatan_admin.trim()
      ? `Status diubah menjadi "${status}". Catatan: ${catatan_admin.trim()}`
      : `Status diubah menjadi "${status}".`;

    await connection.execute(
      `INSERT INTO riwayat_permohonan (id_permohonan, id_user, status_sebelumnya, status_baru, keterangan, tanggal_perubahan)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [permohonanId, adminId, prevStatus, status, keteranganText]
    );

    // Catat ke audit_log
    const ipAddress = req.ip || req.connection?.remoteAddress || null;
    await connection.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi, alamat_ip)
       VALUES (?, ?, 'UPDATE_STATUS_PERMOHONAN', 'permohonan_surat', ?, ?, ?)`,
      [
        adminId,
        currentPermohonan.id_desa,
        permohonanId,
        `Admin mengubah status ${currentPermohonan.nomor_permohonan} dari ${prevStatus} menjadi ${status}`,
        ipAddress,
      ]
    );

    await connection.commit();
    connection.release();

    return successResponse(res, `Status permohonan berhasil diperbarui menjadi ${status}.`, {
      id_permohonan: permohonanId,
      status_sebelumnya: prevStatus,
      status_baru: status,
      catatan_admin,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    next(error);
  }
}

/**
 * 7. Unduh / Lihat Dokumen Persyaratan yang Diunggah Secara Aman
 */
export async function downloadDokumen(req, res, next) {
  try {
    const { id_dokumen } = req.params;
    const docId = parseInt(id_dokumen, 10);

    if (isNaN(docId)) {
      return errorResponse(res, 'ID dokumen tidak valid.', null, 400);
    }

    const [rows] = await pool.execute(
      `SELECT dp.id_dokumen, dp.nama_file, dp.path_file, dp.tipe_file, p.id_desa, w.id_user AS warga_user_id
       FROM dokumen_persyaratan dp
       JOIN permohonan_surat p ON dp.id_permohonan = p.id_permohonan
       JOIN warga w ON p.id_warga = w.id_warga
       WHERE dp.id_dokumen = ?`,
      [docId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Dokumen tidak ditemukan.', null, 404);
    }

    const doc = rows[0];

    // Otorisasi Akses:
    if (req.user.role === 'warga' && req.user.id_user !== doc.warga_user_id) {
      return errorResponse(res, 'Akses ditolak. Anda tidak berwenang mengunduh dokumen ini.', null, 403);
    }
    if (req.user.role === 'admin_desa' && req.user.id_desa !== doc.id_desa) {
      return errorResponse(res, 'Akses ditolak. Dokumen berada di luar desa kewenangan Anda.', null, 403);
    }

    const absolutePath = path.isAbsolute(doc.path_file)
      ? doc.path_file
      : path.join(process.cwd(), doc.path_file);

    if (!fs.existsSync(absolutePath)) {
      return errorResponse(res, 'Berkas fisik pada server tidak ditemukan.', null, 404);
    }

    res.setHeader('Content-Type', doc.tipe_file || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.nama_file}"`);
    return res.sendFile(absolutePath);
  } catch (error) {
    next(error);
  }
}

/**
 * 8. Cetak / Unduh Dokumen PDF Resmi untuk Permohonan yang Telah Disetujui
 */
export async function cetakSuratPDF(req, res, next) {
  try {
    const { id } = req.params;
    const permohonanId = parseInt(id, 10);

    if (isNaN(permohonanId)) {
      return errorResponse(res, 'ID permohonan tidak valid.', null, 400);
    }

    const [rows] = await pool.execute(
      `SELECT
        p.id_permohonan,
        p.id_desa,
        p.nomor_permohonan,
        p.nomor_surat,
        p.file_arsip_pdf,
        p.tanggal_pengajuan,
        p.keperluan,
        p.data_khusus_surat,
        p.status,
        p.tanggal_selesai,
        p.tanggal_terbit,
        u.nama_lengkap,
        u.id_user AS warga_user_id,
        w.nik,
        w.no_telepon,
        w.alamat,
        w.rt,
        w.rw,
        w.tempat_lahir,
        w.tanggal_lahir,
        w.jenis_kelamin,
        w.pekerjaan,
        w.agama,
        js.nama_surat,
        js.kode_surat,
        d.nama_desa,
        d.kode_desa,
        d.alamat_kantor,
        d.telepon,
        d.email,
        d.nama_kabupaten,
        d.nama_kepala_desa,
        d.jabatan_pejabat,
        d.logo_desa,
        k.nama_kecamatan
       FROM permohonan_surat p
       JOIN warga w ON p.id_warga = w.id_warga
       JOIN users u ON w.id_user = u.id_user
       JOIN jenis_surat js ON p.id_jenis_surat = js.id_jenis_surat
       JOIN desa d ON p.id_desa = d.id_desa
       JOIN kecamatan k ON d.id_kecamatan = k.id_kecamatan
       WHERE p.id_permohonan = ?`,
      [permohonanId]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Permohonan surat tidak ditemukan.', null, 404);
    }

    const p = rows[0];

    // Otorisasi
    if (req.user.role === 'warga' && req.user.id_user !== p.warga_user_id) {
      return errorResponse(res, 'Akses ditolak.', null, 403);
    }
    if (req.user.role === 'admin_desa' && req.user.id_desa !== p.id_desa) {
      return errorResponse(res, 'Akses ditolak.', null, 403);
    }

    // Hanya surat berstatus disetujui atau selesai yang dapat dicetak resmi
    if (p.status !== 'disetujui' && p.status !== 'selesai') {
      return errorResponse(
        res,
        'Surat PDF resmi hanya dapat dicetak setelah permohonan disetujui atau selesai diproses.',
        null,
        400
      );
    }

    // Jika sudah ada arsip PDF (status selesai & file tersimpan), layani file arsip langsung
    if (p.status === 'selesai' && p.file_arsip_pdf) {
      const archivePath = path.resolve(p.file_arsip_pdf);
      if (fs.existsSync(archivePath)) {
        const filePrefix = (p.kode_surat && p.kode_surat.toUpperCase().startsWith('SKD')) ? 'SKD'
          : (p.kode_surat && (p.kode_surat.toUpperCase().startsWith('SKU') || (p.nama_surat && p.nama_surat.toLowerCase().includes('usaha')))) ? 'SKU'
          : (p.kode_surat && (p.kode_surat.toUpperCase().startsWith('SKTM') || (p.nama_surat && p.nama_surat.toLowerCase().includes('tidak mampu')))) ? 'SKTM'
          : (p.kode_surat && (p.kode_surat.toUpperCase().startsWith('SP') || (p.nama_surat && p.nama_surat.toLowerCase().includes('pengantar')))) ? 'SP'
          : (p.kode_surat ? p.kode_surat.split('-')[0] : 'Surat');
        const safeFilename = `${filePrefix}-${(p.nomor_surat || p.nomor_permohonan).replace(/\//g, '-')}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
        return res.sendFile(archivePath);
      }
    }

    // Parse data_khusus_surat jika ada
    let dataKhusus = {};
    try {
      if (p.data_khusus_surat) {
        dataKhusus = typeof p.data_khusus_surat === 'string'
          ? JSON.parse(p.data_khusus_surat)
          : p.data_khusus_surat;
      }
    } catch (_) {}

    const isSKD = p.kode_surat && (p.kode_surat.toUpperCase().startsWith('SKD') || (p.nama_surat && p.nama_surat.toLowerCase().includes('domisili')));
    const isSKU = p.kode_surat && (p.kode_surat.toUpperCase().startsWith('SKU') || (p.nama_surat && p.nama_surat.toLowerCase().includes('usaha')));
    const isSKTM = p.kode_surat && (p.kode_surat.toUpperCase().startsWith('SKTM') || (p.nama_surat && p.nama_surat.toLowerCase().includes('tidak mampu')));
    const isSP = p.kode_surat && (p.kode_surat.toUpperCase().startsWith('SP') || (p.nama_surat && p.nama_surat.toLowerCase().includes('pengantar')));

    const wargaData = {
      nama_lengkap: p.nama_lengkap,
      nik: p.nik,
      no_telepon: p.no_telepon,
      alamat: p.alamat,
      rt: p.rt,
      rw: p.rw,
      tempat_lahir: p.tempat_lahir,
      tanggal_lahir: p.tanggal_lahir,
      jenis_kelamin: p.jenis_kelamin,
      pekerjaan: p.pekerjaan,
      agama: p.agama,
    };

    const desaData = {
      nama_desa: p.nama_desa,
      nama_kabupaten: p.nama_kabupaten,
      nama_kepala_desa: p.nama_kepala_desa,
      jabatan_pejabat: p.jabatan_pejabat,
      alamat_kantor: p.alamat_kantor,
      telepon: p.telepon,
      email: p.email,
      logo_desa: p.logo_desa,
    };

    const kecData = {
      nama_kecamatan: p.nama_kecamatan,
    };

    let pdfBuffer;
    if (isSKD) {
      pdfBuffer = await generateSKDPDF({
        nomor_surat: p.nomor_surat || null,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        data_khusus: dataKhusus,
        tanggal_terbit: p.tanggal_terbit || p.tanggal_selesai || new Date(),
        keperluan: p.keperluan,
      });
    } else if (isSKU) {
      pdfBuffer = await generateSKUPDF({
        nomor_surat: p.nomor_surat || null,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        data_khusus: dataKhusus,
        tanggal_terbit: p.tanggal_terbit || p.tanggal_selesai || new Date(),
        keperluan: p.keperluan,
      });
    } else if (isSKTM) {
      pdfBuffer = await generateSKTMPDF({
        nomor_surat: p.nomor_surat || null,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        data_khusus: dataKhusus,
        tanggal_terbit: p.tanggal_terbit || p.tanggal_selesai || new Date(),
        keperluan: p.keperluan,
      });
    } else if (isSP) {
      pdfBuffer = await generateSPPDF({
        nomor_surat: p.nomor_surat || null,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        data_khusus: dataKhusus,
        tanggal_terbit: p.tanggal_terbit || p.tanggal_selesai || new Date(),
        keperluan: p.keperluan,
      });
    } else {
      pdfBuffer = await generateOfficialSuratPDF({
        nomorPermohonan: p.nomor_permohonan,
        nomorSurat: p.nomor_surat,
        namaSurat: p.nama_surat,
        kodeSurat: p.kode_surat,
        keperluan: p.keperluan,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        tanggalSelesai: p.tanggal_selesai,
      });
    }

    const filePrefix = isSKD ? 'SKD' : isSKU ? 'SKU' : isSKTM ? 'SKTM' : isSP ? 'SP' : (p.kode_surat ? p.kode_surat.split('-')[0] : 'Surat');
    const safeFilename = p.nomor_surat
      ? `${filePrefix}-${p.nomor_surat.replace(/\//g, '-')}.pdf`
      : `${filePrefix}-${p.nomor_permohonan}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
}

// ─── Helper: Angka ke Romawi ─────────────────────────────────────────────────
function toRomawi(n) {
  const ROMAWI = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return ROMAWI[n] || String(n);
}

/**
 * Helper internal untuk menerbitkan surat resmi (SKD, SKU, SP / SPKTP)
 */
async function prosesPenerbitanSuratInternal(req, res, next, forcedKode = null) {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const permohonanId = parseInt(id, 10);
    if (isNaN(permohonanId)) {
      conn.release();
      return errorResponse(res, 'ID permohonan tidak valid.', null, 400);
    }

    const adminDesaId = req.user.id_desa;

    // Ambil data permohonan lengkap
    const [rows] = await conn.execute(
      `SELECT
        p.id_permohonan, p.id_desa, p.id_warga, p.nomor_permohonan,
        p.nomor_surat, p.file_arsip_pdf, p.status, p.keperluan,
        p.data_khusus_surat,
        u.id_user AS warga_user_id, u.nama_lengkap,
        w.nik, w.alamat, w.rt, w.rw, w.tempat_lahir, w.tanggal_lahir,
        w.jenis_kelamin, w.pekerjaan, w.agama, w.no_telepon,
        js.nama_surat, js.kode_surat,
        d.nama_desa, d.nama_kabupaten, d.nama_kepala_desa,
        d.jabatan_pejabat, d.alamat_kantor, d.logo_desa,
        k.nama_kecamatan
       FROM permohonan_surat p
       JOIN warga w ON p.id_warga = w.id_warga
       JOIN users u ON w.id_user = u.id_user
       JOIN jenis_surat js ON p.id_jenis_surat = js.id_jenis_surat
       JOIN desa d ON p.id_desa = d.id_desa
       JOIN kecamatan k ON d.id_kecamatan = k.id_kecamatan
       WHERE p.id_permohonan = ?`,
      [permohonanId]
    );

    if (rows.length === 0) {
      conn.release();
      return errorResponse(res, 'Permohonan tidak ditemukan.', null, 404);
    }

    const p = rows[0];

    // Isolasi multi-tenant
    if (p.id_desa !== adminDesaId) {
      conn.release();
      return errorResponse(res, 'Akses ditolak. Permohonan bukan milik desa Anda.', null, 403);
    }

    // Tentukan tipe surat
    const kodeUpper = (p.kode_surat || '').toUpperCase();
    const namaLower = (p.nama_surat || '').toLowerCase();
    let tipe = 'UNKNOWN';
    if (kodeUpper.startsWith('SKD') || namaLower.includes('domisili')) tipe = 'SKD';
    else if (kodeUpper.startsWith('SKU') || namaLower.includes('usaha')) tipe = 'SKU';
    else if (kodeUpper.startsWith('SKTM') || namaLower.includes('tidak mampu')) tipe = 'SKTM';
    else if (kodeUpper.startsWith('SP') || namaLower.includes('pengantar')) tipe = 'SP';

    if (forcedKode && tipe !== forcedKode) {
      conn.release();
      return errorResponse(
        res,
        `Endpoint ini khusus untuk surat jenis ${forcedKode}, sedangkan permohonan ini bertipe ${p.nama_surat}.`,
        null,
        400
      );
    }

    if (tipe === 'UNKNOWN') {
      conn.release();
      return errorResponse(
        res,
        `Template penerbitan resmi belum tersedia untuk jenis surat: ${p.nama_surat}.`,
        null,
        400
      );
    }

    // Jika sudah diterbitkan, kembalikan data yang sudah ada
    if (p.nomor_surat && p.file_arsip_pdf) {
      conn.release();
      return successResponse(res, 'Surat sudah pernah diterbitkan.', {
        nomor_surat: p.nomor_surat,
        file_arsip_pdf: p.file_arsip_pdf,
        already_issued: true,
      });
    }

    // Status harus disetujui
    if (p.status !== 'disetujui') {
      conn.release();
      return errorResponse(
        res,
        `Surat hanya dapat diterbitkan ketika status permohonan adalah 'disetujui'. Status saat ini: ${p.status}.`,
        null,
        400
      );
    }

    // Validasi field wajib
    const missing = [];
    if (!p.nama_kepala_desa) missing.push('Nama Kepala Desa (isi di Profil Desa)');
    if (!p.jabatan_pejabat) missing.push('Jabatan Pejabat (isi di Profil Desa)');
    if (!p.nama_kabupaten) missing.push('Nama Kabupaten (isi di Profil Desa)');
    if (!p.nama_lengkap) missing.push('Nama Lengkap Warga');
    if (!p.nik) missing.push('NIK Warga');

    if (missing.length > 0) {
      conn.release();
      return errorResponse(
        res,
        'Data tidak lengkap untuk menerbitkan surat. Pastikan data berikut sudah diisi: ' + missing.join(', '),
        { missing_fields: missing },
        422
      );
    }

    // Generate nomor surat: {counter}/{tipe}/{ROMAWI_BULAN}/{TAHUN}
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    const [[{ jumlah }]] = await conn.execute(
      `SELECT COUNT(*) AS jumlah FROM arsip_surat
       WHERE id_desa = ? AND nomor_surat LIKE ? AND MONTH(tanggal_terbit) = ? AND YEAR(tanggal_terbit) = ?`,
      [adminDesaId, `%/${tipe}/%`, bulan, tahun]
    );

    let nextCount = Number(jumlah) + 1;
    let nomorSurat = '';
    let isUnique = false;

    // Pastikan nomor surat benar-benar belum terpakai di desa ini
    while (!isUnique) {
      const counterStr = String(nextCount).padStart(3, '0');
      nomorSurat = `${counterStr}/${tipe}/${toRomawi(bulan)}/${tahun}`;
      const [existing] = await conn.execute(
        `SELECT id_arsip FROM arsip_surat WHERE id_desa = ? AND nomor_surat = ?`,
        [adminDesaId, nomorSurat]
      );
      if (existing.length === 0) {
        isUnique = true;
      } else {
        nextCount++;
      }
    }

    // Parse data_khusus_surat
    let dataKhusus = {};
    try {
      if (p.data_khusus_surat) {
        dataKhusus = typeof p.data_khusus_surat === 'string'
          ? JSON.parse(p.data_khusus_surat)
          : p.data_khusus_surat;
      }
    } catch (_) {}

    const wargaData = {
      nama_lengkap: p.nama_lengkap,
      nik: p.nik,
      alamat: p.alamat,
      rt: p.rt,
      rw: p.rw,
      tempat_lahir: p.tempat_lahir,
      tanggal_lahir: p.tanggal_lahir,
      jenis_kelamin: p.jenis_kelamin,
      pekerjaan: p.pekerjaan,
      agama: p.agama,
      no_telepon: p.no_telepon,
    };

    const desaData = {
      nama_desa: p.nama_desa,
      nama_kabupaten: p.nama_kabupaten,
      nama_kepala_desa: p.nama_kepala_desa,
      jabatan_pejabat: p.jabatan_pejabat,
      alamat_kantor: p.alamat_kantor,
      telepon: p.telepon,
      email: p.email,
      logo_desa: p.logo_desa,
    };

    const kecData = {
      nama_kecamatan: p.nama_kecamatan,
    };

    // Generate PDF sesuai tipe
    let pdfBuffer;
    if (tipe === 'SKD') {
      pdfBuffer = await generateSKDPDF({
        nomor_surat: nomorSurat,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        data_khusus: dataKhusus,
        tanggal_terbit: now,
        keperluan: p.keperluan,
      });
    } else if (tipe === 'SKU') {
      pdfBuffer = await generateSKUPDF({
        nomor_surat: nomorSurat,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        data_khusus: dataKhusus,
        tanggal_terbit: now,
        keperluan: p.keperluan,
      });
    } else if (tipe === 'SKTM') {
      pdfBuffer = await generateSKTMPDF({
        nomor_surat: nomorSurat,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        data_khusus: dataKhusus,
        tanggal_terbit: now,
        keperluan: p.keperluan,
      });
    } else if (tipe === 'SP') {
      pdfBuffer = await generateSPPDF({
        nomor_surat: nomorSurat,
        warga: wargaData,
        desa: desaData,
        kecamatan: kecData,
        data_khusus: dataKhusus,
        tanggal_terbit: now,
        keperluan: p.keperluan,
      });
    }

    // Simpan file PDF ke disk
    const arsipDir = path.resolve('uploads/arsip_surat');
    if (!fs.existsSync(arsipDir)) fs.mkdirSync(arsipDir, { recursive: true });

    const safeNomor = nomorSurat.replace(/\//g, '-');
    const filename = `${adminDesaId}-${safeNomor}-${now.getTime()}.pdf`;
    const filePath = path.join(arsipDir, filename);
    fs.writeFileSync(filePath, pdfBuffer);

    const relativeFilePath = path.join('uploads', 'arsip_surat', filename);

    // Snapshot data untuk arsip
    const snapshotData = JSON.stringify({
      tipe_surat: tipe,
      warga: wargaData,
      desa: {
        nama_desa: p.nama_desa,
        nama_kabupaten: p.nama_kabupaten,
        nama_kepala_desa: p.nama_kepala_desa,
        jabatan_pejabat: p.jabatan_pejabat,
        alamat_kantor: p.alamat_kantor,
      },
      kecamatan: kecData,
      data_khusus: dataKhusus,
      keperluan: p.keperluan,
    });

    // Transaksi DB
    await conn.beginTransaction();

    await conn.execute(
      `UPDATE permohonan_surat
       SET nomor_surat = ?, file_arsip_pdf = ?, tanggal_terbit = NOW(),
           status = 'selesai', tanggal_selesai = NOW()
       WHERE id_permohonan = ?`,
      [nomorSurat, relativeFilePath, permohonanId]
    );

    await conn.execute(
      `INSERT INTO arsip_surat
         (id_permohonan, id_desa, nomor_surat, jenis_surat, nama_pemohon, nik_pemohon,
          nama_pejabat, jabatan_pejabat, file_path, file_size, snapshot_data,
          tanggal_terbit, diterbitkan_oleh)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`,
      [
        permohonanId,
        adminDesaId,
        nomorSurat,
        p.nama_surat,
        p.nama_lengkap,
        p.nik,
        p.nama_kepala_desa,
        p.jabatan_pejabat,
        relativeFilePath,
        pdfBuffer.length,
        snapshotData,
        req.user.id_user,
      ]
    );

    // Audit log
    try {
      await conn.execute(
        `INSERT INTO audit_log (id_user, aksi, keterangan, created_at)
         VALUES (?, ?, ?, NOW())`,
        [req.user.id_user, `TERBITKAN_SURAT_${tipe}`, `Menerbitkan ${p.nama_surat} nomor ${nomorSurat} untuk permohonan ${p.nomor_permohonan}`]
      );
    } catch (_) {}

    await conn.commit();
    conn.release();

    return successResponse(res, `${p.nama_surat} berhasil diterbitkan dengan nomor ${nomorSurat}.`, {
      nomor_surat: nomorSurat,
      file_arsip_pdf: relativeFilePath,
      tanggal_terbit: now.toISOString(),
      already_issued: false,
    });
  } catch (error) {
    try { await conn.rollback(); } catch (_) {}
    conn.release();
    if (error.statusCode === 422) {
      return errorResponse(res, error.message, { missing_fields: error.missingFields }, 422);
    }
    next(error);
  }
}

/**
 * 9. Terbitkan Surat Keterangan Domisili (SKD) — hanya Admin Desa
 *    POST /api/permohonan/:id/terbitkan-skd
 */
export async function terbitkanSuratSKD(req, res, next) {
  return prosesPenerbitanSuratInternal(req, res, next, 'SKD');
}

/**
 * 10. Terbitkan Surat Keterangan Usaha (SKU) — hanya Admin Desa
 *     POST /api/permohonan/:id/terbitkan-sku
 */
export async function terbitkanSuratSKU(req, res, next) {
  return prosesPenerbitanSuratInternal(req, res, next, 'SKU');
}

/**
 * 11. Terbitkan Surat Pengantar RT/RW (SP / SPKTP) — hanya Admin Desa
 *     POST /api/permohonan/:id/terbitkan-sp
 */
export async function terbitkanSuratSP(req, res, next) {
  return prosesPenerbitanSuratInternal(req, res, next, 'SP');
}

/**
 * 12. Terbitkan Surat Keterangan Tidak Mampu (SKTM) — hanya Admin Desa
 *     POST /api/permohonan/:id/terbitkan-sktm
 */
export async function terbitkanSuratSKTM(req, res, next) {
  return prosesPenerbitanSuratInternal(req, res, next, 'SKTM');
}

/**
 * 13. Terbitkan Surat Resmi Umum (Auto-detect jenis surat) — hanya Admin Desa
 *     POST /api/permohonan/:id/terbitkan
 */
export async function terbitkanSurat(req, res, next) {
  return prosesPenerbitanSuratInternal(req, res, next, null);
}
