# API Iuran RT

Backend API untuk aplikasi pencatatan iuran warga RT.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT + bcrypt
- **Validation:** Joi
- **Deployment:** Vercel

## Fitur

- 🔐 **Autentikasi** — Login/Register dengan JWT
- 👥 **Manajemen Warga** — CRUD data warga dengan validasi alamat unik
- 💰 **Pencatatan Iuran** — Catat pembayaran dengan kalkulasi otomatis (2-tier pricing)
- 📤 **Pencatatan Pengeluaran** — CRUD pengeluaran kas RT
- 📊 **Laporan** — Laporan pemasukan per metode pembayaran (cash/transfer) dan total pendapatan
- 👤 **Manajemen User** — CRUD pengguna aplikasi

## Struktur Folder

```
├── config/          # Konfigurasi database MongoDB
├── controllers/     # Request handler
├── dto/             # Data Transfer Objects (validasi Joi)
├── entities/        # Definisi schema data
├── helpers/         # Business logic (perhitungan iuran)
├── middleware/      # JWT & role checking
├── repositories/    # Database queries
├── routes/          # Definisi endpoint
├── workers/         # Async tasks (sync data warga)
└── docs/            # Dokumentasi
```

## Setup

```bash
# Install dependencies
npm install

# Konfigurasi environment
cp .env.example .env
# Edit .env sesuai konfigurasi MongoDB

# Jalankan server
npm start          # production
npm run dev        # development (nodemon)
```

## Environment Variables

| Variable          | Keterangan                |
| ----------------- | ------------------------- |
| `MONGODB_URI`     | Connection string MongoDB |
| `JWT_PRIVATE_KEY` | Secret key untuk JWT      |
| `DB_LIVE_NAME_*`  | Nama database production  |
| `DB_DEV_NAME_*`   | Nama database development |

## Dokumentasi

- 📘 [Technical Review](docs/TECHNICAL_REVIEW.md) — Arsitektur, bisnis proses, dan API reference
- 📗 [User Guide](../iuran-rt-apps/docs/USER_GUIDE.md) — Panduan penggunaan aplikasi (non-teknis)
