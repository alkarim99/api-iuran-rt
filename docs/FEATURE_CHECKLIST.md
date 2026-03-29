# Feature Checklist: Iuran RT App

Dokumen ini melacak fitur-fitur yang sudah dikembangkan dan rencana pengembangan di masa depan (Roadmap).

## ✅ Fitur yang Sudah Dikembangkan (V1.0 - V2.3)

### 1. Inti Pembayaran & Warga (Core)
- [x] CRUD Data Warga (Nama & Alamat)
- [x] Pencatatan Iuran Bulanan Warga
- [x] Logika Tier Pricing Otomatis (75rb vs 110rb)
- [x] Rincian Alokasi Iuran (RT, PKK, Sosial, Kematian)
- [x] Sinkronisasi Data Warga ke History Pembayaran (Background Worker)
- [x] Natural Sorting Alamat Warga (K1-9 < K1-12)

### 2. Keuangan (Financial)
- [x] Pencatatan Pengeluaran (Expense)
- [x] Pencatatan Pemasukan Lainnya (Other Income)
- [x] Pemisahan Dana Kas: Petty Cash (Tunai) & Kas Rekening (Transfer)
- [x] **[NEW]** Pengelolaan Saldo Awal (Opening Balance) Tahunan
- [x] Running Balance (Saldo Berjalan) di setiap baris laporan

### 3. Pelaporan & Export (Reporting)
- [x] Laporan Petty Cash (Bu Agus)
- [x] Laporan Kas Rekening (Bu Harris)
- [x] Laporan Rincian Iuran per Periode
- [x] Laporan Neraca Kas RT (Gabungan)
- [x] Dashboard Summary (Total Pemasukan, Pengeluaran, Saldo Kas)
- [x] **[NEW]** Export Excel Terformat (ExcelJS) - Siap Cetak & WYSIWYG

### 4. Keamanan & Sistem (System)
- [x] Autentikasi JWT (Login Admin)
- [x] Middleware `adminRole` untuk proteksi data
- [x] Audit Log / Activity Tracker (Melacak Create, Update, Delete)
- [x] Validasi Input dengan Joi (DTO Pattern)
- [x] Standarisasi Tabel (Sorting & Month Picker)

---

## 🚀 Rencana Fitur Masa Depan (V3.0+)

### 1. Keamanan & Akses (Multi-Role)
- [ ] Role Warga (View-Only riwayat sendiri)
- [ ] Role Ketua RT (Monitoring dashboard tanpa hak edit)
- [ ] Reset Password via Email

### 2. Manajemen Warga Lanjutan (Citizen DB)
- [ ] Database Kependudukan Lengkap (KK, NIK, Anggota Keluarga)
- [ ] Status Hunian (Milik / Kontrak / Kos)
- [ ] Cetak Otomatis Surat Pengantar RT/RW

### 3. Keuangan Lanjutan (Advanced Finance)
- [ ] Master Data Tarif Iuran per Warga (Ganti sistem modulo)
- [ ] Sistem Saldo Titipan / Overpayment Carry-over
- [ ] Grafik Analisis Keuangan (Chart.js) pada Dashboard

### 4. Integritas Data (Data Integrity)
- [ ] Mekanisme Soft Delete (deleted_at)
- [ ] Recycle Bin / Restore Data

### 5. Otomatisasi (Automation)
- [ ] Notifikasi WhatsApp Otomatis (Tagihan & Bukti Bayar)
- [ ] Cron Job Deteksi Penunggak Iuran

---

## Ringkasan Status
- **Versi Saat Ini:** v2.3.0
- **Total Fitur Selesai:** ~20 Fitur
- **Total Fitur Terencana:** ~12 Fitur
