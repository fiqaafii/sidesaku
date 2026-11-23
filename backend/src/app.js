import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import permohonanRoutes from './routes/permohonanRoutes.js';
import adminDesaRoutes from './routes/adminDesaRoutes.js';
import desaRoutes from './routes/desaRoutes.js';
import { successResponse } from './utils/response.js';
import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security & utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Origin tidak diizinkan oleh kebijakan CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  return successResponse(res, 'Backend SiDesaku API berjalan normal', {
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/permohonan', permohonanRoutes);
app.use('/api/admin-desa', adminDesaRoutes);
app.use('/api/desa', desaRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
