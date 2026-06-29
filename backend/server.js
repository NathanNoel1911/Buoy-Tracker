// ============================================
//  KJG BOUY TRACKER — Backend Server
//  Express.js + SQLite
//  Port default: 3001
// ============================================

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const authRoutes = require('./routes/auth');
const bouyRoutes = require('./routes/bouy');

const app  = express();
const PORT = process.env.PORT || 3001;

// ── MIDDLEWARE ────────────────────────────────
app.use(cors({
  origin: '*', // Di produksi ganti dengan domain spesifik
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization','x-device-key']
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Log setiap request (development)
app.use((req, res, next) => {
  const now = new Date().toLocaleTimeString('id-ID');
  console.log(`[${now}] ${req.method} ${req.path}`);
  next();
});

// ── ROUTES ────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/bouy', bouyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'KJG Bouy Tracker API',
    version: '1.0.0',
    time: new Date().toLocaleString('id-ID')
  });
});

// Serve frontend di production (opsional)
// app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── 404 ───────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint tidak ditemukan' });
});

// ── ERROR HANDLER ─────────────────────────────
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({ message: 'Terjadi kesalahan server' });
});

// ── START ─────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════╗');
  console.log('║    KJG BOUY TRACKER — Backend API      ║');
  console.log(`║    Running at http://localhost:${PORT}     ║`);
  console.log('╠════════════════════════════════════════╣');
  console.log('║  Endpoint tersedia:                    ║');
  console.log('║  POST /api/auth/login                  ║');
  console.log('║  GET  /api/bouy          (dashboard)   ║');
  console.log('║  POST /api/bouy          (tambah)      ║');
  console.log('║  POST /api/bouy/data     (ESP32)       ║');
  console.log('║  GET  /api/health                      ║');
  console.log('╠════════════════════════════════════════╣');
  console.log('║  Default login: admin / admin123       ║');
  console.log('╚════════════════════════════════════════╝');
  console.log('');

  // Init database saat startup
  require('./db/database').getDb();
});
