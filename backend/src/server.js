import app from './app.js';
import { testConnection } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Uji koneksi pool database terlebih dahulu
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.warn('[SERVER WARNING] Server tetap berjalan namun koneksi MySQL belum tersedia.');
  }

  app.listen(PORT, () => {
    console.log(`[SERVER] Backend SiDesaku berjalan di http://localhost:${PORT}`);
  });
}

startServer();
