# API Iuran RT

Backend API untuk aplikasi pencatatan iuran warga RT.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT + bcrypt
- **Validation:** Joi
- **Deployment:** Vercel

## Fitur Utama (v2.3.0)

- 🔐 **Autentikasi** — Login/Register dengan JWT dan proteksi Role Admin.
- 👥 **Manajemen Warga** — CRUD data warga dengan validasi alamat unik dan *Natural Sorting*.
- 💰 **Pencatatan Iuran** — Catat pembayaran dengan kalkulasi otomatis (2-tier pricing) dan detail pos (RT, PKK, Sosial, Kematian).
- 📥 **Pemasukan Lainnya** — Pencatatan dana masuk non-iuran (sumbangan, dana RW, dll) dengan metode Cash/Transfer.
- 📤 **Pencatatan Pengeluaran** — CRUD pengeluaran kas RT dengan kategori metode pembayaran.
- ⚖️ **Saldo Awal (Opening Balance)** — Pengelolaan saldo master tahunan untuk Petty Cash dan Rekening BCA.
- 📊 **Laporan & Neraca** — Generasi data untuk Laporan Petty Cash, Laporan Kas Rekening, dan Neraca Kas RT gabungan.
- 👤 **Manajemen User** — CRUD pengguna aplikasi (Admin).

## Struktur Folder

```
├── config/          # Konfigurasi database MongoDB
├── controllers/     # Request handler (Auth, Warga, Payment, Expense, OpeningBalance, Report)
├── dto/             # Data Transfer Objects (validasi Joi)
├── entities/        # Definisi schema data
├── helpers/         # Business logic (perhitungan iuran, audit log)
├── middleware/      # JWT & role checking (adminRole)
├── repositories/    # Database queries
├── routes/          # Definisi endpoint API
├── workers/         # Async tasks (sync data warga ke payment history)
└── docs/            # Dokumentasi teknis dan roadmap
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

- 📘 [Technical Review](docs/TECHNICAL_REVIEW.md) — Arsitektur, bisnis proses, dan API reference lengkap.
- 📝 [Feature Checklist](docs/FEATURE_CHECKLIST.md) — Status penyelesaian fitur dan roadmap masa depan.
- 📗 [User Guide](../iuran-rt-apps/docs/USER_GUIDE.md) — Panduan penggunaan aplikasi (non-teknis).
