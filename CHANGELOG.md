# Backend Release Notes & Changelog

## [v2.0.0] - Iuran RT API V2

Versi 2 merupakan pembaruan arsitektur besar-besaran yang memperkenalkan modul analitik finansial, sistem audit, serta skalabilitas pencatatan periode pembayaran.

### Fitur Baru (New Features)

- **Modul Finansial Lengkap**:
  - Penambahan API _Pengeluaran_ (`/api/expenses`).
  - Penambahan API _Pemasukan Lainnya_ (`/api/other-incomes`).
- **Laporan & Analitik (Report API)**:
  - Endpoint `Report Pricing Tier` untuk klasifikasi metrik pembayaran Warga (Tipe 75k, 110k, dll).
  - Endpoint `Neraca Kas RT` mengkalkulasi selisih _Pemasukan_ dan _Pengeluaran_ dengan presisi desimal (.toFixed).
  - Endpoint Laporan Metode Pembayaran (Cash/Bu Agus & Transfer/Bu Harris).
- **Master Audit Log (Activity Tracker)**:
  - Sistem rekam jejak otomatis yang berjalan asinkron di _background_ untuk melacak aktivitas `CREATE`, `UPDATE`, dan `DELETE`.
  - Terpisah ke dalam koleksi masing-masing (`activity_logs_payment`, `activity_logs_user`, `activity_logs_warga`).
  - Perekaman komparasi _JSON Payload_ historis (`old_data` vs `new_data`).
- **Rincian Ekstraksi Iuran**: Iuran bulanan kini merinci distribusi dana (RT, PKK, Sosial, Kematian).
- **Background Worker**: `syncWargaToPayments` untuk otomatis memperbaiki data _denormalized_ di _collection_ pembayaran apabila nama/alamat warga diubah.

### Perbaikan (Fixes)

- Perbaikan _Natural Sorting Algorithm_ pada repositori Warga agar blok alamat (misal K2-6 vs K2-12) diurutkan secara numerik yang benar.
- Perbaikan respons 401/403 dengan perlindungan filter JWT Token dan Admin Role middleware _Authorization_ yang dikunci lebih ketat (`/api` prefixing).

---

## [v1.0.0] - Legacy Initial Release

### Fitur Utama

- **Autentikasi**: Login dan proteksi rute menggunakan JSON Web Tokens (JWT).
- **Manajemen Warga**: API CRUD tunggal untuk mendata nama dan alamat Warga di 1 perumahan/RT.
- **Pencatatan Iuran**: API CRUD dasar untuk mencatat setoran warga beserta periode bayar (bulan/tahun) dan metode pencatatan dasar.
- **Database**: Pemisahan logic koneksi koleksi secara struktural ke dalam arsitektur Multi-Database (`dbUser`, `dbWarga`, dan `dbPayment`) pada sistem MongoDB.
