# Panduan Mudah Deploy Backend (Express) ke Railway 🚀

Project ini menggunakan struktur **Monorepo** yang memisahkan frontend (`src`) dan backend (`server`).

Jika Anda meng-hubungkan repository utama langsung ke Railway, secara default Railway akan mencoba mem-build Vite (Frontend). Untuk membuat Railway **hanya menjalankan Backend (Express)**, ikuti langkah-langkah pengaturan mudah ini.

---

## 1. Pastikan Struktur Folder Sudah Benar
Project Anda harus memiliki struktur minimal seperti ini:
```text
/ (Root Project)
├── /server                 <-- Ini adalah backend Express
│    ├── index.js           <-- Entry point server
│    ├── package.json       <-- Dependensi backend
│    └── routes/
├── /src                    <-- Ini adalah frontend (Vite/React)
├── package.json            <-- Dependensi root (diabaikan Railway)
└── bun.lockb               <-- (HARUS DIHAPUS jika Anda menggunakan npm)
```

## 2. Checklist File `server/package.json`
Pastikan file `package.json` yang ada di dalam map `server` sudah memiliki `scripts.start` yang tepat:
```json
{
  "name": "connect-rate-server",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",     <-- Skrip ini Wajib ada untuk Railway
    "dev": "node --watch index.js"
  },
  "dependencies": {
    "express": "^4.21.2",
    "mongoose": "^8.12.1",
    // ...dependensi lainnya
  }
}
```

## 3. Checklist File `server/index.js`
Pastikan kode server Express Anda menggunakan `process.env.PORT` (Railway akan men-set PORT sendiri).
```javascript
const express = require('express');
const app = express();

// SANGAT PENTING: Gunakan process.env.PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

## 4. Cara Setting di Dashboard Railway (Langkah Paling Penting! 🚨)

Karena kode backend Anda berada di dalam folder `/server`, Anda wajib memberitahu Railway untuk menjadikan folder `/server` sebagai titik awal (Root Directory).

1. Buka dashboard **Railway** (railway.app).
2. Temukan service/aplikasi backend Anda dan klik untuk masuk ke pengaturannya.
3. Masuk ke tab **Settings**.
4. Scroll ke bawah, cari bagian **Build**.
5. Cari kolom **Root Directory**.
6. Ketikkan `/server` (atau `server/`) pada kolom tersebut.
7. Klik logo centang (Save) atau tekan Enter.
8. Railway akan memulai ulang deploy-nya (Redeploy).

Dengan mengatur Root Directory ke `/server`, Railway akan sepenuhnya mengabaikan frontend Vite yang ada di folder `/src` atau `/` (root), dan hanya menjalankan backend Express Anda! 🎉
