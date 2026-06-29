# KJG Bouy Tracker

Sistem monitoring bouy real-time untuk perairan Indonesia.  
Hardware: ESP32 + GPS NEO-6M + SIM7600 (M2M Telkomsel)  
Data dikirim setiap **6 jam sekali** untuk hemat baterai.

---

## Struktur Folder

```
kjg-bouy-tracker/
├── frontend/               ← File HTML/CSS/JS (buka di browser)
│   ├── index.html          ← Halaman login
│   ├── dashboard.html      ← Dashboard utama + peta
│   ├── css/
│   │   ├── style.css       ← Styles global + login
│   │   └── dashboard.css   ← Styles dashboard
│   └── js/
│       ├── auth.js         ← Logic login
│       └── dashboard.js    ← Logic dashboard + peta
│
└── backend/                ← Node.js API Server
    ├── server.js           ← Entry point
    ├── package.json
    ├── kjg_bouy.db         ← Database SQLite (auto-dibuat)
    ├── routes/
    │   ├── auth.js         ← Login API
    │   └── bouy.js         ← CRUD bouy + endpoint ESP32
    ├── middleware/
    │   └── authMiddleware.js
    └── db/
        └── database.js     ← Schema & seed data
```

---

## Cara Menjalankan

### 1. Install Node.js
Download dari https://nodejs.org (pilih versi LTS)

### 2. Install dependencies backend
```bash
cd backend
npm install
```

### 3. Jalankan backend
```bash
npm start
# atau untuk development dengan auto-reload:
npm run dev
```
Server berjalan di: http://localhost:3001

### 4. Buka frontend
Buka file `frontend/index.html` langsung di browser.  
Atau gunakan Live Server (VS Code extension) untuk development.

### 5. Login
- Username: `admin`
- Password: `admin123`
- **Ganti password setelah login pertama!**

---

## Cara ESP32 Mengirim Data

ESP32 memanggil endpoint ini setiap 6 jam:

```
POST http://<IP_SERVER>:3001/api/bouy/data
Header: x-device-key: kjg_device_secret_2026
Content-Type: application/json

{
  "id":  "BJG-001",
  "lat": -5.6235,
  "lng": 105.3142,
  "alt": 0,
  "speed": 0.2,
  "heading": 235,
  "sats": 8,
  "hdop": 1.2,
  "batt": 85
}
```

**Catatan:** Device ID (`BJG-001`) harus sudah terdaftar di dashboard terlebih dahulu.

---

## Konfigurasi

Edit file `.env` di folder `backend/` (buat jika belum ada):

```env
PORT=3001
JWT_SECRET=ganti_dengan_secret_yang_kuat
DEVICE_KEY=kjg_device_secret_2026
```

---

## Fitur

- ✅ Login dengan username & password
- ✅ Dashboard peta interaktif (Leaflet.js + OpenStreetMap)  
- ✅ Tambah / edit / hapus bouy
- ✅ Titik koordinat bouy ditampilkan di peta
- ✅ Status bouy: Aman / Alert / Offline
- ✅ Geofence per bouy (alert jika keluar radius)
- ✅ Alert kecepatan mencurigakan (> 2 knot)
- ✅ Alert baterai rendah (< 20%)
- ✅ Log aktivitas / history kiriman data
- ✅ Endpoint khusus untuk ESP32 (tanpa login, pakai device key)
- ✅ Data dikirim setiap 6 jam (hemat baterai)

---

## Catatan Kartu M2M Telkomsel

Untuk konfigurasi APN di firmware ESP32:
```cpp
const char* APN = "internet";   // atau "m2minternet" untuk M2M
```

Pastikan SIM M2M sudah diaktifkan dan memiliki kuota data.

---

## Produksi (Deploy ke Server)

Untuk deploy ke VPS/server:
1. Gunakan **PM2** untuk menjalankan Node.js: `pm2 start server.js`
2. Gunakan **Nginx** sebagai reverse proxy
3. Ganti semua `localhost:3001` di `frontend/js/` dengan IP/domain server
4. Aktifkan HTTPS dengan Let's Encrypt

```bash
npm install -g pm2
pm2 start server.js --name kjg-bouy
pm2 save
pm2 startup
```
