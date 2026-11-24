# NOCTURNE E-Commerce — Full-stack starter

Starter toko online menggunakan Next.js App Router, PostgreSQL, autentikasi berbasis session cookie, keranjang persisten, checkout, riwayat pesanan, dan dashboard admin.

## 1. Kebutuhan
- Node.js 20+
- PostgreSQL 14+
- npm

## 2. Instalasi
```bash
npm install
```
Salin `.env.example` menjadi `.env.local`, lalu sesuaikan `DATABASE_URL` dan `SESSION_SECRET`.
`SESSION_SECRET` wajib minimal 32 karakter. Buat nilai acak sendiri; jangan commit `.env.local`.

## 3. Siapkan database
Buat database bernama `nocturne_store`, lalu jalankan isi `database/schema.sql` melalui pgAdmin Query Tool atau psql.

Contoh:
```sql
CREATE DATABASE nocturne_store;
```
Pilih database `nocturne_store`, lalu jalankan `database/schema.sql`.

## 4. Jalankan
```bash
npm run dev
```
Buka http://localhost:3000

## 5. Jadikan akun sebagai admin
Daftar akun dari website terlebih dahulu, kemudian jalankan query berikut di pgAdmin:
```sql
UPDATE users SET role = 'admin' WHERE email = 'email-kamu@example.com';
```
Logout lalu login kembali agar session memuat role admin. Dashboard: `/admin`.

## Fitur yang tersedia
- Katalog produk dari PostgreSQL, kategori, pencarian, stok.
- Registrasi/login dengan password hash bcrypt.
- Session cookie HttpOnly, SameSite Lax, Secure saat production.
- Keranjang belanja tersimpan di database per akun.
- Validasi stok dan checkout dengan transaksi database.
- Riwayat pesanan untuk pelanggan.
- Dashboard admin untuk menambah produk, mengubah stok, melihat pesanan.
- Responsive dark UI dan animasi.

## Catatan pembayaran dan produksi
Checkout saat ini mencatat pesanan dengan status pembayaran `pending`; ini bukan payment gateway dan tidak memproses uang. Untuk menerima pembayaran sungguhan, integrasikan penyedia pembayaran resmi (misalnya Midtrans atau Xendit) pada server, gunakan webhook yang diverifikasi, dan jangan pernah menyimpan nomor kartu atau secret key di frontend.

Sebelum produksi, tambahkan rate limiting untuk login/register, verifikasi email, reset password, CSRF/origin protection untuk semua mutasi, validasi skema lebih ketat, audit log admin, kebijakan privasi, ketentuan pengiriman/pengembalian, HTTPS, backup database, dan pengujian keamanan. Ganti gambar demo dan data produk sesuai katalog toko.

## Struktur
- `app/` halaman dan API routes
- `lib/` koneksi database dan autentikasi
- `database/schema.sql` skema dan seed produk
