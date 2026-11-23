import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Buat MySQL connection pool
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'db_administrasi_desa',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Fungsi untuk menguji koneksi database saat server mulai
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[DB] Terhubung ke database MySQL "${process.env.DB_NAME}" melalui connection pool.`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[DB ERROR] Gagal terhubung ke MySQL:', error.message);
    return false;
  }
}
