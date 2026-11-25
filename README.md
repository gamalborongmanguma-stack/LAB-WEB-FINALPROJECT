# NEXA — E-Commerce Marketplace

Website e-commerce dengan tema visual **Dark & Light Modern Luxury Marketplace**, dibuat menggunakan Next.js App Router, JSX, Tailwind CSS, Framer Motion, PostgreSQL, dan Raw SQL.

## 1. Persyaratan
- Node.js 20.9 atau lebih baru
- PostgreSQL 14 atau lebih baru
- pgAdmin (untuk menjalankan file SQL)

## 2. Instalasi
1. Extract folder project.
2. Buka terminal di folder `ecommerce-darklight`.
3. Jalankan:
   ```bash
   npm install
   ```
4. Buat database PostgreSQL bernama `nexa_market` melalui pgAdmin.
5. Buka Query Tool pada database tersebut, lalu jalankan seluruh isi file `sql/schema.sql`.
6. Salin `.env.example` menjadi `.env.local`, kemudian sesuaikan `DATABASE_URL` dan `JWT_SECRET`.
   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/Nama_Database
   JWT_SECRET=ganti_dengan_secret_random_minimal_32_karakter
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
7. Jalankan project:
   ```bash
   npm run dev
   ```
8. Buka `http://localhost:3000`.

## 3. Akun demo
- Admin: `admin@nexa.local`
- Password: `Admin123!`

Buyer dan Seller dapat dibuat melalui halaman Register. Seller otomatis berstatus `pending` dan harus disetujui Admin sebelum dashboard dapat digunakan.

## 4. Fitur yang tersedia

### Public / Guest
- Homepage editorial dengan hero, kategori, dan rekomendasi produk.
- Katalog produk dan pencarian berdasarkan nama produk/toko.
- Filter kategori dan sorting harga.
- Detail produk, informasi toko, stok, rating, dan ulasan.
- Guest diarahkan ke login ketika mencoba menambah produk ke keranjang.

### Buyer
- Register dan login.
- Profil dasar dan pengubahan nama/email.
- Menambahkan produk ke cart, mengubah kuantitas, dan menghapus item dengan kuantitas 0.
- Checkout membuat order dan order items secara transaksional; stok berkurang dan cart dikosongkan.
- Melihat riwayat pesanan dan status.
- Memberi rating/review setelah order berstatus `Selesai`.

### Seller
- Registrasi dengan status pending dan halaman menunggu approval.
- Mengelola nama, deskripsi, dan gambar toko.
- CRUD produk milik toko sendiri (create, edit, delete) termasuk stok, kategori, harga, deskripsi, dan gambar.
- Melihat pesanan masuk dan memperbarui status pesanan.

### Admin
- Ringkasan statistik pengguna, produk, dan pesanan.
- Approve/reject pendaftaran Seller.
- Melihat, mengubah informasi/status, dan menghapus pengguna non-admin.
- CRUD kategori (tambah, ubah, hapus jika belum dipakai produk).
- Moderasi dengan menghapus produk.

## 5. Struktur folder
```text
app/                 Halaman Next.js dan route UI
components/          Navbar, footer, product card, auth form, reveal animation
lib/db.js            PostgreSQL connection pool
lib/auth.js          Session JWT berbasis cookie httpOnly
lib/actions.js       Server Actions untuk autentikasi dan transaksi
lib/data.js          Query produk dan data fallback demo
sql/schema.sql       DDL, index, seed admin, kategori, dan produk demo
.env.example         Contoh environment variables
```

## 6. Catatan implementasi
- Query database menggunakan PostgreSQL `pg` dan Raw SQL parameterized (`$1`, `$2`, dst.).
- Password disimpan dalam bentuk hash bcrypt.
- Session menggunakan JWT pada cookie `httpOnly`.
- Proteksi role dilakukan pada Server Component dan Server Actions.
- Animasi menggunakan Framer Motion, CSS hover transitions, marquee, dan reveal-on-scroll.
- Tombol checkout tidak mengintegrasikan payment gateway sesuai ketentuan PDF.
- Untuk deployment, wajib mengganti `JWT_SECRET`, mengaktifkan HTTPS, dan meninjau ulang validasi serta kebijakan keamanan sesuai kebutuhan produksi.

## 7. Kesesuaian dengan PDF
Rancangan mengikuti tema Individual Project 1: E-Commerce pada halaman 3–8 PDF, termasuk empat role (Admin, Seller, Buyer, Guest), Product Management, User Management, Cart Management, Store Management, Order Management, Category Management, serta halaman publik dan dashboard per role.
