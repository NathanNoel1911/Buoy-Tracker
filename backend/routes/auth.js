// ============================================
//  KJG BOUY TRACKER — Auth Routes
//  POST /api/auth/login
//  POST /api/auth/logout
// ============================================

const express = require('express');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { getDb } = require('../db/database');
const { authMiddleware, JWT_SECRET } = require('../middleware/authMiddleware');

const router = express.Router();

// ── LOGIN ─────────────────────────────────────
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username dan password harus diisi' });
  }

  try {
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username.trim());

    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// ── CHANGE PASSWORD ───────────────────────────
router.post('/change-password', authMiddleware, async (req, res) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password) {
    return res.status(400).json({ message: 'Password lama dan baru wajib diisi' });
  }
  if (new_password.length < 6) {
    return res.status(400).json({ message: 'Password baru minimal 6 karakter' });
  }

  try {
    const db   = getDb();
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    const valid = await bcrypt.compare(old_password, user.password);
    if (!valid) return res.status(401).json({ message: 'Password lama tidak tepat' });

    const hash = await bcrypt.hash(new_password, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, req.user.id);
    return res.json({ message: 'ok' });
  } catch (err) {
    return res.status(500).json({ message: 'Gagal mengganti password' });
  }
});

module.exports = router;
