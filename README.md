# NEXA. — Platform E-Commerce Modern & Minimalis

> **Marketplace E-Commerce Tema Gelap & Terang** yang dibangun menggunakan **Next.js App Router**, **JSX**, **Tailwind CSS**, **Framer Motion**, **PostgreSQL**, dan **Raw SQL**.

## ✨ Keunggulan Utama

* **Pengalaman Tema Gelap & Terang**: Transisi mode gelap dan terang yang mulus dengan inisialisasi *inline script* untuk mencegah *flash* tampilan saat memuat halaman.
* **Kontrol Akses Berbasis Peran (RBAC)**: Alur terpisah dan penjagaan sisi *server* untuk **Guest**, **Buyer**, **Seller**, dan **Admin**.
* **Checkout Transaksional**: Transaksi atomik PostgreSQL (`BEGIN` / `COMMIT` / `ROLLBACK`) dengan *row locking* (`FOR UPDATE`) untuk membuat *order* dan *order items*, memotong stok produk, serta mengosongkan keranjang pembeli.
* **Rating & Ulasan Setelah Pesanan Selesai**: Pembeli dapat memberikan rating dan ulasan setelah status pesanan mencapai `Selesai`.
* **Verifikasi Seller & Moderasi Konten**: Alur pendaftaran *seller* berstatus *pending* dengan persetujuan/penolakan dari Admin, pengelolaan toko, CRUD produk, manajemen kategori, manajemen pengguna, dan moderasi produk.

## 🛠️ Teknologi yang Digunakan

| Lapisan | Teknologi |
| :--- | :--- |
| **Framework** | Next.js (App Router, JSX, Server Actions) |
| **Styling & Animasi** | Tailwind CSS, Framer Motion, Lucide Icons |
| **Database** | PostgreSQL (`pg` *connection pool* + *parameterized Raw SQL* `$1`, `$2`, ...) |
| **Autentikasi** | *Password hashing* `bcryptjs` + JWT `jose` di dalam *cookie* `httpOnly` |

## 🚀 Panduan Menjalankan Proyek

### 1. Kebutuhan Awal

* **Node.js** versi 20.9 atau lebih baru
* **PostgreSQL** versi 14 atau lebih baru
* **pgAdmin** (untuk menjalankan skrip SQL database)

### 2. Langkah Instalasi

1. Ekstrak atau *clone* folder proyek, lalu buka terminal di direktori proyek.
2. Instal seluruh *dependencies*:

   ```bash
   npm install
   ```

3. Buat database baru bernama `nexa_market` melalui **pgAdmin**.
4. Buka **Query Tool** pada database `nexa_market` dan jalankan seluruh isi berkas SQL yang tersedia di luar folder `/app` (misalnya `schema.sql` / `database.sql`).
5. Salin `.env.example` menjadi `.env.local`, lalu sesuaikan konfigurasinya:

   ```env
   DATABASE_URL=postgresql://postgres:password@localhost:5432/nexa_market
   JWT_SECRET=ganti_dengan_secret_random_minimal_32_karakter
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

6. Jalankan *development server*:

   ```bash
   npm run dev
   ```

7. Buka `http://localhost:3000` di *browser*.

## 🔐 Akun Demo

* **Email Admin**: `admin@nexa.local`
* **Password Admin**: `Admin123!`

> Akun **Buyer** dan **Seller** dapat didaftarkan langsung melalui halaman `/register`. Akun **Seller** baru akan berstatus `pending` dan memerlukan persetujuan **Admin** sebelum dapat mengakses *workspace* penjual.

## 🧩 Fitur Berdasarkan Peran

### 🌐 Guest (Pengunjung Publik)

* Halaman beranda editorial dengan *hero showcase*, kategori, dan sorotan produk.
* Pencarian katalog produk (berdasarkan nama produk atau nama toko), filter kategori, serta *sorting* harga.
* Halaman detail produk lengkap dengan informasi toko, ketersediaan stok, rating, dan ulasan.
* Mengarahkan ke `/login` saat pengunjung mencoba menambahkan barang ke keranjang belanja.

### 🛍️ Buyer (Pembeli)

* Registrasi akun, *login*, serta pengelolaan profil (nama dan email).
* Menambah produk ke keranjang, mengubah jumlah item, atau menghapus item jika jumlahnya diatur menjadi `0`.
* *Checkout* transaksional yang mencatat pesanan, mengurangi stok produk, dan mengosongkan keranjang.
* Riwayat pesanan dan pelacakan status pesanan, serta pengiriman rating dan ulasan pada pesanan berstatus `Selesai`.

### 🏪 Seller (Penjual)

* Halaman status verifikasi (`/pending`) saat menunggu persetujuan Admin (serta opsi hapus akun jika ditolak).
* Pengelolaan informasi toko (nama, deskripsi, dan gambar toko).
* CRUD penuh untuk produk milik toko sendiri (nama, deskripsi, harga, stok, kategori, dan gambar).
* Melihat pesanan masuk dan memperbarui status pesanan (`Diproses`, `Dikirim`, `Selesai`).

### 🛡️ Admin (Administrator)

* Ringkasan statistik platform (jumlah pengguna, produk, dan pesanan).
* Menyetujui (*Approve*) atau menolak (*Reject*) pendaftaran akun **Seller** yang berstatus *pending*.
* Melihat, memperbarui data/status, dan menghapus akun pengguna non-admin yang memenuhi syarat.
* Menambah, mengedit, dan menghapus kategori produk secara aman (mencegah penghapusan kategori yang masih dipakai produk).
* Memoderasi katalog dengan menghapus produk yang melanggar ketentuan.

## 📁 Struktur Proyek

```text
app/                 Halaman dan layout Next.js App Router
components/          Navbar, Footer, ProductCard, AuthForm, Reveal, dll.
lib/
  ├── db.js          Koneksi pool PostgreSQL dan helper query
  ├── auth.js        Pembuatan sesi JWT, verifikasi, dan logout (cookie httpOnly)
  ├── actions.js     Server Actions untuk autentikasi, cart, checkout, review & CMS
  └── data.js        Query produk, helper format rupiah, dan data fallback demo
.env.example         Template variabel lingkungan
```

## 📝 Catatan Implementasi

* Seluruh *query* database menggunakan *parameterized Raw SQL* (`$1`, `$2`, ...) melalui `pg`.
* Pengecekan *role* dan status akun diterapkan pada *Server Components* maupun *Server Actions*.
* Alur *checkout* tidak menggunakan *payment gateway* sesuai ketentuan proyek.
* Sebelum *deployment* produksi, pastikan mengganti `JWT_SECRET`, mengaktifkan HTTPS, dan meninjau ulang konfigurasi keamanan.