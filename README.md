<<<<<<< HEAD

=======
# Silvera — E-Commerce (Next.js + Tailwind + PostgreSQL)

Tema: dark graphite + white-silver. Raw SQL (`pg`), auth JWT cookie (`jose` + `bcryptjs`), Server Actions.

## Menjalankan
1. Buat database kosong `silvera` di pgAdmin, lalu jalankan `database/schema.sql` (Query Tool).
2. `cp .env.example .env` dan sesuaikan `DATABASE_URL` + `AUTH_SECRET`.
3. `npm install && npm run dev` → http://localhost:3000

## Akun demo
- admin@silvera.test / admin123
- seller@silvera.test / seller123
- buyer@silvera.test / buyer123

## Catatan
- Gambar produk memakai URL (bukan upload file).
- Status pesanan disimpan per item agar tiap toko mengelola pesanannya sendiri.
- Fitur opsional yang sudah ada: filter & sorting produk, alamat pengiriman. Wishlist belum dibuat.
>>>>>>> 1705a93 (Revisi ulang WEB)
