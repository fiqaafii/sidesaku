import bcrypt from 'bcryptjs';
import readline from 'readline';
import { pool } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Skrip CLI Satu Kali (One-Time Bootstrap) untuk Pembuatan Akun Super Admin Kecamatan Awal
 *
 * Standar Keamanan Tinggi:
 * 1. Tidak menerima password melalui argumen CLI untuk mencegah terekspos di riwayat shell/process list.
 * 2. Menggunakan prompt interaktif tersembunyi (masked input).
 * 3. Skrip otomatis BERHENTI jika akun Super Admin sudah terdaftar di database.
 * 4. Password langsung di-hash menggunakan bcryptjs (salt: 10).
 * 5. Password dan kredensial rahasia tidak pernah dicetak ke log.
 */

// Helper untuk membaca input tersembunyi dari terminal (password masking)
function questionHidden(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin = process.openStdin();
    process.stdin.on('data', (char) => {
      char = char + '';
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          stdin.pause();
          break;
        default:
          process.stdout.clearLine(0);
          readline.cursorTo(process.stdout, 0);
          process.stdout.write(prompt + '*'.repeat(rl.line.length));
          break;
      }
    });

    rl.question(prompt, (value) => {
      rl.history = rl.history.slice(1);
      rl.close();
      console.log(''); // Newline
      resolve(value.trim());
    });
  });
}

function question(prompt) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function bootstrapSuperAdmin() {
  console.log('\n=============================================================');
  console.log('  INISIALISASI AKUN SUPER ADMIN KECAMATAN (BOOTSTRAP CLI)   ');
  console.log('=============================================================\n');

  try {
    // 1. Periksa apakah sudah ada akun dengan role 'super_admin'
    const [existing] = await pool.execute(
      `SELECT id_user, username, email, created_at FROM users WHERE role = 'super_admin' LIMIT 1`
    );

    if (existing.length > 0) {
      console.log(`[BOOTSTRAP DIBATALKAN] Akun Super Admin sudah terdaftar di sistem:`);
      console.log(`- Username : ${existing[0].username}`);
      console.log(`- Email    : ${existing[0].email}`);
      console.log(`- Terdaftar: ${existing[0].created_at}`);
      console.log('Tidak ada perubahan yang dilakukan pada database.');
      process.exit(0);
    }

    // 2. Minta input secara interaktif tanpa mengekspos password di argumen terminal
    console.log('Silakan masukkan informasi akun Super Admin Kecamatan:\n');

    const namaLengkap = (await question('Nama Lengkap [Super Admin Kecamatan]: ')) || 'Super Admin Kecamatan';
    const username = await question('Username: ');
    const email = await question('Email resmi: ');
    const password = await questionHidden('Password rahasia (min. 8 karakter): ');
    const confirmPassword = await questionHidden('Ulangi password rahasia: ');

    // Validasi input
    if (!username || !email || !password) {
      console.error('\n[GAGAL] Username, email, dan password wajib diisi.');
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\n[GAGAL] Password Super Admin wajib minimal 8 karakter demi keamanan.');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('\n[GAGAL] Konfirmasi password tidak cocok.');
      process.exit(1);
    }

    // 3. Hash password dengan bcryptjs (salt round: 10)
    console.log('\n[PROSES] Mengamankan kata sandi dengan algoritma hashing bcrypt...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Masukkan ke tabel users (id_desa = NULL, role = 'super_admin', status_akun = 'aktif')
    const [result] = await pool.execute(
      `INSERT INTO users (id_desa, nama_lengkap, username, email, password, role, status_akun)
       VALUES (NULL, ?, ?, ?, ?, 'super_admin', 'aktif')`,
      [namaLengkap, username.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    const newId = result.insertId;

    // 5. Catat ke audit_log
    await pool.execute(
      `INSERT INTO audit_log (id_user, id_desa, aktivitas, tabel_terkait, id_data, deskripsi)
       VALUES (?, NULL, 'BOOTSTRAP_SUPERADMIN', 'users', ?, 'Inisialisasi akun Super Admin awal melalui CLI aman')`,
      [newId, newId]
    );

    console.log(`\n✅ [BOOTSTRAP SUKSES] Akun Super Admin awal berhasil dibuat.`);
    console.log(`- ID User     : ${newId}`);
    console.log(`- Nama Lengkap: ${namaLengkap}`);
    console.log(`- Username    : ${username}`);
    console.log(`- Role        : super_admin`);
    console.log(`- Status Akun : aktif`);
    console.log(`\nAkun siap digunakan. Password tidak ditampilkan maupun dicatat ke log demi privasi.`);

    process.exit(0);
  } catch (error) {
    console.error('\n[BOOTSTRAP ERROR] Gagal melakukan inisialisasi Super Admin:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

bootstrapSuperAdmin();
